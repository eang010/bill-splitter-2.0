"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReceiptProcessorProps {
  onReceiptProcessed: (items: any[]) => void
  isDialogOpen: boolean
  onDialogChange: (open: boolean) => void
  onProcessingChange: (isProcessing: boolean) => void
  isProcessing: boolean
}

export default function ReceiptProcessor({ onReceiptProcessed, isDialogOpen, onDialogChange, onProcessingChange, isProcessing }: ReceiptProcessorProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleFileSelect = async (event: Event) => {
      const customEvent = event as CustomEvent<{ file: File }>
      if (!customEvent.detail?.file) return

      onProcessingChange(true)
      const file = customEvent.detail.file

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

        // Dispatch bill items update event
        const event = new CustomEvent("updateBillItems", {
          detail: data.items,
        })
        document.dispatchEvent(event)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Trigger the receipt processor
      const event = new CustomEvent("receiptFileSelected", { detail: { file } })
      document.dispatchEvent(event)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          accept="image/*"
          disabled={isProcessing}
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Button
          disabled={isProcessing}
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Receipt
            </>
          )}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Click to upload a receipt image
      </p>
    </div>
  )
} 