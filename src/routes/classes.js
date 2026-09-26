const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const { getAccessibleClasses, assertClassAccess } = require('../services/access');
const { classOverview, summarizeClasses } = require('../services/progress');
const ai = require('../services/ai');
const { unwrap } = require('../utils/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const router = express.Router();
router.use(requireAuth);

// Daftar kelas beserta ringkasan kemajuan
router.get('/', asyncHandler(async (req, res) => {
  const classes = await getAccessibleClasses(req.user);
  const summary = await summarizeClasses(classes, req.user.school_id);
  res.json({ classes: summary.classes, active_round: summary.rounds[summary.rounds.length - 1] || null });
}));

// Gambaran lengkap satu kelas: sebaran tingkat, kelompok belajar, siswa yang perlu perhatian
router.get('/:id', asyncHandler(async (req, res) => {
  const cls = await assertClassAccess(req.user, req.params.id);
  res.json(await classOverview(cls, req.user.school_id));
}));

// Menambah siswa: { names: "Nama 1\nNama 2" } atau { names: ["Nama 1", "Nama 2"] }
router.post('/:id/students', asyncHandler(async (req, res) => {
  const cls = await assertClassAccess(req.user, req.params.id);
  const raw = req.body?.names;
  const names = (Array.isArray(raw) ? raw : String(raw || '').split('\n'))
    .map((n) => String(n).trim()).filter(Boolean);
  if (!names.length) throw new HttpError(400, 'Tulis minimal satu nama siswa');
  if (names.length > 60) throw new HttpError(400, 'Maksimal 60 siswa sekali tambah');
  if (names.some((n) => n.length > 100)) throw new HttpError(400, 'Nama siswa maksimal 100 karakter');

  const rows = await unwrap(supabaseAdmin.from('students')
    .insert(names.map((full_name) => ({ full_name, class_id: cls.id, school_id: req.user.school_id })))
    .select('id, full_name'));
  res.status(201).json({ students: rows });
}));

// Ringkasan kemajuan kelas dari asisten AI
router.post('/:id/ai-summary', asyncHandler(async (req, res) => {
  const cls = await assertClassAccess(req.user, req.params.id);
  const overview = await classOverview(cls, req.user.school_id);
  const result = await ai.classSummary(cls, overview.subjects);
  res.json({ ...result, generated_at: new Date().toISOString() });
}));

module.exports = router;
