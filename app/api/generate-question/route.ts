import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { subject, topic, questionType } = await req.json();

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const systemPrompt = `You are a Senior Assessment Specialist for Singapore O-Level Humanities ${subject} (Syllabus 2261).
    Your task is to generate a high-fidelity assessment item matching the exact structural parameters requested.
    
    CRITICAL SYLLABUS DIRECTIVES:
    1. If Subject is "Social Studies", focus context and sources entirely on modern Current Affairs, civic governance principles, globalised interactions, identity, or socio-economic diversity challenges in Singapore or globally.
    2. If Subject is "Elective History", follow strict 20th-century history guidelines from 1910s to 1991 (Paris Peace Conference, Nazi Germany, Militarist Japan, WWII in Europe/Asia-Pacific, or Cold War developments).
    
    TOP-TIER ANSWERING SCHEME STANDARDS (LORMS):
    The "suggestedAnswer" parameter must reflect the absolute highest band level criteria defined by Cambridge & SEAB:
    - For Inference tasks: State a clear, non-literal sub-inference, accompanied by dense textual quotes and thorough reasoning explaining the hidden author purpose/motive (V-A-M layout).
    - For Comparison tasks: Detail both valid, crisp similarities and explicit differences based on a common matching point of comparison. Include rigorous cross-referencing markers.
    - For Essay/Evaluation tasks: Provide distinct multi-causal arguments using the strict PEEL format (Point, Evidence, Elaboration, Link), concluding with an explicit, nuanced evaluation of relative factor significance.
    
    Return exclusively a JSON object structured exactly like this:
    {
      "backgroundContext": "Historical/current affairs provenance background details...",
      "sourceA": "Source details including provenance and short text block...",
      "sourceB": "Source details including provenance and short text block...",
      "questionPrompt": "The specific evaluation prompt formatted exactly like a standard exam script item.",
      "suggestedAnswer": "A top-tier, exam-ready model solution showing ideal application of the exact relevant LORMS band rules."
    }`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: systemPrompt }],
      response_format: { type: "json_object" }
    });

    const payload = JSON.parse(completion.choices[0].message.content || '{}');

    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
              } catch {}
            },
          },
        }
      );

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
      console.error("Supabase log step bypassed:", dbErr);
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
