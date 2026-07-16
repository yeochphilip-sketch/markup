import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkSupabaseRateLimit, FEEDBACK_LIMIT, rateLimitResponse } from '@/lib/rate-limit-supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** PATCH: toggle testimonial_approved flag */
export async function PATCH(req: Request) {
  try {
    const { id, approved } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing feedback id' }, { status: 400 });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase
      .from('user_feedback')
      .update({ testimonial_approved: approved === true })
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to toggle testimonial approval:', error);
    return NextResponse.json({ error: 'Could not update approval status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // ── Rate limit: 3 requests per 30s per IP ──
    const rl = await checkSupabaseRateLimit(req, FEEDBACK_LIMIT);
    if (rl && !rl.allowed) {
      return rateLimitResponse(rl.headers);
    }

    const { userId, userEmail, feedbackType, description, testimonialRating } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Feedback description is blank' }, { status: 400 });
    }

    // 1. Log to Supabase Database
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error: dbError } = await supabase
      .from('user_feedback')
      .insert([{
        user_id: userId || null,
        user_email: userEmail || 'anonymous@markup.edu',
        feedback_type: feedbackType || 'General',
        description: description,
        testimonial_rating: testimonialRating ?? null
      }]);

    if (dbError) throw dbError;

    // 2. Alert Personal Email via Resend API
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.SEND_FROM_EMAIL || 'MARKUP System <onboarding@resend.dev>',
            to: 'yeochphilip@gmail.com',         // Make sure this is the exact email you used to sign up for Resend!
            subject: `🚨 New Beta Feedback: [${feedbackType || 'General'}]`,
            html: `
              <h3>New Tester Feedback Received</h3>
              <p><strong>User Email:</strong> ${userEmail || 'anonymous@markup.edu'}</p>
              <p><strong>Category:</strong> ${feedbackType || 'General'}</p>
              <p><strong>Description:</strong></p>
              <blockquote style="background: #f4f4f5; padding: 12px; border-left: 4px solid #6366f1; font-style: italic;">
                ${description}
              </blockquote>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('Email dispatch failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Feedback collection failed:', error);
    return NextResponse.json({ error: 'Could not log feedback record' }, { status: 500 });
  }
}
