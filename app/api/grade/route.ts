import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { SS_EXAMINER_PROMPT } from '@/lib/prompts';

export async function POST(req: Request) {
  try {
    const { studentAnswer, questionType, subject } = await req.json();

    if (!studentAnswer) {
      return NextResponse.json({ error: 'Answer content is required' }, { status: 400 });
    }

    // Call Gemini using the Vercel AI SDK
    const { text } = await generateText({
      model: google('gemini-1.5-flash'), // Cost-efficient, lightning-fast model
      system: SS_EXAMINER_PROMPT,
      prompt: `Subject: ${subject}\nQuestion Type: ${questionType}\n\nStudent Submission:\n"${studentAnswer}"`,
    });

    // Parse the structured text output into a clean JSON object
    const structuredFeedback = JSON.parse(text);

    return NextResponse.json(structuredFeedback);
  } catch (error) {
    console.error('AI Grading Error:', error);
    return NextResponse.json({ error: 'Failed to process grading request' }, { status: 500 });
  }
}
