"use client"

import { useEffect, useMemo, useState } from "react"
import { modes, recipes, type ModeId, type Recipe } from "@/lib/recipes"
import { NutritionRing } from "./nutrition-ring"

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

type ImageAsset = { url: string; alt: string }

const EXACT_RECIPE_IMAGES: Record<string, ImageAsset> = {}

const FOOD_KEYWORD_BUCKETS: Array<{
  keywords: string[]
  asset: ImageAsset
}> = [
  {
    keywords: ["pasta", "bolognese", "spaghetti", "linguine", "mac", "lasagna", "noodle", "ramen"],
    asset: {
      url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1600&q=80",
      alt: "Plant-based pasta bowl with fresh herbs and tomato sauce",
    },
  },
  {
    keywords: ["oats", "oatmeal", "porridge", "overnight"],
    asset: {
      url: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1600&q=80",
      alt: "Creamy anabolic protein oats with berries and nut butter",
    },
  },
  {
    keywords: ["salad", "greens", "bowl", "buddha", "shredded"],
    asset: {
      url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=80",
      alt: "High-protein shredded plant-based salad with colorful vegetables",
    },
  },
  {
    keywords: ["tofu", "tempeh", "seitan"],
    asset: {
      url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1600&q=80",
      alt: "Crispy marinated tofu and tempeh stir fry bowl",
    },
  },
  {
    keywords: ["wrap", "burrito", "taco", "enchilada", "quesadilla"],
    asset: {
      url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1600&q=80",
      alt: "Vegan high-protein burrito wrap with beans and rice",
    },
  },
  {
    keywords: ["burger", "sliders", "sandwich", "sub", "reuben", "cheesesteak", "philly"],
    asset: {
      url: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=1600&q=80",
      alt: "Gourmet plant-based sandwich with fresh greens and sauce",
    },
  },
  {
    keywords: ["chili", "stew", "soup", "gumbo"],
    asset: {
      url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1600&q=80",
      alt: "Hearty three-bean vegan chili bowl with fresh toppings",
    },
  },
  {
    keywords: ["pizza", "flatbread", "pepperoni"],
    asset: {
      url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80",
      alt: "Vegan whole-grain pizza with fresh vegetables and herbs",
    },
  },
  {
    keywords: ["curry", "korma", "tikka", "masala", "dal", "lentil"],
    asset: {
      url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1600&q=80",
      alt: "Creamy coconut lentil curry with basmati rice",
    },
  },
  {
    keywords: ["smoothie", "shake", "milkshake"],
    asset: {
      url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1600&q=80",
      alt: "Thick green high-protein vegan smoothie bowl with toppings",
    },
  },
  {
    keywords: ["wings", "buffalo", "bbq", "skewer", "kabob", "ribs"],
    asset: {
      url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80",
      alt: "Spicy buffalo cauliflower wings with celery and dip",
    },
  },
  {
    keywords: ["parm", "parmesan", "eggplant", "zucchini"],
    asset: {
      url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1600&q=80",
      alt: "Baked eggplant parmesan with marinara and fresh basil",
    },
  },
  {
    keywords: ["scrambled", "scramble", "omelet", "frittata", "breakfast", "hash"],
    asset: {
      url: "https://images.unsplash.com/photo-1514516345957-556ca7c91a1f?auto=format&fit=crop&w=1600&q=80",
      alt: "Tofu scramble breakfast skillet with vegetables and avocado",
    },
  },
  {
    keywords: ["rice", "teriyaki", "broccoli", "bibimbap"],
    asset: {
      url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1600&q=80",
      alt: "Vegan teriyaki rice bowl with broccoli and sesame seeds",
    },
  },
  {
    keywords: ["sloppy", "sloppy joe", "meatball", "meatloaf"],
    asset: {
      url: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1600&q=80",
      alt: "Lentil-based vegan sloppy joe sandwich sliders",
    },
  },
  {
    keywords: ["bean", "chickpea", "hummus", "black bean", "fava"],
    asset: {
      url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1600&q=80",
      alt: "Mediterranean chickpea bowl with hummus and fresh vegetables",
    },
  },
  {
    keywords: ["nut", "peanut", "almond", "banana", "energy"],
    asset: {
      url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80",
      alt: "Creamy peanut butter banana protein wrap",
    },
  },
]

const FALLBACK_IMAGE: ImageAsset = {
  url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1600&q=80",
  alt: "Fresh plant-based fitness meal with vegetables, grains, and legumes",
}

