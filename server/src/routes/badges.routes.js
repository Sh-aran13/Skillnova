import { Router } from 'express';
import * as badges from '../controllers/badges.controller.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Apply auth to all badge routes
router.use(authenticate, requireAuth);

// Interns view own badges
router.get('/badges/me', requireRole('INTERN', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'), badges.getMyBadges);

// Mentors view assigned interns' badges and history
router.get('/badges/mentor', requireRole('MENTOR', 'ADMIN', 'SUPER_ADMIN'), badges.getMentorBadges);

// Admins view system-wide badge statistics and leaderboards
router.get('/badges/analytics', requireRole('ADMIN', 'SUPER_ADMIN'), badges.getAdminBadgeAnalytics);

export default router;
