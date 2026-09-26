require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY, dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di file .env');
}

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, noSession);
const createAnonClient = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, noSession);

module.exports = { supabaseAdmin, createAnonClient };
