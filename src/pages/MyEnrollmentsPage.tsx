import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getBookingsForUser, updateBookingStatus } from '../services/storageService';
import { Badge } from '../components/common/Badge';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { SessionRoomModal } from '../components/skills/SessionRoomModal';
import { EmptyState } from '../components/common/EmptyState';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Repeat,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Star,
  ArrowRight,
  Video,
  Coins,
  Gift,
} from 'lucide-react';

interface MyEnrollmentsPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const MyEnrollmentsPage: React.FC<MyEnrollmentsPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [activeWorkspaceBooking, setActiveWorkspaceBooking] = useState<Booking | null>(null);

  const loadData = async () => {
    if (!currentUser) return;
    const userBookings = await getBookingsForUser(currentUser.id);
    setBookings(userBookings.asLearner);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-xs text-slate-500 mb-4">Please log in to view your learning enrollments.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this session request?')) {
      await updateBookingStatus(bookingId, 'cancelled', currentUser.id);
      showToast('Booking Cancelled', 'Your session request has been cancelled.', 'info');
      await loadData();
    }
  };

  const handleMarkCompleted = async (bookingId: string) => {
    if (window.confirm('Confirm that this learning session took place?')) {
      await updateBookingStatus(bookingId, 'completed', currentUser.id);
      showToast('Session Completed! 🎓', 'You can now leave a community review.', 'success');
      await loadData();
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    accepted: bookings.filter((b) => b.status === 'accepted').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
            <GraduationCap className="w-4 h-4 text-brand-600" />
            <span>My Learning Journey</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-0.5">My Enrollments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track all skills you are learning, join live session rooms, and rate completed sessions.
          </p>
        </div>

        <button
          onClick={() => onNavigate('explore')}
          className="px-4 py-2 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>Find More Skills</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'All Requests', count: counts.all },
          { id: 'pending', label: 'Pending', count: counts.pending },
          { id: 'accepted', label: 'Confirmed / Accepted', count: counts.accepted },
          { id: 'completed', label: 'Completed', count: counts.completed },
          { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No enrollments in this tab"
          description="You haven't requested any learning sessions in this status yet."
          actionText="Explore Neighborhood Skills"
          onAction={() => onNavigate('explore')}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Info */}
              <div className="flex items-start gap-4">
                <img
                  src={b.teacherAvatar}
                  alt={b.teacherName}
                  className="w-13 h-13 rounded-full object-cover border-2 border-slate-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      onClick={() => onNavigate('skill-detail', b.skillId)}
                      className="text-base font-extrabold text-slate-900 hover:text-brand-600 transition-colors cursor-pointer"
                    >
                      {b.skillTitle}
                    </h3>
                    <Badge status={b.status} label={b.status} />
                  </div>

                  <p className="text-xs text-slate-500">
                    Teacher: <strong className="text-slate-800">{b.teacherName}</strong>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      {b.slot.day} ({b.slot.time})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {b.mode}
                    </span>
                  </div>

                  {b.bookingType === 'credit' && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium mt-1">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>Credit Enrollment: {b.creditCost || 10} Credits</span>
                    </div>
                  )}

                  {b.bookingType === 'sponsored' && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-ocean-900 bg-ocean-50 px-2.5 py-1 rounded-md border border-ocean-200 font-medium mt-1">
                      <Gift className="w-3.5 h-3.5 text-ocean-600" />
                      <span>Sponsored Learning: Free Community Seat</span>
                    </div>
                  )}

                  {(b.bookingType === 'barter' || b.isBarterExchange) && b.proposedBarterSkill && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium mt-1">
                      <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Barter trade: You offered "{b.proposedBarterSkill}"</span>
                    </div>
                  )}

                  {b.message && (
                    <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">
                      "{b.message}"
                    </p>
                  )}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {b.status === 'accepted' && (
                  <button
                    onClick={() => setActiveWorkspaceBooking(b)}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Session Room</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('messages', b.teacherId)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  Chat
                </button>

                {b.status === 'accepted' && (
                  <button
                    onClick={() => handleMarkCompleted(b.id)}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Completed
                  </button>
                )}

                {b.status === 'completed' && !b.hasReview && (
                  <button
                    onClick={() => setReviewingBooking(b)}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    Leave Review
                  </button>
                )}

                {b.status === 'completed' && b.hasReview && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    ✓ Reviewed
                  </span>
                )}

                {(b.status === 'pending' || b.status === 'accepted') && (
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        booking={reviewingBooking}
        isOpen={Boolean(reviewingBooking)}
        onClose={() => setReviewingBooking(null)}
        onSuccess={() => loadData()}
      />

      {/* Live Session Workspace Modal */}
      <SessionRoomModal
        booking={activeWorkspaceBooking}
        isOpen={Boolean(activeWorkspaceBooking)}
        onClose={() => setActiveWorkspaceBooking(null)}
      />
    </div>
  );
};
