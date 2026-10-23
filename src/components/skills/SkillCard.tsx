import React from 'react';
import { Skill, MatchResult } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { Star, MapPin, Clock, Users, ArrowRight, Sparkles, Repeat } from 'lucide-react';

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
  const isOwner = currentUser?.id === skill.teacherId;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Card Header with Badges */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge category={skill.category} label={skill.category} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600">
                {skill.level}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-ocean-50 text-ocean-700">
                {skill.mode}
              </span>
            </div>
          </div>

          {/* Match Score Badge (if applicable) */}
          {match && match.score > 20 && !isOwner && (
            <div className="mb-3 p-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                {match.isReciprocal ? (
                  <Repeat className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{match.score}% Match</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium truncate max-w-[200px]">
                {match.reasons[0]}
              </span>
            </div>
          )}

          {/* Skill Title */}
          <h3
            onClick={() => onViewDetails(skill.id)}
            className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {skill.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {skill.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {skill.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Schedule & Capacity Meta */}
        <div className="px-5 py-2.5 bg-slate-50/80 border-y border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{skill.durationMinutes} mins / session</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Up to {skill.maxLearners} learners</span>
          </div>
        </div>
      </div>

      {/* Footer Teacher & Action */}
      <div className="p-5 pt-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={skill.teacherAvatar}
              alt={skill.teacherName}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {skill.teacherName}
                {isOwner && <span className="ml-1 text-[10px] text-brand-600 font-semibold">(You)</span>}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{skill.locality.split(',')[0]}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-800">
              {skill.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-amber-600">({skill.reviewCount})</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails(skill.id)}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
          >
            Details
          </button>

          {isOwner ? (
            <button
              onClick={() => onViewDetails(skill.id)}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-colors text-center"
            >
              Manage Listing
            </button>
          ) : (
            <button
              onClick={() => onEnrollClick ? onEnrollClick(skill) : onViewDetails(skill.id)}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all text-center flex items-center justify-center gap-1"
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
