import React, { useState } from 'react';
import { Skill, MatchResult } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { toggleSaveSkill } from '../../services/storageService';
import { Badge } from '../common/Badge';
import {
  Star,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  Repeat,
  Bookmark,
  ShieldCheck,
  Eye,
} from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  match?: MatchResult;
  onViewDetails: (skillId: string) => void;
  onEnrollClick?: (skill: Skill) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  match,
  onViewDetails,
  onEnrollClick,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const isOwner = currentUser?.id === skill.teacherId;

  const [isSaved, setIsSaved] = useState<boolean>(
    Boolean(currentUser?.savedSkillIds?.includes(skill.id))
  );

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Sign in required', 'Log in to save skills to your wishlist.', 'info');
      return;
    }
    const saved = await toggleSaveSkill(currentUser.id, skill.id);
    setIsSaved(saved);
    showToast(
      saved ? 'Saved to Wishlist' : 'Removed from Wishlist',
      `"${skill.title.slice(0, 30)}..."`,
      'info'
    );
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 hover:border-brand-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      <div>
        {/* Cover Image Header */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={skill.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
            alt={skill.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

          {/* Badges on top of cover image */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge category={skill.category} label={skill.category} />

            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                isSaved
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-black/30 hover:bg-black/50 text-white'
              }`}
              title={isSaved ? 'Saved in Wishlist' : 'Save for later'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Bottom of cover: Level and Mode Chips */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-white">
            <span className="px-2.5 py-0.5 rounded-md bg-black/40 backdrop-blur-xs border border-white/20">
              {skill.level}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/80 backdrop-blur-xs text-white">
              {skill.mode === 'both' ? 'Online / In-person' : skill.mode}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 pb-3">
          {/* Smart Match Banner */}
          {match && match.score > 20 && !isOwner && (
            <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-brand-50 border border-emerald-200/90 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                {match.isReciprocal ? (
                  <Repeat className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                <span>{match.score}% Match</span>
              </div>
              <span className="text-[11px] text-emerald-800 font-medium truncate max-w-[190px]">
                {match.reasons[0]}
              </span>
            </div>
          )}

          {/* Title */}
          <h3
            onClick={() => onViewDetails(skill.id)}
            className="text-base font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {skill.title}
          </h3>

          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {skill.description}
          </p>

          {/* Topic Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {skill.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Schedule & Duration Meta */}
        <div className="px-5 py-2.5 bg-slate-50 border-y border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{skill.durationMinutes} mins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Up to {skill.maxLearners} learners</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Eye className="w-3 h-3" />
            <span>{skill.viewsCount || 120}</span>
          </div>
        </div>
      </div>

      {/* Footer: Teacher info & Action buttons */}
      <div className="p-5 pt-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={skill.teacherAvatar}
                alt={skill.teacherName}
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" title="Active local neighbor" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {skill.teacherName}
                </p>
                <span title="Verified Mentor">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                </span>
                {isOwner && (
                  <span className="text-[10px] text-brand-600 font-bold">(You)</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{skill.locality.split(',')[0]}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/70 shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-900">
              {skill.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-amber-600">({skill.reviewCount})</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails(skill.id)}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
          >
            Curriculum & Details
          </button>

          {isOwner ? (
            <button
              onClick={() => onViewDetails(skill.id)}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-colors text-center"
            >
              Manage Listing
            </button>
          ) : (
            <button
              onClick={() => (onEnrollClick ? onEnrollClick(skill) : onViewDetails(skill.id))}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all text-center flex items-center justify-center gap-1"
            >
              <span>Enroll / Barter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
