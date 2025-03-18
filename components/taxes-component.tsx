"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"

interface TaxSettings {
  gst: number
  serviceCharge: number
  applyGst: boolean
  applyServiceCharge: boolean
}

interface TaxesComponentProps {
  inDialog?: boolean
  taxSettings?: TaxSettings
  updateTaxSettings?: (settings: TaxSettings) => void
}

// Default tax settings
const defaultTaxSettings: TaxSettings = {
  gst: 9,
  serviceCharge: 10,
  applyGst: true,
  applyServiceCharge: true,
}

export default function TaxesComponent({
  inDialog = false,
  taxSettings: externalTaxSettings,
  updateTaxSettings: externalUpdateTaxSettings,
}: TaxesComponentProps) {
  // Use internal state only if external state is not provided
  const [internalTaxSettings, setInternalTaxSettings] = useState<TaxSettings>(defaultTaxSettings)

  // Determine which state and update function to use
  const taxSettings = externalTaxSettings || internalTaxSettings

  // If external update function is provided, use it, otherwise use internal state
  const updateTaxSettings = (newSettings: TaxSettings) => {
    if (externalUpdateTaxSettings) {
      externalUpdateTaxSettings(newSettings)
    } else {
      setInternalTaxSettings(newSettings)

      // Dispatch event to update calculations
      const event = new CustomEvent("updateTaxSettings", {
        detail: newSettings,
      })
      document.dispatchEvent(event)
    }
  }

  // Only set up event listeners if using internal state
  useEffect(() => {
    if (externalTaxSettings) return // Skip if using external state

    const handleTaxSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<TaxSettings>
      if (customEvent.detail) {
        setInternalTaxSettings(customEvent.detail)
      }
    }

    const handleReceiptReset = () => {
      setInternalTaxSettings(defaultTaxSettings)
    }

    document.addEventListener("updateTaxSettings", handleTaxSettingsUpdate as EventListener)
    document.addEventListener("resetReceipt", handleReceiptReset)

    // Dispatch initial tax settings
    const event = new CustomEvent("updateTaxSettings", {
      detail: defaultTaxSettings,
    })
    document.dispatchEvent(event)

    return () => {
      document.removeEventListener("updateTaxSettings", handleTaxSettingsUpdate as EventListener)
      document.removeEventListener("resetReceipt", handleReceiptReset)
    }
  }, [externalTaxSettings])

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value) || 0
    updateTaxSettings({ ...taxSettings, gst: value })
  }

  const handleServiceChargeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value) || 0
    updateTaxSettings({ ...taxSettings, serviceCharge: value })
  }

  const handleGstToggle = (checked: boolean) => {
    updateTaxSettings({ ...taxSettings, applyGst: checked })
  }

  const handleServiceChargeToggle = (checked: boolean) => {
    updateTaxSettings({ ...taxSettings, applyServiceCharge: checked })
  }

  const taxContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="gst">GST (%)</Label>
          <Input
            id="gst"
            type="number"
            value={taxSettings.gst}
            onChange={handleGstChange}
            className="w-24"
            min="0"
            step="0.1"
          />
        </div>
        <Switch checked={taxSettings.applyGst} onCheckedChange={handleGstToggle} aria-label="Apply GST" />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="service-charge">Service Charge (%)</Label>
          <Input
            id="service-charge"
            type="number"
            value={taxSettings.serviceCharge}
            onChange={handleServiceChargeChange}
            className="w-24"
            min="0"
            step="0.1"
          />
        </div>
        <Switch
          checked={taxSettings.applyServiceCharge}
          onCheckedChange={handleServiceChargeToggle}
          aria-label="Apply Service Charge"
        />
      </div>
    </div>
  )

  // For dialog view, show without card wrapper
  if (inDialog) {
    return taxContent
  }

  // For main view, show with card wrapper
  return (
    <Card>
      <CardContent className="pt-6">{taxContent}</CardContent>
    </Card>
  )
}