export function resolveRecipeImage(recipe: Recipe): ImageAsset {
  const nameForLookup = recipe.title?.trim() || ""
  const idKey = recipe.id
  if (idKey && Object.prototype.hasOwnProperty.call(EXACT_RECIPE_IMAGES, idKey)) {
    const match = EXACT_RECIPE_IMAGES[idKey]
    if (match && isSafeImageUrl(match.url)) return match
  }

  const ingredientKeywords =
    Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
      ? recipe.ingredients
          .map((ing) => (ing && typeof ing.name === "string" ? ing.name : ""))
          .filter(Boolean)
          .join(" ")
      : ""
  const stepKeywords =
    Array.isArray(recipe.steps) && recipe.steps.length > 0
      ? recipe.steps
          .flatMap((step) => [
            step && typeof step.title === "string" ? step.title : "",
            step && typeof step.desc === "string" ? step.desc : "",
          ])
          .filter(Boolean)
          .join(" ")
      : ""

  const haystack = `${idKey ?? ""} ${nameForLookup} ${recipe.description ?? ""} ${ingredientKeywords} ${stepKeywords}`.toLowerCase()

  for (const bucket of FOOD_KEYWORD_BUCKETS) {
    for (const kw of bucket.keywords) {
      if (haystack.includes(kw.toLowerCase())) {
        return bucket.asset
      }
    }
  }

  if (
    recipe.image &&
    typeof recipe.image === "string" &&
    recipe.image.length > 0 &&
    !recipe.image.endsWith("placeholder.svg") &&
    isSafeImageUrl(recipe.image)
  ) {
    return {
      url: recipe.image,
      alt: recipe.imageAlt || nameForLookup || FALLBACK_IMAGE.alt,
    }
  }
  return FALLBACK_IMAGE
}

function isSafeImageUrl(url: unknown): url is string {
  if (typeof url !== "string") return false
  try {
    const u = new URL(url)
    return u.protocol === "https:" || u.protocol === "http:"
  } catch {
    return false
  }
}

