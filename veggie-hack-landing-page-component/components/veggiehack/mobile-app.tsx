"use client"

import { FormEvent, useEffect, useRef, useState } from "react"

const chips = ["⚡ Instant food hacks", "🥗 Vegan meals anywhere", "📈 Personalized recipes"]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function MobileApp() {
  const [email, setEmail] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmKey, setConfirmKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
      }
    }
  }, [])

  async function handleWaitlistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = email.trim()
    if (!EMAIL_PATTERN.test(value)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: value,
          source: 'mobile-app-landing',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join waitlist')
      }

      const data = await response.json()
      
      setEmail("")
      setShowConfirm(true)
      setConfirmKey((key: number) => key + 1)

      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
      }
      hideTimer.current = setTimeout(() => {
        setShowConfirm(false)
      }, 4200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="waitlist" className="scroll-mt-24 bg-[#f4f5f3] py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#0f8a5f]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#34d399]" />
            COMING SOON • IOS &amp; ANDROID
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-[#0d1512] sm:text-5xl">
            Your Food Hacks, Coming to Your Pocket.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#0d1512]/55">
            We&apos;re building the VeggieHack mobile app to help you discover clever vegan meals wherever you are.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#0d1512]/12 bg-white px-3 py-1.5 text-xs font-medium text-[#0d1512]/65 transition hover:-translate-y-0.5 hover:border-[#34d399]/40 hover:text-[#0d1512]"
              >
                {chip}
              </span>
            ))}
          </div>

          <form onSubmit={handleWaitlistSubmit} className="mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="waitlist-email" className="sr-only">
              Email address
            </label>
            <input
              id="waitlist-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              aria-describedby={showConfirm ? "waitlist-confirm" : undefined}
              className="flex-1 rounded-xl border border-[#0d1512]/12 bg-white px-4 py-3 text-sm text-[#0d1512] placeholder:text-[#0d1512]/35 transition focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#34d399]/25"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={[
                "vh-cta rounded-xl px-5 py-3 text-sm font-semibold shadow-[0_8px_20px_rgba(15,138,95,0.18)] transition-all duration-300",
                isLoading
                  ? "bg-[#0f8a5f]/70 cursor-not-allowed opacity-70"
                  : "bg-[#0f8a5f] text-white hover:bg-[#0d7a53] hover:shadow-[0_12px_28px_rgba(15,138,95,0.28)]",
              ].join(" ")}
            >
              {isLoading ? (
                <>
                  <svg className="inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                    <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Joining...
                </>
              ) : (
                "Join the Waitlist →"
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
          {showConfirm && (
            <div
              key={confirmKey}
              id="waitlist-confirm"
              role="status"
              aria-live="polite"
              className="animate-confirm-flash mt-3 flex max-w-md items-center gap-3 rounded-xl border border-[#34d399]/50 bg-[#ecfdf5] px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#34d399] text-[#06140f] shadow-[0_0_16px_rgba(52,211,153,0.55)]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="#06140f" strokeWidth="1.5" opacity="0.25" />
                  <path
                    className="animate-check-draw"
                    d="M7.5 12.5 10.4 15.4 16.5 8.8"
                    stroke="#06140f"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>
                <span className="block text-sm font-semibold text-[#065f46]">You&apos;re on the list</span>
                <span className="block text-xs text-[#047857]/80">We&apos;ll ping you when beta access opens.</span>
              </span>
            </div>
          )}

          <p className="mt-3 max-w-md text-xs text-[#0d1512]/45">
            No spam. We&apos;ll only notify you when beta access opens. Early testers get lifetime Pro access.
          </p>
        </div>

        {/* phone mockup */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-[280px] rounded-[2.5rem] border-[6px] border-[#0d161c] bg-[#0d161c] p-2 shadow-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(13,22,28,0.35)]">
            <div className="overflow-hidden rounded-[2rem] bg-[#0e1a20]">
              <div className="flex items-center justify-between px-5 py-3 text-[10px] text-white/50">
                <span>9:41</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                </span>
              </div>
              <div className="flex items-center justify-between px-4 pb-3">
                <span className="font-display text-sm font-bold text-white">
                  Veggie<span className="text-[#34d399]">Hack</span>
                </span>
                <span className="rounded-full bg-[#34d399]/15 px-2 py-0.5 text-[9px] font-semibold text-[#34d399]">
                  Preview
                </span>
              </div>

              <div className="relative mx-3 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/recipes/app-preview-hand.png" alt="Phone showing a VeggieHack recipe" className="h-40 w-full object-cover" />
                <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[9px] font-medium text-[#34d399] backdrop-blur">
                  Pantry Scan Active
                </span>
              </div>

              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#34d399]">92% INGREDIENT MATCH</span>
                  <span className="text-[10px] text-white/40">$1.95</span>
                </div>
                <h4 className="mt-1 text-sm font-semibold text-white">Crispy Garlic Tofu Wraps</h4>
                <p className="mt-0.5 text-[10px] text-white/45">24g Protein · 12 Mins</p>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("food-hack-studio")?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }}
                  className="vh-cta mt-3 w-full rounded-lg bg-[#34d399] py-2 text-xs font-semibold text-[#06140f] hover:bg-[#3fe0a6]"
                >
                  View Smart Hack
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
