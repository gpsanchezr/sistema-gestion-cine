import { createClient } from '@supabase/supabase-js';

// Usamos los datos públicos para que funcione de inmediato
const supabaseUrl = 'https://qzpwgodgfauqlirozmmd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cHdnb2RnZmF1cWxpcm96bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MzAzOTEsImV4cCI6MjA5MDIwNjM5MX0.laIvcQNTtF-jpGQs_iLia8ek4tofV3aeXc5eYdQmqPg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);