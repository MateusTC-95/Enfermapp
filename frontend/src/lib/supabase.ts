import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avmupljrhfnbklsortti.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bXVwbGpyaGZuYmtsc29ydHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTE4NzcsImV4cCI6MjA5MTI4Nzg3N30.meX4otoPrnhtk1lCtCgfl8Ez_u9NgwAMZ0uavehFmeQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);