require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Membersihkan URL dari spasi, tanda kutip, garis miring, atau /rest/v1 di akhir
const SUPABASE_URL = (process.env.SUPABASE_URL || '')
  .trim().replace(/^["']|["']$/g, '').replace(/\/+(rest\/v1\/?)?$/, '');
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY, dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di file .env');
}
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL)) {
  console.warn(`⚠️  SUPABASE_URL terlihat tidak biasa: "${SUPABASE_URL}". Formatnya seharusnya https://xxxx.supabase.co`);
}

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, noSession);
const createAnonClient = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, noSession);

module.exports = { supabaseAdmin, createAnonClient };
