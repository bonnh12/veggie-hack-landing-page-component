export type AdFormat = "auto" | "horizontal" | "wide-horizontal" | "rectangle" | "vertical"

export type AdSlotProps = {
  slotId?: string
  format?: AdFormat
  label?: string
  className?: string
}

const formatStyles: Record<Exclude<AdFormat, "auto">, { minH: string; maxW: string; ratio?: string }> = {
  horizontal: {
    minH: "min-h-[110px] sm:min-h-[120px]",
    maxW: "max-w-6xl",
  },
  "wide-horizontal": {
    minH: "min-h-[130px] sm:min-h-[150px] md:min-h-[180px]",
    maxW: "max-w-6xl",
  },
  rectangle: {
    minH: "min-h-[240px] sm:min-h-[260px]",
    maxW: "max-w-xl",
  },
  vertical: {
    minH: "min-h-[500px] sm:min-h-[560px]",
    maxW: "max-w-xs",
  },
}

export function AdSlot({
  slotId,
  format = "horizontal",
  label = "Advertisement",
  className,
}: AdSlotProps) {
  const resolvedFormat = format === "auto" ? "horizontal" : format
  const style = formatStyles[resolvedFormat]

  const slotAttrs: Record<string, string> = {}
  if (slotId) {
    slotAttrs["data-ad-slot"] = slotId
  }

  return (
    <section
      aria-label={`Advertisement slot${slotId ? ` ${slotId}` : ""}`}
      className={["bg-[#f4f5f3] py-10 sm:py-12", className ?? ""].join(" ").trim()}
      {...slotAttrs}
    >
      <div className={["mx-auto px-5 sm:px-6", style.maxW].join(" ")}>
        <div
          className={[
            "relative group",
            "flex items-center justify-center",
            style.minH,
            "w-full rounded-2xl",
            "overflow-hidden",
            "border border-white/10",
            "bg-[#0d161c]",
            "px-6 sm:px-10",
            "shadow-[0_1px_2px_rgba(13,22,28,0.18),0_12px_40px_-20px_rgba(13,22,28,0.5)]",
            "transition-all duration-300",
            "hover:border-white/20",
          ].join(" ")}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-[#34d399]/[0.06] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-white/[0.03] blur-3xl"
          />

          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-4 sm:left-5 sm:top-5"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55 backdrop-blur">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {label}
            </span>
          </span>

          {slotId && (
            <span
              aria-hidden
              className="pointer-events-none absolute right-4 top-4 sm:right-5 sm:top-5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-white/40"
            >
              {slotId}
            </span>
          )}

          <div className="relative z-10 flex flex-col items-center gap-3 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/50">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 7h18M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7l2-3h14l2 3M9 12h.01M15 12h.01M9 16h6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white/55">
                Sponsored Placement
              </p>
              <p className="text-xs text-white/35">
                Google AdSense · {formatLabel(resolvedFormat)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function formatLabel(f: Exclude<AdFormat, "auto">): string {
  switch (f) {
    case "wide-horizontal":
      return "970 × 250 Billboard"
    case "horizontal":
      return "728 × 90 Leaderboard"
    case "rectangle":
      return "300 × 250 MPU"
    case "vertical":
      return "160 × 600 Skyscraper"
  }
}
