-- Poveon Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  location TEXT,
  wallet_balance DECIMAL(10, 2) DEFAULT 1000.00,
  verification_status TEXT DEFAULT 'NOT_VERIFIED' CHECK (verification_status IN ('NOT_VERIFIED', 'PENDING', 'VERIFIED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests table
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'GENERAL' CHECK (urgency IN ('GENERAL', 'SERIOUS', 'EXTREMELY_URGENT')),
  whatsapp TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(request_id, user_id)
);

-- Unlocked requests table
CREATE TABLE IF NOT EXISTS public.unlocked_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, request_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_request_id ON public.applications(request_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_requests_user_id ON public.unlocked_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_requests_request_id ON public.unlocked_requests(request_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile on signup"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for requests table
CREATE POLICY "Anyone can view requests"
  ON public.requests FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own requests"
  ON public.requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
  ON public.requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests"
  ON public.requests FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for applications table
CREATE POLICY "Users can view applications for their requests"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE requests.id = applications.request_id
      AND requests.user_id = auth.uid()
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can apply to requests"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for unlocked_requests table
CREATE POLICY "Users can view their own unlocked requests"
  ON public.unlocked_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock requests"
  ON public.unlocked_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, wallet_balance, verification_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    1000.00,
    'NOT_VERIFIED'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_requests
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
