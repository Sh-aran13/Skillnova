// ════════════════════════════════════════════════════════════
//  Badge Service
// ════════════════════════════════════════════════════════════
import prisma from '../utils/prisma.js';
import { notify } from './notification.service.js';
import { logger } from '../utils/logger.js';

/**
 * Automatically evaluates badge eligibility for an intern.
 * Awards badges if milestones are reached and not already unlocked.
 * Sends notifications and returns newly unlocked badges.
 */
export async function evaluateBadgeEligibility(userId) {
  try {
    const streak = await prisma.learningStreak.findUnique({
      where: { internId: userId }
    });

    if (!streak) {
      return [];
    }

    const maxStreak = Math.max(streak.currentStreak, streak.longestStreak);

    // Fetch all badges
    const badges = await prisma.badge.findMany();

    // Fetch user's earned badges
    const earnedUserBadges = await prisma.userBadge.findMany({
      where: { internId: userId }
    });

    const earnedBadgeIds = new Set(earnedUserBadges.map(ub => ub.badgeId));
    const eligibleBadges = badges.filter(b => maxStreak >= b.requirement && !earnedBadgeIds.has(b.id));

    const newlyUnlocked = [];

    for (const badge of eligibleBadges) {
      try {
        const userBadge = await prisma.userBadge.create({
          data: {
            internId: userId,
            badgeId: badge.id
          },
          include: {
            badge: true
          }
        });

        newlyUnlocked.push(userBadge.badge);

        logger.info(`🏆 Intern ${userId} unlocked badge: ${badge.name}!`);

        // Send database & real-time notification
        await notify(userId, {
          type: 'badge',
          title: '🎉 Congratulations!',
          body: `You have unlocked the ${badge.name} Badge for maintaining a ${badge.requirement}-Day Learning Streak.`,
          link: '/dashboard'
        });
      } catch (err) {
        // Unique constraint might trigger if evaluated concurrently, skip in that case
        logger.warn({ err, userId, badgeId: badge.id }, 'badge-already-created-concurrently');
      }
    }

    return newlyUnlocked;
  } catch (err) {
    logger.error({ err, userId }, 'failed-to-evaluate-badge-eligibility');
    throw err;
  }
}

/**
 * Retrieves badge progress for a user (earned status, locked status, progress values).
 */
export async function getBadgeProgress(userId) {
  const [badges, earnedUserBadges, streak] = await Promise.all([
    prisma.badge.findMany({ orderBy: { requirement: 'asc' } }),
    prisma.userBadge.findMany({ where: { internId: userId } }),
    prisma.learningStreak.findUnique({ where: { internId: userId } })
  ]);

  const maxStreak = streak ? Math.max(streak.currentStreak, streak.longestStreak) : 0;
  const earnedMap = new Map(earnedUserBadges.map(ub => [ub.badgeId, ub.earnedAt]));

  const list = badges.map(badge => {
    const earnedAt = earnedMap.get(badge.id);
    const isEarned = !!earnedAt;

    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      requirement: badge.requirement,
      earned: isEarned,
      earnedAt: earnedAt || null,
      progress: isEarned ? badge.requirement : maxStreak,
      progressPercent: isEarned
        ? 100
        : Math.min(100, Math.round((maxStreak / badge.requirement) * 100))
    };
  });

  const recentlyEarned = earnedUserBadges.length > 0
    ? earnedUserBadges.reduce((latest, current) => current.earnedAt > latest.earnedAt ? current : latest, earnedUserBadges[0])
    : null;

  let recentBadgeDetails = null;
  if (recentlyEarned) {
    const matchingBadge = badges.find(b => b.id === recentlyEarned.badgeId);
    if (matchingBadge) {
      recentBadgeDetails = {
        ...matchingBadge,
        earnedAt: recentlyEarned.earnedAt
      };
    }
  }

  return {
    totalBadges: badges.length,
    earnedCount: earnedUserBadges.length,
    recentlyEarned: recentBadgeDetails,
    badges: list
  };
}

/**
 * Fetches badge earning history for a user.
 */
export async function getBadgeHistory(userId) {
  return prisma.userBadge.findMany({
    where: { internId: userId },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' }
  });
}

/**
 * Calculates statistics for mentor's interns.
 */
