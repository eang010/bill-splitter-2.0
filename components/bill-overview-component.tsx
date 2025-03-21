"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

interface DiscountSettings {
  type: "percentage" | "amount"
  value: number
  applyBeforeTax: boolean
  enabled: boolean
}

interface PersonTotal {
  name: string
  amount: number
  serviceChargeAmount: number
  gstAmount: number
  discountAmount: number
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

// Default discount settings
const defaultDiscountSettings: DiscountSettings = {
  type: "percentage",
  value: 0,
  applyBeforeTax: true,
  enabled: false,
}

export default function BillOverviewComponent() {
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(defaultTaxSettings)
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings>(defaultDiscountSettings)
  const [personTotals, setPersonTotals] = useState<PersonTotal[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [serviceChargeTotal, setServiceChargeTotal] = useState(0)
  const [gstTotal, setGstTotal] = useState(0)
  const [discountTotal, setDiscountTotal] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)
  const [names, setNames] = useState<string[]>([])
  const { toast } = useToast()

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

    // Listen for discount settings updates
    const handleDiscountSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<DiscountSettings>
      if (customEvent.detail) {
        setDiscountSettings(customEvent.detail)
      }
    }

    // Listen for receipt reset
    const handleReceiptReset = () => {
      setTaxSettings(defaultTaxSettings)
      setDiscountSettings(defaultDiscountSettings)
    }

    document.addEventListener("updateBillItems", handleBillItemsUpdate as EventListener)
    document.addEventListener("updateTaxSettings", handleTaxSettingsUpdate as EventListener)
    document.addEventListener("updateDiscountSettings", handleDiscountSettingsUpdate as EventListener)
    document.addEventListener("resetReceipt", handleReceiptReset)

