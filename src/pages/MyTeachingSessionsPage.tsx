import React, { useState, useEffect } from 'react';
import { Skill, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  getSkills,
  getBookingsForUser,
  updateBookingStatus,
  deleteSkill,
} from '../services/storageService';
import { Badge } from '../components/common/Badge';
import { SessionRoomModal } from '../components/skills/SessionRoomModal';
import { EmptyState } from '../components/common/EmptyState';
import {
  CalendarCheck,
  PlusCircle,
  Clock,
  MapPin,
  Repeat,
  Check,
  X,
  MessageSquare,
  CheckCircle2,
  Edit,
  Trash2,
  Users,
  Star,
  Video,
} from 'lucide-react';

interface MyTeachingSessionsPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onEditSkill: (skill: Skill) => void;
}

export const MyTeachingSessionsPage: React.FC<MyTeachingSessionsPageProps> = ({
  onNavigate,
  onEditSkill,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [incomingBookings, setIncomingBookings] = useState<Booking[]>([]);
  const [activeWorkspaceBooking, setActiveWorkspaceBooking] = useState<Booking | null>(null);

  const loadData = async () => {
    if (!currentUser) return;
    const allSkills = await getSkills();
    setMySkills(allSkills.filter((s) => s.teacherId === currentUser.id));

    const userBookings = await getBookingsForUser(currentUser.id);
    setIncomingBookings(userBookings.asTeacher);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-xs text-slate-500 mb-4">Please log in to manage your teaching sessions.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleAcceptRequest = async (bookingId: string, learnerName: string) => {
    await updateBookingStatus(bookingId, 'accepted', currentUser.id);
    showToast('Booking Accepted! 🎉', `You confirmed the session with ${learnerName}.`, 'success');
    await loadData();
  };

  const handleRejectRequest = async (bookingId: string) => {
    if (window.confirm('Decline this session request?')) {
      await updateBookingStatus(bookingId, 'rejected', currentUser.id);
      showToast('Request Declined', 'The learner has been notified.', 'info');
      await loadData();
    }
  };

  const handleMarkCompleted = async (bookingId: string) => {
    if (window.confirm('Confirm that this learning session took place?')) {
      await updateBookingStatus(bookingId, 'completed', currentUser.id);
      showToast('Session Completed! 🎓', 'Session status updated to completed.', 'success');
      await loadData();
    }
  };

  const handleDeleteListing = async (skillId: string) => {
    if (window.confirm('Are you sure you want to delete this skill listing?')) {
      await deleteSkill(skillId);
      showToast('Listing Removed', 'Your skill offering was deleted.', 'info');
      await loadData();
    }
  };

  const pendingRequests = incomingBookings.filter((b) => b.status === 'pending');
  const activeConfirmedBookings = incomingBookings.filter((b) => b.status === 'accepted');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
            <CalendarCheck className="w-4 h-4 text-brand-600" />
            <span>Mentor Portal</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-0.5">My Teaching Sessions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming requests from neighbors, manage confirmations, and maintain your skill listings.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-skill')}
          className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all self-start sm:self-auto flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Offer Another Skill</span>
        </button>
      </div>

      {/* 1. Pending Learner Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Pending Session Requests ({pendingRequests.length})
            </h2>
            {pendingRequests.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center text-xs text-slate-400">
            No pending booking requests right now. New requests will appear here for your confirmation.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={b.learnerAvatar}
                    alt={b.learnerName}
                    className="w-13 h-13 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {b.learnerName} wants to learn "{b.skillTitle}"
                      </h3>
                      <Badge status={b.status} label={b.status} />
                    </div>

                    <p className="text-xs text-slate-500">{b.learnerEmail}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 pt-1">
                      <span className="font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        {b.slot.day} ({b.slot.time})
                      </span>
                      <span>Format: {b.mode}</span>
                    </div>

                    {b.isBarterExchange && b.proposedBarterSkill && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium mt-1">
                        <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Proposed Barter: {b.learnerName} offers to teach you "{b.proposedBarterSkill}"</span>
                      </div>
                    )}

                    {b.message && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2 italic">
                        "{b.message}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Accept / Reject Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAcceptRequest(b.id, b.learnerName)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Accept Request
                  </button>
                  <button
                    onClick={() => handleRejectRequest(b.id)}
                    className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Confirmed Upcoming Teaching Schedule */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Confirmed Upcoming Teaching ({activeConfirmedBookings.length})
        </h2>

        {activeConfirmedBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center text-xs text-slate-400">
            No confirmed upcoming teaching sessions on the calendar.
          </div>
        ) : (
          <div className="space-y-3">
            {activeConfirmedBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={b.learnerAvatar}
                    alt={b.learnerName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {b.skillTitle} • Learner: {b.learnerName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {b.slot.day} ({b.slot.time}) • {b.mode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveWorkspaceBooking(b)}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Session Room</span>
                  </button>

                  <button
                    onClick={() => onNavigate('messages', b.learnerId)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    Chat
                  </button>
                  <button
                    onClick={() => handleMarkCompleted(b.id)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700 rounded-lg flex items-center gap-1 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. My Active Skill Listings Manager */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            My Published Skill Listings ({mySkills.length})
          </h2>
        </div>

        {mySkills.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="You haven't offered any skills yet"
            description="Share your knowledge in cooking, coding, music, or design with neighbors."
            actionText="Offer Your First Skill"
            onAction={() => onNavigate('create-skill')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mySkills.map((sk) => (
              <div
                key={sk.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge category={sk.category} label={sk.category} />
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {sk.rating.toFixed(1)} ({sk.reviewCount})
                    </span>
                  </div>

                  <h3
                    onClick={() => onNavigate('skill-detail', sk.id)}
                    className="text-sm font-bold text-slate-900 hover:text-brand-600 cursor-pointer line-clamp-1"
                  >
                    {sk.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sk.description}</p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span>{sk.durationMinutes} mins</span>
                    <span>•</span>
                    <span>{sk.availableSlots.length} available slots</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEditSkill(sk)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3 text-slate-400" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteListing(sk.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Workspace Modal */}
      <SessionRoomModal
        booking={activeWorkspaceBooking}
        isOpen={Boolean(activeWorkspaceBooking)}
        onClose={() => setActiveWorkspaceBooking(null)}
      />
    </div>
  );
};
