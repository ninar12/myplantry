"use client"

import { useRef, useState } from "react"
import { Camera, Receipt, Loader2, Sparkles, X, CheckCircle2 } from "lucide-react"
import { usePantry } from "@/context/PantryContext"

type ScanType = "receipt" | "fridge" | "handwritten"

interface ScannedItem {
  name: string
  category: string
  quantity: number
  expiration_date: string
  location: string
  opened?: boolean
}

export default function PhotoUploadStub({
  scanType = "receipt",
}: {
  scanType?: ScanType
}) {
  const { addItem, checkPantryDuplicate } = usePantry()
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number } | null>(null)
  const [skippedItems, setSkippedItems] = useState<ScannedItem[]>([])
  const [showSkippedBanner, setShowSkippedBanner] = useState(false)
  const [addedCount, setAddedCount] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scanFile = (file: File): Promise<ScannedItem[]> =>
    new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result as string
        const [meta, base64] = dataUrl.split(",")
        const mimeType = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg"
        try {
          const res = await fetch("/api/scan-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64, mimeType, type: scanType }),
          })
          const { items } = await res.json()
          resolve(Array.isArray(items) ? items : [])
        } catch {
          resolve([])
        }
      }
      reader.onerror = () => resolve([])
      reader.readAsDataURL(file)
    })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    setScanProgress({ current: 0, total: files.length })
    setShowSkippedBanner(false)
    setSkippedItems([])
    setAddedCount(null)

    const allItems: ScannedItem[] = []

    for (let i = 0; i < files.length; i++) {
      setScanProgress({ current: i + 1, total: files.length })
      const items = await scanFile(files[i])
      allItems.push(...items)
    }

    // Deduplicate within batch and against existing pantry
    const newItems: ScannedItem[] = []
    const duplicates: ScannedItem[] = []
    const seenNames = new Set<string>()

    for (const item of allItems) {
      const key = item.name.toLowerCase()
      if (seenNames.has(key)) continue
      seenNames.add(key)
      if (checkPantryDuplicate(item.name)) {
        duplicates.push(item)
      } else {
        newItems.push(item)
      }
    }

    for (const item of newItems) {
      await addItem({
        name: item.name,
        category: item.category,
        quantity: item.quantity ?? 1,
        expiration_date: item.expiration_date,
        location: item.location === "pantry" ? "pantry" : "fridge",
        opened: item.opened ?? false,
      })
    }

    setAddedCount(newItems.length)
    if (duplicates.length > 0) {
      setSkippedItems(duplicates)
      setShowSkippedBanner(true)
    }

    setScanProgress(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const addSkippedItems = async () => {
    for (const item of skippedItems) {
      await addItem({
        name: item.name,
        category: item.category,
        quantity: item.quantity ?? 1,
        expiration_date: item.expiration_date,
        location: item.location === "pantry" ? "pantry" : "fridge",
        opened: false,
      })
    }
    setShowSkippedBanner(false)
    setSkippedItems([])
  }

  const isScanning = scanProgress !== null

  return (
    <div className="flex flex-col gap-2">
      <label className="w-full relative overflow-hidden group border-2 border-dashed border-[#2b6954]/30 bg-[#2b6954]/5 hover:bg-[#2b6954]/10 hover:border-[#2b6954]/50 transition-all rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleFileChange}
          disabled={isScanning}
        />
        {isScanning ? (
          <>
            <Loader2 className="w-8 h-8 text-[#2b6954] animate-spin" />
            <span className="text-[#003527] font-medium text-sm flex items-center gap-2">
              {scanProgress!.total > 1
                ? `Scanning ${scanProgress!.current} of ${scanProgress!.total}…`
                : "Extracting items with AI"}{" "}
              <Sparkles className="w-3 h-3 text-[#2b6954]" />
            </span>
            {scanProgress!.total > 1 && (
              <div className="w-40 h-1.5 rounded-full overflow-hidden" style={{ background: "#e4e2de" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ background: "#2b6954", width: `${(scanProgress!.current / scanProgress!.total) * 100}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#003527]/10 z-10 group-hover:-translate-y-1 transition-transform">
                <Camera className="w-5 h-5 text-[#2b6954]" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#003527]/10 group-hover:-translate-y-1 transition-transform delay-75">
                <Receipt className="w-5 h-5 text-[#2b6954]" />
              </div>
            </div>
            <div className="text-center">
              <span className="block text-[#003527] font-semibold text-sm mb-0.5">
                Wait, here&apos;s a receipt...
              </span>
              <span className="block text-[#003527]/60 text-xs">
                Scan one or more photos at once
              </span>
            </div>
          </>
        )}
      </label>

      {addedCount !== null && !showSkippedBanner && addedCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
          <p>Added {addedCount} item{addedCount !== 1 ? "s" : ""} to your pantry.</p>
          <button onClick={() => setAddedCount(null)} className="ml-auto">
            <X className="w-4 h-4 text-green-400 hover:text-green-600" />
          </button>
        </div>
      )}

      {showSkippedBanner && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
          <span className="text-base shrink-0">ⓘ</span>
          <div className="flex-1">
            {addedCount !== null && addedCount > 0 && (
              <p className="font-medium mb-1 text-green-700">
                Added {addedCount} item{addedCount !== 1 ? "s" : ""}.
              </p>
            )}
            <p>
              {skippedItems.length} item{skippedItems.length !== 1 ? "s" : ""}{" "}
              already in pantry {skippedItems.length !== 1 ? "were" : "was"} skipped.
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={addSkippedItems}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                Add all anyway
              </button>
              <button
                onClick={() => setShowSkippedBanner(false)}
                className="px-3 py-1 border border-blue-300 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={() => setShowSkippedBanner(false)} className="shrink-0">
            <X className="w-4 h-4 text-blue-400 hover:text-blue-600" />
          </button>
        </div>
      )}
    </div>
  )
}
