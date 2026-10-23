import React from 'react';
import { SkillCategory, SkillLevel, LearningMode } from '../../types';
import { Search, Filter, RotateCcw, MapPin } from 'lucide-react';

export interface FilterState {
  keyword: string;
  category: string;
  level: string;
  locality: string;
  mode: string;
  sortBy: 'relevance' | 'rating' | 'newest' | 'reviews';
}

interface SkillFiltersProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
  categories: SkillCategory[];
}

export const SkillFilters: React.FC<SkillFiltersProps> = ({
  filters,
  onChange,
  onReset,
  categories,
}) => {
  const isFiltered =
    filters.keyword ||
    filters.category ||
    filters.level ||
    filters.locality ||
    filters.mode ||
    filters.sortBy !== 'relevance';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-8 space-y-4">
      {/* Top Search bar & Sort */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="relative md:col-span-6">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by skill name, topic, or keyword (e.g., Python, Guitar, Figma)..."
            value={filters.keyword}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400"
          />
        </div>

        <div className="relative md:col-span-3">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Locality or city (e.g. Mission, Oakland)..."
            value={filters.locality}
            onChange={(e) => onChange({ ...filters, locality: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
            }
            className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-700 font-medium"
          >
            <option value="relevance">Sort: Highest Match / Relevance</option>
            <option value="rating">Sort: Top Rated Mentors</option>
            <option value="newest">Sort: Newly Published</option>
            <option value="reviews">Sort: Most Reviewed</option>
          </select>
        </div>
      </div>

      {/* Categories Horizontal Scroll Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Categories
          </span>
          {isFiltered && (
            <button
              onClick={onReset}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onChange({ ...filters, category: '' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !filters.category
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                onChange({ ...filters, category: filters.category === cat ? '' : cat })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.category === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Dropdowns: Level and Learning Format */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Level:</span>
          <select
            value={filters.level}
            onChange={(e) => onChange({ ...filters, level: e.target.value })}
            className="py-1 px-2.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Any Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Learning Mode:</span>
          <select
            value={filters.mode}
            onChange={(e) => onChange({ ...filters, mode: e.target.value })}
            className="py-1 px-2.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Any Format</option>
            <option value="online">Online only</option>
            <option value="in-person">In-person only</option>
            <option value="both">Both / Flexible</option>
          </select>
        </div>
      </div>
    </div>
  );
};
