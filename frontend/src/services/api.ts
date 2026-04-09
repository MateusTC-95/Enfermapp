import { createClient } from '@supabase/supabase-js';

// Conexão direta com o SUPABASE
const supabaseUrl = 'https://avmupljrhfnbklsortti.supabase.co';
const supabaseKey = 'sb_publishable_95sIeMO0b43Pn_37vtlJew_Zaglz3fa';

export const supabase = createClient(supabaseUrl, supabaseKey);