"use client"

import { useEffect, useState } from "react"
import { Users, Plus, DollarSign, Upload, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import MoneyAnimation from "./money-animation"
import NameList from "./name-list"
import TaxesComponent from "./taxes-component"
import { usePathname, useRouter } from "next/navigation"

// Default tax settings
const defaultTaxSettings = {
  gst: 9,
  serviceCharge: 10,
  applyGst: true,
  applyServiceCharge: true,
}

export default function NavigationBar() {
  const [mounted, setMounted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isNamesDialogOpen, setIsNamesDialogOpen] = useState(false)
  const [isTaxesDialogOpen, setIsTaxesDialogOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [taxSettings, setTaxSettings] = useState(defaultTaxSettings)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    // Listen for tax settings updates from other components
    const handleTaxSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<typeof defaultTaxSettings>
      if (customEvent.detail) {
        setTaxSettings(customEvent.detail)
      }
    }

    // Listen for receipt reset events
    const handleReceiptReset = () => {
      setTaxSettings(defaultTaxSettings)
    }

    document.addEventListener("updateTaxSettings", handleTaxSettingsUpdate as EventListener)
    document.addEventListener("resetReceipt", handleReceiptReset)

    return () => {
      document.removeEventListener("updateTaxSettings", handleTaxSettingsUpdate as EventListener)
      document.removeEventListener("resetReceipt", handleReceiptReset)
    }
  }, [])

  // Update tax settings and dispatch event
  const updateTaxSettings = (newSettings: typeof defaultTaxSettings) => {
    setTaxSettings(newSettings)

    // Dispatch event to update calculations
    const event = new CustomEvent("updateTaxSettings", {
      detail: newSettings,
    })
    document.dispatchEvent(event)
  }

  const handleUpload = () => {
    setIsUploadDialogOpen(false)
    setIsProcessing(true)

    // Reset tax settings to default when a new receipt is uploaded
    setTaxSettings(defaultTaxSettings)

    // Reset receipt data
    const resetEvent = new CustomEvent("resetReceipt")
    document.dispatchEvent(resetEvent)

    // Reset bill items
    const resetBillItemsEvent = new CustomEvent("updateBillItems", {
      detail: [
        { id: "1", name: "Pasta", amount: 12.5, assignedTo: [] },
        { id: "2", name: "Pizza", amount: 15.9, assignedTo: [] },
        { id: "3", name: "Salad", amount: 8.75, assignedTo: [] },
        { id: "4", name: "Drinks", amount: 7.2, assignedTo: [] },
        { id: "5", name: "Dessert", amount: 9.5, assignedTo: [] },
      ],
    })
    document.dispatchEvent(resetBillItemsEvent)

    // Reset tax settings
    const resetTaxSettingsEvent = new CustomEvent("updateTaxSettings", {
      detail: defaultTaxSettings,
    })
    document.dispatchEvent(resetTaxSettingsEvent)

    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false)
      // Navigate to bills page after processing
      window.location.href = "/bills"
    }, 3000)
  }

  const handleLogout = () => {
    localStorage.removeItem("billSplitterAuth")
    router.push("/")
  }

  if (!mounted) return null

  return (
    <>
      <MoneyAnimation isVisible={isProcessing} />

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex items-center justify-around">
        {/* Names Dialog */}
        <Dialog open={isNamesDialogOpen} onOpenChange={setIsNamesDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12">
              <Users className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>People</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <NameList inDialog={true} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Receipt Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-16 w-16 shadow-lg">
              <Plus className="h-8 w-8" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a receipt</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="border-2 border-dashed border-muted-foreground rounded-lg p-12 flex flex-col items-center justify-center gap-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  Upload a receipt image to automatically extract items
                </p>
                <Button onClick={handleUpload}>Select Image</Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">Supported formats: JPG, PNG, PDF</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Taxes Dialog */}
        <Dialog open={isTaxesDialogOpen} onOpenChange={setIsTaxesDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12">
              <DollarSign className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Taxes & Charges</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <TaxesComponent inDialog={true} taxSettings={taxSettings} updateTaxSettings={updateTaxSettings} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Logout Dialog */}
        <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12">
              <LogOut className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Logout</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4">Are you sure you want to logout?</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

