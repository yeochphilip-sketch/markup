import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { studentAnswer, questionType, subject } = await req.json();

    const assessmentPrompt = `You are a Senior Assistant Examiner for Singapore O-Level ${subject}. 
    Evaluate the student's answer paragraph according to official Level of Response Marking Schemes (LORMS) criteria for skill: ${questionType}.
    Check for:
    1. Direct structural point (Clear comparison framework or inference)
    2. Evidence extraction accuracy from active provenance sources
    3. Explanation depth (Linking source intent/bias back to question thesis)

    Student Answer Material:
    "${studentAnswer}"

    Return strictly a JSON object with this shape:
    {
      "scoreEstimate": "L3/4 (Valid Comparison)" or "L4/6 (Highest Level reached description)",
      "critique": [
        "First specific structural feedback item detailing PEEL mastery...",
        "Second critique observation recommending vocabulary or provenance tone alignment optimization..."
      ]
    }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: assessmentPrompt }],
      response_format: { type: "json_object" }
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || '{}'));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
