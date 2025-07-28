-- Add missing columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Update the role check constraint to match the existing enum
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Trainer-client relationships
CREATE TABLE IF NOT EXISTS public.trainer_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  billing_schedule TEXT,
  billing_amount DECIMAL(10,2),
  days_past_due_limit INTEGER DEFAULT 7,
  requires_waiver BOOLEAN DEFAULT false,
  waiver_signed_at TIMESTAMP WITH TIME ZONE,
  requires_health_questionnaire BOOLEAN DEFAULT false,
  health_questionnaire_completed_at TIMESTAMP WITH TIME ZONE,
  trainer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trainer_id, client_id)
);

-- Enable RLS
ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;

-- Workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'assigned', 'completed', 'in_progress')),
  workout_data JSONB DEFAULT '{}',
  feedback TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Programs table
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER CHECK (duration_weeks > 0),
  program_data JSONB DEFAULT '{}',
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Workout sessions (for tracking individual workout performances)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_data JSONB DEFAULT '{}', -- Stores actual performance data
  completed_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- Exercise library
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  muscle_groups TEXT[],
  equipment TEXT,
  instructions TEXT,
  is_default BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trainer_clients
CREATE POLICY "Trainers can manage their client relationships" 
ON public.trainer_clients 
FOR ALL 
USING (auth.uid() = trainer_id);

CREATE POLICY "Clients can view their trainer relationship" 
ON public.trainer_clients 
FOR SELECT 
USING (auth.uid() = client_id);

-- RLS Policies for workouts
CREATE POLICY "Users can view workouts they created or are assigned to" 
ON public.workouts 
FOR SELECT 
USING (auth.uid() = creator_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create workouts" 
ON public.workouts 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update workouts they created" 
ON public.workouts 
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Assigned users can update workout status" 
ON public.workouts 
FOR UPDATE 
USING (auth.uid() = assigned_to)
WITH CHECK (auth.uid() = assigned_to);

-- RLS Policies for programs
CREATE POLICY "Users can view programs they created" 
ON public.programs 
FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "Users can manage programs they created" 
ON public.programs 
FOR ALL 
USING (auth.uid() = creator_id);

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view their own workout sessions" 
ON public.workout_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout sessions" 
ON public.workout_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions" 
ON public.workout_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for exercises
CREATE POLICY "All users can view exercises" 
ON public.exercises 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create custom exercises" 
ON public.exercises 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update exercises they created" 
ON public.exercises 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Insert default exercises
INSERT INTO public.exercises (name, category, muscle_groups, equipment, instructions, is_default) VALUES
('Squat', 'legs', ARRAY['quadriceps', 'glutes', 'core'], 'barbell', 'Stand with feet shoulder-width apart, lower body by bending knees and hips', true),
('Bench Press', 'chest', ARRAY['chest', 'triceps', 'shoulders'], 'barbell', 'Lie on bench, press barbell from chest to full arm extension', true),
('Deadlift', 'back', ARRAY['hamstrings', 'glutes', 'back', 'traps'], 'barbell', 'Stand with feet hip-width apart, lift barbell from floor to hip level', true),
('Pull-up', 'back', ARRAY['lats', 'biceps', 'rear delts'], 'pull-up bar', 'Hang from bar, pull body up until chin clears bar', true),
('Push-up', 'chest', ARRAY['chest', 'triceps', 'core'], 'bodyweight', 'Start in plank position, lower chest to floor and push back up', true),
('Overhead Press', 'shoulders', ARRAY['shoulders', 'triceps', 'core'], 'barbell', 'Press barbell from shoulder level to overhead', true),
('Bent-over Row', 'back', ARRAY['lats', 'rhomboids', 'rear delts', 'biceps'], 'barbell', 'Bend over with barbell, pull to lower chest', true),
('Lunges', 'legs', ARRAY['quadriceps', 'glutes', 'calves'], 'bodyweight', 'Step forward into lunge position, alternate legs', true),
('Plank', 'core', ARRAY['core', 'shoulders'], 'bodyweight', 'Hold straight body position supported on forearms and toes', true),
('Bicep Curls', 'arms', ARRAY['biceps'], 'dumbbells', 'Curl dumbbells from extended arms to shoulder level', true)
ON CONFLICT DO NOTHING;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trainer_clients_updated_at BEFORE UPDATE ON public.trainer_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();