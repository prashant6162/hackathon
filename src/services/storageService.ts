import {
  User,
  Skill,
  Booking,
  Review,
  Notification,
  Message,
  BookingStatus,
  SkillRequest,
  SkillCircle,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SKILLS,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MESSAGES,
  INITIAL_SKILL_REQUESTS,
  INITIAL_SKILL_CIRCLES,
} from './mockData';
import { isFirebaseConfigured, db } from '../config/firebase';
import { sounds } from './soundService';
import {
  getWallet,
  spendCredits,
  awardTeachingCredits,
  refundCredits,
  initializeDemoWallets,
  resetCreditData,
} from './creditService';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
} from 'firebase/firestore';

const STORAGE_KEYS = {
  USERS: 'skillconnect_users_v2',
  SKILLS: 'skillconnect_skills_v2',
  BOOKINGS: 'skillconnect_bookings_v2',
  REVIEWS: 'skillconnect_reviews_v2',
  NOTIFICATIONS: 'skillconnect_notifications_v2',
  MESSAGES: 'skillconnect_messages_v2',
  REQUESTS: 'skillconnect_requests_v2',
  CIRCLES: 'skillconnect_circles_v2',
  ACTIVE_USER_ID: 'skillconnect_active_user_id_v2',
};

// Event listener mechanism for reactive in-app state updates
type ListenerCallback = () => void;
const listeners = new Set<ListenerCallback>();

export function subscribeToDataChanges(callback: ListenerCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyDataChanged() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Error in change listener', e);
    }
  });
}

// Local Storage Helper
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyDataChanged();
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

// Initialize Local Storage with default seed data if not present
export function initializeStorageIfNeeded(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setLocalItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SKILLS)) {
    setLocalItem(STORAGE_KEYS.SKILLS, INITIAL_SKILLS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    setLocalItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    setLocalItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    setLocalItem(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    setLocalItem(STORAGE_KEYS.REQUESTS, INITIAL_SKILL_REQUESTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CIRCLES)) {
    setLocalItem(STORAGE_KEYS.CIRCLES, INITIAL_SKILL_CIRCLES);
  }
  initializeDemoWallets();
}

export function resetDemoDataToDefaults(): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(INITIAL_SKILLS));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_SKILL_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(INITIAL_SKILL_CIRCLES));
  resetCreditData();
  notifyDataChanged();
}

// ========================
// USERS SERVICE
// ========================

export async function getUsers(): Promise<User[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map((d) => d.data() as User);
    } catch (e) {
      console.warn('Firebase getUsers failed, using local fallback', e);
    }
  }
  return getLocalItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}

export async function updateUser(user: User): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    } catch (e) {
      console.warn('Firebase updateUser failed, using local', e);
    }
  }
  const users = getLocalItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  setLocalItem(STORAGE_KEYS.USERS, users);

  // Cascade avatar & name updates across skills, bookings, requests, reviews
  try {
    const skills = getLocalItem<Skill[]>(STORAGE_KEYS.SKILLS, INITIAL_SKILLS);
    let skillsChanged = false;
    skills.forEach((s) => {
      if (s.teacherId === user.id) {
        s.teacherName = user.name;
        s.teacherAvatar = user.avatar;
        skillsChanged = true;
      }
    });
    if (skillsChanged) setLocalItem(STORAGE_KEYS.SKILLS, skills);

    const bookings = getLocalItem<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    let bookingsChanged = false;
    bookings.forEach((b) => {
      if (b.teacherId === user.id) {
        b.teacherName = user.name;
        b.teacherAvatar = user.avatar;
        bookingsChanged = true;
      }
      if (b.learnerId === user.id) {
        b.learnerName = user.name;
        b.learnerAvatar = user.avatar;
        bookingsChanged = true;
      }
    });
    if (bookingsChanged) setLocalItem(STORAGE_KEYS.BOOKINGS, bookings);

    const requests = getLocalItem<SkillRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_SKILL_REQUESTS);
    let requestsChanged = false;
    requests.forEach((r) => {
      if (r.requesterId === user.id) {
        r.requesterName = user.name;
        r.requesterAvatar = user.avatar;
        requestsChanged = true;
      }
    });
    if (requestsChanged) setLocalItem(STORAGE_KEYS.REQUESTS, requests);

    const reviews = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    let reviewsChanged = false;
    reviews.forEach((rv) => {
      if (rv.learnerId === user.id) {
        rv.learnerName = user.name;
        rv.learnerAvatar = user.avatar;
        reviewsChanged = true;
      }
    });
    if (reviewsChanged) setLocalItem(STORAGE_KEYS.REVIEWS, reviews);
  } catch (err) {
    console.error('Error cascading user profile updates', err);
  }
}

