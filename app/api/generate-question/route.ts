import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, topic, questionType } = body;

    // Determine default prompts depending on whether a student chosen bundle mode or custom strategic filters
    let sbcsPromptFallback = "How far does Source A support the claim? Explain your answer.";
    let seqPromptFallback = "Explain the impact of the policy decisions on the local population.";
    let srqPromptFallback = "In your opinion, is institutional intervention or local management more vital?";

    // If a student isolates strategy to a specific objective, we provide target instructions 
    if (questionType && !questionType.includes('All Formats')) {
      if (questionType.includes('SBQ')) {
        sbcsPromptFallback = `Target Focus Evaluation Task [${questionType}]: Focus explicitly on evaluating validity and reliability rules.`;
        seqPromptFallback = "Optional: Section deactivated for focused skill strategy simulation.";
        srqPromptFallback = "Optional: Section deactivated for focused skill strategy simulation.";
      } else if (questionType.includes('SEQ') || questionType.includes('SRQ')) {
        sbcsPromptFallback = "Optional: Section deactivated for focused essay strategy simulation.";
        seqPromptFallback = "Structured Essay query handling direct causal analysis patterns.";
        srqPromptFallback = "State explicit personal recommendation matrices.";
      }
    }

    // Example AI payload response structure mimicking standard Singapore syllabus examination packets
    const generatedChallenge = {
      backgroundContext: `Historical study focusing on ${topic || 'General Syllabus Mix'} within the ${subject} curriculum framework.`,
      sourceAProvenance: "Source A: Excerpt from an official administrative record published during the policy implementation phase.",
      sourceA: "The introduction of structural support grids allowed decentralized groups to expand their workflows efficiently. However, centralized monitors noted variance in reporting accuracy during initial operational reviews.",
      sourceBProvenance: "Source B: Commentaries from a regional independent analyst review board looking back at strategic execution frameworks.",
      sourceB: "While early indicators promised substantial speed improvements, structural constraints became apparent as scale multiplied. Without unified guidelines, localized updates produced cascading discrepancies.",
      questionPrompt: `O-Level Standard Practice Paper: Comprehensive evaluation of structural frameworks across ${topic}.`,
      
      // 📑 Safe Multi-prompt fallbacks to populate text fields seamlessly
      sbcsPrompt: sbcsPromptFallback,
      seqPrompt: seqPromptFallback,
      srqPrompt: srqPromptFallback,
      
      suggestedAnswer: "MODEL ANSWER GUIDELINE:\n\nSBCS: Source A shows initial local success whereas Source B disputes long-term strategic viability.\n\nSEQ: Unified guidelines reduce cascading errors significantly.\n\nSRQ: Local management offers agility, but central standardization ensures system safety."
    };

    return NextResponse.json(generatedChallenge);

  } catch (error: any) {
    console.error("Question compilation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}