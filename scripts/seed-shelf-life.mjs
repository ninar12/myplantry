/**
 * seed-shelf-life.mjs
 *
 * Reads the USDA FoodKeeper Excel file and seeds the shelf_life table in Supabase.
 *
 * Run with:
 *   node scripts/seed-shelf-life.mjs
 *
 * Requires: the FoodKeeper-Data.xlsx file in scripts/data/
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"
import { readFileSync, existsSync } from "fs"

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../.env.local") })

const XLSX_PATH = resolve(__dirname, "data/FoodKeeper-Data.xlsx")
const JSON_CACHE = resolve(__dirname, "data/foodkeeper-parsed.json")

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Category ID → our label mapping (from FoodKeeper Category sheet)
const CATEGORY_MAP = {
  1:  "Other",              // Baby Food
  2:  "Grains & Bread",    // Baked Goods / Bakery
  3:  "Pantry Staples",    // Baked Goods / Baking and Cooking
  4:  "Grains & Bread",    // Baked Goods / Refrigerated Dough
  5:  "Beverages",         // Beverages
  6:  "Canned & Jarred",   // Condiments, Sauces & Canned Goods
  7:  "Dairy",             // Dairy Products & Eggs
  8:  "Other",             // Food Purchased Frozen
  9:  "Grains & Bread",    // Grains, Beans & Pasta
  10: "Meat & Seafood",    // Meat / Fresh
  11: "Meat & Seafood",    // Meat / Shelf Stable
  12: "Meat & Seafood",    // Meat / Smoked or Processed
  13: "Meat & Seafood",    // Meat / Stuffed or Assembled
  14: "Meat & Seafood",    // Poultry / Cooked or Processed
  15: "Meat & Seafood",    // Poultry / Fresh
  16: "Meat & Seafood",    // Poultry / Shelf Stable
  17: "Meat & Seafood",    // Poultry / Stuffed or Assembled
  18: "Produce",           // Produce / Fresh Fruits
  19: "Produce",           // Produce / Fresh Vegetables
  20: "Meat & Seafood",    // Seafood / Fresh
  21: "Meat & Seafood",    // Seafood / Shellfish
  22: "Meat & Seafood",    // Seafood / Smoked
  23: "Pantry Staples",    // Shelf Stable Foods
  24: "Other",             // Vegetarian Proteins
  25: "Other",             // Deli & Prepared Foods
}

function toDays(min, max, metric) {
  if ((min == null || min === "") && (max == null || max === "")) return null
  const lo = Number(min ?? 0)
  const hi = Number(max ?? min)
  const avg = Math.round((lo + hi) / 2)
  switch (String(metric).trim()) {
    case "Days":   return avg
    case "Weeks":  return avg * 7
    case "Months": return avg * 30
    case "Years":  return avg * 365
    default:       return null
  }
}

function parseXlsx() {
  // Use Python (openpyxl) to parse the XLSX and output JSON
  const pyScript = `
import json, sys
from openpyxl import load_workbook

wb = load_workbook('${XLSX_PATH.replace(/\\/g, "\\\\")}')
ws = wb['Product']

rows = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not row[0]:  # skip empty rows
        continue
    rows.append({
        'id':            row[0],
        'category_id':   row[1],
        'name':          row[2],
        'name_subtitle': row[3],
        'pantry_min':    row[5],
        'pantry_max':    row[6],
        'pantry_metric': row[7],
        'pantry_tips':   row[8],
        'dop_pantry_min':    row[9],
        'dop_pantry_max':    row[10],
        'dop_pantry_metric': row[11],
        'fridge_min':    row[16],
        'fridge_max':    row[17],
        'fridge_metric': row[18],
        'fridge_tips':   row[19],
        'dop_fridge_min':    row[20],
        'dop_fridge_max':    row[21],
        'dop_fridge_metric': row[22],
        'opened_fridge_min':    row[24],
        'opened_fridge_max':    row[25],
        'opened_fridge_metric': row[26],
        'freeze_min':    row[30],
        'freeze_max':    row[31],
        'freeze_metric': row[32],
        'freeze_tips':   row[33],
        'dop_freeze_min':    row[34],
        'dop_freeze_max':    row[35],
        'dop_freeze_metric': row[36],
    })

print(json.dumps(rows))
`
  const output = execSync(`python3 -c "${pyScript.replace(/"/g, '\\"')}"`, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  })
  return JSON.parse(output)
}

async function main() {
  if (!existsSync(XLSX_PATH)) {
    console.error(`❌ FoodKeeper Excel file not found at: ${XLSX_PATH}`)
    console.log("\nCopy the file there:")
    console.log(`  cp ~/Downloads/FoodKeeper-Data.xlsx ${XLSX_PATH}`)
    process.exit(1)
  }

  console.log("📖 Parsing FoodKeeper Excel file...")
  let rawRows
  try {
    rawRows = parseXlsx()
  } catch (e) {
    console.error("❌ Failed to parse XLSX:", e.message)
    process.exit(1)
  }
  console.log(`   Found ${rawRows.length} raw products`)

  const rows = []
  for (const r of rawRows) {
    if (!r.name || typeof r.name !== "string") continue

    // DOP (Date of Purchase) fields = shelf life from when you bought it (unopened)
    // Prefer DOP over the plain field when both exist
    const pantry_days = toDays(
      r.dop_pantry_min ?? r.pantry_min,
      r.dop_pantry_max ?? r.pantry_max,
      r.dop_pantry_metric ?? r.pantry_metric
    )
    const fridge_days = toDays(
      r.dop_fridge_min ?? r.fridge_min,
      r.dop_fridge_max ?? r.fridge_max,
      r.dop_fridge_metric ?? r.fridge_metric
    )
    const freezer_days = toDays(
      r.dop_freeze_min ?? r.freeze_min,
      r.dop_freeze_max ?? r.freeze_max,
      r.dop_freeze_metric ?? r.freeze_metric
    )
    const opened_fridge_days = toDays(
      r.opened_fridge_min,
      r.opened_fridge_max,
      r.opened_fridge_metric
    )

    if (pantry_days == null && fridge_days == null && freezer_days == null) continue

    const tips = r.fridge_tips ?? r.pantry_tips ?? r.freeze_tips ?? null
    const category = CATEGORY_MAP[r.category_id] ?? "Other"

    rows.push({
      name: r.name.trim(),
      category,
      pantry_days,
      fridge_days,
      freezer_days,
      opened_fridge_days,
      tips: tips?.trim() ?? null,
      source: "usda",
    })
  }

  // Deduplicate by name — FoodKeeper has duplicate entries that cause upsert conflicts within a batch
  const seen = new Map()
  for (const row of rows) seen.set(row.name, row)
  const deduped = [...seen.values()]

  console.log(`✅ Parsed ${deduped.length} unique ingredients with storage data (${rows.length - deduped.length} duplicates removed)`)
  console.log("⬆️  Upserting into Supabase shelf_life table...\n")

  const BATCH = 100
  let inserted = 0
  let errors = 0

  for (let i = 0; i < deduped.length; i += BATCH) {
    const batch = deduped.slice(i, i + BATCH)
    const { error } = await supabase
      .from("shelf_life")
      .upsert(batch, { onConflict: "name", ignoreDuplicates: false })

    if (error) {
      console.error(`❌ Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
      errors++
    } else {
      inserted += batch.length
      process.stdout.write(`\r   ${inserted}/${deduped.length} rows upserted...`)
    }
  }

  console.log(`\n\n🌱 Done! ${inserted} rows seeded, ${errors} batch errors.`)

  if (errors === 0) {
    console.log("\nYour shelf_life table now has real USDA data.")
    console.log("Any ingredient not in this list will fall through to Gemini and get cached automatically.")
  }
}

main()
