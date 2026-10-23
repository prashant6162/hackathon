import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  getUsers,
  getMessagesBetweenUsers,
  sendMessage,
  subscribeToDataChanges,
} from '../services/storageService';
import { Send, MessageSquare, User as UserIcon, Clock, Sparkles } from 'lucide-react';

interface MessagesPageProps {
  initialRecipientId?: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  initialRecipientId,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [availablePartners, setAvailablePartners] = useState<User[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPartners = async () => {
    if (!currentUser) return;
    const all = await getUsers();
    const others = all.filter((u) => u.id !== currentUser.id);
    setAvailablePartners(others);

    if (initialRecipientId) {
      const match = others.find((u) => u.id === initialRecipientId);
      if (match) setSelectedPartner(match);
      else if (others.length > 0) setSelectedPartner(others[0]);
    } else if (!selectedPartner && others.length > 0) {
      setSelectedPartner(others[0]);
    }
  };

  const loadConversation = async () => {
    if (!currentUser || !selectedPartner) return;
    const thread = await getMessagesBetweenUsers(currentUser.id, selectedPartner.id);
    setMessages(thread);
    setTimeout(scrollToBottom, 50);
  };

  useEffect(() => {
    loadPartners();
  }, [currentUser, initialRecipientId]);

  useEffect(() => {
    loadConversation();
    const unsub = subscribeToDataChanges(() => {
      loadConversation();
    });
    return () => unsub();
  }, [selectedPartner, currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-xs text-slate-500 mb-4">Please log in to access messages.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPartner || sending) return;

    setSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    await sendMessage({
      conversationId: `conv-${[currentUser.id, selectedPartner.id].sort().join('-')}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      receiverId: selectedPartner.id,
      text: textToSend,
    });

    setSending(false);
    await loadConversation();
  };

  const quickReplies = [
    'Looking forward to our session! 🤝',
    'Where is the best spot to meet up in person?',
    'What tools or notes should I prepare in advance?',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
          <MessageSquare className="w-4 h-4 text-brand-600" />
          <span>Community Messaging</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-0.5">Session Conversations</h1>
        <p className="text-xs text-slate-500 mt-1">
          Coordinate timing, exchange lesson files, and plan your barter sessions safely.
        </p>
      </div>

      {/* Main Chat Layout */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        {/* Left Partners Sidebar */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Learning Connections
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {availablePartners.map((partner) => {
              const isSelected = selectedPartner?.id === partner.id;
              return (
                <button
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner)}
                  className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-white border-l-4 border-brand-600 shadow-2xs' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{partner.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{partner.locality}</p>
                    <p className="text-[10px] text-brand-600 font-medium truncate mt-0.5">
                      Teaches: {partner.teachSkills.join(', ')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Conversation Area */}
        <div className="md:col-span-8 flex flex-col bg-white">
          {selectedPartner ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPartner.avatar}
                    alt={selectedPartner.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedPartner.name}</h3>
                    <p className="text-xs text-slate-500">{selectedPartner.locality}</p>
                  </div>
                </div>

                <div className="text-xs text-brand-700 font-semibold bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                  ★ {selectedPartner.rating.toFixed(1)} Community Rating
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[460px]">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No previous messages with {selectedPartner.name}. Send a friendly hello below!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === currentUser.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex gap-3 max-w-[80%] ${
                          isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        <img
                          src={m.senderAvatar}
                          alt={m.senderName}
                          className="w-7 h-7 rounded-full object-cover mt-1 shrink-0"
                        />
                        <div>
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-brand-600 text-white rounded-tr-xs'
                                : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                            }`}
                          >
                            {m.text}
                          </div>
                          <span className="block text-[10px] text-slate-400 mt-1 px-1">
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                  Quick suggestions:
                </span>
                {quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(qr)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-300 shrink-0 transition-colors"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  placeholder={`Write a message to ${selectedPartner.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400">
              Select a learning partner to open conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
