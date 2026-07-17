// ════════════════════════════════════════════════════════════
//  USER — pages/MyBadges.jsx (Premium Showcase of Unlocked Badges)
// ════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Flame, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

const MotionDiv = motion.div;

const MyBadges = () => {
  const [badgeData, setBadgeData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBadgesAndStreaks = async () => {
    try {
      const [bdg, str] = await Promise.all([
        api.get('/badges/me'),
        api.get('/streaks/me')
      ]);
      setBadgeData(bdg.data);
      setStreakData(str.data);
    } catch (err) {
      console.error('Failed to fetch badge or streak data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadgesAndStreaks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
        />
      </div>
    );
  }

  // Filter only unlocked (earned) badges
  const unlockedBadges = (badgeData?.badges || []).filter((b) => b.earned);

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Premium Hero Banner */}
      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #1e2526 0%, #111516 60%, #1e2526 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(90deg, #00bea3, #ff6d34)' }} />
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <Sparkles size={12} />
              <span>Achievement Showcase</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              My Unlocked Badges
            </h1>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              Celebrate your consistency, dedication, and learning milestones. Keep maintaining your daily learning streak to unlock even more prestigious badges!
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 text-center min-w-[120px]">
              <span className="text-2xl block mb-1">🏆</span>
              <p className="font-black text-2xl text-white">{unlockedBadges.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Earned</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 text-center min-w-[120px]">
              <span className="text-2xl block mb-1">🔥</span>
              <p className="font-black text-2xl text-white">{streakData?.streak?.currentStreak ?? 0}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Current Streak</p>
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* Grid containing unlocked badges */}
      {unlockedBadges.length === 0 ? (
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl"
          style={{ background: 'rgba(255, 255, 255, 0.02)' }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-800/50 border border-slate-700/50 mb-4 text-3xl">
            🔒
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Badges Unlocked Yet</h3>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
            You haven't unlocked any achievement badges yet. Start or continue logging your activities today to build a streak and earn your first badge!
          </p>
          <div className="p-4 bg-[#ff6d34]/10 rounded-2xl border border-[#ff6d34]/20 flex items-center gap-3 text-left max-w-md">
            <Flame className="text-[#ff6d34] flex-shrink-0 animate-bounce" size={24} />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">How to earn badges</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Complete all 4 daily tasks (Attendance, Daily Report, Tasks, and Learning Tracker) to maintain and advance your daily learning streak.
              </p>
            </div>
          </div>
        </MotionDiv>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="text-[#00bea3]" size={20} />
              <span>Unlocked Milestones ({unlockedBadges.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {unlockedBadges.map((badge, idx) => (
              <MotionDiv
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative rounded-2xl border p-6 flex flex-col justify-between overflow-hidden group shadow-lg"
                style={{
                  background: 'linear-gradient(145deg, rgba(30,37,38,0.7) 0%, rgba(20,25,26,0.9) 100%)',
                  borderColor: 'rgba(0, 190, 163, 0.25)',
                }}
              >
                {/* Visual Glow Highlight */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
                
                <div className="text-center flex flex-col items-center relative z-10">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-4 bg-emerald-500/10 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {badge.icon}
                  </div>
                  
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Award size={10} />
                    <span>Unlocked</span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {badge.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed min-h-[32px]">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" />
                    <span>{badge.requirement} Days Required</span>
                  </div>
                  {badge.earnedAt && (
                    <div className="flex items-center gap-1 text-right">
                      <Calendar size={12} />
                      <span>{new Date(badge.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBadges;
