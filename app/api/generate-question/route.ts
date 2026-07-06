import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { subject, topic, questionType } = await req.json();

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // Strategy prompt engineering setting direct context limits dynamically
    const systemPrompt = `You are a Senior Assessment Specialist for Singapore O-Level ${subject}.
    Generate a high-fidelity Source-Based Case Study (SBCS) task package matching SEAB parameters.
    
    CRITICAL QUALITY RULES:
    1. If Subject is "Social Studies", anchor the background context and source viewpoints entirely on highly relevant Current Affairs, modern civic governance, globalization developments, or digital media literacy milestones.
    2. If Subject is "Elective History", adhere strictly to standard syllabus units (e.g., Cold War crises, Stalinist Russia, Nazi Germany, or the outbreak of WWII in Asia-Pacific). Do not stray outside textbook historical domains.
    
    Return strictly a JSON object matching this exact shape:
    {
      "backgroundContext": "Historical or current affairs context summary...",
      "sourceA": "Provenance and text extract for Source A...",
      "sourceB": "Provenance and text extract for Source B...",
      "questionPrompt": "The comparative or inference target question...",
      "suggestedAnswer": "An exemplary L5/L6 framework model answer."
    }`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: systemPrompt }],
      response_format: { type: "json_object" }
    });

    const payload = JSON.parse(completion.choices[0].message.content || '{}');

    // Attempt to log this record automatically if a user session cookie exists
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase.from('practice_history').insert({
          user_id: session.user.id,
          subject,
          topic,
          question_type: questionType,
          question_prompt: payload.questionPrompt,
          background_context: payload.backgroundContext,
          source_a: payload.sourceA,
          source_b: payload.sourceB,
          suggested_answer: payload.suggestedAnswer
        });
      }
    } catch (dbErr) {
      console.error("Supabase history log bypassed:", dbErr);
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
