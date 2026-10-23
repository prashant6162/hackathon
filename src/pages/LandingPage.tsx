import React, { useState, useEffect } from 'react';
import { Skill, SkillRequest, SkillCircle } from '../types';
import { getSkills, getSkillRequests, getSkillCircles } from '../services/storageService';
import { SkillCard } from '../components/skills/SkillCard';
import { LeafletMap } from '../components/map/LeafletMap';
import {
  Compass,
  Repeat,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  Users,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Star,
  Award,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onEnrollSkill: (skill: Skill) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onEnrollSkill }) => {
  const [featuredSkills, setFeaturedSkills] = useState<Skill[]>([]);
  const [recentRequests, setRecentRequests] = useState<SkillRequest[]>([]);
  const [circles, setCircles] = useState<SkillCircle[]>([]);

  useEffect(() => {
    getSkills().then((all) => setFeaturedSkills(all.slice(0, 6)));
    getSkillRequests().then((reqs) => setRecentRequests(reqs.slice(0, 3)));
    getSkillCircles().then((c) => setCircles(c.slice(0, 3)));
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-24 bg-gradient-to-b from-brand-50/80 via-ocean-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Civic Problem Statement 049: Neighborhood Knowledge Barter</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Learn Locally,{' '}
              <span className="bg-gradient-to-r from-brand-600 via-teal-600 to-ocean-600 bg-clip-text text-transparent">
                Grow Together.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Your neighbors hold hidden talents in coding, culinary arts, acoustic music, design, and languages.
              SkillConnect turns your neighborhood into a trustworthy, 100% money-free knowledge exchange network.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={() => onNavigate('explore')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-brand-600 hover:bg-brand-700 shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Nearby Skills</span>
              </button>

              <button
                onClick={() => onNavigate('requests')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-ocean-600" />
                <span>Skill Requests Board</span>
              </button>
            </div>

            {/* Real Impact Counters */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto border-t border-slate-200/80">
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs">
                <p className="text-2xl font-black text-brand-700">$0</p>
                <p className="text-[11px] font-semibold text-slate-500">Always 100% Free</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs">
                <p className="text-2xl font-black text-ocean-700">1,420+</p>
                <p className="text-[11px] font-semibold text-slate-500">Hours Exchanged</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs">
                <p className="text-2xl font-black text-purple-700">100%</p>
                <p className="text-[11px] font-semibold text-slate-500">Reciprocal Swaps</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs">
                <p className="text-2xl font-black text-amber-600">4.95★</p>
                <p className="text-[11px] font-semibold text-slate-500">Verified Peer Ratings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Top-Rated Community Offerings</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mt-1">Featured Learning Sessions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hands-on sessions taught by verified neighborhood mentors.
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All ({featuredSkills.length}+)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onViewDetails={(id) => onNavigate('skill-detail', id)}
              onEnrollClick={(sk) => onEnrollSkill(sk)}
            />
          ))}
        </div>
      </section>

      {/* Interactive Locality Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
                <MapPin className="w-4 h-4" />
                <span>OpenStreetMap Interactive Neighborhood Explorer</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Explore Skills in Your Area
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Click any marker to inspect syllabus, mentor credentials, and open session slots.
              </p>
            </div>

            <button
              onClick={() => onNavigate('explore')}
              className="px-4 py-2 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors self-start md:self-auto"
            >
              Browse Full Grid View →
            </button>
          </div>

          <LeafletMap
            skills={featuredSkills}
            onSelectSkill={(id) => onNavigate('skill-detail', id)}
            className="h-80 sm:h-[450px] w-full rounded-2xl"
          />
        </div>
      </section>

      {/* Community Skill Requests Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ocean-600">
              <HelpCircle className="w-4 h-4 text-ocean-600" />
              <span>Neighbor Bounties</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              "Wanted to Learn" Requests
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Neighbors looking for tutoring who offer their own crafts in return!
            </p>
          </div>
          <button
            onClick={() => onNavigate('requests')}
            className="text-xs font-bold text-ocean-600 hover:text-ocean-700 flex items-center gap-1"
          >
            <span>See All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-ocean-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ocean-50 text-ocean-700">
                  {req.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {req.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {req.description}
                </p>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-[11px] text-emerald-900 font-medium">
                  <strong>Offers in return:</strong> {req.offeredInReturn.join(', ')}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{req.requesterName}</span>
                <button
                  onClick={() => onNavigate('requests')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700"
                >
                  I Can Teach This
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Neighborhood Skill Circles / Guilds */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Neighborhood Guilds</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Active Local Skill Circles
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Study groups and craft circles meeting on regular community schedules.
            </p>
          </div>
          <button
            onClick={() => onNavigate('circles')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>Explore All Circles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {circles.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all"
            >
              <img src={c.image} alt={c.name} className="h-40 w-full object-cover" />
              <div className="p-5 space-y-2">
                <span className="text-[10px] font-bold text-purple-600 uppercase">
                  {c.category} • {c.membersCount} members
                </span>
                <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                <button
                  onClick={() => onNavigate('circles')}
                  className="mt-2 w-full py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  View Circle Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Diagram */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              The Non-Monetary Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-1">How Skill Exchange Works</h2>
            <p className="text-xs text-slate-400 mt-2">
              Everything happens directly inside the platform without middleman fees or subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/80 relative">
              <span className="text-3xl font-black text-brand-500/20 absolute top-4 right-4">01</span>
              <BookOpen className="w-8 h-8 text-brand-400 mb-3" />
              <h4 className="font-bold text-sm text-white">Offer What You Know</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Publish a skill—cooking, coding, music, design, or fitness—with your preferred slots and venue.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/80 relative">
              <span className="text-3xl font-black text-ocean-500/20 absolute top-4 right-4">02</span>
              <Sparkles className="w-8 h-8 text-ocean-400 mb-3" />
              <h4 className="font-bold text-sm text-white">Smart Match Engine</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Our algorithm highlights reciprocal matches when a mentor wants to learn what you teach.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/80 relative">
              <span className="text-3xl font-black text-amber-500/20 absolute top-4 right-4">03</span>
              <Repeat className="w-8 h-8 text-amber-400 mb-3" />
              <h4 className="font-bold text-sm text-white">Meet in Session Room</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Meet in person or join the interactive Session Workspace with live notes and peer video.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/80 relative">
              <span className="text-3xl font-black text-pink-500/20 absolute top-4 right-4">04</span>
              <Award className="w-8 h-8 text-pink-400 mb-3" />
              <h4 className="font-bold text-sm text-white">Verified Peer Reviews</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Mutually confirm completion to unlock peer reviews and build neighborhood reputation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Stories from Bay Area Neighbors
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real skill swaps made without spending a dollar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Elena taught me acoustic Travis picking fingerstyle in the Marina park. In return, I walked her through setting up design systems in Figma. It felt like how neighborhoods used to be."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
                alt="Maya"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Maya Patel</p>
                <p className="text-[10px] text-slate-400">Mission District • UI/UX Designer</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "I traded Oaxacan mole paste and handmade heirloom tortilla lessons with David for React mentorship. Within three weekends, my recipe site was deployed!"
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
                alt="Carlos"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Carlos Ramirez</p>
                <p className="text-[10px] text-slate-400">SOMA • Home Cook & Baker</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Being able to trade Python automation coaching for classical piano technique completely revitalized my creative energy. Zero subscription fees, genuine human connection."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                alt="David"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">David Chen</p>
                <p className="text-[10px] text-slate-400">Sunset District • Software Engineer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-ocean-700 p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Share Your Talents?
            </h2>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
              Join hundreds of neighbors already exchanging skills, teaching crafts, and building trust in their locality.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-brand-900 bg-white hover:bg-brand-50 shadow-md transition-all"
              >
                Join Free Community
              </button>
              <button
                onClick={() => onNavigate('explore')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-brand-800/60 hover:bg-brand-800/90 border border-brand-400/30 transition-all"
              >
                Browse All Sessions
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
