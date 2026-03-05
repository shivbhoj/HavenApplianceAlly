import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { Appliance, CATEGORY_LABELS } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildSystemPrompt(appliances: Appliance[]): string {
  const applianceList =
    appliances.length > 0
      ? appliances
          .map((a) => {
            const category = CATEGORY_LABELS[a.category] ?? a.category;
            const warrantyStatus =
              a.warrantyExpiry && new Date(a.warrantyExpiry) > new Date()
                ? `warranty valid until ${a.warrantyExpiry}`
                : a.warrantyExpiry
                  ? "warranty expired"
                  : "no warranty info";
            const maintenanceInfo = a.lastMaintenanceDate
              ? `last maintained ${a.lastMaintenanceDate}`
              : "no maintenance recorded";
            return `- ${a.name} (${a.brand} ${a.model}, ${category}) in ${a.location || "unknown location"}: ${warrantyStatus}, ${maintenanceInfo}${a.notes ? `, notes: ${a.notes}` : ""}`;
          })
          .join("\n")
      : "No appliances registered yet.";

  return `You are HavenAlly, a friendly and knowledgeable AI assistant specializing in home appliances. You help homeowners with:
- Appliance maintenance schedules and tips
- Troubleshooting problems and error codes
- Understanding warranty coverage
- Energy efficiency advice
- When to repair vs. replace appliances
- Safety tips and recalls
- Buying recommendations

The user's registered appliances:
${applianceList}

Guidelines:
- Be concise, practical, and actionable
- When relevant, reference the user's specific appliances by name and brand
- Provide safety warnings when appropriate
- For error codes, give specific diagnostic steps
- Always mention when professional service is recommended for safety
- Format responses with clear sections when explaining multi-step processes`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, appliances } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      appliances: Appliance[];
    };

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(appliances ?? []);

    const stream = client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
