// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://osdnienzwhxyflpgziob.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZG5pZW56d2h4eWZscGd6aW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzYwNTEsImV4cCI6MjA2OTMxMjA1MX0.97kJ9Avuj2FOqRWRbkj-LpXaiClfZloe_--4Z_hhby8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});