export async function getMentorBadgeStats(mentorId, userRole) {
  // Filters based on role. If Admin/Super Admin, see all.
  const internFilter = { role: 'INTERN' };
  if (userRole === 'MENTOR') {
    internFilter.internProfile = { mentorId };
  }

  const [interns, recentHistory] = await Promise.all([
    prisma.user.findMany({
      where: internFilter,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        department: true,
        badges: {
          include: { badge: true }
        },
        learningStreak: true
      }
    }),
    prisma.userBadge.findMany({
      where: {
        user: internFilter
      },
      include: {
        badge: true,
        user: {
          select: { id: true, name: true, avatarUrl: true }
        }
      },
      orderBy: { earnedAt: 'desc' },
      take: 15
    })
  ]);

  const items = interns.map(intern => {
    const earnedCount = intern.badges.length;
    const streak = intern.learningStreak || { currentStreak: 0, longestStreak: 0 };
    const latestBadge = intern.badges.length > 0
      ? intern.badges.reduce((latest, curr) => curr.earnedAt > latest.earnedAt ? curr : latest, intern.badges[0])
      : null;

    return {
      id: intern.id,
      name: intern.name,
      avatarUrl: intern.avatarUrl,
      department: intern.department || 'General',
      earnedCount,
      longestStreak: streak.longestStreak,
      currentStreak: streak.currentStreak,
      latestBadge: latestBadge ? { name: latestBadge.badge.name, icon: latestBadge.badge.icon, earnedAt: latestBadge.earnedAt } : null
    };
  });

  // Calculate statistics
  const totalEarned = items.reduce((sum, intern) => sum + intern.earnedCount, 0);
  const avgBadges = items.length > 0 ? Math.round((totalEarned / items.length) * 10) / 10 : 0;
  
  // Rank achievers
  const topAchievers = [...items]
    .sort((a, b) => b.earnedCount - a.earnedCount || b.longestStreak - a.longestStreak)
    .slice(0, 5);

  return {
    totalEarned,
    avgBadges,
    topAchievers,
    interns: items,
    recentHistory
  };
}

/**
 * Calculates analytics for Admin/Super Admin Dashboard.
 */
export async function getAdminBadgeAnalytics() {
  const [badges, userBadges, activeInternsCount] = await Promise.all([
    prisma.badge.findMany(),
    prisma.userBadge.findMany({
      include: {
        user: {
          select: { name: true, avatarUrl: true, department: true }
        },
        badge: true
      }
    }),
    prisma.user.count({ where: { role: 'INTERN', status: 'ACTIVE' } })
  ]);

  // Compute earned counts per badge
  const badgeCounts = badges.map(badge => {
    const count = userBadges.filter(ub => ub.badgeId === badge.id).length;
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      requirement: badge.requirement,
      count,
      percentage: activeInternsCount > 0 ? Math.round((count / activeInternsCount) * 100) : 0
    };
  }).sort((a, b) => b.count - a.count);

  // Compute top badge holders
  const internBadgeMap = {};
  userBadges.forEach(ub => {
    if (!internBadgeMap[ub.internId]) {
      internBadgeMap[ub.internId] = {
        id: ub.internId,
        name: ub.user.name,
        avatarUrl: ub.user.avatarUrl,
        department: ub.user.department || 'General',
        count: 0
      };
    }
    internBadgeMap[ub.internId].count += 1;
  });

  // Load streaks for details
  const streaks = await prisma.learningStreak.findMany();
  const streakMap = new Map(streaks.map(s => [s.internId, s.longestStreak]));

  const topHolders = Object.values(internBadgeMap)
    .map(holder => ({
      ...holder,
      longestStreak: streakMap.get(holder.id) || 0
    }))
    .sort((a, b) => b.count - a.count || b.longestStreak - a.longestStreak)
    .slice(0, 10);

  // General leaderboard (all interns)
  const allInterns = await prisma.user.findMany({
    where: { role: 'INTERN', status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      department: true,
      learningStreak: true,
      badges: {
        select: { id: true }
      }
    }
  });

  const leaderboard = allInterns.map(intern => {
    const streak = intern.learningStreak || { currentStreak: 0, longestStreak: 0 };
    return {
      id: intern.id,
      name: intern.name,
      avatarUrl: intern.avatarUrl,
      department: intern.department || 'General',
      badgeCount: intern.badges.length,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak
    };
  }).sort((a, b) => b.badgeCount - a.badgeCount || b.longestStreak - a.longestStreak);

  return {
    badgeDistribution: badgeCounts,
    topBadgeHolders: topHolders,
    leaderboard,
    activeInternsCount
  };
}
