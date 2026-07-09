import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

function generateMockSegments(text: string) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.map((sentence, index) => {
    let type: 'correct' | 'weak' | 'error' = 'correct';
    if (index % 4 === 1) type = 'weak';
    if (index % 4 === 2) type = 'error';
    return { text: sentence + ' ', type };
  });
}

export async function POST(req: Request) {
  try {
    const { studentAnswer, questionPrompt, questionType, subject } = await req.json();

    if (!studentAnswer) {
      return NextResponse.json({ error: 'Missing answer text input payload.' }, { status: 400 });
    }

    const isSEQ = questionType.toLowerCase().includes('seq') || questionType.toLowerCase().includes('srq');
    
    const simulatedScoreEstimate = isSEQ ? 'L2/5' : 'L3/4';
    const simulatedEssayScore = isSEQ ? 5 : 4;
    
    const cleanAnswer = studentAnswer.toLowerCase();
    const hasConclusion = cleanAnswer.includes('in conclusion') || cleanAnswer.includes('hence') || cleanAnswer.includes('conclude');
    const simulatedConclusionScore = isSEQ ? (hasConclusion ? 2 : 0) : 0;

    const critique = [
      `Your argument structure maps well to the given prompt framework.`,
      isSEQ && !hasConclusion 
        ? `⚠️ Missing evaluative conclusion segment. Add a final balancing sentence to bump your score to L2/2.` 
        : `Excellent resolution. Your final sentence matches standard SEAB evaluation parameters.`
    ];

    const highlightedSegments = generateMockSegments(studentAnswer);

    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const uid = session.user.id;

      await supabase.from('essay_evaluations').insert([{
        user_id: uid,
        student_essay: studentAnswer,
        score_estimate: simulatedScoreEstimate,
        critique_bullets: critique
      }]);

      const updatePayload: Record<string, any> = {};
      
      if (isSEQ) {
        updatePayload.seq_essay_score = simulatedEssayScore;
        updatePayload.seq_conclusion_score = simulatedConclusionScore;
      } else if (questionType.toLowerCase().includes('inference')) {
        updatePayload.sbq_inference_score = 4;
      } else if (questionType.toLowerCase().includes('compare')) {
        updatePayload.sbq_comparison_score = 4;
      } else {
        updatePayload.sbq_reliability_score = 3;
      }

      await supabase
        .from('user_skill_metrics')
        .upsert({ user_id: uid, ...updatePayload }, { onConflict: 'user_id' });
    }

    return NextResponse.json({
      scoreEstimate: simulatedScoreEstimate,
      critique,
      highlightedSegments
    });

  } catch (error: any) {
    console.error('Grading route exception trap:', error);
    return NextResponse.json({ error: error.message || 'Internal processing error.' }, { status: 500 });
  }
}
