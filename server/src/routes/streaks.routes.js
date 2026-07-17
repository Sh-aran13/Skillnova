// ════════════════════════════════════════════════════════════
//  Streaks Routes
// ════════════════════════════════════════════════════════════
import { Router } from 'express';
import { z } from 'zod';
import * as streaks from '../controllers/streaks.controller.js';
import { authenticate, requireAuth, csrfProtection } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Apply auth middleware to all streak routes
router.use(authenticate, requireAuth);

// Intern routes
router.get('/streaks/me', requireRole('INTERN'), streaks.getMyStreak);
router.get('/learning-tracker/today', requireRole('INTERN'), streaks.getTodayLearning);
router.post(
  '/learning-tracker',
  requireRole('INTERN'),
  csrfProtection,
  validate(z.object({ content: z.string().min(1).max(5000) })),
  streaks.updateTodayLearning
);

// Mentor routes
router.get('/streaks/mentor', requireRole('SUPER_ADMIN', 'ADMIN', 'MENTOR'), streaks.getMentorInterns);

// Admin routes
router.get('/streaks/leaderboard', requireRole('SUPER_ADMIN', 'ADMIN'), streaks.getLeaderboard);

export default router;
