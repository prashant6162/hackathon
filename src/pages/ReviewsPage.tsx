import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { getReviews } from '../services/storageService';
import { ReportReviewModal } from '../components/reviews/ReportReviewModal';
import { Star, ShieldAlert, Award, ThumbsUp, MessageSquare, Filter } from 'lucide-react';

interface ReviewsPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'received' | 'given'>('all');
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);

  const loadData = async () => {
    const all = await getReviews();
    setReviews(all);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = reviews.filter((r) => {
    if (filterType === 'received' && currentUser) {
      return r.teacherId === currentUser.id;
    }
    if (filterType === 'given' && currentUser) {
      return r.learnerId === currentUser.id;
    }
    return true;
  });

  // Calculate overall metrics
  const total = reviews.length;
  const avg = total > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / total : 5.0;
  const qualityAvg = total > 0 ? reviews.reduce((a, b) => a + b.qualityRating, 0) / total : 5.0;
  const commAvg = total > 0 ? reviews.reduce((a, b) => a + b.communicationRating, 0) / total : 5.0;
  const punctAvg = total > 0 ? reviews.reduce((a, b) => a + b.punctualityRating, 0) / total : 5.0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Neighborhood Trust & Verification</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-0.5">Ratings & Reviews</h1>
        <p className="text-xs text-slate-500 mt-1">
          Honest feedback from completed sessions. No paid promotions, no unverified endorsements.
        </p>
      </div>

      {/* Trust Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-center items-center text-center">
          <div className="flex items-center gap-1 text-3xl font-black text-slate-900">
            <span>{avg.toFixed(1)}</span>
            <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-xs font-bold text-slate-600 mt-1">Overall Community Score</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Based on {total} completed sessions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Teaching Quality
            </span>
            <p className="text-xl font-black text-slate-900">{qualityAvg.toFixed(1)} / 5.0</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Clear explanations</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Communication
            </span>
            <p className="text-xl font-black text-slate-900">{commAvg.toFixed(1)} / 5.0</p>
            <p className="text-[10px] text-ocean-600 font-semibold">Timely coordination</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Punctuality
            </span>
            <p className="text-xl font-black text-slate-900">{punctAvg.toFixed(1)} / 5.0</p>
            <p className="text-[10px] text-amber-600 font-semibold">Reliable attendance</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Community Reviews ({reviews.length})
        </button>

        {currentUser && (
          <>
            <button
              onClick={() => setFilterType('received')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'received'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Reviews Received as Teacher
            </button>
            <button
              onClick={() => setFilterType('given')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'given'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Reviews Given as Learner
            </button>
          </>
        )}
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={r.learnerAvatar}
                    alt={r.learnerName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{r.learnerName}</h4>
                    <p className="text-[11px] text-slate-400">
                      Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setReportingReviewId(r.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                    title="Report inappropriate review"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl text-xs font-semibold text-slate-800 mb-3">
                Session: <span className="text-brand-700">{r.skillTitle}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{r.feedback}"
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Quality: ★ {r.qualityRating}</span>
              <span>Communication: ★ {r.communicationRating}</span>
              <span>Punctuality: ★ {r.punctualityRating}</span>
            </div>
          </div>
        ))}
      </div>

      <ReportReviewModal
        reviewId={reportingReviewId}
        isOpen={Boolean(reportingReviewId)}
        onClose={() => setReportingReviewId(null)}
        onSuccess={() => loadData()}
      />
    </div>
  );
};
