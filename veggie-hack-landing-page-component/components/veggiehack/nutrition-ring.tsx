type NutritionRingProps = {
  value: string
  unit: string
  percent: number
}

export function NutritionRing({ value, unit, percent }: NutritionRingProps) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const dash = (Math.min(Math.max(percent, 0), 100) / 100) * circumference

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#1f2f36" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#34d399"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="[filter:drop-shadow(0_0_5px_rgba(52,211,153,0.6))] transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-semibold text-white">{value}</span>
        <span className="text-[10px] uppercase tracking-widest text-white/40">{unit}</span>
      </div>
    </div>
  )
}
