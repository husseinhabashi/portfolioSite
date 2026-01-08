// app/api/nova/route.ts
import OpenAI from "openai"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ASSISTANT_ID = process.env.NOVA_ASSISTANT_ID

const client = new OpenAI({ apiKey: OPENAI_API_KEY })

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function extractTextFromAssistantMessage(message: any): string {
  if (!message?.content || !Array.isArray(message.content)) return "Nova: [No response]"
  const chunks: string[] = []
  for (const part of message.content) {
    if (part?.type === "text" && part?.text?.value) chunks.push(part.text.value)
  }
  return chunks.length ? chunks.join("\n") : "Nova: [No response]"
}

function safeError(err: any) {
  return {
    name: err?.name,
    message: err?.message,
    status: err?.status,
    code: err?.code,
    type: err?.type,
    error: err?.error,
  }
}

export async function POST(req: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfigured: missing OPENAI_API_KEY." },
        { status: 500 }
      )
    }
    if (!ASSISTANT_ID) {
      return NextResponse.json(
        { error: "Server misconfigured: missing NOVA_ASSISTANT_ID." },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => null)
    const message = typeof body?.message === "string" ? body.message.trim() : ""

    if (!message) {
      return NextResponse.json({ error: "Missing 'message' in request body." }, { status: 400 })
    }

    // 1) Thread ID resolution (client -> cookie -> new thread)
    const clientThreadId =
      typeof body?.thread_id === "string" && body.thread_id.trim()
        ? body.thread_id.trim()
        : null

    const jar = await cookies()
    const cookieThreadId = jar.get("nova_thread_id")?.value ?? null

    let threadId = clientThreadId ?? cookieThreadId

    if (!threadId) {
      threadId = (await client.beta.threads.create()).id
    }

    console.log("[Nova] threadId used:", threadId, {
      fromClient: !!clientThreadId,
      fromCookie: !!cookieThreadId && !clientThreadId,
      createdNew: !clientThreadId && !cookieThreadId,
    })

    // 2) Add user message (this builds history in the same thread)
    await client.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    })

    // 3) Run assistant (uses dashboard files + file_search)
    const run = await client.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
    })

    // 4) Poll until complete
    const TIMEOUT_MS = 45_000
    const POLL_MS = 500
    const start = Date.now()

    let current = run
    while (["queued", "in_progress", "cancelling"].includes(current.status)) {
      if (Date.now() - start > TIMEOUT_MS) {
        console.error("[Nova Timeout]", { thread_id: threadId, run_id: run.id })
        const res = NextResponse.json({ error: "Nova timed out.", thread_id: threadId }, { status: 504 })
        res.cookies.set("nova_thread_id", threadId, {
          httpOnly: true,
          sameSite: "lax",
          secure: true,
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
        return res
      }

      await sleep(POLL_MS)
      current = await client.beta.threads.runs.retrieve(run.id, { thread_id: threadId })
    }

    if (current.status !== "completed") {
      console.error("[Nova Run Not Completed]", {
        thread_id: threadId,
        run_id: run.id,
        status: current.status,
        last_error: (current as any)?.last_error,
      })

      const res = NextResponse.json(
        {
          error: "Nova failed to generate a response.",
          status: current.status,
          last_error: (current as any)?.last_error ?? null,
          thread_id: threadId,
        },
        { status: 500 }
      )

      res.cookies.set("nova_thread_id", threadId, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })

      return res
    }

    // 5) Get newest assistant reply
    const msgs = await client.beta.threads.messages.list(threadId, { order: "desc", limit: 20 })
    const assistantMsg = msgs.data.find((m: any) => m.role === "assistant")
    const outputText = extractTextFromAssistantMessage(assistantMsg)

    // ✅ Always set cookie so browser keeps thread even if frontend doesn't store it
    const res = NextResponse.json({ output_text: outputText, thread_id: threadId })
    res.cookies.set("nova_thread_id", threadId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (err: any) {
    console.error("[Nova API Error]", safeError(err))
    return NextResponse.json(
      { error: "Failed to connect to Nova.", details: safeError(err) },
      { status: 500 }
    )
  }
}