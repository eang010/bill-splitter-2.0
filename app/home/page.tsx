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
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()
  const [startTour, setStartTour] = useState(false)
  const [isPWA, setIsPWA] = useState(false)

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

  //check if pwa
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
  
    console.log('Is PWA:', isStandalone);
    setIsPWA(isStandalone);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      <div className="container flex flex-col w-full px-4 pb-24 relative">
        <Link href="/bills" className="absolute top-8 right-4 z-50">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <History className="h-5 w-5" />
          </Button>
        </Link>
        <>
          {!isPWA && (
            <Link href="/pwaInstruction" className="absolute top-2 right-4 z-50 text-sm underline">
              Install as App
            </Link>
          )}
        </>
        <div className="pr-12">
          <h1 className="text-xl sm:text-2xl font-extrabold my-8 tracking-tight relative">
            <span className="font-light tracking-wider bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent drop-shadow-sm">
              Bill
            </span>{" "}
            <span className="animate-splitter">
              {"Splitter".split("").map((letter, index) => (
                <span
                  key={index}
                  style={{ 
                    "--delay": 6 - index,
                    "--position": index
                  } as React.CSSProperties}
                  className="font-black tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent drop-shadow-sm"
                >
                  {letter}
                </span>
              ))}
            </span>
            <div className="absolute -bottom-2 left-0 w-1/3 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
          </h1>
        </div>

        <Suspense fallback={<div>Loading names...</div>}>
          <section id="names-section" className="w-full mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">People</h2>
            </div>
            <div className="mt-4">
              <NameList />
            </div>
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

