import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 💡 Avoid executing createClient immediately at the top level to prevent build time crashes
let supabaseAdminInstance: any = null;

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Provide a clear error log or graceful fallback during static building
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("⚠️ Supabase environment variables missing. Client instantiation deferred.");
      // Return a dummy client or null during build evaluation
      return null;
    }

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseAdminInstance;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
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

    const combinedEssaySubmission = `SBCS: ${sbcsAnswer}\n\nSEQ: ${seqAnswer}\n\nSRQ: ${srqAnswer}`;

    // --- Placeholder for your LLM / Evaluation engine call ---
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

    // Get the instance safely inside the request context
    const supabaseAdmin = getSupabaseAdmin();

    if (userId && supabaseAdmin) {
      const { error: dbError } = await supabaseAdmin
        .from('essay_evaluations')
        .insert([{
          user_id: userId,
          student_essay: combinedEssaySubmission, 
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