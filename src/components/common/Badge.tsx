import React from 'react';
import { BookingStatus, SkillCategory, SkillLevel, LearningMode } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'category' | 'level' | 'status' | 'mode' | 'match' | 'neutral';
  status?: BookingStatus;
  category?: SkillCategory;
  level?: SkillLevel;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  status,
  category,
  className = '',
}) => {
  if (status) {
    switch (status) {
      case 'pending':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 ${className}`}>
            Rejected
          </span>
        );
      case 'completed':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 ${className}`}>
            ✓ Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
            Cancelled
          </span>
        );
    }
  }

  if (category) {
    const colors: Record<SkillCategory, string> = {
      'Programming': 'bg-blue-50 text-blue-700 border-blue-200',
      'Web Development': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'Design': 'bg-purple-50 text-purple-700 border-purple-200',
      'Music': 'bg-pink-50 text-pink-700 border-pink-200',
      'Languages': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Academics': 'bg-amber-50 text-amber-700 border-amber-200',
      'Photography': 'bg-orange-50 text-orange-700 border-orange-200',
      'Cooking': 'bg-red-50 text-red-700 border-red-200',
      'Fitness': 'bg-teal-50 text-teal-700 border-teal-200',
      'Communication': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Other': 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${colors[category] || 'bg-slate-100 text-slate-700 border-slate-200'} ${className}`}>
        {category}
      </span>
    );
  }

  if (variant === 'match') {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm ${className}`}>
        ✨ {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
      {label}
    </span>
  );
};
