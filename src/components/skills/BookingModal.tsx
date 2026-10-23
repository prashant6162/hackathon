import React, { useState } from 'react';
import { Skill, TimeSlot } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { createBooking } from '../../services/storageService';
import { Modal } from '../common/Modal';
import { Calendar, Clock, MapPin, Sparkles, Repeat, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  skill: Skill | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingId?: string) => void;
  onRequireLogin: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  skill,
  isOpen,
  onClose,
  onSuccess,
  onRequireLogin,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isBarterExchange, setIsBarterExchange] = useState<boolean>(true);
  const [proposedSkill, setProposedSkill] = useState<string>('');
  const [customProposedSkill, setCustomProposedSkill] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!skill) return null;

  // Pre-select first slot if none selected
  const activeSlotId = selectedSlotId || (skill.availableSlots[0]?.id || '');
  const selectedSlot = skill.availableSlots.find((s) => s.id === activeSlotId) || skill.availableSlots[0];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      onClose();
      onRequireLogin();
      return;
    }

    if (currentUser.id === skill.teacherId) {
      setError('You cannot book a session for a skill you are offering.');
      return;
    }

    if (!selectedSlot) {
      setError('Please select an available session time slot.');
      return;
    }

    const barterSkillName = isBarterExchange
      ? (proposedSkill === 'custom' ? customProposedSkill.trim() : proposedSkill || currentUser.teachSkills[0] || 'Skill Consultation')
      : undefined;

    setSubmitting(true);

    try {
      const result = await createBooking({
        skillId: skill.id,
        skillTitle: skill.title,
        skillCategory: skill.category,
        teacherId: skill.teacherId,
        teacherName: skill.teacherName,
        teacherAvatar: skill.teacherAvatar,
        learnerId: currentUser.id,
        learnerName: currentUser.name,
        learnerAvatar: currentUser.avatar,
        learnerEmail: currentUser.email,
        slot: selectedSlot,
        mode: skill.mode,
        message: message.trim() || 'Excited to learn and connect with you!',
        isBarterExchange,
        proposedBarterSkill: barterSkillName,
      });

      if (!result.success) {
        setError(result.error || 'Failed to submit booking request.');
        setSubmitting(false);
        return;
      }

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
      });

      showToast(
        'Request Submitted! 🎉',
        `Your session request has been delivered to ${skill.teacherName}.`,
        'success'
      );

      setSubmitting(false);
      onClose();
      onSuccess(result.booking?.id);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Learning Session"
      subtitle="Exchange time, knowledge, and curiosity — zero monetary fees."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleBookingSubmit} className="space-y-5">
        {/* Skill Summary Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src={skill.teacherAvatar}
              alt={skill.teacherName}
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{skill.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Teacher: <strong className="text-slate-700">{skill.teacherName}</strong> • {skill.locality}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 border-t border-slate-200/70 pt-2.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {skill.durationMinutes} minutes
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {skill.mode === 'both' ? 'Online or In-person' : skill.mode}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Slot Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            1. Select Session Time Slot
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {skill.availableSlots.map((slot) => (
              <label
                key={slot.id}
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  activeSlotId === slot.id
                    ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="slotId"
                  value={slot.id}
                  checked={activeSlotId === slot.id}
                  onChange={() => setSelectedSlotId(slot.id)}
                  className="mt-0.5 text-brand-600 focus:ring-brand-500"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-600" />
                    {slot.day}
                  </p>
                  <p className="text-slate-500 mt-0.5">{slot.time}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Barter Exchange Option */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isBarterExchange}
              onChange={(e) => setIsBarterExchange(e.target.checked)}
              className="mt-1 rounded text-brand-600 focus:ring-brand-500"
            />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-900">
                <Repeat className="w-4 h-4 text-emerald-700" />
                <span>Propose a Mutual Skill Barter Exchange</span>
              </div>
              <p className="text-xs text-emerald-800/80 mt-0.5 leading-relaxed">
                Offer to teach {skill.teacherName} a skill you know in return! Both participants get to learn for free.
              </p>
            </div>
          </label>

          {isBarterExchange && (
            <div className="mt-3 pl-7 space-y-2">
              <label className="block text-xs font-semibold text-emerald-950">
                What skill will you teach in return?
              </label>
              {currentUser && currentUser.teachSkills.length > 0 ? (
                <select
                  value={proposedSkill}
                  onChange={(e) => setProposedSkill(e.target.value)}
                  className="w-full text-xs rounded-lg border border-emerald-300 bg-white p-2 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                >
                  {currentUser.teachSkills.map((sk, idx) => (
                    <option key={idx} value={sk}>
                      {sk}
                    </option>
                  ))}
                  <option value="custom">Other / Custom proposition</option>
                </select>
              ) : null}

              {(proposedSkill === 'custom' || (!currentUser || currentUser.teachSkills.length === 0)) && (
                <input
                  type="text"
                  placeholder="e.g., Conversational Spanish, Adobe Lightroom, Sourdough Baking..."
                  value={customProposedSkill}
                  onChange={(e) => setCustomProposedSkill(e.target.value)}
                  className="w-full text-xs rounded-lg border border-emerald-300 bg-white p-2 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              )}
            </div>
          )}
        </div>

        {/* Message to Teacher */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            2. Message to Teacher (Optional)
          </label>
          <textarea
            rows={3}
            placeholder={`Say hello to ${skill.teacherName}, share what you hope to learn, or mention your location preferences...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-hidden focus:ring-2 focus:ring-brand-500 placeholder-slate-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : 'Send Enrollment Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
