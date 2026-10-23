import React, { useState, useEffect } from 'react';
import { User, Skill, Booking, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  getUsers,
  getSkills,
  getBookings,
  getReviews,
  dismissReport,
  deleteReview,
} from '../services/storageService';
import { Badge } from '../components/common/Badge';
import {
  Shield,
  Users,
  BookOpen,
  CalendarCheck,
  Repeat,
  AlertTriangle,
  Check,
  Trash2,
  PieChart,
  Star,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [users, setUsers] = useState<User[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const [u, s, b, r] = await Promise.all([
      getUsers(),
      getSkills(),
      getBookings(),
      getReviews(),
    ]);
    setUsers(u);
    setSkills(s);
    setBookings(b);
    setReviews(r);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">Admin Clearance Required</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          You must be logged in as an administrator to view this console. (Hint: Switch persona to "Sarah Jenkins (Admin)" from the top navbar).
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const reportedReviews = reviews.filter((r) => r.isReported);
  const completedExchanges = bookings.filter((b) => b.status === 'completed');
  const barterRequests = bookings.filter((b) => b.isBarterExchange);

  // Category counts
  const categoryMap: Record<string, number> = {};
  skills.forEach((s) => {
    categoryMap[s.category] = (categoryMap[s.category] || 0) + 1;
  });

  const handleDismissReport = async (reviewId: string) => {
    await dismissReport(reviewId);
    showToast('Report Dismissed', 'Review reinstated to verified list.', 'info');
    await loadData();
  };

  const handleDeleteReportedReview = async (reviewId: string) => {
    if (window.confirm('Delete this reported review permanently?')) {
      await deleteReview(reviewId);
      showToast('Review Removed', 'Inappropriate review deleted from platform.', 'success');
      await loadData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-0.5">Admin Moderation Console</h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee community health, barter velocity, and moderate reported reviews.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-800 rounded-full border border-purple-200">
          Admin: {currentUser.name}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Total Members</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{users.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Verified local accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Offered Skills</span>
            <BookOpen className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{skills.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active learning courses</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Completed Sessions</span>
            <CalendarCheck className="w-4 h-4 text-ocean-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{completedExchanges.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">100% money-free knowledge exchanges</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Barter Trades</span>
            <Repeat className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{barterRequests.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Reciprocal skill swaps proposed</p>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              Reported Reviews Moderation Queue ({reportedReviews.length})
            </h3>
          </div>
          {reportedReviews.length === 0 && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Queue Clear ✓
            </span>
          )}
        </div>

        {reportedReviews.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No community reviews flagged for moderation. The community is healthy and thriving!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 space-y-3">
            {reportedReviews.map((r) => (
              <div
                key={r.id}
                className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      Flagged: {r.reportReason || 'Inappropriate content'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">By: {r.learnerName}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 font-medium italic">"{r.feedback}"</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    For session "{r.skillTitle}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDismissReport(r.id)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Dismiss Report
                  </button>
                  <button
                    onClick={() => handleDeleteReportedReview(r.id)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categories Distribution */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-slate-500" />
          Skill Categories Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(categoryMap).map(([cat, count]) => (
            <div key={cat} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 truncate block">{cat}</span>
              <p className="text-lg font-black text-brand-700 mt-0.5">{count} listings</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
