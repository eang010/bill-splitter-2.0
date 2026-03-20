"use client"

import { useEffect, useRef, useId } from "react"
import { Button } from "@/components/ui/button"
import { Image, Loader2, Camera, Images } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReceiptProcessorProps {
  onReceiptProcessed: (items: any[]) => void
  isDialogOpen: boolean
  onDialogChange: (open: boolean) => void
  onProcessingChange: (isProcessing: boolean) => void
  isProcessing: boolean
  variant?: "button" | "dropzone"
}

/** Best-effort save so the user keeps a copy (Downloads / save dialog / share). */
async function saveImageToDevice(file: File): Promise<void> {
  const baseName = `receipt-${Date.now()}`
  const ext =
    file.name.split(".").pop()?.toLowerCase() ||
    (file.type.includes("png") ? "png" : "jpg")

  try {
    if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
      const picker = window as Window & {
        showSaveFilePicker: (opts: {
          suggestedName: string
          types?: { description: string; accept: Record<string, string[]> }[]
        }) => Promise<FileSystemFileHandle>
      }
      const handle = await picker.showSaveFilePicker({
        suggestedName: `${baseName}.${ext}`,
        types: [
          {
            description: "Image",
            accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(await file.arrayBuffer())
      await writable.close()
      return
    }
  } catch {
    // User cancelled or API unavailable
  }

  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Receipt photo",
      })
      return
    }
  } catch {
    // Share cancelled or failed
  }

  const url = URL.createObjectURL(file)
  const a = document.createElement("a")
  a.href = url
  a.download = `${baseName}.${ext}`
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function ReceiptProcessor({
  onReceiptProcessed,
  isDialogOpen,
  onDialogChange,
  onProcessingChange,
  isProcessing,
  variant = "button",
}: ReceiptProcessorProps) {
  const { toast } = useToast()
  const libraryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const baseId = useId()
  const libraryInputId = `${baseId}-library`
  const cameraInputId = `${baseId}-camera`

  useEffect(() => {
    const handleFileSelect = async (event: Event) => {
      const customEvent = event as CustomEvent<{ file: File; fromCamera?: boolean }>
      if (!customEvent.detail?.file) return

      onProcessingChange(true)
      const file = customEvent.detail.file
      const fromCamera = customEvent.detail.fromCamera === true

      if (fromCamera) {
        void saveImageToDevice(file).catch(() => {
          /* non-fatal */
        })
      }

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/receipt", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to process receipt")
        }

        const itemsEvent = new CustomEvent("updateBillItems", {
          detail: data.items,
        })
        document.dispatchEvent(itemsEvent)

        onReceiptProcessed(data.items)
        toast({
          title: "Receipt processed successfully",
          description: `Found ${data.items.length} items`,
        })
        onDialogChange(false)
      } catch (error) {
        console.error("Error processing receipt:", error)
        toast({
          title: "Error processing receipt",
          description: error instanceof Error ? error.message : "Please try again with a different image",
          variant: "destructive",
        })
      } finally {
        onProcessingChange(false)
      }
    }

    document.addEventListener("receiptFileSelected", handleFileSelect)
    return () => {
      document.removeEventListener("receiptFileSelected", handleFileSelect)
    }
  }, [onReceiptProcessed, toast, onDialogChange, onProcessingChange])

  const dispatchFile = (file: File, fromCamera: boolean) => {
    const event = new CustomEvent("receiptFileSelected", {
      detail: { file, fromCamera },
    })
    document.dispatchEvent(event)
  }

  const handleLibraryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      dispatchFile(file, false)
    }
    e.target.value = ""
  }

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      dispatchFile(file, true)
    }
    e.target.value = ""
  }

  const sharedInputs = (
    <>
      <input
        id={libraryInputId}
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        disabled={isProcessing}
        onChange={handleLibraryChange}
        className="hidden"
      />
      <input
        id={cameraInputId}
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={isProcessing}
        onChange={handleCameraChange}
        className="hidden"
      />
    </>
  )

  return (
    <div className="space-y-4">
      {sharedInputs}
      <div className="flex flex-col items-center gap-4">
        {variant === "dropzone" ? (
          <>
            <div
              className={`flex w-full aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                isProcessing ? "cursor-not-allowed opacity-60" : ""
              } bg-muted/30`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Image className="h-5 w-5" />
                )}
              </span>
              <div className="space-y-1">
                <p className="text-base font-medium text-foreground">
                  {isProcessing ? "Processing receipt..." : "Add a receipt photo"}
                </p>
                <p className="text-sm text-muted-foreground">JPG or PNG</p>
              </div>
              <div className="mt-2 flex w-full max-w-xs flex-col gap-2 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 flex-1 gap-2 rounded-xl"
                  disabled={isProcessing}
                  onClick={() => libraryInputRef.current?.click()}
                >
                  <Images className="h-4 w-4" />
                  Library
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 flex-1 gap-2 rounded-xl"
                  disabled={isProcessing}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                  Camera
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                disabled={isProcessing}
                className="h-11 flex-1 gap-2"
                onClick={() => libraryInputRef.current?.click()}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Images className="h-4 w-4" />
                )}
                From library
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isProcessing}
                className="h-11 flex-1 gap-2"
                onClick={() => cameraInputRef.current?.click()}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                Take photo
              </Button>
            </div>
          </>
        )}
      </div>
      {variant !== "dropzone" && (
        <p className="text-sm text-muted-foreground text-center">
          Choose from your library or take a new photo
        </p>
      )}
    </div>
  )
}
