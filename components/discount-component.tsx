"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface DiscountSettings {
  type: "percentage" | "amount"
  value: number
  applyBeforeTax: boolean
  enabled: boolean
}

interface DiscountComponentProps {
  inDialog?: boolean
  discountSettings?: DiscountSettings
  updateDiscountSettings?: (settings: DiscountSettings) => void
  variant?: "default" | "wizard"
}

// Default discount settings
const defaultDiscountSettings: DiscountSettings = {
  type: "percentage",
  value: 0,
  applyBeforeTax: true,
  enabled: false
}

export default function DiscountComponent({
  inDialog = false,
  discountSettings: externalDiscountSettings,
  updateDiscountSettings: externalUpdateDiscountSettings,
  variant = "default",
}: DiscountComponentProps) {
  const [internalDiscountSettings, setInternalDiscountSettings] = useState<DiscountSettings>(defaultDiscountSettings)

  // Determine which state and update function to use
  const discountSettings = externalDiscountSettings || internalDiscountSettings

  // If external update function is provided, use it, otherwise use internal state
  const updateSettings = (newSettings: DiscountSettings) => {
    if (externalUpdateDiscountSettings) {
      externalUpdateDiscountSettings(newSettings)
    } else {
      setInternalDiscountSettings(newSettings)

      // Dispatch event to update calculations
      const event = new CustomEvent("updateDiscountSettings", {
        detail: newSettings,
      })
      document.dispatchEvent(event)
    }
  }

  const content = (
    <div className="space-y-4">
      <div className={`flex items-center justify-between ${variant === "wizard" ? "rounded-xl bg-muted/50 px-4 py-3" : ""}`}>
        <Label htmlFor="discount-enabled" className="text-sm font-medium">
          Enable Discount
        </Label>
        <Switch
          id="discount-enabled"
          checked={discountSettings.enabled}
          onCheckedChange={(checked) =>
            updateSettings({ ...discountSettings, enabled: checked })
          }
        />
      </div>

      {discountSettings.enabled && (
        <>
          <div className="space-y-2">
            <Label htmlFor="discount-type" className="text-sm font-medium">
              Discount Type
            </Label>
            <Select
              value={discountSettings.type}
              onValueChange={(value: "percentage" | "amount") =>
                updateSettings({ ...discountSettings, type: value })
              }
            >
              <SelectTrigger id="discount-type" className={variant === "wizard" ? "h-12 rounded-xl text-base" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="amount">Amount ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount-value" className="text-sm font-medium">
              {discountSettings.type === "percentage" ? "Percentage" : "Amount"}
            </Label>
            <div className="flex items-center gap-2">
              {discountSettings.type === "amount" && (
                <span className="text-sm text-muted-foreground">$</span>
              )}
              <Input
                id="discount-value"
                type="number"
                min="0"
                step={discountSettings.type === "percentage" ? "1" : "0.01"}
                value={discountSettings.value}
                onChange={(e) =>
                  updateSettings({
                    ...discountSettings,
                    value: parseFloat(e.target.value) || 0,
                  })
                }
                className={`w-24 ${variant === "wizard" ? "h-12 rounded-xl text-base text-center" : ""}`}
              />
              {discountSettings.type === "percentage" && (
                <span className="text-sm text-muted-foreground">%</span>
              )}
            </div>
          </div>

          <div className={`flex items-center justify-between ${variant === "wizard" ? "rounded-xl bg-muted/50 px-4 py-3" : ""}`}>
            <Label htmlFor="apply-before-tax" className="text-sm font-medium">
              Apply Before Tax
            </Label>
            <Switch
              id="apply-before-tax"
              checked={discountSettings.applyBeforeTax}
              onCheckedChange={(checked) =>
                updateSettings({ ...discountSettings, applyBeforeTax: checked })
              }
            />
          </div>
        </>
      )}
    </div>
  )

  if (inDialog || variant === "wizard") {
    return <div className={variant === "wizard" ? "space-y-6" : ""}>{content}</div>
  }

  return (
    <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-primary/5 to-card border border-primary/10">
      <CardContent className="pt-6">{content}</CardContent>
    </Card>
  )
} 