export function FoodHackStudio({ generatedRecipe }: { generatedRecipe?: GeneratedRecipeData }) {
  const [activeMode, setActiveMode] = useState<ModeId>("student-budget")
  const [recipeIdx, setRecipeIdx] = useState<Record<ModeId, number>>({
    "student-budget": 0,
    "protein-booster": 0,
    "meat-craving": 0,
  })
  const [customRecipe, setCustomRecipe] = useState<Recipe | null>(null)
  
  const activeStatus = modes.find((m) => m.id === activeMode)?.status ?? ""
  
  // Use generated recipe if available, otherwise use preset recipes
  const currentRecipe = useMemo(() => {
    if (generatedRecipe && customRecipe) {
      return customRecipe
    }
    const safeIdx = Math.min(recipeIdx[activeMode], recipes[activeMode].length - 1)
    return recipes[activeMode][safeIdx]
  }, [generatedRecipe, customRecipe, recipeIdx, activeMode])
  
  const recipeImage = useMemo(() => resolveRecipeImage(currentRecipe), [currentRecipe])
  
  const [imageSrc, setImageSrc] = useState<string>(recipeImage.url)
  
  useEffect(() => {
    setImageSrc(recipeImage.url)
  }, [recipeImage.url])
  
  // Convert generated recipe to internal Recipe format
  useEffect(() => {
    if (generatedRecipe) {
      const convertedRecipe: Recipe = {
        id: `generated-${Date.now()}`,
        tabLabel: "Custom Generated",
        tabIcon: "✨",
        badges: ["AI GENERATED", "Custom Recipe"],
        title: generatedRecipe.name,
        description: "A personalized plant-based recipe generated just for you based on your preferences.",
        time: generatedRecipe.cookTime || "20 min",
        servings: generatedRecipe.servings || "2 Servings",
        price: generatedRecipe.price || "$2.50 / Serving",
        hackTitle: "THE AI HACK",
        hackLead: "This recipe was ",
        hackHighlight: "custom-generated",
        hackRest: " based on your specific ingredients and preferences to maximize flavor and nutrition.",
        image: "",
        imageAlt: generatedRecipe.name,
        ingredientCount: `${generatedRecipe.ingredients.length} INGREDIENTS`,
        ingredients: generatedRecipe.ingredients.map(ing => ({
          name: `${ing.amount} ${ing.unit} ${ing.item}`,
          price: ing.price || "$0.50"
        })),
        steps: generatedRecipe.steps.map(step => ({
          num: String(step.num).padStart(2, '0'),
          title: step.title,
          desc: step.desc
        })),
        nutrition: {
          proteinValue: `${generatedRecipe.protein}g`,
          proteinRing: Math.min(Math.round((generatedRecipe.protein / 40) * 100), 100),
          proteinNote: `${Math.min(Math.round((generatedRecipe.protein / 40) * 100), 100)}% Solid Protein`,
          kcalValue: String(generatedRecipe.calories),
          kcalRing: Math.min(Math.round((generatedRecipe.calories / 800) * 100), 100),
          kcalNote: `${Math.min(Math.round((generatedRecipe.calories / 800) * 100), 100)}% Target`,
          healthyFats: generatedRecipe.fats ? `${generatedRecipe.fats}g` : "10g",
          healthyFatsRing: generatedRecipe.fats ? Math.min(Math.round((generatedRecipe.fats / 25) * 100), 100) : 40,
          dietary: "Dietary: 100% Vegan",
          balance: "Custom Balanced"
        }
      }
      setCustomRecipe(convertedRecipe)
    }
  }, [generatedRecipe])
  
  function handleImageError() {
    setImageSrc((cur) => (cur !== FALLBACK_IMAGE.url ? FALLBACK_IMAGE.url : cur))
  }

  function zeroPad(num: string | number): string {
    const n = typeof num === "number" ? num : Number.parseInt(String(num), 10)
    if (Number.isNaN(n) || n < 1) return String(num ?? "01")
    if (n >= 10) return String(n)
    return `0${n}`
  }

  function formatPrice(price: string): string {
    const trimmed = String(price ?? "").trim()
    if (!trimmed) return "$0.00"
    if (/^\$/.test(trimmed)) return trimmed
    if (/^\d/.test(trimmed)) return `$${trimmed}`
    return trimmed
  }

  function activateModeAndScrollToStudio(modeId: ModeId) {
    setActiveMode(modeId)
    setRecipeIdx((prev) => ({
      ...prev,
      [modeId]: Math.min(prev[modeId], recipes[modeId].length - 1),
    }))
    requestAnimationFrame(() => {
      const el = document.getElementById("food-hack-studio")
      if (!el) return
      const rect = el.getBoundingClientRect()
      const top = window.scrollY + rect.top - 72
      window.scrollTo({ top, behavior: "smooth" })
    })
  }

  function handleArrowClick(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    modeId: ModeId,
  ) {
    event.stopPropagation()
    event.preventDefault()
    activateModeAndScrollToStudio(modeId)
  }

  return (
    <>
      {/* ===== Food Mission ===== */}
      <section id="food-hack-studio" className="scroll-mt-8 bg-[#f4f5f3] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0f8a5f]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#34d399]" />
            Choose Your Hack
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0d1512] sm:text-4xl">
              What&apos;s Your Food Mission?
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-[#0d1512]/55">
              Choose a mode and let VeggieHack tailor the hack to your biological, financial, or sensory goal.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {modes.map((mode) => {
              const selected = activeMode === mode.id
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => activateModeAndScrollToStudio(mode.id)}
                  aria-pressed={selected}
                  className={[
                    "group relative flex flex-col rounded-2xl border p-6 text-left transition-all duration-300",
                    "bg-[#0e1a20] active:scale-[0.985]",
                    selected
                      ? "border-[#34d399] shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_0_35px_rgba(52,211,153,0.35)] -translate-y-1"
                      : "border-white/10 hover:border-white/25 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]",
                  ].join(" ")}
                >
                  <span className="absolute right-5 top-6 flex h-2.5 w-2.5">
                    {selected && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d399] opacity-60" />
                    )}
                    <span
                      className={[
                        "relative inline-flex h-2.5 w-2.5 rounded-full",
                        selected ? "bg-[#34d399]" : "bg-white/25",
                      ].join(" ")}
                    />
                  </span>

                  <span
                    className={[
                      "w-fit rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
                      selected ? "bg-[#34d399] text-[#06140f]" : "bg-white/10 text-white/60",
                    ].join(" ")}
                  >
                    {mode.tag}
                  </span>

                  <span className="mt-6 text-2xl" aria-hidden>
                    {mode.emoji}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-white">{mode.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{mode.description}</p>

                  <span className="my-5 block h-px w-full bg-white/10" />
                  <span className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white/45">{mode.meta}</span>
                    <button
                      type="button"
                      onClick={(e) => handleArrowClick(e, mode.id)}
                      aria-label={`Open ${mode.title} mode in recipe studio`}
                      className={[
                        "vh-mode-arrow inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1a20]",
                        selected
                          ? "bg-[#34d399] text-[#06140f] shadow-[0_0_16px_rgba(52,211,153,0.55)]"
                          : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white hover:shadow-[0_0_20px_rgba(52,211,153,0.25)] active:scale-90",
                      ].join(" ")}
                    >
                      <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </span>
                </button>
              )
            })}
          </div>

          {/* status bar */}
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[#0d1512]/10 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-3 text-sm text-[#0d1512]/75">
              <svg className="h-5 w-5 shrink-0 text-[#0f8a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h10M4 12h16M4 18h7" strokeLinecap="round" />
              </svg>
              {activeStatus}
            </p>
            <span className="w-fit rounded-full border border-[#34d399]/40 bg-[#34d399]/10 px-3 py-1 text-xs font-semibold text-[#0f8a5f]">
              Active Mode
            </span>
          </div>
        </div>
      </section>

      {/* ===== Generated Recipe ===== */}
      <section className="bg-[#f4f5f3] pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0f8a5f]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#34d399]" />
            Your VeggieHack Recipe
          </p>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0d1512] sm:text-4xl">
              Generated AI Food Hack
            </h2>

            {/* tabs */}
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Recipe modes">
              {modes.map((mode) => {
                const selected = activeMode === mode.id
                return (
                  <button
                    key={mode.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                    setActiveMode(mode.id)
                    setRecipeIdx((prev) => ({
                      ...prev,
                      [mode.id]: Math.min(prev[mode.id], recipes[mode.id].length - 1),
                    }))
                  }}
                    className={[
                      "vh-tab inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium",
                      selected
                        ? "border-[#34d399] bg-[#34d399]/15 text-[#0d5f43] shadow-[0_0_0_1px_rgba(52,211,153,0.55),0_0_20px_rgba(52,211,153,0.35)]"
                        : "border-[#0d1512]/12 bg-white text-[#0d1512]/55 hover:border-[#34d399]/40 hover:bg-[#34d399]/10 hover:text-[#0d1512]",
                    ].join(" ")}
                  >
                    <span aria-hidden>{recipes[mode.id][0].tabIcon}</span>
                    {recipes[mode.id][0].tabLabel}
                  </button>
                )
              })}
            </div>
          </div>

          {/* result card */}
          <div
            key={currentRecipe.id}
            className={[
              "mt-8 rounded-3xl border border-white/10 bg-[#0d161c] p-6 md:p-8",
              "transition-all duration-500 ease-out",
              generatedRecipe ? "animate-[slideInUp_0.5s_ease-out]" : "animate-[fadeIn_0.4s_ease-out]"
            ].join(" ")}
          >
            {/* badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#34d399]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#34d399]">
                {currentRecipe.badges[0]}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                {currentRecipe.badges[1]}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <h3 className="font-display text-2xl font-bold text-white sm:text-3xl transition-all duration-300">{currentRecipe.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55 transition-all duration-300">{currentRecipe.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <MetaPill icon="clock" label={currentRecipe.time} />
                <MetaPill icon="user" label={currentRecipe.servings} />
                <MetaPill icon="coin" label={currentRecipe.price} highlight />
              </div>
            </div>

            {/* two column body */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* LEFT */}
              <div className="space-y-5">
                {/* pantry hack */}
                <div className="flex gap-3 rounded-2xl border border-[#34d399]/25 bg-[#34d399]/[0.06] p-4 transition-all duration-300">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#34d399]/15 text-[#34d399]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed text-white/70">
                    <span className="font-bold uppercase tracking-wide text-[#34d399]">{currentRecipe.hackTitle}</span>{" "}
                    {currentRecipe.hackLead}
                    <span className="font-semibold text-[#34d399]">{currentRecipe.hackHighlight}</span>
                    {currentRecipe.hackRest}
                  </p>
                </div>

                {/* ingredients */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">What You Need</h4>
                    <span className="text-xs font-semibold text-[#34d399]">{currentRecipe.ingredientCount}</span>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {currentRecipe.ingredients.map((ing) => (
                      <li
                        key={ing.name}
                        className="group flex items-center justify-between rounded-lg px-1.5 py-1 -mx-1.5 text-sm transition-colors duration-200 hover:bg-white/[0.04]"
                      >
                        <span className="flex items-center gap-2.5 text-white/70">
                          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#34d399]/[0.15] ring-1 ring-[#34d399]/40">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" aria-hidden />
                          </span>
                          {ing.name}
                        </span>
                        <span className="font-mono text-xs text-white/45 tabular-nums">
                          {formatPrice(ing.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* how to */}
                <div>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/60">How to Make It</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {currentRecipe.steps.map((step, i) => {
                      const total = currentRecipe.steps.length
                      const isLastSingleOddCol = total % 2 === 1 && i === total - 1
                      return (
                        <div
                          key={step.num}
                          className={[
                            "rounded-xl border border-white/10 bg-black/20 p-4 transition-all duration-300",
                            isLastSingleOddCol ? "sm:col-span-2" : "",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-bold text-[#34d399] tabular-nums tracking-tight">
                              {zeroPad(step.num)}
                            </span>
                            <span className="text-sm font-semibold text-white">{step.title}</span>
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-white/50">{step.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 transition-all duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={`${currentRecipe.id}-${imageSrc}`}
                  src={imageSrc}
                  alt={recipeImage.alt}
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                  className={[
                    "h-52 w-full object-cover sm:h-60",
                    "origin-center",
                    "animate-[recipeImageFade_0.5s_ease-out]",
                    "transition-opacity duration-500 ease-out opacity-100",
                  ].join(" ")}
                  style={{
                    animation: "recipeImageFade 0.5s ease-out both",
                  }}
                />
                <style jsx>{`
                  @keyframes recipeImageFade {
                    0% { opacity: 0; transform: scale(1.01) translateY(2px); filter: saturate(0.6); }
                    55% { filter: saturate(1.05); }
                    100% { opacity: 1; transform: scale(1) translateY(0); filter: saturate(1); }
                  }
                  @keyframes slideInUp {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                  }
                  @keyframes fadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                  }
                `}</style>
              </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Nutrition Per Serving</h4>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#34d399]">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Verified AI Breakdown
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-widest text-white/40">
                    <span>Macronutrients</span>
                    <span>{currentRecipe.nutrition.balance}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center rounded-xl border border-white/10 bg-black/20 py-4 transition-all duration-300">
                      <NutritionRing value={currentRecipe.nutrition.proteinValue} unit="Protein" percent={currentRecipe.nutrition.proteinRing} />
                      <span className="mt-3 text-xs font-medium text-[#34d399]">{currentRecipe.nutrition.proteinNote}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-xl border border-white/10 bg-black/20 py-4 transition-all duration-300">
                      <NutritionRing value={currentRecipe.nutrition.kcalValue} unit="Kcal" percent={currentRecipe.nutrition.kcalRing} />
                      <span className="mt-3 text-xs font-medium text-[#34d399]">{currentRecipe.nutrition.kcalNote}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-white/55">
                      <span>Healthy Fats</span>
                      <span className="text-white/70">{currentRecipe.nutrition.healthyFats}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#34d399] transition-[width] duration-700"
                        style={{ width: `${currentRecipe.nutrition.healthyFatsRing}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                    <span className="text-white/50">{currentRecipe.nutrition.dietary}</span>
                    <span className="flex items-center gap-1.5 text-[#34d399]">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Complete Protein
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!generatedRecipe && (
                    <div className="text-center text-[11px] uppercase tracking-widest text-white/40">
                      Variant {Math.min(recipeIdx[activeMode], recipes[activeMode].length - 1) + 1} of {recipes[activeMode].length}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (generatedRecipe) {
                        // For generated recipes, this would trigger a new generation
                        setCustomRecipe(null)
                      } else {
                        const max = recipes[activeMode].length
                        setRecipeIdx((prev) => ({
                          ...prev,
                          [activeMode]: (prev[activeMode] + 1) % max,
                        }))
                      }
                    }}
                    className="vh-cta flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3.5 text-sm font-semibold text-white/80 hover:border-[#34d399]/40 hover:bg-white/[0.07] hover:text-white transition-all duration-300"
                  >
                    <svg className="h-4 w-4 text-[#34d399]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v4h-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {generatedRecipe ? "Generate New Recipe" : "Regenerate Another Variant"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function MetaPill({ icon, label, highlight }: { icon: "clock" | "user" | "coin"; label: string; highlight?: boolean }) {
  const icons = {
    clock: <path d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" strokeLinecap="round" strokeLinejoin="round" />,
    user: <path d="M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeLinecap="round" strokeLinejoin="round" />,
    coin: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v10M9.5 9.5a2.5 2 0 0 1 2.5-1.5c1.4 0 2.5.7 2.5 1.8 0 2.4-5 1.2-5 3.6 0 1.1 1.1 1.8 2.5 1.8a2.5 2 0 0 0 2.5-1.5" strokeLinecap="round" strokeLinejoin="round" />,
  }
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium",
        highlight ? "border-[#34d399]/40 bg-[#34d399]/10 text-[#34d399]" : "border-white/10 bg-white/[0.04] text-white/70",
      ].join(" ")}
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
        {icons[icon]}
      </svg>
      {label}
    </span>
  )
}
