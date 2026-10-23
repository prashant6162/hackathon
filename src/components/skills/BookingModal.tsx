import React, { useState, useEffect } from 'react';
import { Skill, TimeSlot, BookingType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { createBooking } from '../../services/storageService';
import { getWallet, awardStarterBonus } from '../../services/creditService';
import { Modal } from '../common/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Repeat,
  AlertCircle,
  Coins,
  Gift,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  skill: Skill | null;
  isOpen: boolean;
  initialMode?: BookingType;
  onClose: () => void;
  onSuccess: (bookingId?: string) => void;
  onRequireLogin: () => void;
  onNavigateToWallet?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  skill,
  isOpen,
  initialMode = 'credit',
  onClose,
  onSuccess,
  onRequireLogin,
  onNavigateToWallet,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [bookingType, setBookingType] = useState<BookingType>(initialMode);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [proposedSkill, setProposedSkill] = useState<string>('');
  const [customProposedSkill, setCustomProposedSkill] = useState<string>('');
  const [sponsoredReason, setSponsoredReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    if (initialMode) {
      setBookingType(initialMode);
    }
  }, [initialMode, skill]);

  useEffect(() => {
    if (currentUser) {
      const w = getWallet(currentUser.id);
      setWalletBalance(w.balance);
    }
  }, [currentUser, isOpen]);

  if (!skill) return null;

  const sessionCreditCost = skill.creditCost ?? 10;
  const hasSufficientCredits = walletBalance >= sessionCreditCost;

  // Pre-select first slot if none selected
  const activeSlotId = selectedSlotId || (skill.availableSlots[0]?.id || '');
  const selectedSlot = skill.availableSlots.find((s) => s.id === activeSlotId) || skill.availableSlots[0];

  const handleClaimStarterBonus = () => {
    if (!currentUser) return;
    const awarded = awardStarterBonus(currentUser.id, currentUser.name);
    if (awarded) {
      const updated = getWallet(currentUser.id);
      setWalletBalance(updated.balance);
      showToast('Starter Bonus Claimed! 🎁', '20 free credits added to your wallet.', 'success');
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    } else {
      showToast('Already Claimed', 'Your account has already received the starter bonus.', 'info');
    }
  };

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

    if (bookingType === 'credit' && !hasSufficientCredits) {
      setError(`Insufficient credits. You need ${sessionCreditCost} credits, but have ${walletBalance}. Choose Direct Exchange or Sponsored Learning.`);
      return;
    }

    const barterSkillName = bookingType === 'barter'
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
        message: message.trim() || (
          bookingType === 'credit'
            ? `Enrolling via ${sessionCreditCost} credits. Looking forward to our session!`
            : bookingType === 'sponsored'
            ? `Requesting community-sponsored learning: "${sponsoredReason || 'Eager learner seeking community mentorship'}"`
            : `Proposing mutual barter swap: teaching ${barterSkillName}.`
        ),
        isBarterExchange: bookingType === 'barter',
        bookingType,
        creditCost: sessionCreditCost,
        proposedBarterSkill: barterSkillName,
        sponsoredReason: bookingType === 'sponsored' ? (sponsoredReason.trim() || 'Learner with 0 credits requesting community support') : undefined,
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

      const successTitle =
        bookingType === 'credit'
          ? 'Credit Enrollment Submitted! 🪙'
          : bookingType === 'sponsored'
          ? 'Sponsored Request Sent! 🎁'
          : 'Barter Proposal Sent! 🤝';

      showToast(
        successTitle,
        `Your request has been delivered to ${skill.teacherName}.`,
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
      subtitle="Choose your preferred learning pathway: Credits, Barter Exchange, or Community Sponsorship."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleBookingSubmit} className="space-y-5">
        {/* Skill Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src={skill.teacherAvatar}
              alt={skill.teacherName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">{skill.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Teacher: <strong className="text-slate-700">{skill.teacherName}</strong> • {skill.locality}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                {sessionCreditCost} Credits
              </span>
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
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
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

        {/* 3 Learning Options Tabs */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            2. Choose Learning Option
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Credit-based */}
            <button
              type="button"
              onClick={() => {
                setBookingType('credit');
                setError('');
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                bookingType === 'credit'
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Coins className={`w-4 h-4 ${bookingType === 'credit' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {sessionCreditCost} pts
                </span>
              </div>
              <p className="font-bold text-xs text-slate-900 mt-2">Book with Credits</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Instant booking without teaching</p>
            </button>

            {/* Direct Skill Exchange */}
            <button
              type="button"
              onClick={() => {
                setBookingType('barter');
                setError('');
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                bookingType === 'barter'
                  ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-400/30'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Repeat className={`w-4 h-4 ${bookingType === 'barter' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  0 pts
                </span>
              </div>
              <p className="font-bold text-xs text-slate-900 mt-2">Direct Skill Exchange</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Barter 1-on-1 swap</p>
            </button>

            {/* Sponsored Learning */}
            <button
              type="button"
              onClick={() => {
                setBookingType('sponsored');
                setError('');
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                bookingType === 'sponsored'
                  ? 'border-ocean-500 bg-ocean-50/80 ring-2 ring-ocean-400/30'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Gift className={`w-4 h-4 ${bookingType === 'sponsored' ? 'text-ocean-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-ocean-100 text-ocean-800">
                  Free
                </span>
              </div>
              <p className="font-bold text-xs text-slate-900 mt-2">Sponsored Learning</p>
              <p className="text-[10px] text-slate-500 mt-0.5">For 0-credit learners</p>
            </button>
          </div>
        </div>

        {/* Dynamic Detail based on selected learning option */}
        {bookingType === 'credit' && (
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600" />
                Wallet Check:
              </span>
              <span className="text-xs font-bold">
                Available: <strong className="text-slate-900">{walletBalance} Credits</strong>
              </span>
            </div>

            {hasSufficientCredits ? (
              <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  You have sufficient credits! <strong>{sessionCreditCost} credits</strong> will be deducted once {skill.teacherName} accepts your request.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-white border border-rose-200 space-y-2.5">
                <div className="flex items-start gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Insufficient Balance</p>
                    <p className="text-slate-600 mt-0.5">
                      You need <strong>{sessionCreditCost} credits</strong>, but your wallet has <strong>{walletBalance} credits</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleClaimStarterBonus}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors"
                  >
                    🎁 Claim Free 20 Starter Credits
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingType('barter')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 transition-colors"
                  >
                    🤝 Switch to Direct Exchange (0 pts)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingType('sponsored')}
                    className="px-3 py-1.5 rounded-lg bg-ocean-100 text-ocean-800 font-bold hover:bg-ocean-200 transition-colors"
                  >
                    🎁 Request Sponsored Seat
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {bookingType === 'barter' && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
              <Repeat className="w-4 h-4 text-emerald-700" />
              <span>Direct Barter — What skill will you teach in return?</span>
            </div>
            <p className="text-[11px] text-emerald-800/80">
              Both neighbors learn for free! Zero credits spent on either side.
            </p>

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
                placeholder="e.g., Conversational Spanish, Adobe Lightroom, Sourdough Baking, Casual Mentoring..."
                value={customProposedSkill}
                onChange={(e) => setCustomProposedSkill(e.target.value)}
                className="w-full text-xs rounded-lg border border-emerald-300 bg-white p-2 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            )}
          </div>
        )}

        {bookingType === 'sponsored' && (
          <div className="p-4 rounded-2xl bg-ocean-50/70 border border-ocean-200 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-ocean-950">
              <Gift className="w-4 h-4 text-ocean-700" />
              <span>Community Sponsored Learning (0 Credits)</span>
            </div>
            <p className="text-[11px] text-ocean-800/80 leading-relaxed">
              Designed for new learners or community members without credits. Subject to mentor availability and community support.
            </p>
            <div>
              <label className="block text-[11px] font-semibold text-ocean-950 mb-1">
                Why are you requesting a sponsored seat?
              </label>
              <textarea
                rows={2}
                placeholder="Share a short note about your learning journey or curiosity..."
                value={sponsoredReason}
                onChange={(e) => setSponsoredReason(e.target.value)}
                className="w-full text-xs rounded-lg border border-ocean-300 bg-white p-2 focus:outline-hidden focus:ring-2 focus:ring-ocean-500 placeholder-slate-400"
              />
            </div>
          </div>
        )}

        {/* Message to Teacher */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            3. Message to Teacher (Optional)
          </label>
          <textarea
            rows={2}
            placeholder={`Say hello to ${skill.teacherName}, introduce yourself, or share what you hope to focus on...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-hidden focus:ring-2 focus:ring-brand-500 placeholder-slate-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {bookingType === 'credit' && !hasSufficientCredits ? (
              <button
                type="button"
                onClick={() => setBookingType('barter')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Exchange Skills Instead</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {submitting
                    ? 'Submitting...'
                    : bookingType === 'credit'
                    ? `Confirm Booking (${sessionCreditCost} Credits)`
                    : bookingType === 'sponsored'
                    ? 'Submit Sponsored Request'
                    : 'Submit Barter Request'}
                </span>
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
