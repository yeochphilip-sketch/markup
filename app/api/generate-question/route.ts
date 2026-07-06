import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { subject, topic, questionType } = await req.json();

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const systemPrompt = `You are an expert Singapore O-Level Humanities Setter specializing in SEAB standard Source-Based Case Studies (SBCS).
    Generate a highly realistic mock assessment package based on these constraints:
    Subject: ${subject}
    Topic: ${topic}
    Format: ${questionType}

    Return strictly a valid JSON object with exactly this shape:
    {
      "backgroundContext": "Historical context summary...",
      "sourceA": "Provenance and text of Source A...",
      "sourceB": "Provenance and text of Source B...",
      "questionPrompt": "The specific evaluation prompt question...",
      "suggestedAnswer": "An exemplary high-level model answer using rigorous PEEL structure."
    }`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: systemPrompt }],
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content || '{}';
    return NextResponse.json(JSON.parse(responseText));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
