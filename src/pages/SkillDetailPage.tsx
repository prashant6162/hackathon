import React, { useState, useEffect } from 'react';
import { Skill, Review, MatchResult, BookingType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getSkillById, getReviewsForSkill, deleteSkill, toggleSaveSkill } from '../services/storageService';
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
  Bookmark,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Share2,
  Coins,
  Gift,
} from 'lucide-react';

interface SkillDetailPageProps {
  skillId: string;
  onBack: () => void;
  onEditSkill: (skill: Skill) => void;
  onEnrollSkill: (skill: Skill, mode?: BookingType) => void;
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
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);

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
        setIsSaved(Boolean(currentUser.savedSkillIds?.includes(data.id)));
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
        <p className="text-xs text-slate-400">Loading comprehensive session details...</p>
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

  const handleToggleSave = async () => {
    if (!currentUser) {
      showToast('Login required', 'Please sign in to save skills.', 'info');
      return;
    }
    const saved = await toggleSaveSkill(currentUser.id, skill.id);
    setIsSaved(saved);
    showToast(saved ? 'Saved to Wishlist' : 'Removed from Wishlist', skill.title, 'info');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied!', 'Skill link copied to clipboard.', 'success');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Share Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Skills</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            title="Share with neighbors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            onClick={handleToggleSave}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors ${
              isSaved
                ? 'bg-amber-500 border-amber-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Hero Visual Card with High-Res Cover */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 min-h-[300px] flex flex-col justify-end">
        <img
          src={skill.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80'}
          alt={skill.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

        <div className="relative z-10 p-6 sm:p-10 text-white space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge category={skill.category} label={skill.category} />
            <span className="text-xs px-2.5 py-0.5 rounded-lg font-bold bg-white/20 backdrop-blur-xs text-white">
              {skill.level} Level
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-lg font-bold bg-emerald-500/80 backdrop-blur-xs text-white">
              Format: {skill.mode === 'both' ? 'Flexible (Online & In-person)' : skill.mode}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight max-w-3xl">
            {skill.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-200 pt-1">
            <span className="flex items-center gap-1.5 font-semibold">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
              {skill.locality}
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock className="w-4 h-4 text-ocean-400 shrink-0" />
              {skill.durationMinutes} Minutes / Session
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              Up to {skill.maxLearners} Learners
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              {skill.rating.toFixed(1)} ({skill.reviewCount} verified reviews)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
              <Coins className="w-4 h-4 text-amber-300 shrink-0" />
              {skill.creditCost ?? 10} Credits / Session
            </span>
          </div>
        </div>
      </div>

      {/* Smart Match Banner */}
      {matchResult && matchResult.score > 20 && !isOwner && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-brand-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-md">
              <span>{matchResult.score}%</span>
              <span className="text-[9px] uppercase font-bold text-emerald-100">Match</span>
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                SkillConnect Barter Match Highlights
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {matchResult.reasons.map((r, i) => (
                  <span
                    key={i}
                    className="text-xs text-emerald-900 bg-white/80 px-2.5 py-0.5 rounded-lg border border-emerald-200 font-medium"
                  >
                    ✓ {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {matchResult.isReciprocal && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs self-start sm:self-auto shrink-0">
              <Repeat className="w-4 h-4 animate-spin-slow" />
              <span>Reciprocal Barter Available</span>
            </span>
          )}
        </div>
      )}

      {/* Grid: Main Details & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Syllabus, Outcomes, Description */}
        <div className="lg:col-span-8 space-y-8">
          {/* About Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
              About this Learning Session
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {skill.description}
            </p>
          </div>

          {/* What You Will Learn Outcomes */}
          {skill.whatYouWillLearn && skill.whatYouWillLearn.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                What You Will Master in this Session
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {skill.whatYouWillLearn.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs text-slate-700 font-medium leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Syllabus / Curriculum Accordion */}
          {skill.curriculum && skill.curriculum.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-ocean-600" />
                  Structured Session Curriculum
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {skill.curriculum.length} Modules ({skill.durationMinutes} mins total)
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {skill.curriculum.map((mod, idx) => {
                  const isExpanded = expandedModule === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedModule(isExpanded ? null : idx)}
                        className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
                          isExpanded ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-ocean-100 text-ocean-800 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{mod.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="font-semibold">{mod.duration}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-2 bg-slate-50/50 border-t border-slate-100 space-y-1.5">
                          {mod.topics.map((t, tIdx) => (
                            <div key={tIdx} className="text-xs text-slate-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 shrink-0" />
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prerequisites & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prerequisites & Preparation
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {skill.prerequisites || 'No prior background required. All levels welcome!'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Meeting Venue & Format
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {skill.meetingVenue || 'Designated Community Center / Virtual Meetup Link'}
              </p>
            </div>
          </div>

          {/* Available Schedule Slots */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              Available Session Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skill.availableSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{slot.day}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{slot.time}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Open Slot
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Teacher Card & Sticky CTAs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Teacher Trust Profile Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={skill.teacherAvatar}
                  alt={skill.teacherName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active neighbor" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-extrabold text-slate-900">{skill.teacherName}</h4>
                  <span title="Verified Neighbor">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                  </span>
                </div>
                <p className="text-xs text-slate-500">{skill.teacherLocality}</p>
                <div className="flex items-center gap-1 mt-1 text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-slate-900">{skill.rating.toFixed(1)}</span>
                  <span className="text-slate-400">({skill.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200">
                🛡️ Verified Local Mentor
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                ⭐ 100% Barter Trust
              </span>
            </div>

            {/* Response time */}
            <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              ⚡ Usually responds in &lt; 1 hour
            </p>

            {/* Primary Action Buttons */}
            {isOwner ? (
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onEditSkill(skill)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Skill Offering
                </button>
                <button
                  onClick={handleDeleteListing}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Listing
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                {/* Credit Booking CTA */}
                <button
                  onClick={() => onEnrollSkill(skill, 'credit')}
                  className="w-full py-3.5 px-4 rounded-2xl text-xs font-black text-amber-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4 text-amber-900" />
                  <span>Book with Credits ({skill.creditCost ?? 10} Credits)</span>
                </button>

                {/* Direct Barter CTA */}
                <button
                  onClick={() => onEnrollSkill(skill, 'barter')}
                  className="w-full py-3 px-4 rounded-2xl text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all flex items-center justify-center gap-2"
                >
                  <Repeat className="w-4 h-4 text-emerald-700" />
                  <span>Exchange Skills (Direct 0-Credit Barter)</span>
                </button>

                {/* Sponsored Option Link */}
                <div className="text-center pt-0.5">
                  <button
                    onClick={() => onEnrollSkill(skill, 'sponsored')}
                    className="text-[11px] font-semibold text-ocean-700 hover:text-ocean-900 underline transition-colors"
                  >
                    Zero credits? Request Community-Sponsored Seat →
                  </button>
                </div>

                <button
                  onClick={() => onNavigate('messages', skill.teacherId)}
                  className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>Message Teacher</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive Locality Map Preview */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs">
            <LeafletMap
              skills={[skill]}
              center={[skill.latitude || 37.7749, skill.longitude || -122.4194]}
              zoom={13}
              className="h-48 w-full"
            />
            <div className="p-3 bg-white text-xs text-slate-600 flex items-center gap-1.5 border-t border-slate-100 font-medium">
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate">{skill.locality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Verified Peer Reviews ({reviews.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Only learners who completed a session can submit verified ratings.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-black text-amber-900">{skill.rating.toFixed(1)}</span>
            <span className="text-xs text-amber-700">/ 5.0</span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No reviews yet for this listing. Be the first neighbor to enroll!
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
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{r.learnerName}</h4>
                      <p className="text-[10px] text-slate-400">
                        Completed session on {new Date(r.createdAt).toLocaleDateString()}
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
                      className="text-slate-300 hover:text-rose-500 p-1"
                      title="Report inappropriate review"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed pl-13">
                  "{r.feedback}"
                </p>

                <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-2 pl-13">
                  <span>Quality: ★ {r.qualityRating}</span>
                  <span>Communication: ★ {r.communicationRating}</span>
                  <span>Punctuality: ★ {r.punctualityRating}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportReviewModal
        reviewId={reportingReviewId}
        isOpen={Boolean(reportingReviewId)}
        onClose={() => setReportingReviewId(null)}
        onSuccess={() => loadSkillData()}
      />
    </div>
  );
};
