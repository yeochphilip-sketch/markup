import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { studentAnswer, questionType, subject } = await req.json();
    const normalized = studentAnswer.toLowerCase();

    let scoreEstimate = 'L1/2';
    let critique: string[] = [];
    let highlightedSegments = [{ text: studentAnswer, type: 'correct' }];

    // 1. Core Evaluation: Checking for basic Source Identification vs LORMS development
    if (normalized.length < 90) {
      scoreEstimate = 'L1/2';
      critique = [
        "Response is too brief to establish analytical depth.",
        "Fails to cite evidence or extract direct source validation markers.",
        "Stuck at surface description (L1 benchmark)."
      ];
    } 
    // 2. Skill Logic: Comparison and Contrast (AO2/AO3 Criteria)
    else if (questionType.includes('Comparison') || questionType.includes('Compare')) {
      const checksBoth = normalized.includes('source a') && normalized.includes('source b');
      const checksAgreement = normalized.includes('agree') || normalized.includes('similar');
      const checksDifference = normalized.includes('differ') || normalized.includes('contrast');

      if (checksBoth && checksAgreement && checksDifference) {
        scoreEstimate = subject === 'Social Studies' ? 'L3/5' : 'L3/6';
        critique = [
          "Excellent dual perspective breakdown! Validated both explicit agreements and subtle tone differences.",
          "Clear structural execution matching standard SEAB O-Level comparison rules perfectly."
        ];
      } else if (checksBoth && (checksAgreement || checksDifference)) {
        scoreEstimate = 'L2/3';
        critique = [
          "Identified single-sided alignment properties successfully (L2 balance).",
          "To reach higher LORMS tiers, you must expand your comparison to detail BOTH points of difference and points of agreement."
        ];
      } else {
        scoreEstimate = 'L1/2';
        critique = [
          "Missing clear attribution tags. You must declare clear textual examples from both Source A and Source B to establish alignment layers."
        ];
      }
    } 
    // 3. Skill Logic: Purpose / Motive Evolution / Reliability Checks
    else if (questionType.includes('Purpose') || questionType.includes('Utility') || questionType.includes('Reliability')) {
      const hasProvenance = normalized.includes('provenance') || normalized.includes('context') || normalized.includes('published because');
      const hasMotive = normalized.includes('convince') || normalized.includes('influence') || normalized.includes('target audience');

      if (hasProvenance && hasMotive) {
        scoreEstimate = 'L3/5';
        critique = [
          "Strong performance! Successfully decoded the sub-vocal purpose layer instead of just repeating what the source says.",
          "Attribution metrics display strong context understanding, targeting the author's hidden intent."
        ];
      } else {
        scoreEstimate = 'L2/3';
        critique = [
          "Response relies purely on surface details. You explained the content, but skipped evaluating the author's motive.",
          "Tip: Look at the provenance context. Why did they release this specific message at this exact historical moment?"
        ];
      }
    }
    // 4. Skill Logic: Synthesis Matrix Assertion (AO2 / L3 Balance)
    else if (questionType.includes('Assertion') || questionType.includes('Synthesis')) {
      const crossReferences = (normalized.match(/source/g) || []).length;
      
      if (crossReferences >= 3) {
        scoreEstimate = 'L3/6';
        critique = [
          "Robust synthesis pipeline! Evaluated a broad spectrum of source interactions across your analysis argument.",
          "Balanced structure maintained. Ensure individual parameter points don't lose sight of the overarching prompt statement."
        ];
      } else {
        scoreEstimate = 'L2/3';
        critique = [
          "Insufficient source coverage. For a high-scoring assertion matrix row, you must explicitly group and cross-reference multiple documents.",
          "Try to explicitly sort sources that support the statement vs sources that challenge it to achieve true L3 balance."
        ];
      }
    }
    // 5. General / SEQ Essay Explanations Framework (AO1 Criteria)
    else {
      const hasPeel = normalized.includes('because') || normalized.includes('therefore') || normalized.includes('consequently');
      if (hasPeel && normalized.length > 250) {
        scoreEstimate = 'L3/6';
        critique = [
          "PEEL structure executed beautifully. Your explanations tie back to your main topic assertion logically.",
          "To secure the top L3/8 or bonus bands (+2 marks), ensure you explicitly compare the relative importance of different factors in your conclusion."
        ];
      } else {
        scoreEstimate = 'L2/3';
        critique = [
          "Identified factors successfully, but the paragraph reads like a timeline or story narrative instead of an analytical argument.",
          "Ensure every point follows the PEEL chain: make a clear Point, state your Evidence, Explain its impact, and Link it back to the prompt question."
        ];
      }
    }

    return NextResponse.json({
      scoreEstimate,
      critique,
      highlightedSegments
    });
  } catch (err) {
    return NextResponse.json({ error: 'Grading evaluation system fault' }, { status: 500 });
  }
}
