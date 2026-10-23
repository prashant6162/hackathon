import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Skill, Booking, MatchResult } from '../types';
import { getSkills, getBookingsForUser } from '../services/storageService';
import { rankSkillsForUser } from '../services/matchingAlgorithm';
import { SkillCard } from '../components/skills/SkillCard';
import { Badge } from '../components/common/Badge';
import {
  Compass,
  PlusCircle,
  GraduationCap,
  CalendarCheck,
  Star,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Repeat,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onEnrollSkill: (skill: Skill) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onEnrollSkill }) => {
  const { currentUser } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learnerBookings, setLearnerBookings] = useState<Booking[]>([]);
  const [teacherBookings, setTeacherBookings] = useState<Booking[]>([]);
  const [recommendedMatches, setRecommendedMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      setLoading(true);
      const allSkills = await getSkills();
      setSkills(allSkills);

      const userBookings = await getBookingsForUser(currentUser.id);
      setLearnerBookings(userBookings.asLearner);
      setTeacherBookings(userBookings.asTeacher);

      const ranked = rankSkillsForUser(currentUser, allSkills);
      setRecommendedMatches(ranked.slice(0, 4));
      setLoading(false);
    };

    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <p className="text-sm text-slate-500 mb-4">Please sign in to access your dashboard.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Real calculations
  const myOfferedSkills = skills.filter((s) => s.teacherId === currentUser.id);
  const pendingIncomingRequests = teacherBookings.filter((b) => b.status === 'pending');
  const acceptedUpcomingSessions = [
    ...learnerBookings.filter((b) => b.status === 'accepted'),
    ...teacherBookings.filter((b) => b.status === 'accepted'),
  ];
  const completedTotalSessions = [
    ...learnerBookings.filter((b) => b.status === 'completed'),
    ...teacherBookings.filter((b) => b.status === 'completed'),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-ocean-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-brand-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SkillConnect Neighborhood Community</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-brand-100 max-w-xl leading-relaxed">
              Based in <strong>{currentUser.locality}</strong>. You have{' '}
              <strong>{pendingIncomingRequests.length} pending request(s)</strong> awaiting your reply and{' '}
              <strong>{acceptedUpcomingSessions.length} upcoming session(s)</strong>.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('create-skill')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-brand-800 hover:bg-brand-50 shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-brand-600" />
              Offer Skill
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-800/60 hover:bg-brand-800/90 text-white border border-brand-400/30 transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              Explore Skills
            </button>
          </div>
        </div>
      </div>

      {/* Real Statistics Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills I Teach</span>
            <GraduationCap className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{myOfferedSkills.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active listings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingIncomingRequests.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting your approval</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Confirmed</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{acceptedUpcomingSessions.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Accepted learning dates</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-ocean-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{completedTotalSessions.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Mutually verified</p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {currentUser.rating ? currentUser.rating.toFixed(1) : '5.0'}★
          </p>
          <p className="text-[11px] text-slate-500 mt-1">From {currentUser.reviewCount || 0} reviews</p>
        </div>
      </div>

      {/* Skills I Teach & Skills I Want to Learn tags row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teach Skills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Skills I Teach (Offered)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Edit in Profile
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {currentUser.teachSkills.map((sk, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200"
              >
                🎓 {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Learn Skills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-ocean-500"></span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Skills I Want to Learn
              </h3>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs font-semibold text-ocean-600 hover:text-ocean-700"
            >
              Edit in Profile
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {currentUser.learnSkills.map((sk, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-ocean-50 text-ocean-800 border border-ocean-200"
              >
                🎯 {sk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Action Alerts (if any) */}
      {pendingIncomingRequests.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                You have {pendingIncomingRequests.length} pending session booking request(s)!
              </h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Neighbors are eager to learn from you. Accept or reject requests to confirm the schedule.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('teaching')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs self-start sm:self-auto"
          >
            Review Requests →
          </button>
        </div>
      )}

      {/* Recommended Skill Matches (Real Algorithm Results) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Smart Barter Algorithm</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">
              Recommended Matches for You
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by desired skills similarity, reciprocal barter capability, locality, and mentor reputation.
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recommendedMatches.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No matches found yet. Add more interests in your profile to discover personalized matches!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendedMatches.map((match) => (
              <SkillCard
                key={match.skill.id}
                skill={match.skill}
                match={match}
                onViewDetails={(id) => onNavigate('skill-detail', id)}
                onEnrollClick={(sk) => onEnrollSkill(sk)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Confirmed Sessions Schedule */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Upcoming Confirmed Sessions</h3>
          </div>
          <button
            onClick={() => onNavigate('enrollments')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            View All Bookings
          </button>
        </div>

        {acceptedUpcomingSessions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No confirmed upcoming sessions scheduled yet. Explore skills to request your first barter exchange!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {acceptedUpcomingSessions.map((b) => {
              const isTeacher = b.teacherId === currentUser.id;
              return (
                <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={isTeacher ? b.learnerAvatar : b.teacherAvatar}
                      alt="user"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{b.skillTitle}</h4>
                        <Badge status={b.status} label={b.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isTeacher ? `Teaching learner: ${b.learnerName}` : `Learning with mentor: ${b.teacherName}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      {b.slot.day} ({b.slot.time})
                    </span>
                    <button
                      onClick={() => onNavigate('messages')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
