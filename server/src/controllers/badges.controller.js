import { asyncHandler } from '../utils/asyncHandler.js';
import * as badgeService from '../services/badge.service.js';

// Get current intern's badge status and progress
export const getMyBadges = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const progress = await badgeService.getBadgeProgress(userId);
  res.json(progress);
});

// Get mentor's assigned interns badge stats and history
export const getMentorBadges = asyncHandler(async (req, res) => {
  const mentorId = req.user.id;
  const role = req.user.role;
  const stats = await badgeService.getMentorBadgeStats(mentorId, role);
  res.json(stats);
});

// Get administrator badge analytics and leaderboard
export const getAdminBadgeAnalytics = asyncHandler(async (req, res) => {
  const analytics = await badgeService.getAdminBadgeAnalytics();
  res.json(analytics);
});
