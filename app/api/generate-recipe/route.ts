import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export type GenerateRecipeRequest = {
  protein: number
  calories: number
  budget?: string | number
  preferences?: string
}

export type GeneratedIngredient = {
  amount: string
  unit: string
  item: string
  price?: string
}

export type GeneratedStep = {
  num: number
  title: string
  desc: string
}

export type GeneratedRecipe = {
  name: string
  calories: number
  protein: number
  carbs?: number
  fats?: number
  price?: string
  cookTime?: string
  servings?: string
  ingredients: GeneratedIngredient[]
  steps: GeneratedStep[]
}

const OPENAI_MODEL = "gpt-4o-mini"
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions"

function validateBody(body: unknown): { ok: true; data: GenerateRecipeRequest } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Request body must be a JSON object." }
  }
  const b = body as Record<string, unknown>
  if (typeof b.protein !== "number" || !Number.isFinite(b.protein) || b.protein <= 0) {
    return { ok: false, message: "Field 'protein' must be a positive finite number in grams." }
  }
  if (typeof b.calories !== "number" || !Number.isFinite(b.calories) || b.calories <= 0) {
    return { ok: false, message: "Field 'calories' must be a positive finite number." }
  }
  if (b.budget !== undefined && typeof b.budget !== "string" && typeof b.budget !== "number") {
    return { ok: false, message: "Field 'budget' must be a string or number if provided." }
  }
  if (b.preferences !== undefined && typeof b.preferences !== "string") {
    return { ok: false, message: "Field 'preferences' must be a string if provided." }
  }
  return { ok: true, data: body as GenerateRecipeRequest }
}

