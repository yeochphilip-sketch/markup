import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { subject, topic, questionType } = await req.json();

    // Route configuration targeting free high-speed Groq inference servers
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const systemPrompt = `You are an expert Singapore O-Level Humanities Setter specializing in SEAB standard Source-Based Case Studies (SBCS). 
    Generate a highly realistic mock assessment package based on these constraints:
    Subject: ${subject}
    Topic: ${topic}
    Format: ${questionType}

    Return strictly a JSON object with this shape:
    {
      "backgroundContext": "Brief 3-sentence historical context summary...",
      "sourceA": "Provenance: Extract text or attribution block...",
      "sourceB": "Provenance: Dual perspective contrasting/supporting extract...",
      "questionPrompt": "The specific evaluation prompt question (e.g., How far does Source A prove Source B wrong...)"
    }`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: systemPrompt }],
      response_format: { type: "json_object" }
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || '{}'));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
