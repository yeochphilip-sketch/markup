import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(req: Request) {
  try {
    const { subject, topic, questionType } = await req.json();

    const systemPrompt = `
      You are an expert SEAB O-Level Humanities curriculum specialist.
      Generate a realistic, mock exam question for Singapore students based on the following:
      Subject: ${subject}
      Topic: ${topic}
      Question Type: ${questionType}

      OUTPUT FORMAT REQUIREMENTS:
      You must respond with a clean, raw JSON structure containing these exact keys:
      - backgroundContext: (A short paragraph explaining the historical or societal context)
      - sourceA: (A text extract or clear description of a source/cartoon, including the attribution line with author, date, and purpose)
      - sourceB: (A second text extract or description of a source, including its attribution line)
      - questionPrompt: (The actual exam question prompt, e.g., "How far does Source A prove Source B wrong? Explain your answer.")

      Ensure the case files match the rigour, tone, and vocabulary profiles of real Cambridge examination materials.
    `;

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      prompt: `Generate a new customized practice challenge for a student preparing for their preliminary examinations.`,
    });

    const structuredQuestion = JSON.parse(text);

    // Save to Supabase
    const { data, error } = await supabase
      .from('generated_questions')
      .insert([
        {
          subject,
          topic,
          question_type: questionType,
          background_context: structuredQuestion.backgroundContext,
          source_a: structuredQuestion.sourceA,
          source_b: structuredQuestion.sourceB,
          question_prompt: structuredQuestion.questionPrompt,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Attach the saved DB id to the response
    return NextResponse.json({ ...structuredQuestion, id: data.id });
  } catch (error) {
    console.error('Question Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate practice data' }, { status: 500 });
  }
}
