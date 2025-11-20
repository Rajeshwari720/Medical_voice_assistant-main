import { openai } from "@/config/OpenAiModel";
import { NextRequest, NextResponse } from "next/server";
import { AIDoctorAgents } from '@/public/shared/list';

export async function POST(req: NextRequest) {
  const { notes } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      max_tokens: 500,
      messages: [
        { role: 'system', content: JSON.stringify(AIDoctorAgents) },
        {
          role: "user",
          content: "User Notes/Symptoms: " + notes + ", Based on user notes, please suggest a list of doctors with `specialist`, `image`, and `voiceId`. Return JSON only."
        }
      ],
    });

    let rawResp = completion.choices[0].message?.content || "{}";

    // ✅ Remove any ```json or ``` or newlines from the response
    rawResp = rawResp.replace(/```(json)?/g, "").trim();

    // ✅ Parse cleaned JSON string
    const parsed = JSON.parse(rawResp);

    return NextResponse.json(parsed); // send actual object, not string
  } catch (e) {
    console.error("API ERROR:", e);
    return NextResponse.json({ error: e });
  }
}
