/**
 * SkillConnect – Hybrid Credit Service
 * =====================================
 * Demo mode: all credit data is persisted in localStorage.
 * Structured for easy Firebase / real-backend swap-in.
 *
 * CREDIT RULES:
 *  - Teachers earn credits ONLY after a session is marked completed.
 *  - Learners spend credits at booking-acceptance time.
 *  - Direct barter exchange = 0 credits on both sides.
 *  - Sponsored learning = 0 credits for learner, community pool absorbs cost.
 *  - Cancellation policy: full refund if not yet accepted; no refund after session.
 *  - No negative balances; no duplicate rewards.
 */

import { User } from '../types';

// ---------- Types ----------

export type BookingType = 'barter' | 'credit' | 'sponsored';

export type TransactionKind =
  | 'earned_teaching'      // teacher receives credits after session completes
  | 'spent_learning'       // learner spends credits on booking acceptance
  | 'refund_cancelled'     // learner refunded after pre-acceptance cancellation
  | 'purchased'            // user bought a credit package
  | 'sponsored_grant'      // community-sponsored free learning slot granted
  | 'starter_bonus';       // new-user welcome bonus

export interface CreditTransaction {
  id: string;
  userId: string;
  kind: TransactionKind;
  amount: number;           // positive = gain, negative = spend
  balanceAfter: number;
  relatedBookingId?: string;
  relatedSkillTitle?: string;
  relatedUserName?: string;
  packageId?: string;
  note: string;
  createdAt: string;
}

export interface CreditWallet {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  totalPurchased: number;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceINR: number;       // 0 = free
  badge?: string;
  description: string;
  isFeatured?: boolean;
  isLimitedToNewUsers?: boolean;
}

export interface SponsoredRequest {
  id: string;
  learnerId: string;
  learnerName: string;
  learnerAvatar: string;
  skillId: string;
  skillTitle: string;
  teacherId: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// ---------- Storage Keys & Listeners ----------

const KEYS = {
  WALLETS: 'skillconnect_wallets_v2',
  TRANSACTIONS: 'skillconnect_transactions_v2',
  SPONSORED: 'skillconnect_sponsored_v2',
  SKILL_CREDIT_COSTS: 'skillconnect_skill_credit_costs_v2',
};

type CreditListener = () => void;
const creditListeners = new Set<CreditListener>();

export function subscribeToCreditChanges(callback: CreditListener): () => void {
  creditListeners.add(callback);
  return () => {
    creditListeners.delete(callback);
  };
}

export function notifyCreditChanged(): void {
  creditListeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Error in credit change listener', e);
    }
  });
}

// ---------- Configurable Credit Packages ----------

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pkg-starter',
    name: 'Starter Bonus',
    credits: 20,
    priceINR: 0,
    badge: '🎁',
    description: 'One-time welcome gift for new members. Jumpstart your learning journey!',
    isLimitedToNewUsers: true,
  },
  {
    id: 'pkg-basic',
    name: 'Basic Pack',
    credits: 40,
    priceINR: 20,
    badge: '⚡',
    description: 'Great for occasional learners. Attend up to 4 sessions.',
  },
  {
    id: 'pkg-plus',
    name: 'Plus Pack',
    credits: 110,
    priceINR: 50,
    badge: '🚀',
    description: 'Best value! More credits per rupee. Perfect for active skill explorers.',
    isFeatured: true,
  },
];

// Default credit cost per session if skill doesn't override
export const DEFAULT_CREDIT_COST_PER_SESSION = 10;

// ---------- Helpers ----------

function ls<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function lsSet<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

// ---------- Wallet CRUD ----------

export function getWallet(userId: string): CreditWallet {
  const wallets = ls<CreditWallet[]>(KEYS.WALLETS, []);
  return (
    wallets.find((w) => w.userId === userId) || {
      userId,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      totalPurchased: 0,
    }
  );
}

function saveWallet(wallet: CreditWallet): void {
  const wallets = ls<CreditWallet[]>(KEYS.WALLETS, []);
  const idx = wallets.findIndex((w) => w.userId === wallet.userId);
  if (idx !== -1) wallets[idx] = wallet;
  else wallets.push(wallet);
  lsSet(KEYS.WALLETS, wallets);
  notifyCreditChanged();
}

