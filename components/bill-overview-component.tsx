"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface BillItem {
  id: string
  name: string
  amount: number
  assignedTo: string[]
}

interface TaxSettings {
  gst: number
  serviceCharge: number
  applyGst: boolean
  applyServiceCharge: boolean
}

interface PersonTotal {
  name: string
  amount: number
  serviceChargeAmount: number
  gstAmount: number
  total: number
  items: Array<{
    name: string
    amount: number
  }>
}

// Default tax settings
const defaultTaxSettings: TaxSettings = {
  gst: 9,
  serviceCharge: 10,
  applyGst: true,
  applyServiceCharge: true,
}

export default function BillOverviewComponent() {
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(defaultTaxSettings)
  const [personTotals, setPersonTotals] = useState<PersonTotal[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [serviceChargeTotal, setServiceChargeTotal] = useState(0)
  const [gstTotal, setGstTotal] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)
  const [names, setNames] = useState<string[]>([])

  useEffect(() => {
    // Load names from localStorage
    const savedNames = localStorage.getItem("billSplitterNames")
    if (savedNames) {
      setNames(JSON.parse(savedNames))
    }

    // Listen for bill items updates
    const handleBillItemsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<BillItem[]>
      if (customEvent.detail) {
        setBillItems(customEvent.detail)
      }
    }

    // Listen for tax settings updates
    const handleTaxSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<TaxSettings>
      if (customEvent.detail) {
        setTaxSettings(customEvent.detail)
      }
    }

    // Listen for receipt reset
    const handleReceiptReset = () => {
      setTaxSettings(defaultTaxSettings)
    }

    document.addEventListener("updateBillItems", handleBillItemsUpdate as EventListener)
    document.addEventListener("updateTaxSettings", handleTaxSettingsUpdate as EventListener)
    document.addEventListener("resetReceipt", handleReceiptReset)

    return () => {
      document.removeEventListener("updateBillItems", handleBillItemsUpdate as EventListener)
      document.removeEventListener("updateTaxSettings", handleTaxSettingsUpdate as EventListener)
      document.removeEventListener("resetReceipt", handleReceiptReset)
    }
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [billItems, taxSettings])

  const calculateTotals = () => {
    // Get all unique names from bill items
    const allNames = new Set<string>()
    billItems.forEach((item) => {
      item.assignedTo.forEach((name) => {
        allNames.add(name)
      })
    })

    // Calculate total for each person
    const totals: PersonTotal[] = Array.from(allNames).map((name) => {
      let subtotal = 0
      const personItems: Array<{ name: string; amount: number }> = []

      billItems.forEach((item) => {
        if (item.assignedTo.includes(name)) {
          const personAmount = item.amount / item.assignedTo.length
          subtotal += personAmount
          personItems.push({
            name: item.name,
            amount: personAmount,
          })
        }
      })

      // Calculate service charge
      const serviceChargeAmount = taxSettings.applyServiceCharge ? subtotal * (taxSettings.serviceCharge / 100) : 0

      // Calculate GST (applied after service charge)
      const amountWithServiceCharge = subtotal + serviceChargeAmount
      const gstAmount = taxSettings.applyGst ? amountWithServiceCharge * (taxSettings.gst / 100) : 0

      // Calculate total
      const total = subtotal + serviceChargeAmount + gstAmount

      return {
        name,
        amount: subtotal,
        serviceChargeAmount,
        gstAmount,
        total,
        items: personItems,
      }
    })

    // Sort alphabetically
    totals.sort((a, b) => a.name.localeCompare(b.name))

    setPersonTotals(totals)

    // Calculate grand totals
    const totalSubtotal = totals.reduce((sum, person) => sum + person.amount, 0)
    const totalServiceCharge = totals.reduce((sum, person) => sum + person.serviceChargeAmount, 0)
    const totalGst = totals.reduce((sum, person) => sum + person.gstAmount, 0)
    const totalAmount = totals.reduce((sum, person) => sum + person.total, 0)

    setSubtotal(totalSubtotal)
    setServiceChargeTotal(totalServiceCharge)
    setGstTotal(totalGst)
    setGrandTotal(totalAmount)
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Overview</h2>

      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent id="payment-summary">
          <div className="space-y-4">
            {personTotals.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {personTotals.map((person, index) => (
                  <AccordionItem key={person.name} value={`person-${index}`}>
                    <AccordionTrigger className="py-3">
                      <div className="flex justify-between items-center w-full pr-4">
                        <span className="font-medium">{person.name}</span>
                        <span className="font-mono font-bold">${person.total.toFixed(2)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2 pb-1">
                        <div className="flex justify-between items-center text-sm">
                          <span>Subtotal</span>
                          <span className="font-mono">${person.amount.toFixed(2)}</span>
                        </div>

                        {taxSettings.applyServiceCharge && (
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Service Charge ({taxSettings.serviceCharge}%)</span>
                            <span className="font-mono">${person.serviceChargeAmount.toFixed(2)}</span>
                          </div>
                        )}

                        {taxSettings.applyGst && (
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>GST ({taxSettings.gst}%)</span>
                            <span className="font-mono">${person.gstAmount.toFixed(2)}</span>
                          </div>
                        )}

                        <Separator className="my-2" />

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Items:</div>
                          {person.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm pl-2">
                              <span className="text-muted-foreground">{item.name}</span>
                              <span className="font-mono text-muted-foreground">${item.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center text-muted-foreground py-4">No items assigned yet</div>
            )}

            {personTotals.length > 0 && (
              <>
                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono">${subtotal.toFixed(2)}</span>
                  </div>

                  {taxSettings.applyServiceCharge && (
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Service Charge ({taxSettings.serviceCharge}%)</span>
                      <span className="font-mono">${serviceChargeTotal.toFixed(2)}</span>
                    </div>
                  )}

                  {taxSettings.applyGst && (
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>GST ({taxSettings.gst}%)</span>
                      <span className="font-mono">${gstTotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center font-bold">
                  <span>Grand Total</span>
                  <span className="font-mono text-lg">${grandTotal.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

