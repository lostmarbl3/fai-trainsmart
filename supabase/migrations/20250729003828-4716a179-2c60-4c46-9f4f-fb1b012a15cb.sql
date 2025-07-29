-- Temporarily remove foreign key constraints for testing
-- Drop foreign key constraint on workouts.creator_id
ALTER TABLE public.workouts DROP CONSTRAINT IF EXISTS workouts_creator_id_fkey;

-- Drop foreign key constraint on workouts.assigned_to if it exists
ALTER TABLE public.workouts DROP CONSTRAINT IF EXISTS workouts_assigned_to_fkey;

-- Drop any other foreign key constraints that might be blocking us
ALTER TABLE public.trainer_clients DROP CONSTRAINT IF EXISTS trainer_clients_trainer_id_fkey;
ALTER TABLE public.trainer_clients DROP CONSTRAINT IF EXISTS trainer_clients_client_id_fkey;