function isValidRecipe(obj: unknown): obj is GeneratedRecipe {
  if (!obj || typeof obj !== "object") return false
  const r = obj as Record<string, unknown>
  if (typeof r.name !== "string" || r.name.trim().length === 0) return false
  if (typeof r.calories !== "number" || !Number.isFinite(r.calories)) return false
  if (typeof r.protein !== "number" || !Number.isFinite(r.protein)) return false
  if (!Array.isArray(r.ingredients)) return false
  for (const ing of r.ingredients as unknown[]) {
    if (!ing || typeof ing !== "object") return false
    const i = ing as Record<string, unknown>
    if (typeof i.amount !== "string") return false
    if (typeof i.unit !== "string") return false
    if (typeof i.item !== "string") return false
  }
  if (!Array.isArray(r.steps)) return false
  if ((r.steps as unknown[]).length === 0) return false
  for (const s of r.steps as unknown[]) {
    if (!s || typeof s !== "object") return false
    const st = s as Record<string, unknown>
    if (typeof st.num !== "number") return false
    if (typeof st.title !== "string") return false
    if (typeof st.desc !== "string") return false
  }
  return true
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: "Server configuration missing: OPENAI_API_KEY is not set." },
        { status: 500 },
      )
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload. Please send a valid JSON body." },
        { status: 400 },
      )
    }

    const validated = validateBody(body)
    if (!validated.ok) {
      return NextResponse.json({ error: validated.message }, { status: 400 })
    }
    const { protein, calories, budget, preferences } = validated.data

    const systemPrompt = [
      "You are a nutrition engineer specialized in plant-based fitness and bodybuilding meal design for American college students.",
      "Invent a brand-new, never-seen-before customized recipe from scratch using your training data. Do NOT reference any existing recipes or files on the server.",
      "Profile audience: US student — budget-conscious, dorm-friendly cooking tools possible, strong emphasis on complete plant protein, macros aligned exactly to user targets.",
      "Dietary rule: 100% plant-based / vegan only, no animal products (no dairy, eggs, meat, seafood, honey).",
      `Target: ${calories} kcal per serving, ${protein}g protein per serving. Hit these numbers precisely.`,
      budget !== undefined ? `Budget constraint: ${String(budget)} in USD or budget tier (cheap/moderate/premium). Prefer Walmart / Trader Joe's accessible staples.` : "",
      preferences ? `Additional preferences: ${preferences}` : "",
      "Return ONLY a valid JSON object (no markdown, no code fences, no commentary) matching the following schema:",
      "{",
      "  name: string — premium, catchy, gym-worthy title (e.g. 'Anabolic Shredded Tofu Bowl')",
      "  calories: number — exact kcal per serving, match target",
      "  protein: number — exact grams of protein per serving, match target",
      "  carbs?: number — grams carbs",
      "  fats?: number — grams fats",
      "  price?: string — approximate cost per serving, USD",
      "  cookTime?: string — total cook + prep time",
      "  servings?: string — yield",
      "  ingredients: Array<{ amount: string; unit: string; item: string; price?: string }> — complete pantry-to-bowl list, precise measurements",
      "  steps: Array<{ num: number; title: string; desc: string }> — numbered sequential cooking instructions, start at num: 1",
      "}",
      "Quality requirements: ingredients list length 6–14; steps length 4–8; realistic student kitchen methods (stovetop, microwave, rice cooker, toaster oven, no-sheet-pan-one-pot acceptable).",
    ].filter(Boolean).join("\n")

    const userPrompt = [
      `Generate a NEW plant-based student recipe.`,
      `Target macros: ${calories} kcal, ${protein}g protein per serving.`,
      budget !== undefined ? `Budget: ${String(budget)}` : "",
      preferences ? `Preferences / notes: ${preferences}` : "",
      "Deliver ONLY valid JSON matching the schema. No extra prose.",
    ].filter(Boolean).join("\n")

    const upstream = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.85,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    })

    if (!upstream.ok) {
      const status = upstream.status
      let detail = ""
      try {
        const upErr = await upstream.json()
        detail = typeof upErr === "object" && upErr && "error" in upErr && upErr.error
          ? String((upErr as { error: unknown }).error)
          : ""
      } catch {
        try { detail = await upstream.text() } catch { /* ignore */ }
      }
      if (status === 401) {
        return NextResponse.json(
          { error: "Upstream authorization failed. Verify OPENAI_API_KEY is valid." },
          { status: 502 },
        )
      }
      if (status === 429) {
        return NextResponse.json(
          { error: "Upstream rate limited. Please retry in a moment." },
          { status: 503 },
        )
      }
      return NextResponse.json(
        { error: `Upstream provider error (${status}).`, detail: detail || undefined },
        { status: status >= 500 ? 502 : 400 },
      )
    }

    let upstreamJson: unknown
    try {
      upstreamJson = await upstream.json()
    } catch {
      return NextResponse.json(
        { error: "Upstream provider returned non-JSON response." },
        { status: 502 },
      )
    }

    const content =
      upstreamJson &&
      typeof upstreamJson === "object" &&
      "choices" in upstreamJson &&
      Array.isArray((upstreamJson as { choices: unknown }).choices) &&
      (upstreamJson as { choices: unknown[] }).choices[0] &&
      typeof (upstreamJson as { choices: unknown[] }).choices[0] === "object" &&
      "message" in ((upstreamJson as { choices: unknown[] }).choices[0] as object) &&
      typeof (((upstreamJson as { choices: unknown[] }).choices[0] as { message: unknown }).message) === "object" &&
      "content" in ((((upstreamJson as { choices: unknown[] }).choices[0] as { message: unknown }).message) as object)
        ? String(((((upstreamJson as { choices: unknown[] }).choices[0] as { message: { content: unknown } }).message).content))
        : ""

    if (!content) {
      return NextResponse.json(
        { error: "Upstream provider returned empty content." },
        { status: 502 },
      )
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch (e) {
      return NextResponse.json(
        { error: "Generated recipe payload is not valid JSON.", raw: content.substring(0, 400) },
        { status: 502 },
      )
    }

    if (!isValidRecipe(parsed)) {
      return NextResponse.json(
        { error: "Generated recipe does not conform to the required schema.", raw: parsed },
        { status: 502 },
      )
    }

    return NextResponse.json(
      { ok: true, recipe: parsed },
      { status: 200 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: "Unexpected server error while generating recipe.", detail: message },
      { status: 500 },
    )
  }
}
