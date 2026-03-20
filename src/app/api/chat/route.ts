import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { PantryItem } from "@/lib/types";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const { messages, pantryItems }: { messages: Message[]; pantryItems: PantryItem[] } = await req.json();

  const now = Date.now();
  const pantryContext = pantryItems.length > 0
    ? pantryItems
        .map((i) => {
          const daysLeft = Math.ceil((new Date(i.expiration_date).getTime() - now) / (1000 * 60 * 60 * 24));
          return `- ${i.name} (${i.category}, ${daysLeft > 0 ? `${daysLeft} days left` : "expired"})`;
        })
        .join("\n")
    : "No items in pantry.";

  const systemInstruction = `You are a friendly and knowledgeable cooking consultant. The user's current pantry:

${pantryContext}

Give practical, specific cooking advice. Reference actual items from their pantry when relevant. Keep responses concise and conversational.`;

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: { systemInstruction },
    history,
  });

  const response = await chat.sendMessage({ message: lastMessage.content });
  const reply = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";

  return NextResponse.json({ reply });
}
