"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BillItem {
  id: string
  name: string
  amount: number
  assignedTo: string[]
}

export default function BillSplitComponent() {
  const [billItems, setBillItems] = useState<BillItem[]>([
    { id: "1", name: "Pasta", amount: 12.5, assignedTo: [] },
    { id: "2", name: "Pizza", amount: 15.9, assignedTo: [] },
    { id: "3", name: "Salad", amount: 8.75, assignedTo: [] },
    { id: "4", name: "Drinks", amount: 7.2, assignedTo: [] },
    { id: "5", name: "Dessert", amount: 9.5, assignedTo: [] },
  ])
  const [names, setNames] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  useEffect(() => {
    // Load names from localStorage
    const loadNames = () => {
      const savedNames = localStorage.getItem("billSplitterNames")
      if (savedNames) {
        setNames(JSON.parse(savedNames))
      }
    }

    // Initial load
    loadNames()

    // Listen for name updates
    const handleNameUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<string[]>
      if (customEvent.detail) {
        setNames(customEvent.detail)
      } else {
        // Fallback to localStorage if event doesn't have detail
        loadNames()
      }
    }

    document.addEventListener("updateNames", handleNameUpdate as EventListener)

    return () => {
      document.removeEventListener("updateNames", handleNameUpdate as EventListener)
    }
  }, [])

  // Dispatch custom event when bill items change
  useEffect(() => {
    // Create a new event with the current bill items
    const event = new CustomEvent("updateBillItems", {
      detail: billItems,
    })
    // Dispatch the event
    document.dispatchEvent(event)
  }, [billItems])

  const handleAmountChange = (id: string, amount: number) => {
    setBillItems((prev) => prev.map((item) => (item.id === id ? { ...item, amount } : item)))
  }

  const assignNameToItem = (itemId: string, name: string) => {
    if (!name) return

    setBillItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId && !item.assignedTo.includes(name)) {
          return { ...item, assignedTo: [...item.assignedTo, name] }
        }
        return item
      }),
    )
    setSelectedItem(null)
  }

  const removeNameFromItem = (itemId: string, name: string) => {
    setBillItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, assignedTo: item.assignedTo.filter((n) => n !== name) }
        }
        return item
      }),
    )
  }

  return (
    <div className="w-full mb-8">
      <h2 className="text-xl font-semibold mb-4">Split Items</h2>

      <div className="space-y-4">
        {billItems.map((item) => (
          <Card key={item.id} className={selectedItem === item.id ? "border-primary" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`amount-${item.id}`}>Amount</Label>
                    <Input
                      id={`amount-${item.id}`}
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleAmountChange(item.id, Number.parseFloat(e.target.value) || 0)}
                      className="w-24"
                      step="0.01"
                    />
                  </div>

                  <div className="flex-1">
                    <Label htmlFor={`assign-${item.id}`}>Assign to</Label>
                    <Select onValueChange={(value) => assignNameToItem(item.id, value)}>
                      <SelectTrigger id={`assign-${item.id}`}>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        {names.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {item.assignedTo.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.assignedTo.map((name) => (
                      <Badge key={name} variant="secondary" className="flex items-center gap-1">
                        {name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                          onClick={() => removeNameFromItem(item.id, name)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {item.assignedTo.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    ${(item.amount / item.assignedTo.length).toFixed(2)} per person
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

