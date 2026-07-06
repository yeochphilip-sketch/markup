import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { SS_EXAMINER_PROMPT } from '@/lib/prompts';
import { supabase } from '@/utils/supabase';

export async function POST(req: Request) {
  try {
    const { studentAnswer, questionType, subject, questionId } = await req.json();

    if (!studentAnswer) {
      return NextResponse.json({ error: 'Answer content is required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: SS_EXAMINER_PROMPT,
      prompt: `Subject: ${subject}\nQuestion Type: ${questionType}\n\nStudent Submission:\n"${studentAnswer}"`,
    });

    const structuredFeedback = JSON.parse(text);

    // Save the student submission and evaluation parameters to Supabase
    const { error } = await supabase
      .from('student_submissions')
      .insert([
        {
          student_answer: studentAnswer,
          score_estimate: structuredFeedback.scoreEstimate,
          point_status: structuredFeedback.pointStatus,
          evidence_status: structuredFeedback.evidenceStatus,
          critique: structuredFeedback.critique,
          a1_upgrade: structuredFeedback.a1Upgrade,
          question_id: questionId || null // Relational foreign key link
        }
      ]);

    if (error) console.error('Supabase logging failed:', error);

    return NextResponse.json(structuredFeedback);
  } catch (error) {
    console.error('AI Grading Error:', error);
    return NextResponse.json({ error: 'Failed to process grading request' }, { status: 500 });
  }
}
