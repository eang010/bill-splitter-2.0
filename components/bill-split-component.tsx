"use client"

import { useState, useEffect, useRef } from "react"
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
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [names, setNames] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Load names from localStorage
    const loadNames = () => {
      const savedNames = localStorage.getItem("billSplitterNames")
      if (savedNames) {
        setNames(JSON.parse(savedNames))
      }
    }

    // Load bill items from localStorage
    const loadBillItems = () => {
      const savedItems = localStorage.getItem("billSplitterItems")
      if (savedItems) {
        const items = JSON.parse(savedItems)
        setBillItems(items)
        // Dispatch event to notify other components
        const event = new CustomEvent("updateBillItems", {
          detail: items,
        })
        document.dispatchEvent(event)
      }
    }

    // Initial load
    loadNames()
    loadBillItems()
    setIsInitialized(true)

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

    // Listen for bill items updates
    const handleBillItemsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<BillItem[]>
      if (customEvent.detail) {
        setBillItems(customEvent.detail)
        // Reset selected item when new bill items are loaded
        setSelectedItem(null)
        // Save to localStorage
        localStorage.setItem("billSplitterItems", JSON.stringify(customEvent.detail))
      }
    }

    document.addEventListener("updateNames", handleNameUpdate)
    document.addEventListener("updateBillItems", handleBillItemsUpdate as EventListener)

    return () => {
      document.removeEventListener("updateNames", handleNameUpdate)
      document.removeEventListener("updateBillItems", handleBillItemsUpdate as EventListener)
    }
  }, [])

  // Dispatch bill items updates whenever they change
  useEffect(() => {
    if (!isInitialized) return

    const event = new CustomEvent("updateBillItems", {
      detail: billItems,
    })
    document.dispatchEvent(event)
  }, [billItems, isInitialized])

  const handleAssignPerson = (itemId: string, person: string) => {
    setBillItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              assignedTo: [...item.assignedTo, person],
            }
          : item
      )
    )
  }

  const handleRemoveAssignment = (itemId: string, person: string) => {
    setBillItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              assignedTo: item.assignedTo.filter((p) => p !== person),
            }
          : item
      )
    )
  }

  const handleAmountChange = (itemId: string, newAmount: number) => {
    setBillItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              amount: newAmount,
            }
          : item
      )
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-muted/30 pb-2">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Bill Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {billItems.length > 0 ? (
              billItems.map((item) => (
                <Card key={item.id} className="relative shadow-lg rounded-xl bg-gradient-to-br from-card to-card/90">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base">{item.name}</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={item.amount}
                            onChange={(e) => handleAmountChange(item.id, Number(e.target.value))}
                            className="amount-field w-24"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Select
                          value=""
                          onValueChange={(value) => {
                            if (value) {
                              handleAssignPerson(item.id, value)
                            }
                          }}
                        >
                          <SelectTrigger className="assign-name-field w-full">
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent>
                            {names
                              .filter((name) => !item.assignedTo.includes(name))
                              .map((name) => (
                                <SelectItem key={name} value={name}>
                                  {name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      {item.assignedTo.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.assignedTo.map((person) => (
                            <Badge
                              key={person}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {person}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => handleRemoveAssignment(item.id, person)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-4">
                No items added yet. Click the + button to upload a receipt.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

