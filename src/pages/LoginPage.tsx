import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Modal } from '../components/common/Modal';
import { Mail, Lock, Sparkles, ArrowRight, AlertCircle, Shield } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, switchDemoUser, demoUsers, isFirebaseMode, sendPasswordReset } = useAuth();
  const { showToast } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);

    if (result.success) {
      showToast('Welcome Back!', 'Logged in successfully.', 'success');
      onNavigate('dashboard');
    } else {
      setError(result.error || 'Failed to sign in.');
    }
  };

  const handleQuickLogin = async (userId: string, userName: string) => {
    await switchDemoUser(userId);
    showToast('Logged In', `Switched to persona: ${userName}`, 'success');
    onNavigate('dashboard');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitting(true);
    const res = await sendPasswordReset(forgotEmail);
    setForgotSubmitting(false);
    setForgotMsg(res.message);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Login Card */}
        <div className="md:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Welcome to SkillConnect
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Sign In to Your Account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Connect with local mentors and manage your skill exchanges.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotOpen(true);
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-brand-600 font-bold hover:underline"
            >
              Register here
            </button>
          </div>
        </div>

        {/* Right Quick Persona Switcher for Instant Testing */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-brand-50 via-ocean-50 to-slate-50 p-6 rounded-3xl border border-brand-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-brand-800 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>1-Click Quick Demo Sign In</span>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Test multi-user flows instantly! Click any profile to log in as that neighbor.
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u.id, u.name)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-400 hover:shadow-sm text-left transition-all"
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate flex items-center justify-between">
                      <span>{u.name}</span>
                      {u.role === 'admin' && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 rounded">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      Teaches: {u.teachSkills.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotOpen}
        onClose={() => {
          setIsForgotOpen(false);
          setForgotMsg('');
        }}
        title="Reset Your Password"
        subtitle="Enter your email to receive recovery instructions."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleForgotPassword} className="space-y-4">
          {forgotMsg ? (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              {forgotMsg}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Account Email
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500"
                placeholder="name@example.com"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsForgotOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
            >
              Close
            </button>
            {!forgotMsg && (
              <button
                type="submit"
                disabled={forgotSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 disabled:opacity-50"
              >
                {forgotSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};
