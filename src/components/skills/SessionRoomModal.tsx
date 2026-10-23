import React, { useState } from 'react';
import { Booking } from '../../types';
import { Modal } from '../common/Modal';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Share2,
  Calendar,
  Clock,
  MapPin,
  CheckSquare,
  FileText,
  Repeat,
  Sparkles,
  PhoneOff,
} from 'lucide-react';

interface SessionRoomModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionRoomModal: React.FC<SessionRoomModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  if (!booking) return null;

  const [activeTab, setActiveTab] = useState<'workspace' | 'video'>('workspace');
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [notes, setNotes] = useState(
    booking.sessionNotes ||
      '• Shared Session Goal: Cover core fundamentals and work on a hands-on exercise together.\n• Resources discussed: \n• Homework / Next practice steps: '
  );

  const [agenda, setAgenda] = useState([
    { id: 1, text: 'Warm introductions and learning objective alignment', done: true },
    { id: 2, text: 'Mentor walk-through of core techniques & demonstrations', done: false },
    { id: 3, text: 'Learner hands-on practice & live feedback', done: false },
    { id: 4, text: 'Mutual barter check-in & reciprocal session scheduling', done: false },
  ]);

  const toggleAgendaItem = (id: number) => {
    setAgenda(
      agenda.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Session Workspace: ${booking.skillTitle}`}
      subtitle={`Session between ${booking.teacherName} and ${booking.learnerName}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Workspace Mode Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'workspace' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Session Agenda & Notes
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'video' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-brand-600" />
              <span>Live Virtual Room</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            <span>Scheduled: {booking.slot.day} ({booking.slot.time})</span>
          </div>
        </div>

        {activeTab === 'video' ? (
          /* Live Peer Video Interface Simulator */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-80">
              {/* Teacher Video Box */}
              <div className="relative rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800">
                {videoOn ? (
                  <img
                    src={booking.teacherAvatar}
                    alt={booking.teacherName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-xs font-bold flex flex-col items-center gap-2">
                    <VideoOff className="w-8 h-8 text-slate-500" />
                    <span>Camera Paused</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {booking.teacherName} (Mentor)
                </div>
              </div>

              {/* Learner Video Box */}
              <div className="relative rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800">
                <img
                  src={booking.learnerAvatar}
                  alt={booking.learnerName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {booking.learnerName} (Learner)
                </div>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="flex items-center justify-center gap-3 p-3 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3 rounded-full text-white transition-all ${
                  micOn ? 'bg-slate-700 hover:bg-slate-800' : 'bg-rose-600'
                }`}
                title={micOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`p-3 rounded-full text-white transition-all ${
                  videoOn ? 'bg-slate-700 hover:bg-slate-800' : 'bg-rose-600'
                }`}
                title={videoOn ? 'Stop Camera' : 'Start Camera'}
              >
                {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setScreenSharing(!screenSharing)}
                className={`p-3 rounded-full text-white transition-all ${
                  screenSharing ? 'bg-brand-600' : 'bg-slate-700 hover:bg-slate-800'
                }`}
                title="Share Screen"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('workspace')}
                className="px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave Room</span>
              </button>
            </div>
          </div>
        ) : (
          /* Collaborative Workspace View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Agenda Checklist */}
            <div className="space-y-4">
              <div className="p-4 bg-brand-50/70 rounded-2xl border border-brand-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900 mb-1 flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-brand-600" />
                  Barter Agreement Summary
                </h4>
                <p className="text-xs text-brand-950/80 leading-relaxed">
                  {booking.isBarterExchange
                    ? `Exchange proposed: "${booking.proposedBarterSkill}". Both parties have confirmed this zero-cost barter arrangement.`
                    : 'Free community session. No monetary charge.'}
                </p>
                <div className="mt-2 text-xs font-semibold text-brand-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Venue: {booking.meetingVenue || 'Designated Community Center'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-brand-600" />
                  Session Agenda
                </h4>
                <div className="space-y-2">
                  {agenda.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        item.done ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleAgendaItem(item.id)}
                        className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-xs font-medium leading-relaxed">{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Collaborative Shared Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-ocean-600" />
                  Live Session Scratchpad
                </h4>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Auto-saved
                </span>
              </div>
              <textarea
                rows={11}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type lesson notes, code snippets, chords, or homework here..."
                className="w-full text-xs font-mono rounded-2xl border border-slate-200 p-3.5 focus:ring-2 focus:ring-brand-500 bg-slate-50/50 leading-relaxed"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Close Workspace
          </button>
        </div>
      </div>
    </Modal>
  );
};
