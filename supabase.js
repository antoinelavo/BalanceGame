import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabaseUrl = 'https://sfjjrcbkjhbzgfukqyka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmampyY2JramhiemdmdWtxeWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTg0NDgsImV4cCI6MjA2MDQ3NDQ0OH0.2If5bsDalt72lmlsmWeS6t4liWi-ZvQNdiEcxhJATPA';

export const supabase = createClient(supabaseUrl, supabaseKey);
