import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LearningMode } from '../types';
import {
  User,
  MapPin,
  Shield,
  Plus,
  X,
  Sparkles,
  RotateCcw,
  Navigation,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface UserProfilePageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onNavigate }) => {
  const { currentUser, updateUserProfile, resetDemoData, demoUsers, switchDemoUser } = useAuth();
  const { showToast } = useNotifications();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-xs text-slate-500 mb-4">Please log in to manage your profile.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [locality, setLocality] = useState(currentUser.locality);
  const [preferredMode, setPreferredMode] = useState<LearningMode>(currentUser.preferredMode);

  const [teachSkills, setTeachSkills] = useState<string[]>(currentUser.teachSkills);
  const [newTeach, setNewTeach] = useState('');

  const [learnSkills, setLearnSkills] = useState<string[]>(currentUser.learnSkills);
  const [newLearn, setNewLearn] = useState('');

  const [geoStatus, setGeoStatus] = useState<string>(
    currentUser.latitude ? 'Location set (approximate)' : 'Not shared'
  );
  const [saving, setSaving] = useState(false);

  const handleAddTeach = () => {
    const val = newTeach.trim();
    if (val && !teachSkills.includes(val)) {
      setTeachSkills([...teachSkills, val]);
      setNewTeach('');
    }
  };

  const handleRemoveTeach = (s: string) => {
    setTeachSkills(teachSkills.filter((t) => t !== s));
  };

  const handleAddLearn = () => {
    const val = newLearn.trim();
    if (val && !learnSkills.includes(val)) {
      setLearnSkills([...learnSkills, val]);
      setNewLearn('');
    }
  };

  const handleRemoveLearn = (s: string) => {
    setLearnSkills(learnSkills.filter((l) => l !== s));
  };

  const handleRequestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation not supported by your browser');
      return;
    }

    setGeoStatus('Requesting browser permission...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Round coordinates slightly for privacy preservation
        const lat = Math.round(pos.coords.latitude * 100) / 100;
        const lng = Math.round(pos.coords.longitude * 100) / 100;
        updateUserProfile({ latitude: lat, longitude: lng });
        setGeoStatus(`Location shared securely: ~${lat}, ~${lng}`);
        showToast('Location Updated', 'Approximate coordinates updated for distance calculation.', 'success');
      },
      (err) => {
        setGeoStatus('Permission denied or unavailable. Fallback to locality text.');
        showToast('Location Fallback', 'Using locality text for neighborhood matches.', 'info');
      }
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateUserProfile({
      name: name.trim(),
      bio: bio.trim(),
      locality: locality.trim(),
      preferredMode,
      teachSkills,
      learnSkills,
    });
    setSaving(false);
    showToast('Profile Saved!', 'Your changes are live.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
          <User className="w-4 h-4 text-brand-600" />
          <span>Account Settings</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-0.5">Profile & Preferences</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update the skills you offer and want to learn to tune your local matching algorithm.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-xs"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md">
                ★ {currentUser.rating.toFixed(1)} Rating • {currentUser.reviewCount} Reviews
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Locality / Neighborhood
              </label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Preferred Learning Format
            </label>
            <select
              value={preferredMode}
              onChange={(e) => setPreferredMode(e.target.value as LearningMode)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-medium focus:ring-2 focus:ring-brand-500"
            >
              <option value="both">Both (Online and In-person)</option>
              <option value="in-person">In-person Preferred</option>
              <option value="online">Online Preferred</option>
            </select>
          </div>
        </div>

        {/* Skills I Teach */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-brand-900 uppercase tracking-wider">
            Skills I Teach (Used for Reciprocal Barter Matching)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add another skill you can teach..."
              value={newTeach}
              onChange={(e) => setNewTeach(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTeach();
                }
              }}
              className="flex-1 text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={handleAddTeach}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {teachSkills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200"
              >
                🎓 {s}
                <button
                  type="button"
                  onClick={() => handleRemoveTeach(s)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-ocean-900 uppercase tracking-wider">
            Skills I Want to Learn (Generates Recommended Matches)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add another skill or topic you want to learn..."
              value={newLearn}
              onChange={(e) => setNewLearn(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLearn();
                }
              }}
              className="flex-1 text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-ocean-500"
            />
            <button
              type="button"
              onClick={handleAddLearn}
              className="px-4 py-2 text-xs font-bold text-white bg-ocean-600 rounded-xl hover:bg-ocean-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {learnSkills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-ocean-50 text-ocean-800 border border-ocean-200"
              >
                🎯 {s}
                <button
                  type="button"
                  onClick={() => handleRemoveLearn(s)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Location & Privacy Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Location & Privacy Controls
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            By default, SkillConnect uses your neighborhood or city name for discovery. You can optionally share approximate browser geolocation to enable precise proximity calculations.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Device Location Status</p>
              <p className="text-xs text-slate-500 mt-0.5">{geoStatus}</p>
            </div>
            <button
              type="button"
              onClick={handleRequestGeolocation}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors self-start sm:self-auto flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-brand-600" />
              <span>Update Device Location</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
