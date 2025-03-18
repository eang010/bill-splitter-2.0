"use client"

import { useEffect, useState } from "react"
import { Users, DollarSign, LogOut, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { usePathname, useRouter } from "next/navigation"
import NameList from "./name-list"
import TaxesComponent from "./taxes-component"

// Default tax settings
const defaultTaxSettings = {
  gst: 9,
  serviceCharge: 10,
  applyGst: true,
  applyServiceCharge: true,
}

export default function NavigationBar() {
  const [mounted, setMounted] = useState(false)
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

  const handleLogout = () => {
    localStorage.removeItem("billSplitterAuth")
    router.push("/")
  }

  const handleReceiptUploadClick = () => {
    // Dispatch event to trigger receipt upload
    const event = new CustomEvent("receiptUploadClick")
    document.dispatchEvent(event)
  }

  if (!mounted) return null

  return (
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

      {/* Upload Receipt Button */}
      <Button size="icon" className="rounded-full h-16 w-16 shadow-lg" onClick={handleReceiptUploadClick}>
        <Plus className="h-8 w-8" />
      </Button>

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
  )
}

