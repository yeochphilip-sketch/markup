-- Create Table for Storing AI Generated Question Papers
CREATE TABLE public.generated_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    question_type TEXT NOT NULL,
    background_context TEXT NOT NULL,
    source_a TEXT NOT NULL,
    source_b TEXT NOT NULL,
    question_prompt TEXT NOT NULL
);

-- Create Table for Storing Grading Submissions and Metrics
CREATE TABLE public.student_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    student_answer TEXT NOT NULL,
    score_estimate TEXT NOT NULL,
    point_status TEXT NOT NULL,
    evidence_status TEXT NOT NULL,
    critique JSONB NOT NULL,
    a1_upgrade TEXT NOT NULL,
    question_id UUID REFERENCES public.generated_questions(id) ON DELETE SET NULL
);

-- Enable Row Level Security (RLS) for base security parameters
ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous public access for reading and inserting (Perfect for initial staging testing)
CREATE POLICY "Allow public insert tracking" ON public.generated_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access" ON public.generated_questions FOR SELECT USING (true);
CREATE POLICY "Allow public submission insert" ON public.student_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public submission read" ON public.student_submissions FOR SELECT USING (true);

-- Create a Profiles table to track user status and payment ties
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE,
    full_name TEXT,
    avatar_url TEXT,
    stripe_customer_id TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'institutional'))
);

-- Enable RLS parameters on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own profile parameters" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile details" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Automation trigger to create a profile row whenever a new user completes Google Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, subscription_tier)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
