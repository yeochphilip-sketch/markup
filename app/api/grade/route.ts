import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { studentAnswer, questionPrompt, questionType, subject } = await req.json();

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const gradingSystemPrompt = `You are a Senior Cambridge Examiner for Singapore GCE O-Level ${subject || 'Humanities'}.
    Evaluate the student's response based strictly on LORMS criteria and the PEEL framework.
    
    You must evaluate:
    Question/Prompt: "${questionPrompt || 'General Evaluation'}"
    Student Response: "${studentAnswer}"

    You must return a JSON object containing a structured critique and a segmented breakdown of their text for inline highlighting.
    
    Return exactly this JSON format:
    {
      "scoreEstimate": "e.g., L3/4 (Valid Inference with Evidence)",
      "critique": [
        "Identified a clear valid sub-inference.",
        "Missing a crisp link back to the overarching question prompt focus."
      ],
      "highlightedSegments": [
        {
          "text": "The exact string segment from their answer that is well written...",
          "type": "correct"
        },
        {
          "text": "The exact string segment that is vague or structurally weak...",
          "type": "weak" 
        },
        {
          "text": "The exact string segment containing critical logical flaws or historical errors...",
          "type": "error"
        }
      ]
    }
    
    Ensure that when you join all the 'text' fields in the 'highlightedSegments' array together sequentially, they reconstruct the student's original answer. Valid types are: "correct", "weak" (yellow underline/highlight), and "error" (red wavy underline).`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: gradingSystemPrompt }],
      response_format: { type: "json_object" }
    });

    const evaluationPayload = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(evaluationPayload);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
