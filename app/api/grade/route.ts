import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { studentAnswer, questionPrompt, questionType, subject } = await req.json();

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const systemPrompt = `You are an expert Cambridge Chief Examiner for Singapore GCE O-Level ${subject}. 
    Your goal is to meticulously audit the student's essay answer paragraph against official SEAB LORMS criteria.
    
    Current Target Question Type Rules:
    - SBQ: Extracting & Inferring (AO2) -> Max L2/3. Must verify valid inferences instead of pure liftings.
    - SBQ: Comparison & Contrast (AO2/AO3) -> Check if student compares *both* sub-points of similarity AND difference. Base content matching scores max L3/4. Cross-referencing reliability or purpose awards top tier L4.
    - SBQ: Purpose-Motive Evaluation (AO3) -> Look for the 'Impact/Action' on the target audience. If they only mention message/context, cap them at L3. They must state the author's hidden intent/motive to reach L4.
    - SBQ: Utility & Reliability Limits (AO3) -> Check if student tests reliability using cross-referencing to other sources or checking tone/bias.
    
    Analyze the text and return EXACTLY this JSON structure:
    {
      "scoreEstimate": "L3/4 (e.g., Level code and mark out of max limits)",
      "critique": [
        "Bullet points highlighting exact structural flaws or strengths based on O-Level expectations."
      ],
      "highlightedSegments": [
        {"text": "string matching exactly a part of student answer", "type": "correct"},
        {"text": "string matching exactly a part of student answer", "type": "weak"},
        {"text": "string matching exactly a part of student answer", "type": "error"}
      ]
    }

    Rules for segments:
    - Every single character of the student's input must be accounted for in order.
    - Tag strong assertions/valid evidence as 'correct'.
    - Tag vague expansions or general statements without source quotes as 'weak'.
    - Tag historical inaccuracies, major logical leaps, or copied phrases without an explanation as 'error'.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Question Prompt: ${questionPrompt}\nSkill Category: ${questionType}\n\nStudent's Drafted Answer Paper:\n${studentAnswer}` }
      ],
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(parsedData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
