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

  // Load names from localStorage on mount
  useEffect(() => {
    const loadNames = () => {
      const savedNames = localStorage.getItem("billSplitterNames")
      if (savedNames) {
        setNames(JSON.parse(savedNames))
      }
    }
    loadNames()
  }, [])

  // Save names to localStorage and notify other components whenever they change
  useEffect(() => {
    if (names.length > 0) {
      localStorage.setItem("billSplitterNames", JSON.stringify(names))
      
      // Dispatch event to notify other components about name changes
      const event = new CustomEvent("updateNames", {
        detail: names,
      })
      document.dispatchEvent(event)
    }
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

  // For main view, show the original horizontal layout with fixed plus button
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">People</h2>

      <div className="relative flex items-center">
        <div className="absolute left-0 z-10 bg-gradient-to-r from-background to-transparent w-12">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-full px-2 py-2 h-auto flex-shrink-0 border border-input hover:bg-primary/5"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] h-[calc(100vh-8rem)] mb-24">
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
              <div className="mt-4 h-[calc(100%-7rem)] overflow-y-auto pr-2">
                {names.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">No people added yet</div>
                ) : (
                  <div className="space-y-2">
                    {names.map((name, index) => (
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
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div 
          ref={scrollContainerRef} 
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pl-12"
        >
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
    </div>
  )
}

