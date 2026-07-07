import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { subject, topic, questionType } = await req.json();

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `You are a Senior Cambridge Exam Setter for the Singapore SEAB GCE O-Level ${subject} national examination.
    Generate an authentic, exam-grade Source-Based Case Study task covering Topic: "${topic}".
    The task must precisely match the conceptual style and technical wording used in real historical papers.
    
    Target Question Skill Layout: "${questionType}"
    
    Wording Guidelines for specific formats:
    - If "Comparison", word question exactly as: "How far does Source A support Source B about... Explain your answer."
    - If "Purpose", word question exactly as: "Why did the author issue this statement in [Year]? Explain your answer."
    - If "Reliability", word question exactly as: "Does Source A prove that... Explain your answer."
    - If "Assertion/Matrix", word question exactly as: "Using all sources, how far do you agree that... Explain your answer."

    Ensure that your generated Source texts contain clear target parameters:
    1. A provenance line at the top stating the precise author position, date, and historical context.
    2. Subtle bias or ulterior motives to give students ample material for testing utility and reliability.

    Return EXACTLY this JSON structure:
    {
      "backgroundContext": "A 3-4 sentence official textbook style contextual overview introducing the historical contention point.",
      "sourceA": "[Provenance Line]\\nActual historical or realistic mock excerpt reflecting an explicit stance with specific clues.",
      "sourceB": "[Provenance Line]\\nA contrasting or complementary text segment designed to test cross-referencing capabilities.",
      "questionPrompt": "The precisely formatted O-Level style question.",
      "suggestedAnswer": "An ideal response structured explicitly to hit the highest LORMS level (e.g., L5/5 or L6/6), pointing out cross-references and purpose nuances."
    }`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    });

    const challengeData = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(challengeData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
