const { supabaseAdmin } = require('../config/supabase');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');

// Memverifikasi token Supabase (Authorization: Bearer <access_token>) lalu memuat profil
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Token tidak ditemukan. Silakan masuk.');

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) throw new HttpError(401, 'Sesi tidak valid atau kedaluwarsa. Silakan masuk lagi.');

  const { data: profile, error: pErr } = await supabaseAdmin
    .from('profiles').select('id, full_name, role, school_id')
    .eq('id', data.user.id).maybeSingle();
  if (pErr) throw pErr;
  if (!profile) throw new HttpError(403, 'Akun ini belum terdaftar sebagai guru atau kepala sekolah.');

  req.user = profile;
  next();
});

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return next(new HttpError(403, 'Anda tidak memiliki akses ke fitur ini.'));
  next();
};

module.exports = { requireAuth, requireRole };
