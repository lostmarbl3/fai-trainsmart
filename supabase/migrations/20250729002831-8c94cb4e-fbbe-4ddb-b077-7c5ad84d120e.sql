-- Temporarily disable RLS on existing tables for testing
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs DISABLE ROW LEVEL SECURITY;