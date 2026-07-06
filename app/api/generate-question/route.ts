import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { subject, topic, questionType } = await req.json();

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `You are an expert Cambridge Examiner for Singapore GCE O-Level ${subject}.
    Generate a high-quality exam task for the topic: "${topic}" and skill type: "${questionType}".
    
    You must return exactly this JSON format:
    {
      "backgroundContext": "A brief historical background context paragraph setting the scene...",
      "sourceA": "A detailed primary or secondary source excerpt (text-based attribution, provenance, and content)...",
      "sourceB": "A contrasting or supporting second source text segment...",
      "questionPrompt": "The specific analytical essay question prompt targeting the requested skill layout...",
      "suggestedAnswer": "A perfect LORMS top-tier model essay response showing ideal PEEL structure and source cross-referencing."
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
