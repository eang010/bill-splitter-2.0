"use client"

import { DollarSign } from "lucide-react"
import { useEffect, useState } from "react"

interface MoneyAnimationProps {
  isVisible: boolean
}

export default function MoneyAnimation({ isVisible }: MoneyAnimationProps) {
  const [moneyIcons, setMoneyIcons] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([])

  useEffect(() => {
    if (isVisible) {
      // Create 15 money icons with random positions and animations
      const icons = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100, // Random horizontal position (0-100%)
        delay: Math.random() * 0.5, // Random delay (0-0.5s)
        duration: 1 + Math.random() * 2, // Random duration (1-3s)
      }))
      setMoneyIcons(icons)
    } else {
      setMoneyIcons([])
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative h-full w-full overflow-hidden">
        {moneyIcons.map((icon) => (
          <div
            key={icon.id}
            className="absolute animate-fly-up text-primary"
            style={{
              left: `${icon.left}%`,
              animationDelay: `${icon.delay}s`,
              animationDuration: `${icon.duration}s`,
            }}
          >
            <DollarSign className="h-8 w-8" />
          </div>
        ))}
      </div>
      <div className="absolute text-center">
        <div className="animate-pulse text-xl font-semibold">Processing Receipt</div>
      </div>
    </div>
  )
}

