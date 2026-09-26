const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { TARGET_LEVEL, LEVELS, SUBJECT_LABEL, NATIONAL_REFERENCE } = require('../config/levels');
const { getRounds, activeRound } = require('../services/progress');
const { isAIEnabled } = require('../services/ai');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Informasi yang dibutuhkan frontend: definisi tingkat, putaran aktif, status AI
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const rounds = await getRounds(req.user.school_id);
  res.json({
    target_level: TARGET_LEVEL,
    levels: LEVELS,
    subject_label: SUBJECT_LABEL,
    national_reference: NATIONAL_REFERENCE,
    active_round: activeRound(rounds),
    ai_enabled: isAIEnabled(),
  });
}));

module.exports = router;
