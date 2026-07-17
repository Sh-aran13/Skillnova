// ════════════════════════════════════════════════════════════
//  ADMIN — pages/Dashboard.jsx (API-driven)
// ════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { FileText, CalendarCheck, HelpCircle, AlertCircle, Star, Shield, Loader2, Flame, Award } from 'lucide-react';
import { Card, StatCard } from '../../shared/components/UI';
import api from '../../lib/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [interns, setInterns] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [leaderboardTab, setLeaderboardTab] = useState('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, i, l] = await Promise.all([
          api.get('/analytics/platform'),
          api.get('/analytics/interns'),
          api.get('/streaks/leaderboard'),
        ]);
        setStats(s.data);
        setInterns(i.data.items);
        setLeaderboard(l.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !stats || !leaderboard) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin" size={28} style={{ color: 'var(--muted)' }} /></div>;
  }

  const RECENT = interns.slice(0, 5).map((i) => ({
    name: i.name, action: `Score ${i.avgScore}/10 · ${i.completedTasks} tasks`, time: 'now', color: 'green',
  }));

  return (
    <div className="space-y-6">
      <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1f20 0%, #2D3436 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #ff6d34, #00bea3)' }} />
        <div className="relative p-4 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium mb-1" style={{ color: '#ff6d34' }}>Admin Overview · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Platform Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Monitor interns, knowledge base and platform activity</p>
            </div>
            <div className="rounded-xl p-3 self-start" style={{ background: 'rgba(255,109,52,0.15)', border: '1px solid rgba(255,109,52,0.3)' }}>
              <Shield size={26} style={{ color: '#ff6d34' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              [stats.totalInterns, 'Total Interns'],
              [stats.activeUsers, 'Active Users'],
              [stats.pendingReports, 'Pending Reports'],
              [stats.totalArticles, 'KB Articles'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xl font-bold text-white">{v}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Reviews" value={stats.pendingReports} icon={AlertCircle} color="#ff6d34" />
        <StatCard title="Avg Score" value={`${interns.length ? (interns.reduce((s, i) => s + i.avgScore, 0) / interns.length).toFixed(1) : 0}/10`} icon={Star} color="#00bea3" />
        <StatCard title="Verified KB" value={`${stats.verifiedArticles}/${stats.totalArticles}`} icon={HelpCircle} color="#00bea3" />
        <StatCard title="Questions" value={stats.totalQuestions} icon={FileText} color="#ff6d34" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Daily Logins (last 7 days)</h3>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={stats.loginsByDay}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00bea3" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00bea3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, background: 'var(--card)', color: 'var(--text)' }} />
              <Area type="monotone" dataKey="count" stroke="#00bea3" fill="url(#adminGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Top Interns</h3>
          <div className="space-y-3">
            {interns.slice(0, 6).map((i) => (
              <div key={i.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ff6d34, #00bea3)' }}>
                  {i.name?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{i.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{i.department}</p>
                </div>
                <span className="text-xs font-bold" style={{ color: i.avgScore >= 7 ? '#00bea3' : '#f59e0b' }}>{i.avgScore}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Learning Streak Leaderboard Section */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Streak Stats Card */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
              <Flame size={16} className="text-[#ff6d34] fill-[#ff6d34]" /> Streak Analytics
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Average Current Streak</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">🔥 {leaderboard.averageStreak} Days</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Active Interns Tracking</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">👥 {leaderboard.totalActiveInterns} Interns</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Streaks Reset Today</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">💔 {leaderboard.lostStreakToday} Interns</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Leaderboard Card */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
              <Award size={16} className="text-[#00bea3]" /> Learning Leaderboard
            </h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setLeaderboardTab('current')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  leaderboardTab === 'current'
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-850 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Current Streaks
              </button>
              <button
                onClick={() => setLeaderboardTab('longest')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  leaderboardTab === 'longest'
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-850 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Longest Streaks
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {((leaderboardTab === 'current' ? leaderboard.topCurrent : leaderboard.topLongest) || []).length === 0 ? (
              <p className="text-sm text-center py-12 text-slate-400">No streaks registered yet.</p>
            ) : (
              ((leaderboardTab === 'current' ? leaderboard.topCurrent : leaderboard.topLongest) || []).map((entry, idx) => (
                <div key={entry.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ff6d34, #00bea3)' }}>
                    {entry.user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-slate-805 dark:text-white">{entry.user?.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{entry.user?.department || 'General'}</p>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                    {leaderboardTab === 'current' ? `🔥 ${entry.currentStreak}` : `🏆 ${entry.longestStreak}`} days
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