export async function toggleSaveSkill(userId: string, skillId: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  const saved = user.savedSkillIds || [];
  const exists = saved.includes(skillId);
  const updatedSaved = exists ? saved.filter((id) => id !== skillId) : [...saved, skillId];
  await updateUser({ ...user, savedSkillIds: updatedSaved });
  sounds.playPop();
  return !exists;
}

// ========================
// SKILLS SERVICE
// ========================

export async function getSkills(): Promise<Skill[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'skills'));
      return snap.docs.map((d) => d.data() as Skill);
    } catch (e) {
      console.warn('Firebase getSkills failed, using local', e);
    }
  }
  return getLocalItem<Skill[]>(STORAGE_KEYS.SKILLS, INITIAL_SKILLS);
}

export async function getSkillById(id: string): Promise<Skill | null> {
  const skills = await getSkills();
  const found = skills.find((s) => s.id === id);
  if (found) {
    // Increment view count dynamically for realism
    found.viewsCount = (found.viewsCount || 100) + 1;
    setLocalItem(STORAGE_KEYS.SKILLS, skills);
  }
  return found || null;
}

export async function createSkill(skillData: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>): Promise<Skill> {
  const newSkill: Skill = {
    ...skillData,
    id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    rating: 5.0,
    reviewCount: 0,
    viewsCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'skills', newSkill.id), newSkill);
    } catch (e) {
      console.warn('Firebase createSkill error, saving local', e);
    }
  }

  const skills = getLocalItem<Skill[]>(STORAGE_KEYS.SKILLS, INITIAL_SKILLS);
  skills.unshift(newSkill);
  setLocalItem(STORAGE_KEYS.SKILLS, skills);
  sounds.playSuccess();
  return newSkill;
}

export async function updateSkill(skill: Skill): Promise<void> {
  const updated = { ...skill, updatedAt: new Date().toISOString() };
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'skills', updated.id), updated, { merge: true });
    } catch (e) {
      console.warn('Firebase updateSkill error', e);
    }
  }
  const skills = getLocalItem<Skill[]>(STORAGE_KEYS.SKILLS, INITIAL_SKILLS);
  const idx = skills.findIndex((s) => s.id === updated.id);
  if (idx !== -1) {
    skills[idx] = updated;
    setLocalItem(STORAGE_KEYS.SKILLS, skills);
  }
  sounds.playPop();
}

export async function deleteSkill(skillId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'skills', skillId));
    } catch (e) {
      console.warn('Firebase deleteSkill error', e);
    }
  }
  const skills = getLocalItem<Skill[]>(STORAGE_KEYS.SKILLS, INITIAL_SKILLS);
  const filtered = skills.filter((s) => s.id !== skillId);
  setLocalItem(STORAGE_KEYS.SKILLS, filtered);
}

// ========================
// SKILL REQUESTS (COMMUNITY WANTED BOARD)
// ========================

export async function getSkillRequests(): Promise<SkillRequest[]> {
  return getLocalItem<SkillRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_SKILL_REQUESTS);
}

export async function createSkillRequest(
  data: Omit<SkillRequest, 'id' | 'createdAt' | 'responsesCount' | 'status'>
): Promise<SkillRequest> {
  const newReq: SkillRequest = {
    ...data,
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    responsesCount: 0,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  const requests = await getSkillRequests();
  requests.unshift(newReq);
  setLocalItem(STORAGE_KEYS.REQUESTS, requests);
  sounds.playSuccess();
  return newReq;
}

export async function deleteSkillRequest(id: string): Promise<void> {
  const requests = await getSkillRequests();
  const filtered = requests.filter((r) => r.id !== id);
  setLocalItem(STORAGE_KEYS.REQUESTS, filtered);
}

// ========================
// SKILL CIRCLES (NEIGHBORHOOD HUBS)
// ========================

export async function getSkillCircles(): Promise<SkillCircle[]> {
  return getLocalItem<SkillCircle[]>(STORAGE_KEYS.CIRCLES, INITIAL_SKILL_CIRCLES);
}

export async function toggleJoinCircle(circleId: string): Promise<boolean> {
  const circles = await getSkillCircles();
  const idx = circles.findIndex((c) => c.id === circleId);
  if (idx === -1) return false;

  const circle = circles[idx];
  const willJoin = !circle.joined;
  circle.joined = willJoin;
  circle.membersCount += willJoin ? 1 : -1;
  setLocalItem(STORAGE_KEYS.CIRCLES, circles);
  sounds.playPop();
  return willJoin;
}

// ========================
// BOOKINGS SERVICE
// ========================

export async function getBookings(): Promise<Booking[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'bookings'));
      return snap.docs.map((d) => d.data() as Booking);
    } catch (e) {
      console.warn('Firebase getBookings error', e);
    }
  }
  return getLocalItem<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
}

