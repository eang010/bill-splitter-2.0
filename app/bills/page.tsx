"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BillSplitComponent from "@/components/bill-split-component"
import BillOverviewComponent from "@/components/bill-overview-component"
import NavigationBar from "@/components/navigation-bar"
import GuidedTour from "@/components/guided-tour"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BillsPage() {
  const router = useRouter()
  const [startTour, setStartTour] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("billSplitterAuth") === "true"
    if (!isAuthenticated) {
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
      <div className="container flex flex-col w-full px-4 pb-32">
        <div className="flex items-center my-6">
          <Link href="/home">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Bill Breakdown</h1>
        </div>

        <div className="space-y-20">
          <BillSplitComponent />
          <BillOverviewComponent />
        </div>
      </div>

      <NavigationBar />
      <GuidedTour startTour={startTour} onTourStart={() => setStartTour(false)} />
    </main>
  )
}

