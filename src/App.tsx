import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useNotifications } from './context/NotificationContext';
import { Skill, BookingType } from './types';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/Toast';
import { BookingModal } from './components/skills/BookingModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExploreSkillsPage } from './pages/ExploreSkillsPage';
import { CommunityRequestsPage } from './pages/CommunityRequestsPage';
import { SkillCirclesPage } from './pages/SkillCirclesPage';
import { SkillDetailPage } from './pages/SkillDetailPage';
import { CreateSkillPage } from './pages/CreateSkillPage';
import { MyEnrollmentsPage } from './pages/MyEnrollmentsPage';
import { MyTeachingSessionsPage } from './pages/MyTeachingSessionsPage';
import { BookingManagementPage } from './pages/BookingManagementPage';
import { MessagesPage } from './pages/MessagesPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const App: React.FC = () => {
  const { currentUser, isFirebaseMode } = useAuth();
  const { showToast } = useNotifications();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [currentParam, setCurrentParam] = useState<string>('');
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Global Booking Modal state
  const [selectedSkillForBooking, setSelectedSkillForBooking] = useState<Skill | null>(null);
  const [bookingInitialMode, setBookingInitialMode] = useState<BookingType>('credit');

  // Demo banner visibility
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  const navigate = (tab: string, param?: string) => {
    // Protected routes validation
    const protectedTabs = [
      'dashboard',
      'create-skill',
      'enrollments',
      'teaching',
      'bookings',
      'messages',
      'profile',
      'admin',
    ];

    if (protectedTabs.includes(tab) && !currentUser) {
      showToast('Authentication Required', 'Please sign in or select a demo persona to proceed.', 'warning');
      setCurrentTab('login');
      return;
    }

    if (tab === 'create-skill' && !param) {
      setEditingSkill(null);
    }

    setCurrentTab(tab);
    if (param !== undefined) {
      setCurrentParam(param);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnrollSkill = (skill: Skill, mode: BookingType = 'credit') => {
    if (!currentUser) {
      showToast('Sign In Required', 'Please sign in to book a session.', 'info');
      setCurrentTab('login');
      return;
    }
    setBookingInitialMode(mode);
    setSelectedSkillForBooking(skill);
  };

  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'landing':
        return (
          <LandingPage
            onNavigate={navigate}
            onEnrollSkill={handleEnrollSkill}
          />
        );

      case 'login':
        return <LoginPage onNavigate={navigate} />;

      case 'register':
        return <RegisterPage onNavigate={navigate} />;

      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={navigate}
            onEnrollSkill={handleEnrollSkill}
          />
        );

      case 'explore':
        return (
          <ExploreSkillsPage
            onNavigate={navigate}
            onEnrollSkill={handleEnrollSkill}
          />
        );

      case 'requests':
        return <CommunityRequestsPage onNavigate={navigate} />;

      case 'circles':
        return <SkillCirclesPage onNavigate={navigate} />;

      case 'skill-detail':
        return (
          <SkillDetailPage
            skillId={currentParam}
            onBack={() => navigate('explore')}
            onEditSkill={(skill) => {
              setEditingSkill(skill);
              navigate('create-skill', skill.id);
            }}
            onEnrollSkill={handleEnrollSkill}
            onNavigate={navigate}
          />
        );

      case 'create-skill':
        return (
          <CreateSkillPage
            initialSkill={editingSkill}
            onBack={() => navigate('teaching')}
            onSuccess={(skillId) => navigate('skill-detail', skillId)}
          />
        );

      case 'enrollments':
        return <MyEnrollmentsPage onNavigate={navigate} />;

      case 'teaching':
        return (
          <MyTeachingSessionsPage
            onNavigate={navigate}
            onEditSkill={(skill) => {
              setEditingSkill(skill);
              navigate('create-skill', skill.id);
            }}
          />
        );

      case 'bookings':
        return <BookingManagementPage onNavigate={navigate} />;

      case 'messages':
        return <MessagesPage initialRecipientId={currentParam} onNavigate={navigate} />;

      case 'reviews':
        return <ReviewsPage onNavigate={navigate} />;

      case 'profile':
        return <UserProfilePage onNavigate={navigate} />;

      case 'admin':
        return <AdminDashboardPage onNavigate={navigate} />;

      default:
        return (
          <LandingPage
            onNavigate={navigate}
            onEnrollSkill={handleEnrollSkill}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* Top Demo Notice Banner */}
      {!isFirebaseMode && showDemoBanner && (
        <aside aria-label="Demo mode notice" className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs py-2 px-4 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] uppercase tracking-wider">
                Demo Engine Active
              </span>
              <span>
                SkillConnect is running with reactive persistent local storage. All bookings, barter matching, reviews, and messaging are 100% interactive!
              </span>
            </div>
            <button
              onClick={() => setShowDemoBanner(false)}
              className="text-white/80 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
        </aside>
      )}

      {/* Primary Navigation */}
      <Navbar currentTab={currentTab} onNavigate={navigate} />

      {/* Main Page Area */}
      <main className="flex-1">{renderCurrentPage()}</main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Booking Modal (Shared) */}
      <BookingModal
        skill={selectedSkillForBooking}
        isOpen={Boolean(selectedSkillForBooking)}
        initialMode={bookingInitialMode}
        onClose={() => setSelectedSkillForBooking(null)}
        onSuccess={() => {
          setSelectedSkillForBooking(null);
          navigate('enrollments');
        }}
        onRequireLogin={() => {
          setSelectedSkillForBooking(null);
          navigate('login');
        }}
        onNavigateToWallet={() => {
          setSelectedSkillForBooking(null);
          navigate('dashboard');
        }}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};
