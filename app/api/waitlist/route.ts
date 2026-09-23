import { NextResponse } from "next/server"

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
  row: number
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

function appendUrlSupportsBody(url: string): boolean {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    if (host.endsWith("sheets.googleapis.com") || host.endsWith("googleapis.com")) return true
    return false
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const startedAt = new Date().toISOString()

  try {
    const sheetUrl = process.env.GOOGLE_SHEET_URL
    if (!sheetUrl || typeof sheetUrl !== "string" || sheetUrl.trim().length === 0) {
      console.error("[waitlist] missing process.env.GOOGLE_SHEET_URL at", startedAt)
      return NextResponse.json(
        { error: "Server configuration missing: GOOGLE_SHEET_URL is not set." },
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

    const row = [
      timestamp,
      email,
      name ?? "",
      topic ?? "",
      message ?? "",
      source ?? "",
      ip ?? "",
      ua ?? "",
      region,
    ]

    const supportsBody = appendUrlSupportsBody(sheetUrl)
    const sheetHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY
    if (apiKey && typeof apiKey === "string" && apiKey.trim().length > 0) {
      sheetHeaders["Authorization"] = `Bearer ${apiKey.trim()}`
    }
    const sheetToken = process.env.GOOGLE_SHEET_TOKEN || process.env.GOOGLE_APPS_SCRIPT_TOKEN
    if (sheetToken && typeof sheetToken === "string" && sheetToken.trim().length > 0 && !sheetHeaders["Authorization"]) {
      sheetHeaders["Authorization"] = `Bearer ${sheetToken.trim()}`
    }

    let upstream: Response
    let sheetBody: unknown

    if (supportsBody) {
      const payload = {
        values: [row],
        range: "A1",
        majorDimension: "ROWS",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
      }
      upstream = await fetch(sheetUrl, {
        method: "POST",
        headers: sheetHeaders,
        body: JSON.stringify(payload),
      })
      try {
        sheetBody = await upstream.json()
      } catch {
        try { sheetBody = { text: (await upstream.text()).slice(0, 500) } } catch { sheetBody = null }
      }
    } else {
      const queryParams = new URLSearchParams()
      queryParams.set("timestamp", row[0])
      queryParams.set("email", row[1])
      if (name) queryParams.set("name", name)
      if (topic) queryParams.set("topic", topic)
      if (message) queryParams.set("message", message)
      if (source) queryParams.set("source", source)
      if (ip) queryParams.set("ip", ip)
      if (ua) queryParams.set("ua", ua)
      queryParams.set("region", region)

      const separator = sheetUrl.includes("?") ? "&" : "?"
      const finalUrl = `${sheetUrl}${separator}${queryParams.toString()}`

      upstream = await fetch(finalUrl, {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain, */*",
        },
      })
      try {
        sheetBody = await upstream.json()
      } catch {
        try { sheetBody = { text: (await upstream.text()).slice(0, 500) } } catch { sheetBody = null }
      }
    }

    if (!upstream.ok) {
      const status = upstream.status
      const detail =
        sheetBody && typeof sheetBody === "object" && "error" in sheetBody
          ? String((sheetBody as { error: unknown }).error)
          : typeof sheetBody === "string"
            ? sheetBody
            : undefined
      console.error(
        "[waitlist] sheet upstream non-2xx",
        { status, email, urlHost: new URL(sheetUrl).hostname, detail, startedAt },
      )
      if (status === 401 || status === 403) {
        return NextResponse.json(
          { error: "Upstream sheet authorization failed. Verify GOOGLE_SHEET_URL credentials.", detail: detail || undefined },
          { status: 502 },
        )
      }
      if (status === 429) {
        return NextResponse.json(
          { error: "Upstream sheet rate limited. Please retry in a moment.", detail: detail || undefined },
          { status: 503 },
        )
      }
      return NextResponse.json(
        { error: `Upstream sheet error (${status}).`, detail: detail || undefined },
        { status: status >= 500 ? 502 : 500 },
      )
    }

    let rowNumber: number | undefined
    if (sheetBody && typeof sheetBody === "object") {
      const bodyObj = sheetBody as Record<string, unknown>
      if (typeof bodyObj.row === "number") rowNumber = bodyObj.row
      else if (typeof bodyObj.rowIndex === "number") rowNumber = bodyObj.rowIndex
      else if (
        "updates" in bodyObj &&
        bodyObj.updates &&
        typeof bodyObj.updates === "object"
      ) {
        const up = bodyObj.updates as Record<string, unknown>
        if (typeof up.updatedRows === "number") rowNumber = up.updatedRows
        if (typeof up.updatedRange === "string") {
          const match = /(\d+)$/.exec(String(up.updatedRange))
          if (match) rowNumber = Number(match[1])
        }
      }
    }

    const finalRow = rowNumber ?? 1

    console.info(
      "[waitlist] appended row",
      { row: finalRow, email, source: source ?? "unspecified", topic: topic ?? "waitlist", finishedAt: new Date().toISOString() },
    )

    const response: WaitlistSuccess = {
      ok: true,
      row: finalRow,
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
