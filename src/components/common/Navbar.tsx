import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Compass,
  LayoutDashboard,
  GraduationCap,
  CalendarCheck,
  MessageSquare,
  Star,
  Shield,
  PlusCircle,
  Bell,
  Check,
  ChevronDown,
  User as UserIcon,
  LogOut,
  RotateCcw,
  Sparkles,
  Menu,
  X,
  MapPin,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { currentUser, isFirebaseMode, demoUsers, switchDemoUser, logout, resetDemoData } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, showToast } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDemoSwitcherOpen, setIsDemoSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setIsDemoSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: any) => {
    await markAsRead(notif.id);
    setIsNotifOpen(false);
    if (notif.link) {
      const tabName = notif.link.replace('/', '');
      onNavigate(tabName);
    }
  };

  const navLinks = [
    { id: 'explore', label: 'Explore Skills', icon: Compass },
    ...(currentUser
      ? [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'enrollments', label: 'My Enrollments', icon: GraduationCap },
          { id: 'teaching', label: 'My Teaching', icon: CalendarCheck },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'reviews', label: 'Reviews', icon: Star },
        ]
      : []),
    ...(currentUser?.role === 'admin'
      ? [{ id: 'admin', label: 'Admin', icon: Shield }]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-ocean-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <span className="text-xl">🤝</span>
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  SkillConnect
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 uppercase tracking-wider">
                    Free Barter
                  </span>
                </span>
                <span className="block text-[11px] font-medium text-slate-500 -mt-0.5">
                  Learn Locally, Grow Together
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      onNavigate(link.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section Actions */}
          <div className="flex items-center gap-3">
            {/* Demo / Backend indicator */}
            <div className="relative" ref={switcherRef}>
              <button
                onClick={() => setIsDemoSwitcherOpen(!isDemoSwitcherOpen)}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isFirebaseMode
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
                title="Switch persona or inspect backend state"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isFirebaseMode ? 'Firebase Live' : 'Demo Mode Active'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {/* Persona Switcher Dropdown */}
              {isDemoSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Switch Demo Persona
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Test multi-user requests, teacher approvals, and barter exchanges instantly.
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {demoUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchDemoUser(user.id);
                          setIsDemoSwitcherOpen(false);
                          showToast('Switched Persona', `Now browsing as ${user.name}`, 'info');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 transition-colors ${
                          currentUser?.id === user.id ? 'bg-brand-50/70 font-semibold' : ''
                        }`}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate flex items-center justify-between">
                            {user.name}
                            {user.role === 'admin' && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                                Admin
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            Teaches: {user.teachSkills.slice(0, 2).join(', ')}
                          </p>
                        </div>
                        {currentUser?.id === user.id && (
                          <Check className="w-4 h-4 text-brand-600" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="px-3 pt-2 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        resetDemoData();
                        setIsDemoSwitcherOpen(false);
                        showToast('Reset Complete', 'Default demo skills, users & bookings restored', 'success');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore Seed Mock Data
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Offer a Skill CTA */}
            {currentUser && (
              <button
                onClick={() => onNavigate('create-skill')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Offer a Skill
              </button>
            )}

            {/* In-App Notifications Bell */}
            {currentUser && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-rose-600 rounded-full border-2 border-white shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 py-3 z-50">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                              !n.read ? 'bg-brand-50/40' : ''
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-brand-500" style={{ opacity: n.read ? 0 : 1 }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900">{n.title}</p>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(n.createdAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Menu or Login CTA */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                        <MapPin className="w-3 h-3 text-brand-600" />
                        <span className="truncate">{currentUser.locality}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Profile & Settings
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('create-skill');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <PlusCircle className="w-4 h-4 text-slate-400" />
                        Offer New Skill
                      </button>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                        >
                          <Shield className="w-4 h-4 text-purple-500" />
                          Admin Console
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          onNavigate('landing');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </button>
            );
          })}

          {currentUser && (
            <button
              onClick={() => {
                onNavigate('create-skill');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600"
            >
              <PlusCircle className="w-4 h-4" />
              Offer a Skill
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
