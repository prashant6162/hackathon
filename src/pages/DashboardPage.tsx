import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Skill, Booking, MatchResult, BookingType } from '../types';
import { getSkills, getBookingsForUser } from '../services/storageService';
import { rankSkillsForUser } from '../services/matchingAlgorithm';
import {
  getWallet,
  getTransactions,
  purchaseCreditPackage,
  awardStarterBonus,
  CREDIT_PACKAGES,
  CreditWallet,
  CreditTransaction,
  CreditPackage,
  subscribeToCreditChanges,
} from '../services/creditService';
import { SkillCard } from '../components/skills/SkillCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import confetti from 'canvas-confetti';
import {
  Compass,
  PlusCircle,
  GraduationCap,
  CalendarCheck,
  Star,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Repeat,
  AlertCircle,
  CheckCircle2,
  Coins,
  CreditCard,
  Gift,
  History,
  Zap,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Info,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onEnrollSkill: (skill: Skill, mode?: BookingType) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onEnrollSkill }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learnerBookings, setLearnerBookings] = useState<Booking[]>([]);
  const [teacherBookings, setTeacherBookings] = useState<Booking[]>([]);
  const [recommendedMatches, setRecommendedMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Credit Wallet state
  const [wallet, setWallet] = useState<CreditWallet>({
    userId: currentUser?.id || '',
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    totalPurchased: 0,
  });
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [walletSubTab, setWalletSubTab] = useState<'packages' | 'history'>('packages');
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [selectedPkgForCheckout, setSelectedPkgForCheckout] = useState<CreditPackage | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [demoPaymentMethod, setDemoPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      setLoading(true);
      const allSkills = await getSkills();
      setSkills(allSkills);

      const userBookings = await getBookingsForUser(currentUser.id);
      setLearnerBookings(userBookings.asLearner);
      setTeacherBookings(userBookings.asTeacher);

      const ranked = rankSkillsForUser(currentUser, allSkills);
      setRecommendedMatches(ranked.slice(0, 4));

      // Wallet & Transactions
      setWallet(getWallet(currentUser.id));
      setTransactions(getTransactions(currentUser.id));

      setLoading(false);
    };

    loadData();

    // Subscribe to real-time credit updates
    const unsub = subscribeToCreditChanges(() => {
      setWallet(getWallet(currentUser.id));
      setTransactions(getTransactions(currentUser.id));
    });
    return unsub;
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <p className="text-sm text-slate-500 mb-4">Please sign in to access your dashboard.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Real calculations
  const myOfferedSkills = skills.filter((s) => s.teacherId === currentUser.id);
  const pendingIncomingRequests = teacherBookings.filter((b) => b.status === 'pending');
  const acceptedUpcomingSessions = [
    ...learnerBookings.filter((b) => b.status === 'accepted'),
    ...teacherBookings.filter((b) => b.status === 'accepted'),
  ];
  const completedTotalSessions = [
    ...learnerBookings.filter((b) => b.status === 'completed'),
    ...teacherBookings.filter((b) => b.status === 'completed'),
  ];

  const handleClaimStarter = () => {
    if (!currentUser) return;
    const ok = awardStarterBonus(currentUser.id, currentUser.name);
    if (ok) {
      showToast('Starter Bonus Claimed! 🎁', '20 free welcome credits added to your wallet!', 'success');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } else {
      showToast('Already Claimed', 'Your account has already claimed the starter welcome bonus.', 'info');
    }
  };

  const handleConfirmDemoCheckout = () => {
    if (!currentUser || !selectedPkgForCheckout) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      const res = purchaseCreditPackage(currentUser.id, selectedPkgForCheckout, currentUser.name);
      setIsProcessingPayment(false);
      if (res.success) {
        showToast(
          'Package Activated! 💳',
          `Added ${selectedPkgForCheckout.credits} credits to your wallet via Demo Gateway simulator.`,
          'success'
        );
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setSelectedPkgForCheckout(null);
      } else {
        showToast('Package Note', res.error || 'Could not complete package claim.', 'warning');
        setSelectedPkgForCheckout(null);
      }
    }, 500);
  };

  const hasClaimedStarter = transactions.some((t) => t.kind === 'starter_bonus');

  const filteredTransactions = transactions.filter((t) => {
    if (historyFilter === 'all') return true;
    if (historyFilter === 'earned') return t.kind === 'earned_teaching';
    if (historyFilter === 'spent') return t.kind === 'spent_learning';
    if (historyFilter === 'purchased') return t.kind === 'purchased';
    if (historyFilter === 'bonus') return t.kind === 'starter_bonus' || t.kind === 'sponsored_grant';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-ocean-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-brand-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SkillConnect Neighborhood Community</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-brand-100 max-w-xl leading-relaxed">
              Based in <strong>{currentUser.locality}</strong>. You have{' '}
              <strong>{pendingIncomingRequests.length} pending request(s)</strong> awaiting your reply and{' '}
              <strong>{acceptedUpcomingSessions.length} upcoming session(s)</strong>.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('create-skill')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-brand-800 hover:bg-brand-50 shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-brand-600" />
              Offer Skill
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-800/60 hover:bg-brand-800/90 text-white border border-brand-400/30 transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              Explore Skills
            </button>
          </div>
        </div>
      </div>

      {/* Skill Credit Wallet & Economy Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Coins className="w-5 h-5 text-amber-600" />
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Skill Credit Wallet
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                Hybrid Economy
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Exchange time with zero money. Earn credits by completing teaching sessions, spend them to learn from neighbors, or purchase refill packs.
            </p>
          </div>

          {/* Wallet Header Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {!hasClaimedStarter && (
              <button
                onClick={handleClaimStarter}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm shadow-amber-500/20 transition-all flex items-center gap-1.5"
              >
                <Gift className="w-4 h-4" />
                <span>Claim Free 20 Starter Credits</span>
              </button>
            )}
            <button
              onClick={() => setWalletSubTab('packages')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                walletSubTab === 'packages'
                  ? 'bg-amber-100 text-amber-900 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-700" />
              <span>Credit Packages</span>
            </button>
            <button
              onClick={() => setWalletSubTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                walletSubTab === 'history'
                  ? 'bg-brand-100 text-brand-900 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <History className="w-4 h-4 text-brand-700" />
              <span>History ({transactions.length})</span>
            </button>
          </div>
        </div>

        {/* 4 Wallet Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Available Balance */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-orange-50 border border-amber-200/90 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-900 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Available Balance</span>
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-amber-950">{wallet.balance}</span>
              <span className="text-xs font-bold text-amber-800">Credits</span>
            </div>
            <p className="text-[11px] text-amber-900/80 mt-1">
              Ready to spend on learning sessions
            </p>
          </div>

          {/* 2. Credits Earned by Teaching */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-900 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Earned Teaching</span>
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-950">+{wallet.totalEarned}</span>
              <span className="text-xs font-bold text-emerald-800">Credits</span>
            </div>
            <p className="text-[11px] text-emerald-900/80 mt-1">
              From completed verified mentoring
            </p>
          </div>

          {/* 3. Credits Spent on Learning */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Spent Learning</span>
              <ArrowUpRight className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">-{wallet.totalSpent}</span>
              <span className="text-xs font-bold text-slate-600">Credits</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Invested into session enrollments
            </p>
          </div>

          {/* 4. Purchased Refills */}
          <div className="p-5 rounded-2xl bg-brand-50/60 border border-brand-200 shadow-2xs">
            <div className="flex items-center justify-between text-brand-900 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Purchased Credits</span>
              <CreditCard className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-brand-950">{wallet.totalPurchased}</span>
              <span className="text-xs font-bold text-brand-800">Credits</span>
            </div>
            <p className="text-[11px] text-brand-900/80 mt-1">
              Acquired via demo credit packages
            </p>
          </div>
        </div>

        {/* Sub-tab 1: Credit Purchase Packages */}
        {walletSubTab === 'packages' && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span>Configurable Credit Refill Packages</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Refill your wallet when you want to learn without teaching. Real payment gateway can be connected later.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                ⚡ Instant Simulated Top-Up
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {CREDIT_PACKAGES.map((pkg) => {
                const isStarterClaimed = pkg.isLimitedToNewUsers && hasClaimedStarter;
                return (
                  <div
                    key={pkg.id}
                    className={`rounded-3xl p-6 border transition-all flex flex-col justify-between relative ${
                      pkg.isFeatured
                        ? 'bg-gradient-to-b from-amber-50/90 to-white border-amber-300 shadow-md ring-2 ring-amber-400/30'
                        : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    {pkg.isFeatured && (
                      <span className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
                        Best Value
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{pkg.badge || '📦'}</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {pkg.credits} Credits
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-slate-900">{pkg.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {pkg.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900">
                          {pkg.priceINR === 0 ? 'Free' : `₹${pkg.priceINR}`}
                        </span>
                        {pkg.priceINR > 0 && (
                          <span className="text-xs text-slate-400">
                            (₹{(pkg.priceINR / pkg.credits).toFixed(2)} / credit)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-100">
                      {isStarterClaimed ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 cursor-not-allowed"
                        >
                          ✓ Already Claimed
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedPkgForCheckout(pkg)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                            pkg.isFeatured
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>
                            {pkg.priceINR === 0 ? 'Claim 20 Free Credits' : `Purchase ${pkg.credits} Credits`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub-tab 2: Transaction History */}
        {walletSubTab === 'history' && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-brand-600" />
                  <span>Wallet Transaction Ledger</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Every credit movement is tracked, audited, and preserved in your local browser state.
                </p>
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'earned', label: 'Teaching Rewards' },
                  { id: 'spent', label: 'Learning Enrolled' },
                  { id: 'purchased', label: 'Purchased' },
                  { id: 'bonus', label: 'Bonuses' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setHistoryFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      historyFilter === f.id
                        ? 'bg-brand-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                No transactions found for this filter. Enroll in a session or teach a skill to see ledger entries!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Transaction Type</th>
                      <th className="py-3 px-4">Description / Details</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredTransactions.map((tx) => {
                      const isGain = tx.amount > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}{' '}
                            <span className="text-[10px] text-slate-400">
                              {new Date(tx.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.kind === 'earned_teaching'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.kind === 'spent_learning'
                                  ? 'bg-rose-100 text-rose-800'
                                  : tx.kind === 'purchased'
                                  ? 'bg-blue-100 text-blue-800'
                                  : tx.kind === 'refund_cancelled'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {tx.kind === 'earned_teaching' && '🎓 Teaching Reward'}
                              {tx.kind === 'spent_learning' && '🎯 Enrolled Session'}
                              {tx.kind === 'purchased' && '💳 Package Refill'}
                              {tx.kind === 'starter_bonus' && '🎁 Starter Bonus'}
                              {tx.kind === 'refund_cancelled' && '↩️ Refund'}
                              {tx.kind === 'sponsored_grant' && '🌟 Sponsored'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 max-w-md">
                            <p className="line-clamp-1">{tx.note}</p>
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-black whitespace-nowrap ${
                              isGain ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isGain ? `+${tx.amount}` : tx.amount} Credits
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                            {tx.balanceAfter} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Real Statistics Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills I Teach</span>
            <GraduationCap className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{myOfferedSkills.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active listings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingIncomingRequests.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting your approval</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Confirmed</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{acceptedUpcomingSessions.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Accepted learning dates</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-ocean-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{completedTotalSessions.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Mutually verified</p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {currentUser.rating ? currentUser.rating.toFixed(1) : '5.0'}★
          </p>
          <p className="text-[11px] text-slate-500 mt-1">From {currentUser.reviewCount || 0} reviews</p>
        </div>
      </div>

      {/* Skills I Teach & Skills I Want to Learn tags row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teach Skills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Skills I Teach (Offered)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Edit in Profile
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {currentUser.teachSkills.map((sk, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200"
              >
                🎓 {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Learn Skills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-ocean-500"></span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Skills I Want to Learn
              </h3>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs font-semibold text-ocean-600 hover:text-ocean-700"
            >
              Edit in Profile
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {currentUser.learnSkills.map((sk, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-ocean-50 text-ocean-800 border border-ocean-200"
              >
                🎯 {sk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Action Alerts (if any) */}
      {pendingIncomingRequests.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                You have {pendingIncomingRequests.length} pending session booking request(s)!
              </h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Neighbors are eager to learn from you. Accept or reject requests to confirm the schedule.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('teaching')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs self-start sm:self-auto"
          >
            Review Requests →
          </button>
        </div>
      )}

      {/* Recommended Skill Matches (Real Algorithm Results) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Smart Barter Algorithm</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">
              Recommended Matches for You
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by desired skills similarity, reciprocal barter capability, locality, and mentor reputation.
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recommendedMatches.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No matches found yet. Add more interests in your profile to discover personalized matches!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendedMatches.map((match) => (
              <SkillCard
                key={match.skill.id}
                skill={match.skill}
                match={match}
                onViewDetails={(id) => onNavigate('skill-detail', id)}
                onEnrollClick={(sk, mode) => onEnrollSkill(sk, mode)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Confirmed Sessions Schedule */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Upcoming Confirmed Sessions</h3>
          </div>
          <button
            onClick={() => onNavigate('enrollments')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            View All Bookings
          </button>
        </div>

        {acceptedUpcomingSessions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No confirmed upcoming sessions scheduled yet. Explore skills to request your first barter exchange!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {acceptedUpcomingSessions.map((b) => {
              const isTeacher = b.teacherId === currentUser.id;
              return (
                <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={isTeacher ? b.learnerAvatar : b.teacherAvatar}
                      alt="user"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{b.skillTitle}</h4>
                        <Badge status={b.status} label={b.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isTeacher ? `Teaching learner: ${b.learnerName}` : `Learning with mentor: ${b.teacherName}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      {b.slot.day} ({b.slot.time})
                    </span>
                    <button
                      onClick={() => onNavigate('messages')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Demo Checkout Simulator Modal */}
      {selectedPkgForCheckout && (
        <Modal
          isOpen={Boolean(selectedPkgForCheckout)}
          onClose={() => setSelectedPkgForCheckout(null)}
          title="Demo Checkout Simulator"
          subtitle="Simulate purchasing a credit refill package in your prototype."
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            {/* Clear Demo Label Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Simulated Sandbox Payment Gateway</span>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                No real payment or credit card is processed. This demo checkout demonstrates how a payment gateway webhook easily connects to the SkillConnect Credit Wallet API.
              </p>
            </div>

            {/* Package Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xl">{selectedPkgForCheckout.badge || '📦'}</span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">{selectedPkgForCheckout.name}</h4>
                <p className="text-xs text-slate-500">{selectedPkgForCheckout.credits} Skill Credits</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Total Due</p>
                <p className="text-xl font-black text-slate-900">
                  {selectedPkgForCheckout.priceINR === 0 ? 'Free' : `₹${selectedPkgForCheckout.priceINR}`}
                </p>
              </div>
            </div>

            {/* Simulated Payment Methods */}
            {selectedPkgForCheckout.priceINR > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Simulated Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / GPay' },
                    { id: 'card', label: 'Debit Card' },
                    { id: 'netbanking', label: 'NetBanking' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDemoPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        demoPaymentMethod === m.id
                          ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedPkgForCheckout(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmDemoCheckout}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-500/20 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {isProcessingPayment
                    ? 'Processing Simulation...'
                    : selectedPkgForCheckout.priceINR === 0
                    ? 'Claim Free Package'
                    : `Simulate Pay ₹${selectedPkgForCheckout.priceINR}`}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
