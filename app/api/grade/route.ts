import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(req: Request) {
  try {
    const { studentAnswer, questionPrompt, questionType, subject, topic } = await req.json();
    
    // 1. Extract and authenticate user session token context
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    let userId = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }
    
    // 2. Evaluate limits if an authenticated profile is found
    if (userId) {
      const { data: tierData } = await supabase
        .from('user_tiers')
        .select('current_tier')
        .eq('user_id', userId)
        .single();
        
      const currentTier = tierData?.current_tier || 'Free Starter';
      
      // Enforce premium parameter locks on Custom school homework vet uploads
      // If it's custom mode, questionPrompt is manually provided or designated custom by the frontend
      if (currentTier === 'Free Starter' && (!questionPrompt || questionPrompt.trim() === '')) {
        return NextResponse.json(
          { error: 'Custom homework vetting is a feature restricted to Pro Master subscribers.' },
          { status: 403 }
        );
      }
      
      // Scan daily frequency execution counts
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('essay_evaluations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`);
        
      if (currentTier === 'Free Starter' && count && count >= 3) {
        return NextResponse.json(
          { error: 'Daily scan tier threshold reached (3/3). Upgrade to unlock unlimited usage.' },
          { status: 429 }
        );
      }
    }

    // 3. Fallback/Mock evaluation processing payload execution flow (Placeholder for evaluation engine response)
    return NextResponse.json({
      scoreEstimate: 'L3/5',
      critique: ['Clear assertion statement mapped.', 'Evidence lacks secondary source cross-reference contextualization.'],
      highlightedSegments: [
        { text: studentAnswer || 'Sample content block', type: 'correct' }
      ]
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
