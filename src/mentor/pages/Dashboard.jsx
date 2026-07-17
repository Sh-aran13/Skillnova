// ════════════════════════════════════════════════════════════
//  Mentor — pages/Dashboard.jsx
// ════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { Users, FileText, AlertTriangle, Loader2, TrendingUp, Flame, Trophy, CalendarCheck } from 'lucide-react';
import { Card, StatCard, SectionHeader } from '../../shared/components/UI';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/auth';

const MentorDashboard = () => {
  const { user } = useAuthStore();
  const [interns, setInterns] = useState([]);
  const [reports, setReports] = useState([]);
  const [streakInterns, setStreakInterns] = useState([]);
  const [badgeStats, setBadgeStats] = useState(null);
  const [activeTab, setActiveTab] = useState('performance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [i, r, s, b] = await Promise.all([
          api.get('/analytics/interns'),
          api.get('/reports', { params: { limit: 50, status: 'PENDING' } }),
          api.get('/streaks/mentor'),
          api.get('/badges/mentor'),
        ]);
        setInterns(i.data.items);
        setReports(r.data.items);
        setStreakInterns(s.data.items);
        setBadgeStats(b.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin" size={28} style={{ color: 'var(--muted)' }} /></div>;

  const avgScore = interns.length ? (interns.reduce((s, i) => s + (i.avgScore || 0), 0) / interns.length).toFixed(1) : 0;
  const needAttention = interns.filter((i) => (i.avgScore ?? 0) < 7 || (i.attendanceRate ?? 0) < 75);

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-5 sm:p-8 text-white" style={{ background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' }}>
        <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: '#A78BFA' }}>Mentor Overview</p>
        <h1 className="text-2xl sm:text-3xl font-bold">Good day, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="opacity-80 mt-2 text-sm">You have {interns.length} intern{interns.length !== 1 ? 's' : ''} and {reports.length} report{reports.length !== 1 ? 's' : ''} pending review.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Interns" value={interns.length} icon={Users} color="#7C3AED" />
        <StatCard title="Reports to Review" value={reports.length} icon={FileText} color="#ff6d34" />
        <StatCard title="Avg Intern Score" value={avgScore} icon={TrendingUp} color="#00bea3" subtitle="/10" />
        <StatCard title="Need Attention" value={needAttention.length} icon={AlertTriangle} color="#dc2626" />
      </div>

      <Card className="p-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <SectionHeader title="My Interns" subtitle="Monitor performance and learning activity of assigned interns" />
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'performance'
                  ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('streaks')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'streaks'
                  ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Learning Streaks
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'badges'
                  ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Achievement Badges
            </button>
          </div>
        </div>

        {activeTab === 'performance' && (
          <div className="sn-table-scroll -mx-1">
            <table className="w-full text-sm min-w-[40rem]">
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  {['Intern', 'Department', 'Avg Score', 'Tasks Done', 'Attendance'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-left" style={{ color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {interns.map((i) => (
                  <tr key={i.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text)' }}>{i.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>{i.department}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: i.avgScore >= 7 ? '#00bea3' : '#f59e0b' }}>{i.avgScore || '—'}/10</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{i.completedTasks}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: i.attendanceRate >= 90 ? 'rgba(0,190,163,0.12)' : i.attendanceRate >= 75 ? 'rgba(245,158,11,0.12)' : 'rgba(220,38,38,0.12)', color: i.attendanceRate >= 90 ? '#00bea3' : i.attendanceRate >= 75 ? '#d97706' : '#dc2626' }}>
                        {i.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'streaks' && (
          <div className="sn-table-scroll -mx-1">
            <table className="w-full text-sm min-w-[45rem]">
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  {['Intern', 'Department', 'Status', 'Current Streak', 'Longest Streak', 'Last Completed'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-left" style={{ color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {streakInterns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No intern streak data available.
                    </td>
                  </tr>
                ) : (
                  streakInterns.map((i) => (
                    <tr key={i.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 font-medium flex items-center gap-2" style={{ color: 'var(--text)' }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #ff6d34, #00bea3)' }}>
                          {i.name?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p>{i.name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{i.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>{i.department}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: i.status === 'Active' 
                              ? 'rgba(0,190,163,0.12)' 
                              : i.status === 'At Risk' 
                                ? 'rgba(245,158,11,0.12)' 
                                : 'rgba(148,163,184,0.12)',
                            color: i.status === 'Active' 
                              ? '#00bea3' 
                              : i.status === 'At Risk' 
                                ? '#d97706' 
                                : '#64748b'
                          }}
                        >
                          {i.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: 'var(--text)' }}>
                        🔥 {i.currentStreak} Days
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: 'var(--text)' }}>
                        🏆 {i.longestStreak} Days
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>
                        {i.lastCompletedDate ? new Date(i.lastCompletedDate).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'badges' && badgeStats && (
          <div className="space-y-6 font-sans">
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Badges Earned</span>
                <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block">🏆 {badgeStats.totalEarned} Badges</span>
              </div>
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Avg Badges / Intern</span>
                <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block">🥇 {badgeStats.avgBadges} Badges</span>
              </div>
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Top Achievers</span>
                <div className="flex flex-col gap-0.5 mt-1">
                  {badgeStats.topAchievers?.slice(0, 2).map((ta, idx) => (
                    <span key={ta.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {idx + 1}. <strong className="text-[#ff6d34] font-black">{ta.name}</strong> ({ta.earnedCount} Badges)
                    </span>
                  ))}
                  {badgeStats.topAchievers?.length === 0 && <span className="text-xs text-slate-400">No achievements logged</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Intern Badges Table */}
              <div className="lg:col-span-2 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Intern Badge Breakdown</h4>
                <div className="sn-table-scroll -mx-1">
                  <table className="w-full text-sm min-w-[32rem]">
                    <thead>
                      <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                        {['Intern', 'Badges', 'Max Streak', 'Latest Badge'].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-left" style={{ color: 'var(--muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {badgeStats.interns.map((i) => (
                        <tr key={i.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="px-4 py-3 font-medium flex items-center gap-2" style={{ color: 'var(--text)' }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #ff6d34, #00bea3)' }}>
                              {i.name?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                            </div>
                            <span>{i.name}</span>
                          </td>
                          <td className="px-4 py-3 font-bold" style={{ color: 'var(--text)' }}>
                            🏆 {i.earnedCount} Earned
                          </td>
                          <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>
                            {i.longestStreak} Days
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--text)' }}>
                            {i.latestBadge ? (
                              <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/80 font-medium">
                                <span>{i.latestBadge.icon}</span>
                                <span>{i.latestBadge.name}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">None yet</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Badge History</h4>
                {badgeStats.recentHistory?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center border border-dashed rounded-2xl dark:border-slate-800">No badges earned recently.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {badgeStats.recentHistory?.map((h) => (
                      <div key={h.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                        <span className="text-2xl mt-0.5 flex-shrink-0">{h.badge.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-800 dark:text-white truncate">
                            {h.user.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                            Earned {h.badge.name} Badge
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1">
                            {new Date(h.earnedAt).toLocaleDateString()} · {new Date(h.earnedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MentorDashboard;
