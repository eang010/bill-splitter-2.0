"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BillSplitComponent from "@/components/bill-split-component"
import BillOverviewComponent from "@/components/bill-overview-component"
import NavigationBar from "@/components/navigation-bar"
import GuidedTour from "@/components/guided-tour"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Compass, Chrome, Ellipsis } from "lucide-react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function BillsPage() {
  const router = useRouter()
  const [startTour, setStartTour] = useState(false)
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

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
          <h1 className="text-xl sm:text-2xl font-bold mb-6">
            <span className="font-light tracking-wider bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent drop-shadow-sm">
              Bill{" "}
            </span>
            <span className="inline-flex">
              <span className="animate-tilt-left font-black tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent drop-shadow-sm">
                Break
              </span>
              <span className="animate-tilt-right font-black tracking-tight bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent drop-shadow-sm">
                down
              </span>
            </span>
          </h1>
        </div>
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>To download Bill Splitter as an App, please follow the directions below.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=" flex items-center space-x-4 rounded-md border p-4 m-4">
              <Compass />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-relaxed">
                  For Apple iOS <br></br>
                    1. Open Safari. <br></br>
                    2. Navigate to <Link href={origin} className="text-blue-600 underline hover:text-blue-800">{origin}</Link>. <br></br>
                    3. Tap the 'Share' button. <br></br>
                    4. Select 'Add to Home screen'. <br></br>
                  </p>
                </div>
            </div>
            <div className=" flex items-center space-x-4 rounded-md border p-4 m-4">
              <Chrome />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-relaxed">
                  For Android <br></br>
                    1. Open Chrome. <br></br> 
                    2. Navigate to <Link href={origin} className="text-blue-600 underline hover:text-blue-800">{origin}</Link>. <br></br>
                    3. Tap the three-dot overflow menu [...] <br></br>
                    4. Select 'Add to Home screen'. <br></br>
                    5. Enter a name for the app before adding it to your home screen. <br></br>
                  </p>
                </div>
            </div>
          </CardContent>
        </Card>  
      </div>

      <NavigationBar />
      <GuidedTour startTour={startTour} onTourStart={() => setStartTour(false)} />
    </main>
  )
}

