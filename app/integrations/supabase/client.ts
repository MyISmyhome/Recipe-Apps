import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://jlaqdqthmobcznyzuakj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYXFkcXRobW9iY3pueXp1YWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDY5ODgsImV4cCI6MjA3NjQ4Mjk4OH0.8J_F48T0hQz2OcCgDCZ4vwMmqH4niVw23gngKKmrnFE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
