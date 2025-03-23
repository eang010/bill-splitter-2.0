"use client"

import { useEffect, useState } from "react"
import { DollarSign } from "lucide-react"

interface MoneyAnimationProps {
  isVisible: boolean
}

interface MoneyIcon {
  id: number
  left: number
  delay: number
  duration: number
  startPosition: number
}

export default function MoneyAnimation({ isVisible }: MoneyAnimationProps) {
  const [moneyIcons, setMoneyIcons] = useState<MoneyIcon[]>([])

  useEffect(() => {
    if (isVisible) {
      // Generate 15 money icons with random positions and timings
      const icons = Array.from({ length: 15 }, (_, index) => ({
        id: index,
        left: Math.random() * 100, // Random position from 0 to 100%
        delay: Math.random() * 2, // Random delay from 0 to 2 seconds
        duration: 3 + Math.random() * 2, // Random duration from 3 to 5 seconds
        startPosition: Math.random() * 100, // Random start position from 0 to 100%
      }))
      setMoneyIcons(icons)

      // Keep generating new icons while visible
      const interval = setInterval(() => {
        setMoneyIcons(prev => {
          // Remove icons that have finished their animation
          const remainingIcons = prev.filter(icon => {
            const totalTime = icon.delay + icon.duration
            return totalTime > 0
          })
          
          // Add new icons if we have less than 15
          if (remainingIcons.length < 15) {
            const newIcons = Array.from({ length: 15 - remainingIcons.length }, (_, index) => ({
              id: Date.now() + index,
              left: Math.random() * 100,
              delay: Math.random() * 2,
              duration: 3 + Math.random() * 2,
              startPosition: Math.random() * 100,
            }))
            return [...remainingIcons, ...newIcons]
          }
          
          return remainingIcons
        })
      }, 1000) // Check every second

      return () => clearInterval(interval)
    } else {
      setMoneyIcons([])
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-lg font-semibold animate-pulse">
          Processing Receipt...
        </div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        {moneyIcons.map((icon) => (
          <div
            key={icon.id}
            className="absolute text-primary"
            style={{
              left: `${icon.left}%`,
              top: `${icon.startPosition}%`,
              animation: `fly-up ${icon.duration}s ease-in-out ${icon.delay}s infinite`,
              willChange: 'transform',
            }}
          >
            <DollarSign className="h-6 w-6" />
          </div>
        ))}
      </div>
    </div>
  )
} 