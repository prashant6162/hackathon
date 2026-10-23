import React, { useState } from 'react';
import { Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { createReview } from '../../services/storageService';
import { Modal } from '../common/Modal';
import { Star, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReviewModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [rating, setRating] = useState<number>(5);
  const [commRating, setCommRating] = useState<number>(5);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [punctRating, setPunctRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) return;

    if (!feedback.trim()) {
      setError('Please provide written feedback about your learning experience.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await createReview({
        bookingId: booking.id,
        skillId: booking.skillId,
        skillTitle: booking.skillTitle,
        teacherId: booking.teacherId,
        learnerId: currentUser.id,
        learnerName: currentUser.name,
        learnerAvatar: currentUser.avatar,
        rating,
        communicationRating: commRating,
        qualityRating: qualityRating,
        punctualityRating: punctRating,
        feedback: feedback.trim(),
      });

      if (!res.success) {
        setError(res.error || 'Failed to submit review.');
        setSubmitting(false);
        return;
      }

      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 },
      });

      showToast('Review Published! ⭐', 'Thank you for building community trust.', 'success');
      setSubmitting(false);
      onClose();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error saving review.');
      setSubmitting(false);
    }
  };

  const renderStars = (
    value: number,
    onChange: (val: number) => void,
    size: string = 'w-6 h-6'
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onChange(star)}
            className="p-0.5 focus:outline-hidden hover:scale-110 transition-transform"
          >
            <Star
              className={`${size} ${
                star <= value
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200 fill-slate-100'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate & Review Learning Session"
      subtitle={`Session: ${booking.skillTitle} with ${booking.teacherName}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Overall Rating */}
        <div className="text-center py-3 bg-amber-50/60 rounded-2xl border border-amber-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
            Overall Experience Rating
          </label>
          <div className="flex justify-center">
            {renderStars(rating, setRating, 'w-8 h-8')}
          </div>
          <span className="inline-block mt-2 text-xs font-bold text-amber-800">
            {rating === 5 && 'Outstanding! 🌟'}
            {rating === 4 && 'Very Good! 👍'}
            {rating === 3 && 'Average 🙂'}
            {rating === 2 && 'Needs Improvement 😕'}
            {rating === 1 && 'Unsatisfactory ⚠️'}
          </span>
        </div>

        {/* Sub-ratings */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Detailed Criteria Breakdown
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Teaching Quality:</span>
            {renderStars(qualityRating, setQualityRating, 'w-4 h-4')}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Communication & Clarity:</span>
            {renderStars(commRating, setCommRating, 'w-4 h-4')}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Punctuality & Reliability:</span>
            {renderStars(punctRating, setPunctRating, 'w-4 h-4')}
          </div>
        </div>

        {/* Written Feedback */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Written Feedback
          </label>
          <textarea
            rows={4}
            required
            placeholder={`What did you learn? How was ${booking.teacherName}'s guidance? What would you tell fellow community members considering this skill?`}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-hidden focus:ring-2 focus:ring-brand-500 placeholder-slate-400"
          />
        </div>

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
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : 'Submit Community Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
