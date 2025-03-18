"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ReceiptProcessorProps {
  onReceiptProcessed: (items: any[]) => void
  isDialogOpen: boolean
  onDialogChange: (open: boolean) => void
}

export default function ReceiptProcessor({ onReceiptProcessed, isDialogOpen, onDialogChange }: ReceiptProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const handleFileSelect = async (event: Event) => {
      const customEvent = event as CustomEvent<{ file: File }>
      if (!customEvent.detail?.file) return

      setIsProcessing(true)
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
        setIsProcessing(false)
      }
    }

    document.addEventListener("receiptFileSelected", handleFileSelect)
    return () => {
      document.removeEventListener("receiptFileSelected", handleFileSelect)
    }
  }, [onReceiptProcessed, toast, onDialogChange])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Trigger the receipt processor
      const event = new CustomEvent("receiptFileSelected", { detail: { file } })
      document.dispatchEvent(event)
    }
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                disabled={isProcessing}
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button
                disabled={isProcessing}
                className="min-w-[120px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload a receipt image to automatically extract items and prices
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 