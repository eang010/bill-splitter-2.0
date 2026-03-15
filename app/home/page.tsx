"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import NameList from "@/components/name-list"
import TaxesComponent from "@/components/taxes-component"
import DiscountComponent, { DiscountSettings } from "@/components/discount-component"
import ReceiptProcessor from "@/components/receipt-processor"
import MoneyAnimation from "@/components/money-animation"
import { Button } from "@/components/ui/button"

const defaultTaxSettings = {
  gst: 9,
  serviceCharge: 10,
  applyGst: true,
  applyServiceCharge: true,
}

const defaultDiscountSettings: DiscountSettings = {
  type: "percentage",
  value: 0,
  applyBeforeTax: true,
  enabled: false,
}

export default function HomePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(true)
  const [taxSettings, setTaxSettings] = useState(defaultTaxSettings)
  const [discountSettings, setDiscountSettings] = useState(defaultDiscountSettings)

  useEffect(() => {
    try {
      const isAuthenticated = localStorage.getItem("billSplitterAuth") === "true"
      if (!isAuthenticated) {
        router.push("/")
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    setIsUploadDialogOpen(currentStep === 1)
  }, [currentStep])

  useEffect(() => {
    const savedTaxSettings = localStorage.getItem("billSplitterTaxSettings")
    const savedDiscountSettings = localStorage.getItem("billSplitterDiscountSettings")

    if (savedTaxSettings) {
      try {
        const parsed = JSON.parse(savedTaxSettings)
        setTaxSettings(parsed)
        const taxEvent = new CustomEvent("updateTaxSettings", { detail: parsed })
        document.dispatchEvent(taxEvent)
      } catch (error) {
        console.error("Error parsing saved tax settings:", error)
      }
    } else {
      const taxEvent = new CustomEvent("updateTaxSettings", { detail: defaultTaxSettings })
      document.dispatchEvent(taxEvent)
    }

    if (savedDiscountSettings) {
      try {
        const parsed = JSON.parse(savedDiscountSettings)
        setDiscountSettings(parsed)
        const discountEvent = new CustomEvent("updateDiscountSettings", { detail: parsed })
        document.dispatchEvent(discountEvent)
      } catch (error) {
        console.error("Error parsing saved discount settings:", error)
      }
    } else {
      const discountEvent = new CustomEvent("updateDiscountSettings", { detail: defaultDiscountSettings })
      document.dispatchEvent(discountEvent)
    }
  }, [])

  const updateTaxSettings = (newSettings: typeof defaultTaxSettings) => {
    setTaxSettings(newSettings)
    try {
      localStorage.setItem("billSplitterTaxSettings", JSON.stringify(newSettings))
    } catch (error) {
      console.error("Error saving tax settings:", error)
    }
    const event = new CustomEvent("updateTaxSettings", {
      detail: newSettings,
    })
    document.dispatchEvent(event)
  }

  const updateDiscountSettings = (newSettings: typeof defaultDiscountSettings) => {
    setDiscountSettings(newSettings)
    try {
      localStorage.setItem("billSplitterDiscountSettings", JSON.stringify(newSettings))
    } catch (error) {
      console.error("Error saving discount settings:", error)
    }
    const event = new CustomEvent("updateDiscountSettings", {
      detail: newSettings,
    })
    document.dispatchEvent(event)
  }

  const handleReceiptProcessed = (items: any[]) => {
    setIsProcessing(false)
    setIsUploadDialogOpen(false)
    setTaxSettings(defaultTaxSettings)
    setDiscountSettings(defaultDiscountSettings)
    try {
      localStorage.setItem("billSplitterTaxSettings", JSON.stringify(defaultTaxSettings))
      localStorage.setItem("billSplitterDiscountSettings", JSON.stringify(defaultDiscountSettings))
    } catch (error) {
      console.error("Error saving default settings:", error)
    }
    document.dispatchEvent(new CustomEvent("updateTaxSettings", { detail: defaultTaxSettings }))
    document.dispatchEvent(new CustomEvent("updateDiscountSettings", { detail: defaultDiscountSettings }))
    try {
      localStorage.removeItem("billSplitterItems")
      localStorage.setItem("billSplitterItems", JSON.stringify(items))
    } catch (error) {
      console.error("Error saving receipt items:", error)
    }
    setCurrentStep(2)
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const handleContinue = () => {
    if (currentStep === 2) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      setCurrentStep(4)
    } else if (currentStep === 4) {
      router.push("/bills")
    }
  }

  const stepTitle = currentStep === 2 ? "Who is splitting?" : currentStep === 3 ? "Taxes & Charges" : "Discount"

  return (
    <main className="min-h-screen bg-background">
      <MoneyAnimation isVisible={isProcessing} />
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-10">
        <div className="pt-6">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: 4 }).map((_, index) => {
              const stepNumber = index + 1
              const isComplete = stepNumber <= currentStep
              return (
                <span
                  key={stepNumber}
                  className={`h-2.5 w-2.5 rounded-full border ${
                    isComplete ? "border-primary bg-primary" : "border-muted-foreground/40"
                  }`}
                />
              )
            })}
          </div>
        </div>

        {currentStep > 1 && (
          <div className="mt-6 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">{stepTitle}</h1>
          </div>
        )}

        <div className={`flex flex-1 flex-col ${currentStep === 1 ? "justify-center" : "pt-6"}`}>
          {currentStep === 1 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <h1 className="text-2xl font-semibold">Upload Receipt</h1>
              <div className="mt-6 w-full rounded-3xl border border-dashed border-muted-foreground/30 bg-card/60 p-10 shadow-sm">
                <ReceiptProcessor
                  onReceiptProcessed={handleReceiptProcessed}
                  isDialogOpen={isUploadDialogOpen}
                  onDialogChange={setIsUploadDialogOpen}
                  onProcessingChange={setIsProcessing}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <NameList inDialog />
              <Button className="w-full" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <TaxesComponent taxSettings={taxSettings} updateTaxSettings={updateTaxSettings} />
              <Button className="w-full" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <DiscountComponent
                discountSettings={discountSettings}
                updateDiscountSettings={updateDiscountSettings}
              />
              <Button className="w-full" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

