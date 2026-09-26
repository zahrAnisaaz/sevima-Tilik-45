const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { assertClassAccess } = require('../services/access');
const { classOverview } = require('../services/progress');
const { SUBJECTS } = require('../config/levels');
const ai = require('../services/ai');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const router = express.Router();
router.use(requireAuth);

// Rencana aktivitas untuk satu kelompok (kelas + mata uji + tingkat)
router.post('/plan', asyncHandler(async (req, res) => {
  const { class_id, subject, level, minutes = 45, context } = req.body || {};
  if (!SUBJECTS.includes(subject)) throw new HttpError(400, "subject harus 'literasi' atau 'numerasi'");
  const lv = Number(level);
  if (!Number.isInteger(lv) || lv < 1 || lv > 5) throw new HttpError(400, 'level harus 1–5');
  const mins = [30, 45, 60].includes(Number(minutes)) ? Number(minutes) : 45;
  if (context != null && String(context).length > 200) throw new HttpError(400, 'Konteks maksimal 200 karakter');

  const cls = await assertClassAccess(req.user, class_id);
  const overview = await classOverview(cls, req.user.school_id);
  const groupSize = overview.subjects[subject].groups.find((g) => g.level === lv)?.students.length || 0;

  const plan = await ai.activityPlan({ subject, level: lv, grade: cls.grade, groupSize: groupSize || 1, minutes: mins, context });
  res.json({ ...plan, group_size: groupSize, generated_at: new Date().toISOString() });
}));

module.exports = router;
