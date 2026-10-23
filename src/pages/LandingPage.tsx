import React, { useState, useEffect } from 'react';
import { Skill } from '../types';
import { getSkills } from '../services/storageService';
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
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onEnrollSkill: (skill: Skill) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onEnrollSkill }) => {
  const [featuredSkills, setFeaturedSkills] = useState<Skill[]>([]);

  useEffect(() => {
    getSkills().then((all) => {
      setFeaturedSkills(all.slice(0, 6));
    });
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-brand-50/70 via-ocean-50/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Problem Statement 049: Neighborhood Knowledge Barter</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Learn Locally,{' '}
              <span className="bg-gradient-to-r from-brand-600 via-ocean-600 to-indigo-600 bg-clip-text text-transparent">
                Grow Together.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Your neighborhood is rich with hidden talent. SkillConnect gives your locality a trustworthy, 100% free barter platform to discover mentors nearby, exchange skills directly, and connect without monetary transactions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => onNavigate('explore')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Nearby Skills</span>
              </button>

              <button
                onClick={() => onNavigate('create-skill')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Offer a Skill You Know</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto border-t border-slate-200/80">
              <div>
                <p className="text-2xl font-black text-slate-900">$0</p>
                <p className="text-xs font-medium text-slate-500">Always 100% Free</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p className="text-xs font-medium text-slate-500">Reciprocal Barter</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">4.9★</p>
                <p className="text-xs font-medium text-slate-500">Verified Peer Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Why SkillConnect Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No middleman fees. No subscription walls. Just genuine neighborly knowledge sharing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Credit-Free Barter Model
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Teach what you are passionate about, and learn what you've always dreamed of. Users can propose mutual 1-to-1 trades or join community sessions freely.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-ocean-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Locality First & Privacy Protected
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discover opportunities in your neighborhood. We match by neighborhood radius and city boundaries without exposing sensitive home GPS coordinates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Verified Session Reviews
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero fake reviews. Ratings and feedback can only be left by members after a completed learning session has been mutually confirmed by participants.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Locality Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
                <MapPin className="w-4 h-4" />
                <span>OpenStreetMap Interactive Neighborhood Explorer</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Local Skills Active Right Now
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Click any marker on the map to inspect session details, mentors, and open slots.
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
            className="h-80 sm:h-96 w-full rounded-2xl"
          />
        </div>
      </section>

      {/* Featured Skills Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Featured Learning Opportunities</h2>
            <p className="text-xs text-slate-500 mt-1">
              Top rated skills taught by verified community mentors
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
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

      {/* How It Works 4-Step Diagram */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Simple 4-Step Cycle
            </span>
            <h2 className="text-3xl font-extrabold mt-1">How Skill Exchange Works</h2>
            <p className="text-xs text-slate-400 mt-2">
              Everything happens directly inside the platform without monetary exchanges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 relative">
              <span className="text-3xl font-black text-brand-500/30 absolute top-4 right-4">01</span>
              <BookOpen className="w-8 h-8 text-brand-400 mb-3" />
              <h4 className="font-bold text-sm text-white">Offer Your Skill</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Publish a skill you know—coding, cooking, languages, yoga, or design—with your preferred slots.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 relative">
              <span className="text-3xl font-black text-ocean-500/30 absolute top-4 right-4">02</span>
              <Sparkles className="w-8 h-8 text-ocean-400 mb-3" />
              <h4 className="font-bold text-sm text-white">Discover & Match</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Our matching algorithm finds relevant local mentors and highlights reciprocal barter opportunities.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 relative">
              <span className="text-3xl font-black text-amber-500/30 absolute top-4 right-4">03</span>
              <Repeat className="w-8 h-8 text-amber-400 mb-3" />
              <h4 className="font-bold text-sm text-white">Book & Meet</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Pick a slot and propose an exchange. Coordinate directly through in-app messaging.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 relative">
              <span className="text-3xl font-black text-pink-500/30 absolute top-4 right-4">04</span>
              <CheckCircle2 className="w-8 h-8 text-pink-400 mb-3" />
              <h4 className="font-bold text-sm text-white">Review & Grow</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Mark sessions completed to unlock transparent ratings and build neighborly trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-ocean-700 p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Share What You Know?
            </h2>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
              Join hundreds of neighbors already exchanging creative skills, technology knowledge, and life crafts without spending a penny.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-brand-900 bg-white hover:bg-brand-50 shadow-md transition-all"
              >
                Create Free Account
              </button>
              <button
                onClick={() => onNavigate('explore')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-brand-800/50 hover:bg-brand-800/70 border border-brand-400/30 transition-all"
              >
                Explore Listings First
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
