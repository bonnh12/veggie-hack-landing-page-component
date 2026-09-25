import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export type WaitlistRequest = {
  email: string
  name?: string
  topic?: string
  message?: string
  source?: string
}

export type WaitlistSuccess = {
  ok: true
  id: string
  timestamp: string
  email: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LEN = 254
const MAX_FIELD_LEN = 2000
const MAX_MESSAGE_LEN = 10000

function isString(v: unknown): v is string {
  return typeof v === "string"
}

function sanitize(value: string, max: number): string {
  return value.trim().slice(0, max)
}

function validateBody(body: unknown): { ok: true; data: WaitlistRequest } | { ok: false; message: string; status?: number } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Request body must be a JSON object.", status: 400 }
  }
  const b = body as Record<string, unknown>

  if (!("email" in b) || !isString(b.email)) {
    return { ok: false, message: "Field 'email' is required and must be a string.", status: 400 }
  }
  const email = sanitize(b.email, MAX_EMAIL_LEN)
  if (email.length === 0) {
    return { ok: false, message: "Field 'email' must not be empty.", status: 400 }
  }
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, message: "Field 'email' does not appear to be a valid email address.", status: 400 }
  }

  const name = "name" in b && isString(b.name) ? sanitize(b.name, MAX_FIELD_LEN) : undefined
  const topic = "topic" in b && isString(b.topic) ? sanitize(b.topic, MAX_FIELD_LEN) : undefined
  const message = "message" in b && isString(b.message) ? sanitize(b.message, MAX_MESSAGE_LEN) : undefined
  const source = "source" in b && isString(b.source) ? sanitize(b.source, MAX_FIELD_LEN) : undefined

  return {
    ok: true,
    data: {
      email,
      name: name || undefined,
      topic: topic || undefined,
      message: message || undefined,
      source: source || undefined,
    },
  }
}

export async function POST(req: Request) {
  const startedAt = new Date().toISOString()

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || typeof supabaseUrl !== "string" || supabaseUrl.trim().length === 0) {
      console.error("[waitlist] missing NEXT_PUBLIC_SUPABASE_URL at", startedAt)
      return NextResponse.json(
        { error: "Server configuration missing: NEXT_PUBLIC_SUPABASE_URL is not set." },
        { status: 500 },
      )
    }

    if (!supabaseKey || typeof supabaseKey !== "string" || supabaseKey.trim().length === 0) {
      console.error("[waitlist] missing NEXT_PUBLIC_SUPABASE_ANON_KEY at", startedAt)
      return NextResponse.json(
        { error: "Server configuration missing: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set." },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

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
      return NextResponse.json(
        { error: validated.message },
        { status: validated.status ?? 400 },
      )
    }
    const { email, name, topic, message, source } = validated.data

    const timestamp = new Date().toISOString()
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      undefined
    const ua = req.headers.get("user-agent")?.slice(0, MAX_FIELD_LEN) || undefined
    const region = "US"

    const { data: insertData, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email,
        name: name || null,
        topic: topic || null,
        message: message || null,
        source: source || null,
        ip: ip || null,
        user_agent: ua || null,
        region,
        created_at: timestamp,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error(
        "[waitlist] supabase insert error",
        { error: insertError.message, code: insertError.code, email, startedAt },
      )
      
      // Handle unique constraint violation (duplicate email)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: "This email is already on the waitlist." },
          { status: 409 },
        )
      }

      return NextResponse.json(
        { error: "Failed to add to waitlist. Please try again later.", detail: insertError.message },
        { status: 500 },
      )
    }

    if (!insertData || !insertData.id) {
      console.error("[waitlist] supabase insert returned no data", { email, startedAt })
      return NextResponse.json(
        { error: "Failed to add to waitlist. No data returned from database." },
        { status: 500 },
      )
    }

    console.info(
      "[waitlist] successfully added to waitlist",
      { id: insertData.id, email, source: source ?? "unspecified", topic: topic ?? "waitlist", finishedAt: new Date().toISOString() },
    )

    const response: WaitlistSuccess = {
      ok: true,
      id: insertData.id,
      timestamp,
      email,
    }
    return NextResponse.json(response, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error(
      "[waitlist] unexpected error",
      { message, stack: stack?.slice(0, 600), startedAt },
    )
    return NextResponse.json(
      { error: "Unexpected server error while recording waitlist entry.", detail: message },
      { status: 500 },
    )
  }
}
