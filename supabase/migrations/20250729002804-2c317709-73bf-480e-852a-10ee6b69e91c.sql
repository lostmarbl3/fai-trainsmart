-- Temporarily disable RLS on all tables for testing
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_assignments DISABLE ROW LEVEL SECURITY;