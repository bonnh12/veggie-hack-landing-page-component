"use client"

import { FormEvent, useEffect, useRef, useState } from "react"

const PANTRY_SUGGESTION = "I have rice, chickpeas, tomatoes and 15 minutes."

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

export function Hero({ onRecipeGenerated }: { onRecipeGenerated?: (recipe: GeneratedRecipeData) => void }) {
  const [query, setQuery] = useState("")
  const [justFilled, setJustFilled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fillTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (fillTimer.current) clearTimeout(fillTimer.current)
    }
  }, [])

  function handleSuggestionClick() {
    setQuery(PANTRY_SUGGESTION)
    setJustFilled(true)
    if (fillTimer.current) clearTimeout(fillTimer.current)
    fillTimer.current = setTimeout(() => {
      setJustFilled(false)
    }, 900)
    requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return
      el.focus({ preventScroll: true })
      const len = el.value.length
      try {
        el.setSelectionRange(len, len)
      } catch {
        /* some input types throw — ignore */
      }
    })
  }

  function handleClear() {
    setQuery("")
    setError(null)
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
    })
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (!query.trim()) {
      setError("Please enter what you're craving or your ingredients")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Parse budget from query if present (e.g., "under $5", "budget $3")
      const budgetMatch = query.match(/(?:under|budget|under \$|below)\s*[$]?(\d+(?:\.\d{2})?)/i)
      const budget = budgetMatch ? parseFloat(budgetMatch[1]) : undefined

      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          protein: 25, // Default target for balanced vegan meal
          calories: 450, // Default target calories
          budget: budget || 'moderate',
          preferences: query,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate recipe')
      }

      const data = await response.json()
      
      if (onRecipeGenerated) {
        onRecipeGenerated(data)
      }

      // Scroll to studio after successful generation
      const studio = document.getElementById("food-hack-studio")
      studio?.scrollIntoView({ behavior: "smooth", block: "start" })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden rounded-b-[2.5rem] bg-[#06110d]">
      {/* ambient green glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 78% 8%, rgba(16,185,129,0.45) 0%, rgba(6,17,13,0) 55%), radial-gradient(90% 70% at 15% 0%, rgba(20,83,66,0.55) 0%, rgba(6,17,13,0) 60%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-36 text-center">
        <p className="mb-6 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#34d399]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#34d399]" />
          Smart Plant-Based Recipe Creator
        </p>

        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
          Turn What You Have Into Something{" "}
          <span className="block bg-gradient-to-r from-[#34e0a1] to-[#22d3ee] bg-clip-text text-transparent">
            You&apos;ll Crave.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-white/55">
          Tell VeggieHack what you&apos;re craving or what you&apos;ve got in your kitchen. Our AI creates fast,
          affordable vegan meals tailored to you.
        </p>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur">
          <form
            onSubmit={handleGenerate}
            className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you craving or what ingredients do you have?"
                className={[
                  "w-full rounded-xl border bg-[#0a1a14] py-3.5 pl-11 pr-10 text-sm text-white placeholder:text-white/35",
                  "transition-all duration-300 ease-out",
                  justFilled
                    ? "border-[#34d399] shadow-[0_0_0_1px_rgba(52,211,153,0.55),0_0_32px_rgba(52,211,153,0.35)] bg-[#0a2219]"
                    : "border-white/10 focus:border-[#34d399]/60 focus:outline-none focus:ring-2 focus:ring-[#34d399]/25",
                ].join(" ")}
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white active:scale-90"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={[
                "vh-cta inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all duration-300",
                isLoading
                  ? "bg-[#34d399]/70 cursor-not-allowed opacity-70"
                  : "bg-[#34d399] text-[#06140f] hover:bg-[#3fe0a6] hover:shadow-[0_0_32px_rgba(52,211,153,0.55)]",
              ].join(" ")}
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                    <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M5 3v4M3 5h4M6 17v4m-2-2h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5L13 3Z" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                  Generate My Hack
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 transition-all duration-300 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {error}
              </div>
            </div>
          )}
          <div className="px-1 pb-1 pt-3 text-left text-xs text-white/40">
            <span className="hidden sm:inline">
              Try:&nbsp;
            </span>
            <button
              type="button"
              onClick={handleSuggestionClick}
              className={[
                "group inline-flex items-center gap-1.5 rounded-md px-2 py-1 -mx-2 transition-all duration-300",
                "font-medium text-[#34d399] hover:text-[#3fe0a6] active:scale-[0.98]",
                "hover:bg-[#34d399]/10 sm:hover:bg-[#34d399]/10",
                justFilled ? "bg-[#34d399]/[0.14] ring-1 ring-[#34d399]/40" : "",
              ].join(" ")}
            >
              <svg
                className={[
                  "h-3 w-3 opacity-80 transition-transform duration-300",
                  justFilled ? "translate-x-0 opacity-100" : "-translate-x-0.5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                ].join(" ")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="sm:inline">
                &ldquo;{PANTRY_SUGGESTION}&rdquo;
              </span>
              <span className="sm:hidden">
                Try sample: &ldquo;{PANTRY_SUGGESTION}&rdquo;
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
