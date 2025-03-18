"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { PlusCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface NameListProps {
  inDialog?: boolean
}

export default function NameList({ inDialog = false }: NameListProps) {
  const [names, setNames] = useState<string[]>([])
  const [newName, setNewName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load names from localStorage
    const savedNames = localStorage.getItem("billSplitterNames")
    if (savedNames) {
      setNames(JSON.parse(savedNames))
    }
  }, [])

  useEffect(() => {
    // Save names to localStorage whenever they change
    localStorage.setItem("billSplitterNames", JSON.stringify(names))

    // Dispatch event to notify other components about name changes
    const event = new CustomEvent("updateNames", {
      detail: names,
    })
    document.dispatchEvent(event)
  }, [names])

  const handleAddName = () => {
    if (newName.trim() !== "") {
      const updatedNames = [...names, newName.trim()]
      setNames(updatedNames)
      setNewName("")
      setIsDialogOpen(false)

      // Scroll to the end of the list after adding a new name
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
        }
      }, 100)
    }
  }

  const handleRemoveName = (index: number) => {
    const updatedNames = [...names]
    updatedNames.splice(index, 1)
    setNames(updatedNames)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddName()
    }
  }

  // For dialog view, show a more compact layout
  if (inDialog) {
    return (
      <div className="w-full">
        <div className="flex gap-2 mb-4">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter name"
            className="flex-1"
          />
          <Button onClick={handleAddName}>Add</Button>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {names.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No people added yet</div>
          ) : (
            names.map((name, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                <span>{name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleRemoveName(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // For main view, show the original horizontal layout
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">People</h2>

      <div ref={scrollContainerRef} className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 flex-shrink-0">
              <PlusCircle className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add a person</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 items-center">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter name"
                className="flex-1"
                autoFocus
              />
              <Button onClick={handleAddName}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>

        {names.map((name, index) => (
          <div key={index} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full flex-shrink-0">
            <span className="text-sm">{name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full"
              onClick={() => handleRemoveName(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

