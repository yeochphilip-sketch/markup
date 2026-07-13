import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Service Role or Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to bypass RLS if writing metrics
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 🛠️ Updated Input Destructuring for the 3 individual canvases
    const { 
      sbcsAnswer = '', 
      seqAnswer = '', 
      srqAnswer = '', 
      questionPrompt, 
      questionType, 
      subject, 
      topic,
      userId 
    } = body;

    // Build the diagnostic evaluation prompt using specific multi-canvas instructions
    const combinedEssaySubmission = `SBCS: ${sbcsAnswer}\n\nSEQ: ${seqAnswer}\n\nSRQ: ${srqAnswer}`;

    // --- Placeholder for your LLM / Evaluation engine call ---
    // In your actual implementation, you will send combinedEssaySubmission along with questionPrompt to OpenAI/Anthropic.
    const mockScoreEstimate = "L3/6 Bundle Matrix";
    const mockCritique = [
      "SBCS inference successfully grounded in Source A details.",
      "SEQ prioritization needs more distinct historical link back to core prompt criteria.",
      "SRQ assertion covers personal judgment but lacks balanced contrasting perspectives."
    ];
    const mockHighlightedSegments = [
      { text: sbcsAnswer, type: 'correct' },
      { text: seqAnswer, type: 'weak' },
      { text: srqAnswer, type: 'correct' }
    ];
    // ---------------------------------------------------------

    // 🗄️ Database Schema Alignment: Insert combined string safely to legacy column
    if (userId) {
      const { error: dbError } = await supabaseAdmin
        .from('essay_evaluations')
        .insert([{
          user_id: userId,
          student_essay: combinedEssaySubmission, // Combined structured payload safely saved
          score_estimate: mockScoreEstimate,
          critique_bullets: mockCritique,
          created_at: new Date().toISOString()
        }]);

      if (dbError) {
        console.error("Database alignment insert failed:", dbError);
      }
    }

    return NextResponse.json({
      scoreEstimate: mockScoreEstimate,
      critique: mockCritique,
      highlightedSegments: mockHighlightedSegments
    });

  } catch (error: any) {
    console.error("Grading execution error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}