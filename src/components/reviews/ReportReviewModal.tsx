import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { reportReview } from '../../services/storageService';
import { useNotifications } from '../../context/NotificationContext';
import { AlertTriangle } from 'lucide-react';

interface ReportReviewModalProps {
  reviewId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  reviewId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useNotifications();
  const [reason, setReason] = useState<string>('inappropriate');
  const [details, setDetails] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!reviewId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fullReason = `${reason}: ${details.trim() || 'No additional note'}`;
    await reportReview(reviewId, fullReason);
    showToast('Report Submitted', 'Our moderation team will review this entry.', 'info');
    setSubmitting(false);
    onClose();
    onSuccess();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Community Review"
      subtitle="Help keep SkillConnect safe, honest, and respectful."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Reason for Report
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-medium focus:ring-2 focus:ring-brand-500"
          >
            <option value="Inappropriate / Offensive Language">Inappropriate or Offensive Language</option>
            <option value="Spam or Fabricated Review">Spam or Fabricated Review</option>
            <option value="Harassment or Personal Attack">Harassment or Personal Attack</option>
            <option value="Irrelevant to Learning Session">Irrelevant to Learning Session</option>
            <option value="Other Policy Violation">Other Policy Violation</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Additional Details (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Provide context for our moderators..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
