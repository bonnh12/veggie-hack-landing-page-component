"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/veggiehack/site-header"
import { Hero } from "@/components/veggiehack/hero"
import { FoodHackStudio } from "@/components/veggiehack/food-hack-studio"
import { AdSlot } from "@/components/AdSlot"
import { MobileApp } from "@/components/veggiehack/mobile-app"
import { FaqSection } from "@/components/veggiehack/faq-section"
import { SiteFooter } from "@/components/veggiehack/site-footer"

type GeneratedRecipeData = {
  name: string
  calories: number
  protein: number
  carbs?: number
  fats?: number
  price?: string
  cookTime?: string
  servings?: string
  ingredients: Array<{ amount: string; unit: string; item: string; price?: string }>
  steps: Array<{ num: number; title: string; desc: string }>
}

export default function Page() {
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipeData | undefined>()

  const handleRecipeGenerated = (recipe: GeneratedRecipeData) => {
    setGeneratedRecipe(recipe)
  }

  return (
    <main id="top" className="min-h-screen bg-[#f4f5f3]">
      <div className="relative">
        <SiteHeader overlay />
        <Hero onRecipeGenerated={handleRecipeGenerated} />
      </div>
      <FoodHackStudio generatedRecipe={generatedRecipe} />
      <AdSlot slotId="veggiehack-below-studio" format="wide-horizontal" />
      <MobileApp />
      <AdSlot slotId="veggiehack-pre-faq" format="horizontal" />
      <FaqSection />
      <SiteFooter />
    </main>
  )
}
