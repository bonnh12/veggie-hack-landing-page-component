import type { ReactNode } from "react"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

export function LegalShell({
  eyebrow,
  title,
  lede,
  wide = false,
  children,
}: {
  eyebrow: string
  title: string
  lede: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#121212] text-[#ececec]">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[#1a1a1a]">
        <div className={`mx-auto px-6 py-14 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#34d399]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#34d399]" />
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">{lede}</p>
          <p className="mt-5 text-xs text-white/35">Effective date: September 21, 2026 · United States</p>
        </div>
      </section>
      <section className={`mx-auto px-6 py-12 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>{children}</section>
      <SiteFooter />
    </main>
  )
}

export function LegalBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="mb-10">
      <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/60">{children}</div>
    </article>
  )
}
