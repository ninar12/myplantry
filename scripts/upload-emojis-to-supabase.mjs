import { createClient } from "@supabase/supabase-js"
import { readFileSync, readdirSync } from "fs"
import { join, extname } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { config } from "dotenv"

config({ path: ".env.local" })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BUCKET = "emojis"
const __dir = dirname(fileURLToPath(import.meta.url))
const emojisDir = join(__dir, "../public/emojis")

async function main() {
  // Create bucket if it doesn't exist
  const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ["image/png", "image/webp", "image/jpeg"],
  })
  if (bucketError && !bucketError.message.includes("already exists")) {
    console.error("Bucket error:", bucketError.message)
    process.exit(1)
  }
  console.log(`Bucket "${BUCKET}" ready.`)

  const files = readdirSync(emojisDir).filter(f => extname(f) === ".png")
  let ok = 0, fail = 0

  for (const file of files) {
    const data = readFileSync(join(emojisDir, file))
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(file, data, { contentType: "image/png", upsert: true })
    if (error) {
      console.error(`  ✗ ${file}: ${error.message}`)
      fail++
    } else {
      console.log(`  ✓ ${file}`)
      ok++
    }
  }

  console.log(`\nDone: ${ok} uploaded, ${fail} failed.`)
  const base = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}`
  console.log(`\nBase URL: ${base}`)
  console.log(`Example:  ${base}/apple.png`)
}

main()
