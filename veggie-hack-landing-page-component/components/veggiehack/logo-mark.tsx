import { Sprout } from "lucide-react"
import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[8px] bg-[#34d399]/20 text-[#34d399]",
        "h-8 w-8",
        className,
      )}
      aria-hidden="true"
    >
      <Sprout className="h-[58%] w-[58%]" strokeWidth={2.25} />
    </span>
  )
}
