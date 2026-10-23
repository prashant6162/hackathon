import React, { useState, useEffect, useMemo } from 'react';
import { Skill, SkillCategory, MatchResult, BookingType } from '../types';
import { useAuth } from '../context/AuthContext';
import { getSkills } from '../services/storageService';
import { rankSkillsForUser, computeSkillMatch } from '../services/matchingAlgorithm';
import { SkillCard } from '../components/skills/SkillCard';
import { SkillFilters, FilterState } from '../components/skills/SkillFilters';
import { LeafletMap } from '../components/map/LeafletMap';
import { EmptyState } from '../components/common/EmptyState';
import { LayoutGrid, Map, Compass, RotateCcw } from 'lucide-react';

interface ExploreSkillsPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onEnrollSkill: (skill: Skill, mode?: BookingType) => void;
}

const CATEGORIES: SkillCategory[] = [
  'Programming',
  'Web Development',
  'Design',
  'Music',
  'Languages',
  'Academics',
  'Photography',
  'Cooking',
  'Fitness',
  'Communication',
  'Other',
];

export const ExploreSkillsPage: React.FC<ExploreSkillsPageProps> = ({
  onNavigate,
  onEnrollSkill,
}) => {
  const { currentUser } = useAuth();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    category: '',
    level: '',
    locality: '',
    mode: '',
    sortBy: 'relevance',
  });

  useEffect(() => {
    getSkills().then((skills) => {
      setAllSkills(skills);
    });
  }, []);

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      level: '',
      locality: '',
      mode: '',
      sortBy: 'relevance',
    });
  };

  // Compute matches and apply real filters
  const filteredSkillsWithMatch = useMemo(() => {
    let result = allSkills.map((skill) => {
      let match: MatchResult | undefined = undefined;
      if (currentUser) {
        match = computeSkillMatch(currentUser, skill);
      }
      return { skill, match };
    });

    // Keyword filter
    if (filters.keyword.trim()) {
      const q = filters.keyword.toLowerCase();
      result = result.filter(
        ({ skill }) =>
          skill.title.toLowerCase().includes(q) ||
          skill.description.toLowerCase().includes(q) ||
          skill.category.toLowerCase().includes(q) ||
          skill.tags.some((t) => t.toLowerCase().includes(q)) ||
          skill.teacherName.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter(({ skill }) => skill.category === filters.category);
    }

    // Level filter
    if (filters.level) {
      result = result.filter(({ skill }) => skill.level === filters.level);
    }

    // Locality filter
    if (filters.locality.trim()) {
      const loc = filters.locality.toLowerCase();
      result = result.filter(({ skill }) =>
        skill.locality.toLowerCase().includes(loc)
      );
    }

    // Mode filter
    if (filters.mode) {
      result = result.filter(
        ({ skill }) => skill.mode === filters.mode || skill.mode === 'both'
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'relevance' && a.match && b.match) {
        return b.match.score - a.match.score;
      }
      if (filters.sortBy === 'rating') {
        return b.skill.rating - a.skill.rating;
      }
      if (filters.sortBy === 'reviews') {
        return b.skill.reviewCount - a.skill.reviewCount;
      }
      if (filters.sortBy === 'newest') {
        return new Date(b.skill.createdAt).getTime() - new Date(a.skill.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [allSkills, filters, currentUser]);

  const displayedSkills = filteredSkillsWithMatch.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSkillsWithMatch.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
            <Compass className="w-4 h-4 text-brand-600" />
            <span>Discover Local Knowledge</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-0.5">Explore Skills</h1>
          <p className="text-xs text-slate-500 mt-1">
            Found <strong>{filteredSkillsWithMatch.length}</strong> learning opportunities in the locality.
          </p>
        </div>

        {/* Grid vs Map Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Grid View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <SkillFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        categories={CATEGORIES}
      />

      {/* Main Content: Map or Grid */}
      {viewMode === 'map' ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Interactive Neighborhood Skills Map
            </h3>
            <p className="text-xs text-slate-500">
              Pins show mentors offering skills in their approximate locality. Click any pin to inspect the session.
            </p>
          </div>
          <LeafletMap
            skills={filteredSkillsWithMatch.map((m) => m.skill)}
            onSelectSkill={(id) => onNavigate('skill-detail', id)}
            className="h-[550px] w-full rounded-2xl"
          />
        </div>
      ) : (
        <>
          {filteredSkillsWithMatch.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No skills found"
              description="No learning sessions matched your current search filters. Try clearing your filters or exploring another category."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedSkills.map(({ skill, match }) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    match={match}
                    onViewDetails={(id) => onNavigate('skill-detail', id)}
                    onEnrollClick={(sk, mode) => onEnrollSkill(sk, mode)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-all"
                  >
                    Load More Skills ({filteredSkillsWithMatch.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
