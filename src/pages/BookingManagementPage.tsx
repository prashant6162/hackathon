import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getBookingsForUser, updateBookingStatus } from '../services/storageService';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  Repeat,
  Check,
  X,
  CheckCircle2,
  Filter,
  MessageSquare,
} from 'lucide-react';

interface BookingManagementPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const BookingManagementPage: React.FC<BookingManagementPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [roleFilter, setRoleFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [learnerBookings, setLearnerBookings] = useState<Booking[]>([]);
  const [teacherBookings, setTeacherBookings] = useState<Booking[]>([]);

  const loadData = async () => {
    if (!currentUser) return;
    const userBookings = await getBookingsForUser(currentUser.id);
    setLearnerBookings(userBookings.asLearner);
    setTeacherBookings(userBookings.asTeacher);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-xs text-slate-500 mb-4">Please log in to manage your bookings.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  const allCombined = [
    ...teacherBookings.map((b) => ({ ...b, roleInSession: 'teacher' as const })),
    ...learnerBookings.map((b) => ({ ...b, roleInSession: 'learner' as const })),
  ];

  const filtered = allCombined.filter((b) => {
    if (roleFilter === 'incoming' && b.roleInSession !== 'teacher') return false;
    if (roleFilter === 'outgoing' && b.roleInSession !== 'learner') return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    await updateBookingStatus(bookingId, newStatus, currentUser.id);
    showToast('Booking Updated', `Status changed to ${newStatus}.`, 'info');
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span>Central Operations</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-0.5">Booking Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Unified control center for all incoming teaching requests and outgoing learning enrollments.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Role toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Perspective:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({allCombined.length})
            </button>
            <button
              onClick={() => setRoleFilter('incoming')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                roleFilter === 'incoming' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Incoming (Teacher) ({teacherBookings.length})
            </button>
            <button
              onClick={() => setRoleFilter('outgoing')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                roleFilter === 'outgoing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Outgoing (Learner) ({learnerBookings.length})
            </button>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 bg-white p-2 font-medium focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table / Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings match criteria"
          description="Try selecting a different filter perspective or status."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const isTeacher = b.roleInSession === 'teacher';
            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={isTeacher ? b.learnerAvatar : b.teacherAvatar}
                    alt="avatar"
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{b.skillTitle}</h4>
                      <Badge status={b.status} label={b.status} />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {isTeacher ? 'You are Teaching' : 'You are Learning'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {isTeacher ? `Learner: ${b.learnerName}` : `Teacher: ${b.teacherName}`}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        {b.slot.day} ({b.slot.time})
                      </span>
                      <span>Mode: {b.mode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => onNavigate('messages')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    Chat
                  </button>

                  {isTeacher && b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(b.id, 'accepted')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(b.id, 'rejected')}
                        className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {b.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'completed')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700 rounded-lg flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Completed
                    </button>
                  )}

                  {(b.status === 'pending' || b.status === 'accepted') && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'cancelled')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
