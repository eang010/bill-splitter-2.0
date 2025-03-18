import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add a helper function to calculate split amounts with taxes
export function calculateSplitAmount(
  amount: number,
  peopleCount: number,
  gstRate = 0,
  serviceRate = 0,
  applyGst = false,
  applyService = false,
) {
  const baseAmount = amount / peopleCount
  const taxMultiplier = 1 + (applyGst ? gstRate / 100 : 0) + (applyService ? serviceRate / 100 : 0)

  return baseAmount * taxMultiplier
}

