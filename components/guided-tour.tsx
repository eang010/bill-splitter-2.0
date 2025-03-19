"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, ArrowRight } from "lucide-react"

interface TourStep {
  target: string
  title: string
  content: string
  position: "top" | "right" | "bottom" | "left"
}

interface GuidedTourProps {
  startTour?: boolean
  onTourStart?: () => void
}

const homeTourSteps: TourStep[] = [
  {
    target: "#name-add-button",
    title: "Add People",
    content: "Click here to add names of people who are splitting the bill.",
    position: "bottom",
  },
  {
    target: "#taxes-section",
    title: "Taxes & Charges",
    content: "Update GST and service charge percentages if necessary.",
    position: "top",
  },
  {
    target: "#upload-receipt-button",
    title: "Upload Receipt",
    content: "Click here to upload a receipt and start splitting the bill. This will take you to the bills page.",
    position: "top",
  },
  {
    target: "#help-button",
    title: "Need Help?",
    content: "Click this button anytime to see this tour again.",
    position: "bottom",
  },
]

const billsTourSteps: TourStep[] = [
  {
    target: ".assign-name-field",
    title: "Assign Names",
    content: "Select names from the dropdown to assign people to each item.",
    position: "right",
  },
  {
    target: ".amount-field",
    title: "Edit Amount",
    content: "Edit the amount if the receipt value is incorrect.",
    position: "left",
  },
  {
    target: "#names-button",
    title: "Manage People",
    content: "Click here to add more people if needed.",
    position: "bottom",
  },
  {
    target: "#taxes-button",
    title: "Update Taxes",
    content: "Click here to update tax settings if needed.",
    position: "bottom",
  },
  {
    target: "#payment-summary",
    title: "Payment Summary",
    content: "View the breakdown of what each person owes. You're all set!",
    position: "bottom",
  },
  {
    target: "#help-button",
    title: "Need Help?",
    content: "Click this button anytime to see this tour again.",
    position: "bottom",
  },
]

export default function GuidedTour({ startTour = false, onTourStart }: GuidedTourProps) {
  const [isTourActive, setIsTourActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const pathname = usePathname()

  // Get the appropriate tour steps based on the current page
  const tourSteps = pathname === "/home" ? homeTourSteps : billsTourSteps

  // Handle external tour start trigger
  useEffect(() => {
    if (startTour) {
      setIsTourActive(true)
      setCurrentStep(0)
      if (onTourStart) {
        onTourStart()
      }
    }
  }, [startTour, onTourStart])

  // Auto-start tour for first-time users
  useEffect(() => {
    // Check if this is the first time the user is accessing the app
    const hasSeenHomeTour = localStorage.getItem("billSplitterHomeTourComplete") === "true"
    const hasSeenBillsTour = localStorage.getItem("billSplitterBillsTourComplete") === "true"

    // Start the tour after a short delay to ensure the page is fully loaded
    const timer = setTimeout(() => {
      if (pathname === "/home" && !hasSeenHomeTour) {
        setIsTourActive(true)
        setCurrentStep(0)
      } else if (pathname === "/bills" && !hasSeenBillsTour) {
        setIsTourActive(true)
        setCurrentStep(0)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    if (!isTourActive) return

    // Get current step
    const step = tourSteps[currentStep]

    // Find the target element
    const element = document.querySelector(step.target) as HTMLElement
    setTargetElement(element)

    if (element) {
      const rect = element.getBoundingClientRect()

      // Calculate tooltip position based on the position property
      let top = 0
      let left = 0

      switch (step.position) {
        case "top":
          top = rect.top - 10 - 120 // height of tooltip
          left = rect.left + rect.width / 2 - 150 // half of tooltip width
          // If the element is too low in the viewport, position the tooltip above the viewport midpoint
          if (rect.top > window.innerHeight / 2) {
            top = Math.min(rect.top - 10 - 120, window.innerHeight / 2 - 120)
            element.scrollIntoView({ behavior: "smooth", block: "center" })
          }
          break
        case "right":
          top = rect.top + rect.height / 2 - 60 // half of tooltip height
          left = rect.right + 10
          break
        case "bottom":
          top = rect.bottom + 10
          left = rect.left + rect.width / 2 - 150 // half of tooltip width
          // Add extra margin at the bottom to prevent cut-off by navigation bar
          if (top + 120 > window.innerHeight - 100) { // 120 is tooltip height, 100 is nav bar + padding
            top = window.innerHeight - 220 // Keep 100px from bottom of screen
          }
          break
        case "left":
          top = rect.top + rect.height / 2 - 60 // half of tooltip height
          left = rect.left - 10 - 300 // width of tooltip
          break
      }

      // Ensure tooltip stays within viewport
      if (left < 10) left = 10
      if (left > window.innerWidth - 310) left = window.innerWidth - 310
      if (top < 10) top = 10
      if (top > window.innerHeight - 130) top = window.innerHeight - 130

      setTooltipPosition({ top, left })

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [isTourActive, currentStep, tourSteps])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const completeTour = () => {
    setIsTourActive(false)
    // Mark the appropriate tour as complete based on the current page
    if (pathname === "/home") {
      localStorage.setItem("billSplitterHomeTourComplete", "true")
    } else if (pathname === "/bills") {
      localStorage.setItem("billSplitterBillsTourComplete", "true")
    }
  }

  if (!isTourActive) return null

  const currentTourStep = tourSteps[currentStep]

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={completeTour} />

      {/* Highlight target element */}
      {targetElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 5,
            left: targetElement.getBoundingClientRect().left - 5,
            width: targetElement.getBoundingClientRect().width + 10,
            height: targetElement.getBoundingClientRect().height + 10,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
            borderRadius: "4px",
            border: "2px solid white",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-card border border-border rounded-lg shadow-lg p-4 w-[300px]"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{currentTourStep.title}</h3>
          <Button variant="ghost" size="icon" onClick={completeTour} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{currentTourStep.content}</p>
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={completeTour}>
              Skip
            </Button>
            <Button size="sm" onClick={handleNext}>
              {currentStep < tourSteps.length - 1 ? (
                <>
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </>
              ) : (
                "Finish"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
} 