export async function getBookingsForUser(userId: string): Promise<{ asLearner: Booking[]; asTeacher: Booking[] }> {
  const bookings = await getBookings();
  return {
    asLearner: bookings.filter((b) => b.learnerId === userId),
    asTeacher: bookings.filter((b) => b.teacherId === userId),
  };
}

export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const existingBookings = await getBookings();

  // Prevent duplicate active booking for same user + skill + slot
  const isDuplicate = existingBookings.some(
    (b) =>
      b.learnerId === bookingData.learnerId &&
      b.skillId === bookingData.skillId &&
      b.slot.id === bookingData.slot.id &&
      (b.status === 'pending' || b.status === 'accepted')
  );

  if (isDuplicate) {
    return {
      success: false,
      error: 'You already have an active or pending booking for this session slot.',
    };
  }

  const bookingType = bookingData.bookingType || (bookingData.isBarterExchange ? 'barter' : 'credit');
  const creditCost = bookingData.creditCost ?? 10;

  // Validate balance if booking with credits
  if (bookingType === 'credit') {
    const wallet = getWallet(bookingData.learnerId);
    if (wallet.balance < creditCost) {
      return {
        success: false,
        error: `Insufficient credits. You need ${creditCost} credits, but your current balance is ${wallet.balance} credits.`,
      };
    }
  }

  const newBooking: Booking = {
    ...bookingData,
    id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    status: 'pending',
    bookingType,
    creditCost,
    sponsoredReason: bookingData.sponsoredReason,
    creditsDeducted: false,
    creditsAwarded: false,
    meetingLink: bookingData.mode === 'in-person' ? undefined : `https://meet.skillconnect.local/room-${Math.random().toString(36).substr(2, 6)}`,
    meetingVenue: bookingData.meetingVenue || 'Designated Community Center / Park Pavilion',
    sessionNotes: bookingType === 'barter'
      ? `Mutual Barter Agreement: Proposing to exchange ${bookingData.proposedBarterSkill || 'reciprocal mentorship'} for this session.`
      : bookingType === 'sponsored'
      ? `Sponsored Learning Request: Community-supported seat request (${bookingData.sponsoredReason || 'Learning grant'}). 0 credits required.`
      : `Credit-Based Learning: ${creditCost} credits enrolled.`,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'bookings', newBooking.id), newBooking);
    } catch (e) {
      console.warn('Firebase createBooking error', e);
    }
  }

  existingBookings.unshift(newBooking);
  setLocalItem(STORAGE_KEYS.BOOKINGS, existingBookings);
  sounds.playSuccess();

  // Notify the teacher about new booking request
  await createNotification({
    userId: bookingData.teacherId,
    title: bookingData.isBarterExchange ? 'Mutual Barter Proposal! 🤝' : 'New Session Request 📬',
    message: `${bookingData.learnerName} requested to learn "${bookingData.skillTitle}" on ${bookingData.slot.day} (${bookingData.slot.time}).`,
    type: 'booking_request',
    link: '/teaching',
  });

  return { success: true, booking: newBooking };
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  actionByUserId?: string
): Promise<void> {
  const bookings = await getBookings();
  const idx = bookings.findIndex((b) => b.id === bookingId);
  if (idx === -1) return;

  const b = bookings[idx];
  b.status = newStatus;
  if (newStatus === 'completed') {
    b.completedAt = new Date().toISOString();
  }

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'bookings', bookingId), b, { merge: true });
    } catch (e) {
      console.warn('Firebase updateBookingStatus error', e);
    }
  }

  setLocalItem(STORAGE_KEYS.BOOKINGS, bookings);
  sounds.playChime();

  // Send relevant notification and handle credit transactions
  if (newStatus === 'accepted') {
    if (b.bookingType === 'credit' && !b.creditsDeducted) {
      const deduction = spendCredits(
        b.learnerId,
        b.creditCost || 10,
        b.id,
        b.skillTitle,
        b.teacherName
      );
      if (deduction.success) {
        b.creditsDeducted = true;
      } else {
        console.warn('Credit deduction note:', deduction.error);
      }
    }
    await createNotification({
      userId: b.learnerId,
      title: 'Booking Confirmed! 🎉',
      message: `${b.teacherName} accepted your session for "${b.skillTitle}"! Check your schedule.`,
      type: 'booking_accepted',
      link: '/enrollments',
    });
  } else if (newStatus === 'rejected') {
    if (b.bookingType === 'credit' && b.creditsDeducted) {
      refundCredits(b.learnerId, b.creditCost || 10, b.id, b.skillTitle);
      b.creditsDeducted = false;
    }
    await createNotification({
      userId: b.learnerId,
      title: 'Booking Update',
      message: `${b.teacherName} was unable to accept your request for "${b.skillTitle}". You can explore other slots.`,
      type: 'booking_rejected',
      link: '/explore',
    });
  } else if (newStatus === 'completed') {
    if (!b.creditsAwarded) {
      const rewardCredits = b.creditCost || 10;
      awardTeachingCredits(
        b.teacherId,
        rewardCredits,
        b.id,
        b.skillTitle,
        b.learnerName
      );
      b.creditsAwarded = true;
    }
    await createNotification({
      userId: b.learnerId,
      title: 'Session Marked Completed 🎓',
      message: `Your learning session for "${b.skillTitle}" is completed! Leave a review to help the community.`,
      type: 'session_completed',
      link: '/reviews',
    });
    await createNotification({
      userId: b.teacherId,
      title: 'Teaching Credits Earned! 🪙',
      message: `You earned ${b.creditCost || 10} credits for completing "${b.skillTitle}" with ${b.learnerName}!`,
      type: 'system',
      link: '/dashboard',
    });
  } else if (newStatus === 'cancelled') {
    if (b.bookingType === 'credit' && b.creditsDeducted) {
      refundCredits(b.learnerId, b.creditCost || 10, b.id, b.skillTitle);
      b.creditsDeducted = false;
    }
    const notifyTarget = actionByUserId === b.learnerId ? b.teacherId : b.learnerId;
    await createNotification({
      userId: notifyTarget,
      title: 'Session Cancelled',
      message: `The booking for "${b.skillTitle}" on ${b.slot.day} has been cancelled.`,
      type: 'booking_cancelled',
      link: '/bookings',
    });
  }
}

