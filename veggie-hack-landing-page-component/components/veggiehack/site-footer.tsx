import Link from "next/link"
import { LogoMark } from "./logo-mark"

export function SiteFooter() {
  return (
    <footer className="bg-[#0a1215]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <LogoMark />
              <span>
                Veggie<span className="text-[#34d399]">Hack</span>
              </span>
            </span>
            <span className="hidden h-4 w-px bg-white/15 sm:block" />
            <span className="text-sm text-white/45">Hack your cravings. Eat better.</span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-white/55">
            <Link href="/privacy" className="transition hover:text-white active:opacity-80">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-white active:opacity-80">
              Terms of Service
            </Link>
            <Link href="/contact" className="transition hover:text-white active:opacity-80">
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 VeggieHack. All rights reserved.</span>
          <span>Simple, clever plant-based food hacks.</span>
        </div>
      </div>
    </footer>
  )
}
