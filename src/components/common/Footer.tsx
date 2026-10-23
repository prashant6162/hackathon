import React from 'react';
import { Heart, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-ocean-500 flex items-center justify-center text-white text-xl">
                🤝
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                SkillConnect
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              <strong>Problem Statement 049:</strong> Empowering neighborhoods by turning local skills into shared community assets. Exchange knowledge directly—no monetary fees, no subscription walls, just neighbor-to-neighbor learning.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-brand-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Credit-Free & Barter-First Knowledge Sharing</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('explore')}
                  className="hover:text-brand-400 transition-colors"
                >
                  Browse All Skills
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('create-skill')}
                  className="hover:text-brand-400 transition-colors"
                >
                  Offer Your Skill
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reviews')}
                  className="hover:text-brand-400 transition-colors"
                >
                  Community Trust & Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-brand-400 transition-colors"
                >
                  Member Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Local Communities & Transparency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Neighborhood Hubs
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                San Francisco (Mission, Sunset, SOMA)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-ocean-500" />
                Oakland (Downtown, Rockridge)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                Berkeley (Elmwood, Telegraph)
              </li>
              <li className="pt-2 text-xs text-slate-500">
                Privacy pledge: Exact GPS coordinates are never made public. Only neighborhood localities are shown.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} SkillConnect. Built for civic empowerment and local knowledge democratization.
          </p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for local communities</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