// ========================
// REVIEWS SERVICE
// ========================

export async function getReviews(): Promise<Review[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      return snap.docs.map((d) => d.data() as Review);
    } catch (e) {
      console.warn('Firebase getReviews error', e);
    }
  }
  return getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
}

export async function getReviewsForTeacher(teacherId: string): Promise<Review[]> {
  const reviews = await getReviews();
  return reviews.filter((r) => r.teacherId === teacherId);
}

export async function getReviewsForSkill(skillId: string): Promise<Review[]> {
  const reviews = await getReviews();
  return reviews.filter((r) => r.skillId === skillId);
}

export async function createReview(
  reviewData: Omit<Review, 'id' | 'createdAt'>
): Promise<{ success: boolean; error?: string }> {
  // Prevent self rating
  if (reviewData.learnerId === reviewData.teacherId) {
    return { success: false, error: 'You cannot review your own session.' };
  }

  const reviews = await getReviews();
  // Prevent duplicate review for same booking
  const existing = reviews.find((r) => r.bookingId === reviewData.bookingId);
  if (existing) {
    return { success: false, error: 'A review has already been submitted for this session.' };
  }

  const newReview: Review = {
    ...reviewData,
    id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'reviews', newReview.id), newReview);
    } catch (e) {
      console.warn('Firebase createReview error', e);
    }
  }

  reviews.unshift(newReview);
  setLocalItem(STORAGE_KEYS.REVIEWS, reviews);
  sounds.playSuccess();

  // Mark booking as reviewed
  const bookings = await getBookings();
  const bIdx = bookings.findIndex((b) => b.id === reviewData.bookingId);
  if (bIdx !== -1) {
    bookings[bIdx].hasReview = true;
    setLocalItem(STORAGE_KEYS.BOOKINGS, bookings);
  }

  // Recalculate teacher's average rating and skill's average rating
  const teacherReviews = reviews.filter((r) => r.teacherId === reviewData.teacherId);
  const avgRating = teacherReviews.reduce((acc, cur) => acc + cur.rating, 0) / teacherReviews.length;

  const users = await getUsers();
  const teacherIdx = users.findIndex((u) => u.id === reviewData.teacherId);
  if (teacherIdx !== -1) {
    users[teacherIdx].rating = Math.round(avgRating * 10) / 10;
    users[teacherIdx].reviewCount = teacherReviews.length;
    users[teacherIdx].completedSessions = (users[teacherIdx].completedSessions || 0) + 1;
    users[teacherIdx].totalHoursExchanged = (users[teacherIdx].totalHoursExchanged || 10) + 2;
    setLocalItem(STORAGE_KEYS.USERS, users);
  }

  const skills = await getSkills();
  const skillIdx = skills.findIndex((s) => s.id === reviewData.skillId);
  if (skillIdx !== -1) {
    const skillReviews = reviews.filter((r) => r.skillId === reviewData.skillId);
    const sAvg = skillReviews.reduce((acc, cur) => acc + cur.rating, 0) / skillReviews.length;
    skills[skillIdx].rating = Math.round(sAvg * 10) / 10;
    skills[skillIdx].reviewCount = skillReviews.length;
    setLocalItem(STORAGE_KEYS.SKILLS, skills);
  }

  // Send notification to teacher
  await createNotification({
    userId: reviewData.teacherId,
    title: 'New Review Received! ⭐',
    message: `${reviewData.learnerName} left a ${reviewData.rating}-star review for "${reviewData.skillTitle}".`,
    type: 'new_review',
    link: '/reviews',
  });

  return { success: true };
}

