import React, { useState } from 'react';
import { useAuth, RegisterData } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ProfilePictureModal } from '../components/profile/ProfilePictureModal';
import { User, Mail, Lock, MapPin, Sparkles, Plus, X, ArrowRight, AlertCircle, Check, Camera, Upload } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
];

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    locality: '',
    bio: '',
    preferredMode: 'both' as 'online' | 'in-person' | 'both',
    avatar: PRESET_AVATARS[0],
  });

  const [teachSkills, setTeachSkills] = useState<string[]>(['Creative Arts']);
  const [newTeachInput, setNewTeachInput] = useState('');

  const [learnSkills, setLearnSkills] = useState<string[]>(['Web Development']);
  const [newLearnInput, setNewLearnInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const addTeachSkill = () => {
    const val = newTeachInput.trim();
    if (val && !teachSkills.includes(val)) {
      setTeachSkills([...teachSkills, val]);
      setNewTeachInput('');
    }
  };

  const removeTeachSkill = (skill: string) => {
    setTeachSkills(teachSkills.filter((s) => s !== skill));
  };

  const addLearnSkill = () => {
    const val = newLearnInput.trim();
    if (val && !learnSkills.includes(val)) {
      setLearnSkills([...learnSkills, val]);
      setNewLearnInput('');
    }
  };

  const removeLearnSkill = (skill: string) => {
    setLearnSkills(learnSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    if (teachSkills.length === 0) {
      setError('Please add at least one skill you can teach or share.');
      return;
    }

    if (learnSkills.length === 0) {
      setError('Please add at least one skill you want to learn.');
      return;
    }

    setSubmitting(true);

    const payload: RegisterData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      locality: formData.locality.trim(),
      bio: formData.bio.trim() || 'Excited to learn and share skills in the neighborhood.',
      teachSkills,
      learnSkills,
      preferredMode: formData.preferredMode,
      avatar: formData.avatar,
    };

    const res = await register(payload);
    setSubmitting(false);

    if (res.success) {
      showToast('Welcome to SkillConnect! 🎉', 'Your profile is ready.', 'success');
      onNavigate('dashboard');
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Join the Knowledge Barter Network
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-1">Create Your Free Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Exchange your talents with neighbors—zero monetary cost.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Profile Photo *
              </label>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Photo / Take Selfie</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50/70 rounded-2xl border border-slate-200">
              {/* Active Selected Avatar with click to customize */}
              <div
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative cursor-pointer group shrink-0"
                title="Click to customize profile picture"
              >
                <img
                  src={formData.avatar}
                  alt="Selected avatar"
                  className="w-14 h-14 rounded-full object-cover border-3 border-brand-500 shadow-md group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-0 right-0 bg-brand-600 text-white p-1 rounded-full shadow-xs">
                  <Camera className="w-3 h-3" />
                </span>
              </div>

              {/* Presets Row */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                  Or pick a neighborhood preset:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormData({ ...formData, avatar: av })}
                      className={`relative rounded-full p-0.5 transition-transform ${
                        formData.avatar === av ? 'ring-3 ring-brand-500 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={av}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      {formData.avatar === av && (
                        <span className="absolute bottom-0 right-0 bg-brand-600 text-white p-0.5 rounded-full">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="maya@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password (min 6 chars) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Locality & Learning Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Locality / City *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mission District, San Francisco"
                  value={formData.locality}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Learning Mode
              </label>
              <select
                value={formData.preferredMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredMode: e.target.value as 'online' | 'in-person' | 'both',
                  })
                }
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-brand-500"
              >
                <option value="both">Both (Online or In-person)</option>
                <option value="in-person">In-person Preferred</option>
                <option value="online">Online Preferred</option>
              </select>
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Bio / Introduction
            </label>
            <textarea
              rows={2}
              placeholder="Tell neighbors a little about your background, hobbies, or what inspires you..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500 placeholder-slate-400"
            />
          </div>

          {/* Skills I Can Teach Tag Input */}
          <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200/80">
            <label className="block text-xs font-bold text-brand-900 uppercase tracking-wider mb-1">
              Skills I Can Teach (Skills to Offer) *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a skill you can teach (e.g., Python, Piano, Sourdough, Yoga)..."
                value={newTeachInput}
                onChange={(e) => setNewTeachInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTeachSkill();
                  }
                }}
                className="flex-1 text-xs rounded-lg border border-brand-300 p-2 bg-white focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={addTeachSkill}
                className="px-3 py-2 text-xs font-bold text-white bg-brand-600 rounded-lg hover:bg-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {teachSkills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white border border-brand-300 text-brand-800 font-semibold shadow-2xs"
                >
                  {sk}
                  <button
                    type="button"
                    onClick={() => removeTeachSkill(sk)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Skills I Want to Learn Tag Input */}
          <div className="p-4 rounded-2xl bg-ocean-50/50 border border-ocean-200/80">
            <label className="block text-xs font-bold text-ocean-900 uppercase tracking-wider mb-1">
              Skills I Want to Learn (My Interests) *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a skill you want to learn (e.g., UI/UX, Spanish, Guitar)..."
                value={newLearnInput}
                onChange={(e) => setNewLearnInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLearnSkill();
                  }
                }}
                className="flex-1 text-xs rounded-lg border border-ocean-300 p-2 bg-white focus:ring-2 focus:ring-ocean-500"
              />
              <button
                type="button"
                onClick={addLearnSkill}
                className="px-3 py-2 text-xs font-bold text-white bg-ocean-600 rounded-lg hover:bg-ocean-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {learnSkills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white border border-ocean-300 text-ocean-800 font-semibold shadow-2xs"
                >
                  {sk}
                  <button
                    type="button"
                    onClick={() => removeLearnSkill(sk)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Creating Profile...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Custom Profile Photo Modal */}
        <ProfilePictureModal
          currentAvatar={formData.avatar}
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          onSaveAvatar={(newAv) => {
            setFormData({ ...formData, avatar: newAv });
            showToast('Photo Selected! 📸', 'Your profile picture is ready.', 'info');
          }}
        />

        <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Already a member?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-brand-600 font-bold hover:underline"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
};