    return () => {
      document.removeEventListener("updateBillItems", handleBillItemsUpdate as EventListener)
      document.removeEventListener("updateTaxSettings", handleTaxSettingsUpdate as EventListener)
      document.removeEventListener("updateDiscountSettings", handleDiscountSettingsUpdate as EventListener)
      document.removeEventListener("resetReceipt", handleReceiptReset)
    }
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [billItems, taxSettings, discountSettings])

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

      // Calculate discount
      let discountAmount = 0
      if (discountSettings.enabled) {
        if (discountSettings.type === "percentage") {
          discountAmount = subtotal * (discountSettings.value / 100)
        } else {
          // For amount type, divide the total discount amount among all people
          discountAmount = discountSettings.value / allNames.size
        }
      }

      // Apply discount before or after tax based on settings
      let amountAfterDiscount = subtotal
      if (discountSettings.enabled && discountSettings.applyBeforeTax) {
        amountAfterDiscount = subtotal - discountAmount
      }

      // Calculate service charge
      const serviceChargeAmount = taxSettings.applyServiceCharge ? amountAfterDiscount * (taxSettings.serviceCharge / 100) : 0

      // Calculate GST (applied after service charge)
      const amountWithServiceCharge = amountAfterDiscount + serviceChargeAmount
      const gstAmount = taxSettings.applyGst ? amountWithServiceCharge * (taxSettings.gst / 100) : 0

      // Apply discount after tax if configured
      if (discountSettings.enabled && !discountSettings.applyBeforeTax) {
        amountAfterDiscount = subtotal + serviceChargeAmount + gstAmount - discountAmount
      }

      // Calculate total
      const total = discountSettings.applyBeforeTax
        ? amountAfterDiscount + serviceChargeAmount + gstAmount
        : amountAfterDiscount

      return {
        name,
        amount: subtotal,
        serviceChargeAmount,
        gstAmount,
        discountAmount,
        total,
        items: personItems,
      }
    })

    // Sort alphabetically
    totals.sort((a, b) => a.name.localeCompare(b.name))

    setPersonTotals(totals)

    // Calculate grand totals
    const totalSubtotal = totals.reduce((sum, person) => sum + person.amount, 0)
    const totalDiscount = totals.reduce((sum, person) => sum + person.discountAmount, 0)

    // Calculate grand total with proper discount application
    let grandTotalAmount = totalSubtotal
    
    if (discountSettings.enabled && discountSettings.applyBeforeTax) {
      grandTotalAmount -= totalDiscount
    }

    // Apply service charge to discounted or original amount
    const totalServiceCharge = taxSettings.applyServiceCharge 
      ? grandTotalAmount * (taxSettings.serviceCharge / 100)
      : 0
    
    // Apply GST to amount with service charge
    const amountWithServiceCharge = grandTotalAmount + totalServiceCharge
    const totalGst = taxSettings.applyGst 
      ? amountWithServiceCharge * (taxSettings.gst / 100)
      : 0

    // Calculate final grand total
    if (discountSettings.enabled && !discountSettings.applyBeforeTax) {
      grandTotalAmount = totalSubtotal + totalServiceCharge + totalGst - totalDiscount
    } else {
      grandTotalAmount = grandTotalAmount + totalServiceCharge + totalGst
    }

    setSubtotal(totalSubtotal)
    setServiceChargeTotal(totalServiceCharge)
    setGstTotal(totalGst)
    setDiscountTotal(totalDiscount)
    setGrandTotal(grandTotalAmount)
  }

  const handleShare = async () => {
    // Format the payment summary
    const summary = personTotals.map(person => 
      `${person.name}: $${person.total.toFixed(2)}`
    ).join('\n');
    
    const fullSummary = `Bill Split Summary\n\n${summary}\n\nTotal: $${grandTotal.toFixed(2)}`;

    // Try to use Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bill Split Summary',
          text: fullSummary,
        });
        toast({
          title: "Shared successfully!",
          description: "The payment summary has been shared.",
        });
      } catch (error) {
        // Fall back to clipboard if user cancels share
        await copyToClipboard(fullSummary);
      }
    } else {
      // Fall back to clipboard
      await copyToClipboard(fullSummary);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        description: "The payment summary has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <Card 
        id="payment-summary" 
        className="shadow-lg border-t-4 border-t-primary bg-gradient-to-br from-card to-card/90 transition-colors duration-200"
      >
        <CardHeader className="bg-muted/30 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
              Payment Summary
            </CardTitle>
            {personTotals.length > 0 && (
              <Button
                variant="default"
                size="sm"
                className="h-6 flex items-center gap-1 px-2 text-xs"
                onClick={handleShare}
              >
                <Share2 className="h-3 w-3" />
                Share
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personTotals.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {personTotals.map((person, index) => (
                  <AccordionItem 
                    key={person.name} 
                    value={`person-${index}`}
                    className="border border-border/50 rounded-md mb-2 overflow-hidden transition-colors duration-200"
                  >
                    <AccordionTrigger className="py-3 px-4 hover:bg-muted/50 transition-colors data-[state=open]:underline">
                      <div className="flex justify-between items-center w-full pr-4">
                        <span className="font-medium">{person.name}</span>
                        <span className="font-mono font-bold text-primary">${person.total.toFixed(2)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-muted/20 px-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Subtotal</span>
                          <span className="font-mono font-medium">${person.amount.toFixed(2)}</span>
                        </div>

                        {discountSettings.enabled && discountSettings.applyBeforeTax && (
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>
                              Discount ({discountSettings.type === "percentage" ? `${discountSettings.value}%` : "Fixed Amount"})
                            </span>
                            <span className="font-mono">-${person.discountAmount.toFixed(2)}</span>
                          </div>
                        )}

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

                        {discountSettings.enabled && !discountSettings.applyBeforeTax && (
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>
                              Discount ({discountSettings.type === "percentage" ? `${discountSettings.value}%` : "Fixed Amount"})
                            </span>
                            <span className="font-mono">-${person.discountAmount.toFixed(2)}</span>
                          </div>
                        )}

                        <Separator className="my-3" />

                        <div className="space-y-2">
                          <div className="font-medium">Items:</div>
                          <div className="space-y-1.5 bg-background/50 rounded-md p-2">
                            {person.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{item.name}</span>
                                <span className="font-mono text-muted-foreground">${item.amount.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center text-muted-foreground py-8 bg-muted/20 rounded-lg">
                No items assigned yet
              </div>
            )}

            {personTotals.length > 0 && (
              <>
                <Separator className="my-4" />

                <div className="space-y-4">
                  <div className="bg-muted/20 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
                    </div>

                    {discountSettings.enabled && discountSettings.applyBeforeTax && (
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                          Discount ({discountSettings.type === "percentage" ? `${discountSettings.value}%` : "Fixed Amount"})
                        </span>
                        <span className="font-mono">-${discountTotal.toFixed(2)}</span>
                      </div>
                    )}

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

                    {discountSettings.enabled && !discountSettings.applyBeforeTax && (
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                          Discount ({discountSettings.type === "percentage" ? `${discountSettings.value}%` : "Fixed Amount"})
                        </span>
                        <span className="font-mono">-${discountTotal.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Grand Total</span>
                      <span className="font-mono font-bold text-xl text-primary">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

