import Link from "next/link"
import { LogoMark } from "./logo-mark"

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-20"
          : "relative z-20 border-b border-white/10 bg-[#0a1215]"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-display text-xl font-bold tracking-tight text-white transition hover:opacity-90 sm:text-2xl"
        >
          <LogoMark />
          <span className="truncate">
            Veggie<span className="text-[#34d399]">Hack</span>
          </span>
        </Link>
        <Link
          href="/#waitlist"
          className="vh-cta shrink-0 whitespace-nowrap rounded-full bg-[#34d399] px-4 py-2.5 text-xs font-semibold text-[#06140f] shadow-[0_0_25px_rgba(52,211,153,0.35)] hover:bg-[#3fe0a6] hover:shadow-[0_0_32px_rgba(52,211,153,0.5)] sm:px-5 sm:text-sm"
        >
          JOIN WISHLIST
        </Link>
      </div>
    </header>
  )
}
