import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    let { subject, topic, questionType } = await req.json();

    // Resolve 'Any Topic' Fallbacks dynamically 
    if (topic.includes('Any Topic')) {
      if (subject === 'Social Studies') {
        const ssTopics = [
          'Issue 1: Exploring Citizenship and Governance',
          'Issue 2: Living in a Diverse Society',
          'Issue 3: Responding to a Globalised World'
        ];
        topic = ssTopics[Math.floor(Math.random() * ssTopics.length)];
      } else {
        const histTopics = [
          'Case Study: Nazi Germany (*SBCS)',
          'Case Study: Militarist Japan',
          'WWII: Outbreak in Europe (*SBCS)',
          'Cold War: Origins in Europe (*SBCS)'
        ];
        topic = histTopics[Math.floor(Math.random() * histTopics.length)];
      }
    }

    // Resolve 'All Skills' fallback dynamically
    if (questionType.includes('All Skills')) {
      const skills = [
        'SBQ: Inference / Message (AO2)',
        'SBQ: Comparison & Contrast (AO2)',
        'SBQ: Purpose / Motive Evolution (AO2)',
        'SBQ: Utility & Reliability Limits (AO2)'
      ];
      questionType = skills[Math.floor(Math.random() * skills.length)];
    }

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `You are a Senior Cambridge Exam Setter for the Singapore SEAB GCE O-Level ${subject} national examination.
    Generate an authentic, exam-grade Source-Based Case Study task covering Topic: "${topic}".
    The task must precisely match the conceptual style and technical wording used in real papers.
    
    Target Question Skill Layout: "${questionType}"
    
    Wording Guidelines:
    - If "Comparison", word question exactly as: "How far does Source A support Source B about... Explain your answer."
    - If "Purpose", word question exactly as: "Why did the author issue this statement in [Year]? Explain your answer."
    - If "Reliability" or "Utility", word question exactly as: "Does Source A prove that... Explain your answer." or "How useful is Source A as evidence of... Explain your answer."
    - If "Inference", word question exactly as: "What can you infer from Source A about... Explain your answer."

    Return response as a valid JSON object matching this structure:
    {
      "backgroundContext": "A 3-4 sentence official textbook style contextual overview introducing the historical contention point.",
      "sourceA": "[Provenance Line]\\nActual historical or realistic mock excerpt reflecting an explicit stance with specific clues.",
      "sourceB": "[Provenance Line]\\nA contrasting or complementary text segment designed to test cross-referencing capabilities.",
      "questionPrompt": "The precisely formatted O-Level style question.",
      "suggestedAnswer": "An ideal response structured explicitly to hit the highest LORMS level."
    }`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    });

    const challengeData = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(challengeData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
