"use client"

import { FormEvent, useEffect, useRef, useState } from "react"

const metrics = [
  { label: "First reply", value: "< 24 hrs", hint: "Placeholder US support SLA" },
  { label: "Waitlist tickets", value: "1,284", hint: "Open launch inquiries" },
  { label: "CSAT", value: "98%", hint: "Last 30-day sample" },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [topic, setTopic] = useState("waitlist")
  const [message, setMessage] = useState("")
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    const emailValue = email.trim()
    if (!EMAIL_PATTERN.test(emailValue)) {
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
          email: emailValue,
          name: name.trim() || undefined,
          topic: topic,
          message: message.trim() || undefined,
          source: 'contact-form',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit form')
      }

      const data = await response.json()
      
      setName("")
      setEmail("")
      setTopic("waitlist")
      setMessage("")
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
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/45">
            Full name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm font-normal normal-case tracking-normal text-white placeholder:text-white/30 focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#34d399]/25"
              placeholder="Alex Rivera"
              autoComplete="name"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/45">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm font-normal normal-case tracking-normal text-white placeholder:text-white/30 focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#34d399]/25"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
        </div>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-white/45">
          Topic
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm font-normal normal-case tracking-normal text-white focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#34d399]/25"
          >
            <option value="waitlist">Waitlist &amp; launch access</option>
            <option value="privacy">Email privacy / CPRA request</option>
            <option value="macros">Macro &amp; nutrition question</option>
            <option value="other">Other support</option>
          </select>
        </label>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-white/45">
          Message
          <textarea
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm font-normal normal-case tracking-normal text-white placeholder:text-white/30 focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#34d399]/25"
            placeholder="How can we help?"
          />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className={[
            "vh-cta mt-5 w-full rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 sm:w-auto",
            isLoading
              ? "bg-[#34d399]/70 cursor-not-allowed opacity-70 text-[#06140f]"
              : "bg-[#34d399] text-[#06140f] hover:bg-[#3fe0a6]",
          ].join(" ")}
        >
          {isLoading ? (
            <>
              <svg className="inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sending...
            </>
          ) : (
            "Send message"
          )}
        </button>
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
            role="status"
            aria-live="polite"
            className="animate-confirm-flash mt-4 flex items-center gap-3 rounded-xl border border-[#34d399]/50 bg-[#10241c] px-4 py-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#34d399] text-[#06140f]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden>
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
            <span className="text-sm text-[#d1fae5]">Message queued. We will reply to your inbox.</span>
          </div>
        )}
      </form>

      <aside className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">{metric.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-white">{metric.value}</p>
            <p className="mt-1 text-xs text-white/40">{metric.hint}</p>
          </div>
        ))}
        <p className="text-xs leading-relaxed text-white/40">
          Support hours: Monday–Friday, 9:00 a.m.–6:00 p.m. Eastern. Privacy requests from California residents are
          acknowledged within 10 business days as required under the CPRA.
        </p>
      </aside>
    </div>
  )
}
