import React, { useState, useEffect } from 'react';
import { SkillCircle } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getSkillCircles, toggleJoinCircle } from '../services/storageService';
import { Badge } from '../components/common/Badge';
import { Users, Calendar, MapPin, Check, Plus, Sparkles, ArrowRight } from 'lucide-react';

interface SkillCirclesPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const SkillCirclesPage: React.FC<SkillCirclesPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [circles, setCircles] = useState<SkillCircle[]>([]);

  const loadData = async () => {
    const data = await getSkillCircles();
    setCircles(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleJoin = async (circleId: string, circleName: string) => {
    if (!currentUser) {
      showToast('Sign in required', 'Log in to join local learning circles.', 'info');
      onNavigate('login');
      return;
    }
    const joined = await toggleJoinCircle(circleId);
    showToast(
      joined ? 'Joined Circle! 🎉' : 'Left Circle',
      `You ${joined ? 'are now a member of' : 'left'} ${circleName}.`,
      'success'
    );
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
          <Users className="w-4 h-4 text-brand-600" />
          <span>Neighborhood Guilds & Study Circles</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-0.5">
          Local Skill Circles
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Join regular neighborhood barter groups to practice hands-on crafts, code together, and jam without costs.
        </p>
      </div>

      {/* Circles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {circles.map((circle) => (
          <div
            key={circle.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={circle.image}
                  alt={circle.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge category={circle.category} label={circle.category} />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <MapPin className="w-4 h-4 text-brand-400" />
                    <span>{circle.locality}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    <Users className="w-3.5 h-3.5" />
                    <span>{circle.membersCount} Neighbors</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {circle.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {circle.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Cadence: {circle.meetupCadence}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {circle.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => handleToggleJoin(circle.id, circle.name)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  circle.joined
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                }`}
              >
                {circle.joined ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Joined Guild (Click to Leave)</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Join Neighborhood Circle</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
