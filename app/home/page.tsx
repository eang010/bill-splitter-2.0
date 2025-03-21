"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import NameList from "@/components/name-list"
import TaxesComponent from "@/components/taxes-component"
import NavigationBar from "@/components/navigation-bar"
import GuidedTour from "@/components/guided-tour"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, DollarSign, Percent, History } from "lucide-react"
import DiscountComponent from "@/components/discount-component"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()
  const [startTour, setStartTour] = useState(false)

  // Check if user is authenticated
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

  // Listen for tour start event
  useEffect(() => {
    const handleTourStart = () => {
      setStartTour(true)
    }

    document.addEventListener("startTour", handleTourStart)
    return () => {
      document.removeEventListener("startTour", handleTourStart)
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      <div className="container flex flex-col w-full px-4 pb-24 relative">
        <Button
          id="history-button"
          variant="ghost"
          size="icon"
          className="absolute top-6 right-4 h-10 w-10"
          onClick={() => router.push("/bills")}
        >
          <History className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-center my-6">Bill Splitter</h1>

        <Suspense fallback={<div>Loading names...</div>}>
          <section id="names-section" className="w-full mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">People</h2>
            </div>
            <NameList />
          </section>
        </Suspense>

        <ScrollArea className="flex-1 w-full">
          <section id="taxes-section" className="w-full mb-8">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Taxes</h2>
            </div>
            <TaxesComponent />
          </section>

          <section id="discount-section" className="w-full mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Percent className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Discount</h2>
            </div>
            <DiscountComponent />
          </section>
        </ScrollArea>
      </div>

      <NavigationBar />
      <GuidedTour startTour={startTour} onTourStart={() => setStartTour(false)} />
    </main>
  )
}

