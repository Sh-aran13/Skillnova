// ════════════════════════════════════════════════════════════
//  Streaks Controller
// ════════════════════════════════════════════════════════════
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getOrCreateStreak,
  checkDailyActivities,
  checkAndUpdateStreakForToday,
  getUtcMidnight
} from '../services/streak.service.js';
import { evaluateBadgeEligibility } from '../services/badge.service.js';

// Get current intern's streak status
export const getMyStreak = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const streak = await getOrCreateStreak(userId);
  const todayProgress = await checkDailyActivities(userId, new Date());
  
  res.json({ streak, todayProgress });
});

// Get admin leaderboard & analytics
export const getLeaderboard = asyncHandler(async (req, res) => {
  const today = getUtcMidnight();

  const [topCurrent, topLongest, totalActiveInterns, avgStreakResult, lostStreakToday] = await Promise.all([
    // Top 10 current streaks
    prisma.learningStreak.findMany({
      orderBy: { currentStreak: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            department: true
          }
        }
      }
    }),
    // Top 10 longest streaks
    prisma.learningStreak.findMany({
      orderBy: { longestStreak: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            department: true
          }
        }
      }
    }),
    // Total active interns
    prisma.user.count({
      where: {
        role: 'INTERN',
        status: 'ACTIVE'
      }
    }),
    // Average current streak
    prisma.learningStreak.aggregate({
      where: {
        user: {
          role: 'INTERN',
          status: 'ACTIVE'
        }
      },
      _avg: {
        currentStreak: true
      }
    }),
    // Interns who lost their streak today
    prisma.learningStreak.count({
      where: {
        lastResetDate: today
      }
    })
  ]);

  const averageStreak = avgStreakResult._avg.currentStreak 
    ? Math.round(avgStreakResult._avg.currentStreak * 10) / 10 
    : 0;

  res.json({
    topCurrent,
    topLongest,
    totalActiveInterns,
    averageStreak,
    lostStreakToday
  });
});

// Get mentor's assigned interns or all interns for admin
export const getMentorInterns = asyncHandler(async (req, res) => {
  const { sort = 'currentStreak', order = 'desc' } = req.query;

  // Filter based on role
  const where = { role: 'INTERN' };
  if (req.user.role === 'MENTOR') {
    where.internProfile = { mentorId: req.user.id };
  }

  const interns = await prisma.user.findMany({
    where,
    include: {
      internProfile: {
        include: {
          mentor: { select: { name: true } }
        }
      },
      learningStreak: true
    }
  });

  const today = getUtcMidnight();
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const items = interns.map((intern) => {
    const streak = intern.learningStreak || { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
    const lastCompleted = streak.lastCompletedDate ? getUtcMidnight(streak.lastCompletedDate) : null;

    let status = 'Inactive';
    if (lastCompleted) {
      if (lastCompleted.getTime() === today.getTime()) {
        status = 'Active';
      } else if (lastCompleted.getTime() === yesterday.getTime()) {
        status = 'At Risk';
      }
    }

    return {
      id: intern.id,
      name: intern.name,
      avatarUrl: intern.avatarUrl,
      email: intern.email,
      department: intern.department || 'General',
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastCompletedDate: streak.lastCompletedDate,
      status
    };
  });

  // Sort
  items.sort((a, b) => {
    let valA = a[sort];
    let valB = b[sort];

    if (typeof valA === 'string') {
      return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (valA === null || valA === undefined) valA = 0;
    if (valB === null || valB === undefined) valB = 0;

    if (valA instanceof Date) {
      return order === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
    }

    return order === 'asc' ? valA - valB : valB - valA;
  });

  res.json({ items });
});

// Fetch today's learning log
export const getTodayLearning = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const today = getUtcMidnight();

  const tracker = await prisma.learningTracker.findUnique({
    where: {
      userId_date: { userId, date: today }
    }
  });

  res.json({ content: tracker?.content || '' });
});

// Update today's learning log
export const updateTodayLearning = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { content } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    throw ApiError.badRequest('Content is required and must be a string');
  }

  const today = getUtcMidnight();

  const tracker = await prisma.learningTracker.upsert({
    where: {
      userId_date: { userId, date: today }
    },
    update: {
      content: content.trim()
    },
    create: {
      userId,
      date: today,
      content: content.trim()
    }
  });

  // Trigger streak check for today in real-time and capture newly unlocked badges
  const { streak, newlyUnlocked } = await checkAndUpdateStreakForToday(userId);

  res.json({ ok: true, tracker, streak, newlyUnlocked });
});

export default {
  getMyStreak,
  getLeaderboard,
  getMentorInterns,
  getTodayLearning,
  updateTodayLearning
};
