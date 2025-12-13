"use client"

import { useEffect, useState } from "react"
import { Users, DollarSign, LogOut, Plus, HelpCircle, Percent, History, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { usePathname, useRouter } from "next/navigation"
import NameList from "./name-list"
import TaxesComponent from "./taxes-component"
import ReceiptProcessor from "./receipt-processor"
import { ThemeToggle } from "./theme-toggle"
import DiscountComponent, { DiscountSettings } from "./discount-component"
import MoneyAnimation from "./money-animation"
import Link from "next/link"

// Default tax settings
const defaultTaxSettings = {
  gst: 9,
  serviceCharge: 10,
  applyGst: true,
  applyServiceCharge: true,
}

// Default discount settings
const defaultDiscountSettings: DiscountSettings = {
  type: "percentage" as const,
  value: 0,
  applyBeforeTax: true,
  enabled: false,
}

export default function NavigationBar() {
  const [mounted, setMounted] = useState(false)
  const [isNamesDialogOpen, setIsNamesDialogOpen] = useState(false)
  const [isTaxesDialogOpen, setIsTaxesDialogOpen] = useState(false)
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [taxSettings, setTaxSettings] = useState(defaultTaxSettings)
  const [discountSettings, setDiscountSettings] = useState(defaultDiscountSettings)
  const [startTour, setStartTour] = useState(false)
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

    // Listen for discount settings updates
    const handleDiscountSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<typeof defaultDiscountSettings>
      if (customEvent.detail) {
        setDiscountSettings(customEvent.detail)
      }
    }

    // Listen for receipt reset events
    const handleReceiptReset = () => {
      setTaxSettings(defaultTaxSettings)
      setDiscountSettings(defaultDiscountSettings)
    }

    // Listen for receipt upload button click
    const handleReceiptUploadClick = () => {
      setIsUploadDialogOpen(true)
    }

    document.addEventListener("updateTaxSettings", handleTaxSettingsUpdate as EventListener)
    document.addEventListener("updateDiscountSettings", handleDiscountSettingsUpdate as EventListener)
    document.addEventListener("resetReceipt", handleReceiptReset)
    document.addEventListener("receiptUploadClick", handleReceiptUploadClick)

    return () => {
      document.removeEventListener("updateTaxSettings", handleTaxSettingsUpdate as EventListener)
      document.removeEventListener("updateDiscountSettings", handleDiscountSettingsUpdate as EventListener)
      document.removeEventListener("resetReceipt", handleReceiptReset)
      document.removeEventListener("receiptUploadClick", handleReceiptUploadClick)
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

  // Update discount settings and dispatch event
  const updateDiscountSettings = (newSettings: typeof defaultDiscountSettings) => {
    setDiscountSettings(newSettings)

    // Dispatch event to update calculations
    const event = new CustomEvent("updateDiscountSettings", {
      detail: newSettings,
    })
    document.dispatchEvent(event)
  }

  const handleLogout = () => {
    // Only clear the authentication state
    localStorage.removeItem("billSplitterAuth")
    router.push("/")
  }

  const handleReceiptProcessed = (items: any[]) => {
    setIsUploadDialogOpen(false)
    setIsProcessing(false)
    
    // Clear existing bill items from localStorage
    localStorage.removeItem("billSplitterItems")
    
    // Store the new bill items in localStorage
    localStorage.setItem("billSplitterItems", JSON.stringify(items))
    
    // Dispatch the bill items update event
    const event = new CustomEvent("updateBillItems", {
      detail: items,
    })
    document.dispatchEvent(event)
    
    // Redirect to bills page if not already there
    if (pathname !== "/bills") {
      router.push("/bills")
    }
  }

  const handleHelpClick = () => {
    // Dispatch event to start the tour
    const event = new CustomEvent("startTour")
    document.dispatchEvent(event)
  }

  if (!mounted) return null

  return (
    <>
      <MoneyAnimation isVisible={isProcessing} />
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <nav className="flex items-center justify-between border-t bg-background px-4 py-2">
          <div className="flex items-center gap-2">
            <Dialog open={isNamesDialogOpen} onOpenChange={setIsNamesDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  id="names-button"
                  variant={isNamesDialogOpen ? "default" : "ghost"}
                  size="icon"
                  className={`h-12 w-12 ${isNamesDialogOpen ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setIsNamesDialogOpen(true)}
                >
                  <Users className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage People</DialogTitle>
                </DialogHeader>
                <NameList inDialog />
              </DialogContent>
            </Dialog>

            <Dialog open={isTaxesDialogOpen} onOpenChange={setIsTaxesDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  id="taxes-button"
                  variant={isTaxesDialogOpen ? "default" : "ghost"}
                  size="icon"
                  className={`h-12 w-12 ${isTaxesDialogOpen ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setIsTaxesDialogOpen(true)}
                >
                  <DollarSign className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Taxes</DialogTitle>
                </DialogHeader>
                <TaxesComponent
                  inDialog
                  taxSettings={taxSettings}
                  updateTaxSettings={updateTaxSettings}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  id="discount-button"
                  variant={isDiscountDialogOpen ? "default" : "ghost"}
                  size="icon"
                  className={`h-12 w-12 ${isDiscountDialogOpen ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setIsDiscountDialogOpen(true)}
                >
                  <Percent className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Discount</DialogTitle>
                </DialogHeader>
                <DiscountComponent
                  inDialog
                  discountSettings={discountSettings}
                  updateDiscountSettings={updateDiscountSettings}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button
                id="upload-receipt-button"
                variant={isUploadDialogOpen ? "default" : "default"}
                size="icon"
                className={`h-12 w-12 rounded-full ${isUploadDialogOpen ? "bg-primary text-primary-foreground" : ""}`}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload</DialogTitle>
              </DialogHeader>
              <ReceiptProcessor
                onReceiptProcessed={handleReceiptProcessed}
                isDialogOpen={isUploadDialogOpen}
                onDialogChange={setIsUploadDialogOpen}
                onProcessingChange={setIsProcessing}
                isProcessing={isProcessing}
              />
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              id="help-button"
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={handleHelpClick}
            >
              <HelpCircle className="h-6 w-6" />
            </Button>

            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setIsLogoutDialogOpen(true)}
                >
                  <LogOut className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Logout</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <p>Are you sure you want to logout?</p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsLogoutDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="default" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </nav>

        <div className="text-center py-1 pb-4 text-[10px] text-muted-foreground/70 bg-background border-t">
          <p className="flex items-center justify-center gap-1">
            Made with ❤️ by{" "}
            <Link 
              href="https://www.linkedin.com/in/emilyang20/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              Emily
              <Linkedin className="h-2.5 w-2.5" />
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