export async function reportReview(reviewId: string, reason: string): Promise<void> {
  const reviews = await getReviews();
  const idx = reviews.findIndex((r) => r.id === reviewId);
  if (idx !== -1) {
    reviews[idx].isReported = true;
    reviews[idx].reportReason = reason;
    setLocalItem(STORAGE_KEYS.REVIEWS, reviews);
  }
}

export async function dismissReport(reviewId: string): Promise<void> {
  const reviews = await getReviews();
  const idx = reviews.findIndex((r) => r.id === reviewId);
  if (idx !== -1) {
    reviews[idx].isReported = false;
    delete reviews[idx].reportReason;
    setLocalItem(STORAGE_KEYS.REVIEWS, reviews);
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  const reviews = await getReviews();
  const filtered = reviews.filter((r) => r.id !== reviewId);
  setLocalItem(STORAGE_KEYS.REVIEWS, filtered);
}

// ========================
// NOTIFICATIONS SERVICE
// ========================

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const all = getLocalItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  return all.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createNotification(
  notifData: Omit<Notification, 'id' | 'createdAt' | 'read'>
): Promise<void> {
  const newNotif: Notification = {
    ...notifData,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const all = getLocalItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  all.unshift(newNotif);
  setLocalItem(STORAGE_KEYS.NOTIFICATIONS, all);
  sounds.playChime();
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const all = getLocalItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const idx = all.findIndex((n) => n.id === id);
  if (idx !== -1) {
    all[idx].read = true;
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, all);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const all = getLocalItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  all.forEach((n) => {
    if (n.userId === userId) {
      n.read = true;
    }
  });
  setLocalItem(STORAGE_KEYS.NOTIFICATIONS, all);
}

// ========================
// MESSAGES SERVICE
// ========================

export async function getMessages(): Promise<Message[]> {
  return getLocalItem<Message[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
}

export async function getMessagesBetweenUsers(userA: string, userB: string): Promise<Message[]> {
  const all = await getMessages();
  return all.filter(
    (m) =>
      (m.senderId === userA && m.receiverId === userB) ||
      (m.senderId === userB && m.receiverId === userA)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function sendMessage(
  msgData: Omit<Message, 'id' | 'timestamp' | 'read'>
): Promise<Message> {
  const newMsg: Message = {
    ...msgData,
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  const all = await getMessages();
  all.push(newMsg);
  setLocalItem(STORAGE_KEYS.MESSAGES, all);
  sounds.playPop();

  await createNotification({
    userId: msgData.receiverId,
    title: `New Message from ${msgData.senderName} 💬`,
    message: msgData.text.length > 50 ? `${msgData.text.substring(0, 50)}...` : msgData.text,
    type: 'new_message',
    link: '/messages',
  });

  return newMsg;
}
