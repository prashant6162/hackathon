import React, { useState, useEffect } from 'react';
import { Skill, SkillCategory, SkillLevel, LearningMode, TimeSlot } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { createSkill, updateSkill } from '../services/storageService';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface CreateSkillPageProps {
  initialSkill?: Skill | null;
  onBack: () => void;
  onSuccess: (skillId: string) => void;
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

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const CreateSkillPage: React.FC<CreateSkillPageProps> = ({
  initialSkill,
  onBack,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const isEditing = Boolean(initialSkill);

  const [title, setTitle] = useState(initialSkill?.title || '');
  const [category, setCategory] = useState<SkillCategory>(initialSkill?.category || 'Design');
  const [description, setDescription] = useState(initialSkill?.description || '');
  const [level, setLevel] = useState<SkillLevel>(initialSkill?.level || 'Beginner');
  const [mode, setMode] = useState<LearningMode>(initialSkill?.mode || 'both');
  const [locality, setLocality] = useState(
    initialSkill?.locality || currentUser?.locality || 'San Francisco, CA'
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    initialSkill?.durationMinutes || 60
  );
  const [maxLearners, setMaxLearners] = useState<number>(initialSkill?.maxLearners || 2);
  const [prerequisites, setPrerequisites] = useState(initialSkill?.prerequisites || '');
  const [tagsInput, setTagsInput] = useState(initialSkill?.tags.join(', ') || '');

  const [slots, setSlots] = useState<TimeSlot[]>(
    initialSkill?.availableSlots || [
      { id: 'slot-1', day: 'Saturday', time: '10:00 AM - 11:30 AM' },
      { id: 'slot-2', day: 'Tuesday', time: '6:00 PM - 7:30 PM' },
    ]
  );

  const [newSlotDay, setNewSlotDay] = useState<string>('Saturday');
  const [newSlotTime, setNewSlotTime] = useState<string>('2:00 PM - 3:30 PM');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialSkill) {
      setTitle(initialSkill.title);
      setCategory(initialSkill.category);
      setDescription(initialSkill.description);
      setLevel(initialSkill.level);
      setMode(initialSkill.mode);
      setLocality(initialSkill.locality);
      setDurationMinutes(initialSkill.durationMinutes);
      setMaxLearners(initialSkill.maxLearners);
      setPrerequisites(initialSkill.prerequisites);
      setTagsInput(initialSkill.tags.join(', '));
      setSlots(initialSkill.availableSlots);
    }
  }, [initialSkill]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-xs text-slate-500 mb-4">You must be logged in to offer a skill.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-bold text-brand-600 hover:underline"
        >
          ← Return
        </button>
      </div>
    );
  }

  const handleAddSlot = () => {
    if (!newSlotTime.trim()) return;
    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      day: newSlotDay,
      time: newSlotTime.trim(),
    };
    setSlots([...slots, newSlot]);
  };

  const handleRemoveSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Skill title is required.');
      return;
    }

    if (!description.trim()) {
      setError('Detailed description is required.');
      return;
    }

    if (slots.length === 0) {
      setError('Please add at least one available session day and time slot.');
      return;
    }

    setSubmitting(true);

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (isEditing && initialSkill) {
        const updated: Skill = {
          ...initialSkill,
          title: title.trim(),
          category,
          description: description.trim(),
          level,
          mode,
          locality: locality.trim(),
          availableSlots: slots,
          durationMinutes: Number(durationMinutes),
          maxLearners: Number(maxLearners),
          prerequisites: prerequisites.trim(),
          tags: tagsArray.length > 0 ? tagsArray : [category],
        };
        await updateSkill(updated);
        showToast('Skill Updated!', 'Your listing changes have been saved.', 'success');
        setSubmitting(false);
        onSuccess(updated.id);
      } else {
        const created = await createSkill({
          teacherId: currentUser.id,
          teacherName: currentUser.name,
          teacherAvatar: currentUser.avatar,
          teacherLocality: currentUser.locality,
          title: title.trim(),
          category,
          description: description.trim(),
          level,
          mode,
          locality: locality.trim(),
          latitude: currentUser.latitude || 37.7749,
          longitude: currentUser.longitude || -122.4194,
          availableSlots: slots,
          durationMinutes: Number(durationMinutes),
          maxLearners: Number(maxLearners),
          prerequisites: prerequisites.trim(),
          tags: tagsArray.length > 0 ? tagsArray : [category, 'Neighborhood Skill'],
        });

        showToast(
          'Skill Published! 🎓',
          'Your skill is now discoverable by neighbors for free exchange.',
          'success'
        );
        setSubmitting(false);
        onSuccess(created.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save skill.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            {isEditing ? 'Modify Skill Offering' : 'Share What You Know'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {isEditing ? 'Edit Skill Listing' : 'Publish a New Skill'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Offer your knowledge to neighbors with zero monetary charges.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skill Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Skill Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern UI/UX Design & Component Systems in Figma"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          {/* Category & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SkillCategory)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-medium focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Skill Level *
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as SkillLevel)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-medium focus:ring-2 focus:ring-brand-500"
              >
                <option value="Beginner">Beginner (No background needed)</option>
                <option value="Intermediate">Intermediate (Core basics understood)</option>
                <option value="Advanced">Advanced (Deep dive & mastery)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & What Learners Will Gain *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Explain what topics you will cover, how you structure the session, and what hands-on exercises or crafts you'll practice together..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-brand-500 placeholder-slate-400"
            />
          </div>

          {/* Format & Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Teaching Format *
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as LearningMode)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-medium focus:ring-2 focus:ring-brand-500"
              >
                <option value="both">Both (Online or In-person)</option>
                <option value="in-person">In-person Only</option>
                <option value="online">Online Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Locality / City *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mission District, San Francisco"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Duration & Max Learners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Session Duration (Minutes) *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={15}
                  max={300}
                  step={15}
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Max Learners Per Session *
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={maxLearners}
                onChange={(e) => setMaxLearners(Number(e.target.value))}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Prerequisites or What to Bring
            </label>
            <input
              type="text"
              placeholder="e.g. Laptop with Figma installed, or acoustic guitar, or apron and chef knife..."
              value={prerequisites}
              onChange={(e) => setPrerequisites(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Topic Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Figma, UX Design, Prototyping, Wireframes"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Available Slots Manager */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-600" />
                Available Days & Time Slots ({slots.length})
              </label>
            </div>

            {/* List of current slots */}
            <div className="space-y-2">
              {slots.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{s.day}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{s.time}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(s.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Slot row */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
              <select
                value={newSlotDay}
                onChange={(e) => setNewSlotDay(e.target.value)}
                className="text-xs rounded-xl border border-slate-300 bg-white p-2 font-medium"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Time (e.g. 10:00 AM - 11:30 AM)"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="flex-1 text-xs rounded-xl border border-slate-300 p-2 bg-white"
              />

              <button
                type="button"
                onClick={handleAddSlot}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Slot
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Skill Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
