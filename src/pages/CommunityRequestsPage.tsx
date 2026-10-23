import React, { useState, useEffect } from 'react';
import { SkillRequest, SkillCategory, LearningMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  getSkillRequests,
  createSkillRequest,
  deleteSkillRequest,
} from '../services/storageService';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import {
  HelpCircle,
  Plus,
  Repeat,
  MapPin,
  Clock,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Send,
} from 'lucide-react';

interface CommunityRequestsPageProps {
  onNavigate: (tab: string, param?: string) => void;
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

export const CommunityRequestsPage: React.FC<CommunityRequestsPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [requests, setRequests] = useState<SkillRequest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState<boolean>(false);

  // New Request Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SkillCategory>('Cooking');
  const [description, setDescription] = useState('');
  const [preferredMode, setPreferredMode] = useState<LearningMode>('both');
  const [urgency, setUrgency] = useState<'flexible' | 'this_week' | 'weekend'>('this_week');
  const [barterOfferInput, setBarterOfferInput] = useState('');

  // Offer to Teach Response Modal
  const [respondingToRequest, setRespondingToRequest] = useState<SkillRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const loadData = async () => {
    const data = await getSkillRequests();
    setRequests(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Login Required', 'Please sign in to post a request.', 'warning');
      onNavigate('login');
      return;
    }

    if (!title.trim() || !description.trim()) {
      showToast('Validation Error', 'Title and description are required.', 'error');
      return;
    }

    const offers = barterOfferInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await createSkillRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterAvatar: currentUser.avatar,
      requesterLocality: currentUser.locality,
      title: title.trim(),
      category,
      description: description.trim(),
      offeredInReturn: offers.length > 0 ? offers : currentUser.teachSkills,
      preferredMode,
      urgency,
    });

    showToast('Request Published! 📬', 'Neighbors will be notified about your learning request.', 'success');
    setIsNewRequestModalOpen(false);
    setTitle('');
    setDescription('');
    setBarterOfferInput('');
    await loadData();
  };

  const handleRespondToRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !respondingToRequest) return;
    setSubmittingResponse(true);

    showToast(
      'Proposal Sent! 🤝',
      `You offered to teach ${respondingToRequest.requesterName}. Conversation opened.`,
      'success'
    );
    setSubmittingResponse(false);
    setRespondingToRequest(null);
    onNavigate('messages', respondingToRequest.requesterId);
  };

  const handleDeleteRequest = async (id: string) => {
    if (window.confirm('Delete this skill request?')) {
      await deleteSkillRequest(id);
      showToast('Request Removed', 'Your request was removed.', 'info');
      await loadData();
    }
  };

  const filteredRequests = selectedCategory
    ? requests.filter((r) => r.category === selectedCategory)
    : requests;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ocean-600">
            <HelpCircle className="w-4 h-4 text-ocean-600" />
            <span>Community Knowledge Bounties</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-0.5">
            Skill Requests & "Wanted" Board
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Can't find what you want to learn? Post a request with what you can teach in return, or help a neighbor!
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              showToast('Sign in required', 'Please sign in to post a learning request.', 'info');
              onNavigate('login');
              return;
            }
            setIsNewRequestModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700 shadow-md shadow-ocean-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Skill Request</span>
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            !selectedCategory
              ? 'bg-ocean-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Requests ({requests.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-ocean-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No requests in this category"
          description="Be the first neighbor to post a learning request in this category!"
          actionText="Post a Skill Request"
          onAction={() => setIsNewRequestModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => {
            const isOwner = currentUser?.id === req.requesterId;
            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-ocean-300 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge category={req.category} label={req.category} />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ocean-50 text-ocean-700">
                      {req.urgency === 'this_week' ? 'Needs This Week' : req.urgency === 'weekend' ? 'Weekends' : 'Flexible Timing'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 line-clamp-2 leading-snug">
                    {req.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {req.description}
                  </p>

                  {/* Reciprocal Offer Section */}
                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                      <Repeat className="w-3 h-3 text-emerald-600" />
                      Offered In Exchange (Barter):
                    </span>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {req.offeredInReturn.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-emerald-300 text-emerald-900 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={req.requesterAvatar}
                      alt={req.requesterName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {req.requesterName}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{req.requesterLocality.split(',')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {isOwner ? (
                    <button
                      onClick={() => handleDeleteRequest(req.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove your request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setRespondingToRequest(req)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700 rounded-xl shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span>I Can Teach This!</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Skill Request Modal */}
      <Modal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        title="Post a Community Skill Request"
        subtitle="Let neighbors know what you want to learn and what skills you can offer in return."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              What do you want to learn? *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Seeking mentor for sourdough proofing & starter maintenance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SkillCategory)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-medium focus:ring-2 focus:ring-ocean-500"
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
                Preferred Mode
              </label>
              <select
                value={preferredMode}
                onChange={(e) => setPreferredMode(e.target.value as LearningMode)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-medium focus:ring-2 focus:ring-ocean-500"
              >
                <option value="both">Both (Online or In-person)</option>
                <option value="in-person">In-person</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Explain What You Hope to Master & Your Current Level *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Share your goals, availability, and any hurdles you've faced..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              What skills can you teach in exchange? (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. UI/UX Design, Watercolor Painting, Conversational Spanish..."
              value={barterOfferInput}
              onChange={(e) => setBarterOfferInput(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewRequestModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700 rounded-xl shadow-xs"
            >
              Publish Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Offer to Teach Response Modal */}
      {respondingToRequest && (
        <Modal
          isOpen={Boolean(respondingToRequest)}
          onClose={() => setRespondingToRequest(null)}
          title={`Offer to Teach ${respondingToRequest.requesterName}`}
          subtitle={`Regarding: "${respondingToRequest.title}"`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRespondToRequest} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
              <p>
                <strong>{respondingToRequest.requesterName}</strong> can barter with:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {respondingToRequest.offeredInReturn.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Message / Proposal
              </label>
              <textarea
                rows={4}
                required
                placeholder={`Hi ${respondingToRequest.requesterName}! I saw your request and would love to teach you. I'm available this week and interested in your skill barter...`}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-ocean-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRespondingToRequest(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingResponse}
                className="px-5 py-2 text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingResponse ? 'Sending...' : 'Send Barter Proposal'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
