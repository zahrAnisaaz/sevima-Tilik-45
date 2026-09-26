const express = require('express');
const { supabaseAdmin, createAnonClient } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, 'Email dan kata sandi wajib diisi');

  const { data, error } = await createAnonClient().auth.signInWithPassword({ email: String(email).trim(), password });
  if (error) throw new HttpError(401, 'Email atau kata sandi salah');

  const { data: profile, error: pErr } = await supabaseAdmin.from('profiles')
    .select('id, full_name, role, school_id').eq('id', data.user.id).maybeSingle();
  if (pErr) throw pErr;
  if (!profile) throw new HttpError(403, 'Akun ini belum terdaftar sebagai guru atau kepala sekolah.');

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    profile,
  });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const { refresh_token } = req.body || {};
  if (!refresh_token) throw new HttpError(400, 'refresh_token wajib diisi');
  const { data, error } = await createAnonClient().auth.refreshSession({ refresh_token });
  if (error) throw new HttpError(401, 'Sesi kedaluwarsa. Silakan masuk lagi.');
  res.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token, expires_at: data.session.expires_at });
}));

router.get('/me', requireAuth, (req, res) => res.json({ profile: req.user }));

module.exports = router;
