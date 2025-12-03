import { openai } from "@/config/OpenAiModel";
import { NextRequest, NextResponse } from "next/server";
import { AIDoctorAgents } from '@/public/shared/list';

export async function POST(req: NextRequest) {
  const { notes } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 500,
      response_format: { type: "json_object" }, // Forces JSON output
      messages: [
        { role: 'system', content: JSON.stringify(AIDoctorAgents) },
        {
          role: "user",
          content:
            "User Notes/Symptoms: " +
            notes +
            ". Based on user notes, suggest a list of doctors with specialist, image, and voiceId. Return JSON only."
        }
      ],
    });

    const rawResp = completion.choices[0].message?.content;
    const parsed = JSON.parse(rawResp || "{}");

    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error("API ERROR:", e?.error || e);
    return NextResponse.json({ error: e?.error?.message || "Something went wrong." });
  }
}
