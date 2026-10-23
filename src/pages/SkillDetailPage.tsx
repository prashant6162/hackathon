import React, { useState, useEffect } from 'react';
import { Skill, Review, MatchResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getSkillById, getReviewsForSkill, deleteSkill } from '../services/storageService';
import { computeSkillMatch } from '../services/matchingAlgorithm';
import { Badge } from '../components/common/Badge';
import { LeafletMap } from '../components/map/LeafletMap';
import { ReportReviewModal } from '../components/reviews/ReportReviewModal';
import {
  Star,
  Clock,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  Repeat,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

interface SkillDetailPageProps {
  skillId: string;
  onBack: () => void;
  onEditSkill: (skill: Skill) => void;
  onEnrollSkill: (skill: Skill) => void;
  onNavigate: (tab: string, param?: string) => void;
}

export const SkillDetailPage: React.FC<SkillDetailPageProps> = ({
  skillId,
  onBack,
  onEditSkill,
  onEnrollSkill,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [skill, setSkill] = useState<Skill | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Report review modal
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);

  const loadSkillData = async () => {
    setLoading(true);
    const data = await getSkillById(skillId);
    if (data) {
      setSkill(data);
      const revs = await getReviewsForSkill(data.id);
      setReviews(revs);
      if (currentUser) {
        const match = computeSkillMatch(currentUser, data);
        setMatchResult(match);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSkillData();
  }, [skillId, currentUser]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-xs text-slate-400">Loading skill details...</p>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-sm text-slate-700 font-bold">Skill listing not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs font-bold text-brand-600 hover:underline"
        >
          ← Back to Explore
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.id === skill.teacherId;

  const handleDeleteListing = async () => {
    if (window.confirm('Are you sure you want to delete this skill listing?')) {
      await deleteSkill(skill.id);
      showToast('Listing Removed', 'Your skill offering has been deleted.', 'info');
      onBack();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </button>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge category={skill.category} label={skill.category} />
            <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-white/10 text-white">
              {skill.level} Level
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Format: {skill.mode}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {skill.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-400" />
              {skill.locality}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-ocean-400" />
              {skill.durationMinutes} Minutes / Session
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              Up to {skill.maxLearners} Learners Max
            </span>
          </div>
        </div>

        {/* Smart Match Banner (if applicable) */}
        {matchResult && matchResult.score > 20 && !isOwner && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {matchResult.score}%
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  SkillConnect Match Breakdown
                </p>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {matchResult.reasons.map((r, i) => (
                    <span key={i} className="text-[11px] text-emerald-800 font-medium">
                      • {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {matchResult.isReciprocal && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs self-start sm:self-auto">
                <Repeat className="w-3.5 h-3.5" />
                Mutual Barter Available
              </span>
            )}
          </div>
        )}

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Details */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">
                About this Learning Session
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {skill.description}
              </p>
            </div>

            {/* Prerequisites */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                Prerequisites & What to Bring
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                {skill.prerequisites || 'No prior experience required. Beginner friendly!'}
              </p>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Topic Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skill.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Available Schedule Slots */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-600" />
                Available Session Schedule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skill.availableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{slot.day}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{slot.time}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Open Slot
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Teacher Bio & Actions */}
          <div className="md:col-span-4 space-y-6">
            {/* Teacher Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={skill.teacherAvatar}
                  alt={skill.teacherName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{skill.teacherName}</h4>
                  <p className="text-xs text-slate-500">{skill.teacherLocality}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-800">
                      {skill.rating.toFixed(1)}
                    </span>
                    <span className="text-slate-400">({skill.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "Proud to be a local knowledge mentor on SkillConnect. Looking forward to exchanging skills with neighbors!"
                </p>
              </div>

              {/* Action Buttons */}
              {isOwner ? (
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => onEditSkill(skill)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4 text-slate-500" />
                    Edit Listing
                  </button>
                  <button
                    onClick={handleDeleteListing}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    Delete Listing
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => onEnrollSkill(skill)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Repeat className="w-4 h-4" />
                    Request Session / Barter
                  </button>
                  <button
                    onClick={() => onNavigate('messages')}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    Message Teacher
                  </button>
                </div>
              )}
            </div>

            {/* Locality Map Snippet */}
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <LeafletMap
                skills={[skill]}
                center={[skill.latitude || 37.7749, skill.longitude || -122.4194]}
                zoom={13}
                className="h-44 w-full"
              />
              <div className="p-3 bg-white text-[11px] text-slate-500 flex items-center gap-1.5 border-t border-slate-100">
                <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span className="truncate">{skill.locality}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Feedback Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Verified Peer Reviews ({reviews.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reviews can only be submitted after mutually completing a learning session.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-black text-amber-900">{skill.rating.toFixed(1)}</span>
            <span className="text-xs text-amber-700">/ 5.0</span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No reviews yet for this session listing. Be the first neighbor to enroll and leave feedback!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="pt-4 first:pt-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.learnerAvatar}
                      alt={r.learnerName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{r.learnerName}</h4>
                      <p className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
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
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Report inappropriate review"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed pl-12">
                  {r.feedback}
                </p>

                {/* Sub-ratings breakdown */}
                <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-2 pl-12">
                  <span>Quality: ★ {r.qualityRating}</span>
                  <span>Communication: ★ {r.communicationRating}</span>
                  <span>Punctuality: ★ {r.punctualityRating}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Review Modal */}
      <ReportReviewModal
        reviewId={reportingReviewId}
        isOpen={Boolean(reportingReviewId)}
        onClose={() => setReportingReviewId(null)}
        onSuccess={() => loadSkillData()}
      />
    </div>
  );
};
