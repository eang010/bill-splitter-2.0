"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import NameList from "@/components/name-list"
import TaxesComponent from "@/components/taxes-component"
import NavigationBar from "@/components/navigation-bar"
import GuidedTour from "@/components/guided-tour"
import { ScrollArea } from "@/components/ui/scroll-area"

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
      <div className="container flex flex-col w-full px-4 pb-24">
        <h1 className="text-2xl font-bold text-center my-6">Bill Splitter</h1>

        <Suspense fallback={<div>Loading names...</div>}>
          <section id="names-section" className="w-full mb-8">
            <NameList />
          </section>
        </Suspense>

        <ScrollArea className="flex-1 w-full">
          <section id="taxes-section" className="w-full mb-8">
            <h2 className="text-xl font-semibold mb-4">Taxes & Charges</h2>
            <TaxesComponent />
          </section>
        </ScrollArea>
      </div>

      <NavigationBar />
      <GuidedTour startTour={startTour} onTourStart={() => setStartTour(false)} />
    </main>
  )
}