function recordTransaction(tx: Omit<CreditTransaction, 'id' | 'createdAt'>): CreditTransaction {
  const all = ls<CreditTransaction[]>(KEYS.TRANSACTIONS, []);
  const newTx: CreditTransaction = {
    ...tx,
    id: genId('tx'),
    createdAt: new Date().toISOString(),
  };
  all.unshift(newTx);
  lsSet(KEYS.TRANSACTIONS, all);
  notifyCreditChanged();
  return newTx;
}

// ---------- Public API ----------

/** Get all transactions for a user (most recent first) */
export function getTransactions(userId: string): CreditTransaction[] {
  const all = ls<CreditTransaction[]>(KEYS.TRANSACTIONS, []);
  return all
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Award the new-user starter bonus.
 * Safe to call multiple times — idempotent (checks for prior starter_bonus tx).
 */
export function awardStarterBonus(userId: string, userName: string): boolean {
  const existing = getTransactions(userId).find((t) => t.kind === 'starter_bonus');
  if (existing) return false; // already awarded

  const wallet = getWallet(userId);
  const newBalance = wallet.balance + 20;
  saveWallet({
    ...wallet,
    balance: newBalance,
    totalEarned: wallet.totalEarned + 20,
  });
  recordTransaction({
    userId,
    kind: 'starter_bonus',
    amount: +20,
    balanceAfter: newBalance,
    note: `🎁 Welcome bonus — enjoy your first 20 credits, ${userName.split(' ')[0]}!`,
  });
  return true;
}

/**
 * Deduct credits when a learner's booking is accepted.
 * Returns false if balance is insufficient.
 */
export function spendCredits(
  learnerId: string,
  cost: number,
  bookingId: string,
  skillTitle: string,
  teacherName: string
): { success: boolean; error?: string } {
  if (cost <= 0) return { success: true };
  const wallet = getWallet(learnerId);
  if (wallet.balance < cost) {
    return {
      success: false,
      error: `Insufficient credits. You need ${cost} credits but have ${wallet.balance}.`,
    };
  }
  const newBalance = wallet.balance - cost;
  saveWallet({
    ...wallet,
    balance: newBalance,
    totalSpent: wallet.totalSpent + cost,
  });
  recordTransaction({
    userId: learnerId,
    kind: 'spent_learning',
    amount: -cost,
    balanceAfter: newBalance,
    relatedBookingId: bookingId,
    relatedSkillTitle: skillTitle,
    relatedUserName: teacherName,
    note: `Enrolled in "${skillTitle}" with ${teacherName} (${cost} credits)`,
  });
  return { success: true };
}

/**
 * Award credits to teacher after a session is completed.
 * Idempotent — checks for prior earned_teaching tx with same bookingId.
 */
export function awardTeachingCredits(
  teacherId: string,
  credits: number,
  bookingId: string,
  skillTitle: string,
  learnerName: string
): boolean {
  const existing = getTransactions(teacherId).find(
    (t) => t.kind === 'earned_teaching' && t.relatedBookingId === bookingId
  );
  if (existing) return false; // already rewarded

  const wallet = getWallet(teacherId);
  const newBalance = wallet.balance + credits;
  saveWallet({
    ...wallet,
    balance: newBalance,
    totalEarned: wallet.totalEarned + credits,
  });
  recordTransaction({
    userId: teacherId,
    kind: 'earned_teaching',
    amount: +credits,
    balanceAfter: newBalance,
    relatedBookingId: bookingId,
    relatedSkillTitle: skillTitle,
    relatedUserName: learnerName,
    note: `✅ Earned ${credits} credits for completing "${skillTitle}" with ${learnerName}`,
  });
  return true;
}

/**
 * Refund learner if booking is cancelled before acceptance.
 */
export function refundCredits(
  learnerId: string,
  cost: number,
  bookingId: string,
  skillTitle: string
): void {
  if (cost <= 0) return;
  const wallet = getWallet(learnerId);
  const newBalance = wallet.balance + cost;
  saveWallet({
    ...wallet,
    balance: newBalance,
    totalSpent: Math.max(0, wallet.totalSpent - cost),
  });
  recordTransaction({
    userId: learnerId,
    kind: 'refund_cancelled',
    amount: +cost,
    balanceAfter: newBalance,
    relatedBookingId: bookingId,
    relatedSkillTitle: skillTitle,
    note: `↩️ Refund: Booking for "${skillTitle}" was cancelled`,
  });
}

/**
 * Demo checkout — simulates purchasing a credit package.
 * In production, replace this body with real payment gateway webhook handler.
 */
export function purchaseCreditPackage(
  userId: string,
  pkg: CreditPackage,
  userName: string
): { success: boolean; error?: string } {
  // For new-user-only package, enforce the restriction
  if (pkg.isLimitedToNewUsers) {
    const existing = getTransactions(userId).find((t) => t.kind === 'starter_bonus');
    if (existing) {
      return { success: false, error: 'The Starter Bonus is only available once per account.' };
    }
  }

  const wallet = getWallet(userId);
  const newBalance = wallet.balance + pkg.credits;
  saveWallet({
    ...wallet,
    balance: newBalance,
    totalPurchased: wallet.totalPurchased + pkg.credits,
    totalEarned: pkg.priceINR === 0 ? wallet.totalEarned + pkg.credits : wallet.totalEarned,
  });
  recordTransaction({
    userId,
    kind: pkg.priceINR === 0 ? 'starter_bonus' : 'purchased',
    amount: +pkg.credits,
    balanceAfter: newBalance,
    packageId: pkg.id,
    note:
      pkg.priceINR === 0
        ? `🎁 Claimed free "${pkg.name}" — ${pkg.credits} credits added`
        : `💳 [DEMO] Purchased "${pkg.name}" for ₹${pkg.priceINR} — ${pkg.credits} credits added`,
  });
  return { success: true };
}

// ---------- Skill Credit Cost ----------

/** How many credits does a particular skill session cost? */
export function getSkillCreditCost(skillId: string): number {
  const map = ls<Record<string, number>>(KEYS.SKILL_CREDIT_COSTS, {});
  return map[skillId] ?? DEFAULT_CREDIT_COST_PER_SESSION;
}

export function setSkillCreditCost(skillId: string, cost: number): void {
  const map = ls<Record<string, number>>(KEYS.SKILL_CREDIT_COSTS, {});
  map[skillId] = cost;
  lsSet(KEYS.SKILL_CREDIT_COSTS, map);
}

// ---------- Sponsored Learning ----------

export function getSponsoredRequests(): SponsoredRequest[] {
  return ls<SponsoredRequest[]>(KEYS.SPONSORED, []);
}

export function createSponsoredRequest(
  data: Omit<SponsoredRequest, 'id' | 'createdAt' | 'status'>
): SponsoredRequest {
  const all = getSponsoredRequests();
  const newReq: SponsoredRequest = {
    ...data,
    id: genId('spon'),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  all.unshift(newReq);
  lsSet(KEYS.SPONSORED, all);
  return newReq;
}

export function updateSponsoredStatus(
  id: string,
  status: 'approved' | 'rejected'
): void {
  const all = getSponsoredRequests();
  const idx = all.findIndex((r) => r.id === id);
  if (idx !== -1) {
    all[idx].status = status;
    lsSet(KEYS.SPONSORED, all);
  }
}

/** Initialize wallets & realistic transaction history for demo seed users */
export function initializeDemoWallets(): void {
  const seedWallets: { userId: string; balance: number; earned: number; spent: number }[] = [
    { userId: 'user-maya',   balance: 75,  earned: 90,  spent: 15 },
    { userId: 'user-david',  balance: 120, earned: 130, spent: 10 },
    { userId: 'user-elena',  balance: 200, earned: 210, spent: 10 },
    { userId: 'user-carlos', balance: 40,  earned: 50,  spent: 10 },
    { userId: 'user-priya',  balance: 60,  earned: 70,  spent: 10 },
    { userId: 'user-marcus', balance: 50,  earned: 60,  spent: 10 },
    { userId: 'user-admin',  balance: 500, earned: 500, spent: 0  },
  ];

  const existing = ls<CreditWallet[]>(KEYS.WALLETS, []);
  if (existing.length === 0) {
    const wallets: CreditWallet[] = seedWallets.map((s) => ({
      userId: s.userId,
      balance: s.balance,
      totalEarned: s.earned,
      totalSpent: s.spent,
      totalPurchased: 0,
    }));
    lsSet(KEYS.WALLETS, wallets);
  }

  // Seed sample transactions if none exist
  const existingTx = ls<CreditTransaction[]>(KEYS.TRANSACTIONS, []);
  if (existingTx.length === 0) {
    const now = Date.now();
    const seedTransactions: CreditTransaction[] = [
      {
        id: 'tx-maya-1',
        userId: 'user-maya',
        kind: 'starter_bonus',
        amount: 20,
        balanceAfter: 20,
        note: '🎁 Welcome bonus — 20 initial skill credits!',
        createdAt: new Date(now - 7 * 86400000).toISOString(),
      },
      {
        id: 'tx-maya-2',
        userId: 'user-maya',
        kind: 'earned_teaching',
        amount: 20,
        balanceAfter: 40,
        relatedSkillTitle: 'Modern UI/UX Design & Component Systems in Figma',
        relatedUserName: 'David Chen',
        note: '✅ Earned 20 credits for completing "Modern UI/UX Design & Component Systems in Figma" with David Chen',
        createdAt: new Date(now - 4 * 86400000).toISOString(),
      },
      {
        id: 'tx-maya-3',
        userId: 'user-maya',
        kind: 'spent_learning',
        amount: -15,
        balanceAfter: 25,
        relatedSkillTitle: 'Acoustic Guitar Fingerpicking',
        relatedUserName: 'Elena Rostova',
        note: 'Enrolled in "Acoustic Guitar Fingerpicking" with Elena Rostova (15 credits)',
        createdAt: new Date(now - 3 * 86400000).toISOString(),
      },
      {
        id: 'tx-maya-4',
        userId: 'user-maya',
        kind: 'earned_teaching',
        amount: 50,
        balanceAfter: 75,
        relatedSkillTitle: 'Botanical Watercolor Painting & Wet-on-Wet Blending',
        relatedUserName: 'Marcus Vance',
        note: '✅ Earned 50 credits for completing "Botanical Watercolor Painting" workshop',
        createdAt: new Date(now - 86400000).toISOString(),
      },
      {
        id: 'tx-david-1',
        userId: 'user-david',
        kind: 'starter_bonus',
        amount: 20,
        balanceAfter: 20,
        note: '🎁 Welcome bonus — 20 initial skill credits!',
        createdAt: new Date(now - 8 * 86400000).toISOString(),
      },
      {
        id: 'tx-david-2',
        userId: 'user-david',
        kind: 'earned_teaching',
        amount: 110,
        balanceAfter: 130,
        relatedSkillTitle: 'Full-Stack React & Modern TypeScript Architecture',
        relatedUserName: 'Carlos Ramirez',
        note: '✅ Earned 110 credits across mentoring sessions in TypeScript & React',
        createdAt: new Date(now - 2 * 86400000).toISOString(),
      },
      {
        id: 'tx-david-3',
        userId: 'user-david',
        kind: 'spent_learning',
        amount: -10,
        balanceAfter: 120,
        relatedSkillTitle: 'Acoustic Guitar Fingerpicking',
        relatedUserName: 'Elena Rostova',
        note: 'Enrolled in "Acoustic Guitar Fingerpicking" with Elena Rostova (10 credits)',
        createdAt: new Date(now - 86400000).toISOString(),
      },
    ];
    lsSet(KEYS.TRANSACTIONS, seedTransactions);
  }

  notifyCreditChanged();
}

/** Reset credit data to original defaults */
export function resetCreditData(): void {
  localStorage.removeItem(KEYS.WALLETS);
  localStorage.removeItem(KEYS.TRANSACTIONS);
  localStorage.removeItem(KEYS.SPONSORED);
  localStorage.removeItem(KEYS.SKILL_CREDIT_COSTS);
  initializeDemoWallets();
}
