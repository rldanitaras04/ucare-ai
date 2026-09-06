import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildCarinaMessages, checkRateLimit } from "@repo/utils";
import type { CarinaMessage } from "@repo/utils";
import { createServerClient } from "@repo/supabase/server";

interface RequestBody {
  messages: CarinaMessage[];
}

function isValidMessage(msg: unknown): msg is CarinaMessage {
  if (typeof msg !== "object" || msg === null) return false;
  const m = msg as Record<string, unknown>;
  return (
    typeof m.role === "string" &&
    ["user", "assistant", "system"].includes(m.role) &&
    typeof m.content === "string" &&
    m.content.trim().length > 0
  );
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(`carina:${user.id}`, { windowMs: 60_000, maxRequests: 20 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
        },
      }
    );
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "AI service is not configured" },
      { status: 503 }
    );
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { error: "Messages array is required and must not be empty" },
      { status: 400 }
    );
  }

  if (body.messages.length > 50) {
    return NextResponse.json(
      { error: "Too many messages (max 50)" },
      { status: 400 }
    );
  }

  if (!body.messages.every(isValidMessage)) {
    return NextResponse.json(
      { error: "Invalid message format: each message must have a valid role and non-empty content" },
      { status: 400 }
    );
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const messages = buildCarinaMessages(body.messages, "admin");

  try {
    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
