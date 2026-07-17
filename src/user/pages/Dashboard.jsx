// ════════════════════════════════════════════════════════════
//  USER — pages/Dashboard.jsx (API-driven)
// ════════════════════════════════════════════════════════════
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  CheckCircle, ClipboardList,
  Flame,
  Loader2,
  MessageSquare,
  TrendingUp,
  Award,
  Lock
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import notify from '../../lib/toast';
import { formatRelative } from '../../lib/utils';
import { Badge, Card, GreenButton, Modal, SectionHeader, StatCard } from '../../shared/components/UI';
import BadgeUnlockModal from '../components/BadgeUnlockModal';

const MotionDiv = motion.div;
const CHART_C = ['#ff6d34', '#00bea3', '#7C3AED', '#f59e0b', '#06b6d4'];

const Dashboard = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [badgeData, setBadgeData] = useState(null);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackerContent, setTrackerContent] = useState('');
  const [savingTracker, setSavingTracker] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [s, r, t, a, str, bdg] = await Promise.all([
        api.get('/reports/stats'),
        api.get('/reports', { params: { limit: 5 } }),
        api.get('/tasks', { params: { limit: 50 } }),
        api.get('/attendance/summary'),
        api.get('/streaks/me'),
        api.get('/badges/me'),
      ]);
      setStats(s.data);
      setMyReports(r.data.items);
      setMyTasks(t.data.items);
      setAttendance(a.data);
      setStreakData(str.data);
      setBadgeData(bdg.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    })();
  }, []);

  const openTrackerModal = async () => {
    setIsTrackerOpen(true);
    try {
      const { data } = await api.get('/learning-tracker/today');
      setTrackerContent(data.content || '');
    } catch {
      notify.error("Failed to load today's learning log.");
    }
  };

  const saveTracker = async () => {
    if (!trackerContent.trim()) {
      notify.error('Please write what you learned today.');
      return;
    }
    setSavingTracker(true);
    try {
      const response = await api.post('/learning-tracker', { content: trackerContent.trim() });
      notify.success('Learning Tracker updated successfully!');
      setIsTrackerOpen(false);
      
      // Trigger unlock animation modal in real-time if new badges are earned
      if (response.data.newlyUnlocked && response.data.newlyUnlocked.length > 0) {
        setUnlockedBadges(response.data.newlyUnlocked);
        setIsUnlockOpen(true);
      }
      
      await fetchData();
    } catch (err) {
      notify.error(err.response?.data?.error || 'Failed to update Learning Tracker.');
    } finally {
      setSavingTracker(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin" size={28} style={{ color: 'var(--muted)' }} />
      </div>
    );
  }

  const myTasksByStatus = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => ({
    name: status.replace('_', ' '),
    value: myTasks.filter((t) => t.status === status).length,
  })).filter((s) => s.value > 0);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-6 pb-16">
      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, #2D3436 0%, #1a1f20 60%, #2D3436 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #ff6d34, #00bea3)' }} />
        <div className="relative p-7 sm:p-10">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-2" style={{ color: '#00bea3' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {greeting},<br className="sm:hidden" /> {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="mt-4 text-sm sm:text-base font-medium text-slate-400 max-w-lg leading-relaxed">
            You have <span className="text-white font-bold">{myTasks.filter((t) => t.status !== 'DONE').length} pending tasks</span>{' '}
            and {stats?.pending ?? 0} reports awaiting review.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-6 max-w-xl">
            {[
              [stats?.reviewed ?? 0, 'Reports'],
              [`${attendance?.rate ?? 0}%`, 'Attendance'],
              [`${user?.rating?.toFixed(1) ?? '—'}`, 'Score'],
            ].map(([v, l]) => (
              <div key={l} className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
                <p className="font-black text-xl text-white">{v}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: '#ff6d34' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionDiv>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Reports"   value={stats?.total ?? 0}    icon={ClipboardList} color="#ff6d34" />
        <StatCard title="Reviewed"        value={stats?.reviewed ?? 0} icon={CheckCircle}   color="#00bea3" />
        <StatCard title="Attendance Rate" value={`${attendance?.rate ?? 0}%`} icon={CalendarCheck} color="#ff6d34" />
        <StatCard title="Avg Score"       value={stats?.averageScore?.toFixed(1) ?? '—'} icon={TrendingUp} color="#00bea3" subtitle="/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>My Tasks by Status</h3>
          {myTasksByStatus.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>No tasks yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={myTasksByStatus} dataKey="value" nameKey="name" outerRadius={75} innerRadius={45} paddingAngle={3}>
                  {myTasksByStatus.map((_, i) => <Cell key={i} fill={CHART_C[i % CHART_C.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, background: 'var(--card)', color: 'var(--text)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {myTasksByStatus.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {myTasksByStatus.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_C[i % CHART_C.length] }} />
                  <span style={{ color: 'var(--muted)' }} className="truncate">{s.name}</span>
                  <span className="font-semibold ml-auto" style={{ color: 'var(--text)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Recent Reports</h3>
          {myReports.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>No reports submitted yet.</p>
          ) : (
            <div className="space-y-2.5">
              {myReports.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: r.status === 'REVIEWED' ? 'rgba(0,190,163,0.15)' : 'rgba(255,109,52,0.15)' }}>
                    <CheckCircle size={14} style={{ color: r.status === 'REVIEWED' ? '#00bea3' : '#ff6d34' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{r.title}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{formatRelative(r.submittedAt)} · {r.status}</p>
                  </div>
                  {r.score != null && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#d97706' }}>
                      {r.score}/10
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
                <Flame size={16} className="text-[#ff6d34] fill-[#ff6d34]" /> Learning Streak
              </h3>
              <Badge variant={streakData?.streak?.currentStreak > 0 ? "success" : "gray"}>
                {streakData?.streak?.currentStreak > 0 ? "Active" : "No Streak"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Streak</span>
                <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">🔥 {streakData?.streak?.currentStreak ?? 0} Days</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Longest Streak</span>
                <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">🏆 {streakData?.streak?.longestStreak ?? 0} Days</span>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Today's Progress</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Marked Attendance</span>
                <span className="text-base">{streakData?.todayProgress?.attendance ? '✅' : '☐'}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Submitted Daily Report</span>
                <span className="text-base">{streakData?.todayProgress?.report ? '✅' : '☐'}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Completed Daily Tasks</span>
                <span className="text-base">{streakData?.todayProgress?.tasks ? '✅' : '☐'}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Updated Learning Tracker</span>
                <div className="flex items-center gap-2">
                  <span className="text-base">{streakData?.todayProgress?.tracker ? '✅' : '☐'}</span>
                  <button 
                    onClick={openTrackerModal} 
                    className="text-[10px] font-bold px-2 py-0.5 rounded text-white bg-blue-500 hover:bg-blue-600 transition"
                  >
                    {streakData?.todayProgress?.tracker ? 'Edit' : 'Update'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            {streakData?.todayProgress?.allCompleted ? (
              <span className="text-emerald-500 font-bold">🎉 All required daily activities completed!</span>
            ) : (
              <span>Complete all activities to continue your streak.</span>
            )}
          </div>
        </Card>
      </div>

      {/* Achievement Badges Section */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-950/45 text-[#ff6d34]">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Achievement Badges</h3>
              <p className="text-xs text-slate-400">Gamified learning rewards and milestones</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-sans">
            <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400 block font-semibold mb-0.5">Total Badges Earned</span>
              <span className="font-bold text-base text-slate-800 dark:text-white">🏆 {badgeData?.earnedCount ?? 0} / {badgeData?.totalBadges ?? 6}</span>
            </div>
            {badgeData?.recentlyEarned && (
              <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <span className="text-2xl">{badgeData.recentlyEarned.icon}</span>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Recently Earned</span>
                  <span className="font-bold text-slate-800 dark:text-white">{badgeData.recentlyEarned.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Badges Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 font-sans">
          {badgeData?.badges?.map((badge) => {
            const isNextBadge = !badge.earned && (badgeData.badges.find(b => !b.earned)?.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  badge.earned
                    ? 'bg-slate-50/55 dark:bg-slate-900/20 border-emerald-500/20 dark:border-emerald-500/10 shadow-sm shadow-emerald-500/5'
                    : 'bg-slate-50/20 dark:bg-slate-900/5 border-slate-100 dark:border-slate-800/85 opacity-75'
                } ${isNextBadge ? 'ring-2 ring-[#ff6d34]/20 border-[#ff6d34]/40 bg-orange-50/5 dark:bg-orange-950/5' : ''}`}
              >
                {/* Lock icon overlay */}
                {!badge.earned && (
                  <div className="absolute top-3 right-3 text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-lg">
                    <Lock size={12} />
                  </div>
                )}

                <div className="text-center flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-3.5 transition-transform ${
                    badge.earned ? 'bg-emerald-100/50 dark:bg-emerald-950/30 scale-100' : 'bg-slate-100 dark:bg-slate-800/40 grayscale opacity-40 scale-95'
                  }`}>
                    {badge.icon}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-full">{badge.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed min-h-[30px] line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/50">
                  {badge.earned ? (
                    <div className="text-center">
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                      {badge.earnedAt && (
                        <p className="text-[9px] text-slate-400 mt-1.5">
                          {new Date(badge.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-[9px] font-semibold text-slate-400 mb-1">
                        <span>Streak Progress</span>
                        <span>{badge.progress} / {badge.requirement} Days</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-[#ff6d34] h-full rounded-full transition-all duration-500"
                          style={{ width: `${badge.progressPercent}%` }}
                        />
                      </div>
                      {isNextBadge && (
                        <p className="text-[9px] text-[#ff6d34] font-black text-center mt-1.5 uppercase tracking-wider animate-pulse">
                          Next Up!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader title="Open Tasks" subtitle="What you're working on right now" />
        {myTasks.filter((t) => t.status !== 'DONE').length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>All caught up — no open tasks 🎉</p>
        ) : (
          <div className="space-y-2">
            {myTasks.filter((t) => t.status !== 'DONE').slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: t.priority === 'HIGH' || t.priority === 'URGENT' ? '#ff6d34' : t.priority === 'MEDIUM' ? '#f59e0b' : '#94a3b8' }} />
                <p className="text-sm flex-1 truncate" style={{ color: 'var(--text)' }}>{t.title}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(255,109,52,0.15)', color: '#ff6d34' }}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {onNavigate && (
        <button onClick={() => onNavigate('qa')}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:scale-110 transition-transform z-50 group"
          style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }} title="Q&A Forum">
          <MessageSquare className="text-white" />
          <span className="absolute right-full mr-4 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">Q&A Forum</span>
        </button>
      )}

      <Modal isOpen={isTrackerOpen} onClose={() => setIsTrackerOpen(false)} title="Update Learning Tracker"
        footer={
          <>
            <button onClick={() => setIsTrackerOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
            <GreenButton onClick={saveTracker}>{savingTracker ? 'Saving…' : 'Save Learnings'}</GreenButton>
          </>
        }>
        <div className="space-y-4 font-sans">
          <p className="text-xs text-slate-400">
            Log your daily learning activities, progress, key takeaways, or concepts you learned today. Complete this log to maintain your streak!
          </p>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Learnings Content</label>
            <textarea value={trackerContent} onChange={(e) => setTrackerContent(e.target.value)}
              rows={8} placeholder="What did you learn today? (e.g. worked on react state management, resolved database migration issues...)"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition font-sans text-slate-900 dark:text-white" />
          </div>
        </div>
      </Modal>

      <BadgeUnlockModal
        isOpen={isUnlockOpen}
        onClose={() => setIsUnlockOpen(false)}
        badges={unlockedBadges}
      />

    </div>
  );
};

export default Dashboard;
