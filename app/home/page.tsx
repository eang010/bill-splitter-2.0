"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
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
  const [nameCount, setNameCount] = useState(0)

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

  useEffect(() => {
    const loadNames = () => {
      const savedNames = localStorage.getItem("billSplitterNames")
      if (savedNames) {
        setNameCount(JSON.parse(savedNames).length)
      } else {
        setNameCount(0)
      }
    }

    loadNames()

    const handleNamesUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<string[]>
      if (customEvent.detail) {
        setNameCount(customEvent.detail.length)
      } else {
        loadNames()
      }
    }

    document.addEventListener("updateNames", handleNamesUpdate)
    return () => {
      document.removeEventListener("updateNames", handleNamesUpdate)
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

  const stepCopy = {
    1: {
      title: "Upload your receipt",
      subtitle: "Add a photo to extract items automatically.",
    },
    2: {
      title: "Who is splitting?",
      subtitle: "Add everyone sharing this bill.",
    },
    3: {
      title: "Taxes & charges",
      subtitle: "Adjust GST and service charge settings.",
    },
    4: {
      title: "Discount",
      subtitle: "Apply a discount if needed.",
    },
  }

  const isContinueDisabled = currentStep === 2 && nameCount === 0

  return (
    <main className="min-h-screen bg-background">
      <MoneyAnimation isVisible={isProcessing} />
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10">
        <div className="pt-10">
          {currentStep === 1 && (
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight relative inline-block text-left">
                <span className="font-light tracking-wider bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent drop-shadow-sm">
                  Bill
                </span>{" "}
                <span className="animate-splitter">
                  {"Splitter".split("").map((letter, index) => (
                    <span
                      key={index}
                      style={{
                        "--delay": 6 - index,
                        "--position": index,
                      } as React.CSSProperties}
                      className="font-black tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent drop-shadow-sm"
                    >
                      {letter}
                    </span>
                  ))}
                </span>
                <div className="absolute -bottom-2 left-0 w-1/3 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
              </h1>
            </div>
          )}
          {currentStep > 1 && (
            <div className="flex items-center justify-center">
              {Array.from({ length: 4 }).map((_, index) => {
                const stepNumber = index + 1
                const isComplete = stepNumber < currentStep
                const isCurrent = stepNumber === currentStep
                return (
                  <div key={stepNumber} className="flex items-center">
                    <span
                      className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                        isCurrent
                          ? "border-primary bg-primary scale-125"
                          : isComplete
                            ? "border-primary/40 bg-primary/40"
                            : "border-muted-foreground/40"
                      }`}
                    />
                    {stepNumber < 4 && (
                      <span
                        className={`mx-2 h-px w-8 transition-colors duration-300 ${
                          isComplete ? "bg-primary/40" : "bg-muted-foreground/30"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {currentStep > 1 && (
          <div className="relative mt-10 text-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold text-foreground">
              {stepCopy[currentStep as keyof typeof stepCopy].title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {stepCopy[currentStep as keyof typeof stepCopy].subtitle}
            </p>
          </div>
        )}

        <div
          key={currentStep}
          className={`flex flex-1 flex-col animate-in fade-in-0 duration-300 ${
            currentStep === 1 ? "justify-center pt-8" : "pt-8"
          }`}
        >
          {currentStep === 1 && (
            <div className="w-full">
              <ReceiptProcessor
                variant="dropzone"
                onReceiptProcessed={handleReceiptProcessed}
                isDialogOpen={isUploadDialogOpen}
                onDialogChange={setIsUploadDialogOpen}
                onProcessingChange={setIsProcessing}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-1 flex-col">
              <NameList inDialog />
              <Button
                className="mt-auto h-12 w-full rounded-xl text-base"
                onClick={handleContinue}
                disabled={isContinueDisabled}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-1 flex-col">
              <TaxesComponent
                variant="wizard"
                taxSettings={taxSettings}
                updateTaxSettings={updateTaxSettings}
              />
              <Button className="mt-auto h-12 w-full rounded-xl text-base" onClick={handleContinue}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex flex-1 flex-col">
              <DiscountComponent
                variant="wizard"
                discountSettings={discountSettings}
                updateDiscountSettings={updateDiscountSettings}
              />
              <Button className="mt-auto h-12 w-full rounded-xl text-base" onClick={handleContinue}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

