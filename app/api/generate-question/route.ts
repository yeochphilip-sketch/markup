import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    let { subject, topic, questionType } = await req.json();

    // Fallbacks for "Any Topic"
    if (!topic || topic.includes('Any Topic')) {
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

    // Fallbacks for "All Skills"
    if (!questionType || questionType.includes('All Skills')) {
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

    Return EXACTLY this output layout using the tags specified. Follow the spacing exactly:

    [CONTEXT]
    Provide a 3-4 sentence official textbook style contextual overview introducing the historical contention point.
    [/CONTEXT]

    [SOURCE_A]
    [Provenance Line here]
    Actual historical or realistic mock excerpt reflecting an explicit stance with specific clues.
    [/SOURCE_A]

    [SOURCE_B]
    [Provenance Line here]
    A contrasting or complementary text segment designed to test cross-referencing capabilities.
    [/SOURCE_B]

    [PROMPT]
    The precisely formatted O-Level style question prompt.
    [/PROMPT]

    [ANSWER]
    An ideal response structured explicitly to hit the highest LORMS level.
    [/ANSWER]`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }]
    });

    const text = completion.choices[0]?.message?.content || '';

    // Regex parsing matching tags safely
    const extract = (tag: string) => {
      const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    };

    const challengeData = {
      backgroundContext: extract('CONTEXT') || 'Contextual parameters failed to assemble correctly.',
      sourceA: extract('SOURCE_A') || 'Source materials missing from the model payload.',
      sourceB: extract('SOURCE_B') || 'Supplementary source documentation failed to deliver.',
      questionPrompt: extract('PROMPT') || 'Could you infer what historical changes occurred during this milestone?',
      suggestedAnswer: extract('ANSWER') || 'Ideal model metrics omitted.'
    };

    return NextResponse.json(challengeData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
