export type SkillCategory =
  | 'Programming'
  | 'Web Development'
  | 'Design'
  | 'Music'
  | 'Languages'
  | 'Academics'
  | 'Photography'
  | 'Cooking'
  | 'Fitness'
  | 'Communication'
  | 'Other';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type LearningMode = 'online' | 'in-person' | 'both';

export interface TimeSlot {
  id: string;
  day: string;
  time: string;
  isOccupied?: boolean;
}

export interface CurriculumModule {
  title: string;
  duration: string;
  topics: string[];
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  locality: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  bio: string;
  teachSkills: string[];
  learnSkills: string[];
  preferredMode: LearningMode;
  rating: number;
  reviewCount: number;
  completedSessions: number;
  totalHoursExchanged?: number;
  responseTime?: string;
  endorsements?: Record<string, number>;
  badges?: UserBadge[];
  savedSkillIds?: string[];
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Skill {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  teacherLocality: string;
  title: string;
  category: SkillCategory;
  description: string;
  level: SkillLevel;
  mode: LearningMode;
  locality: string;
  latitude?: number;
  longitude?: number;
  coverImage?: string;
  curriculum?: CurriculumModule[];
  whatYouWillLearn?: string[];
  meetingVenue?: string;
  availableSlots: TimeSlot[];
  durationMinutes: number;
  maxLearners: number;
  prerequisites: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  skillId: string;
  skillTitle: string;
  skillCategory: SkillCategory;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  learnerId: string;
  learnerName: string;
  learnerAvatar: string;
  learnerEmail: string;
  slot: TimeSlot;
  mode: LearningMode;
  message: string;
  isBarterExchange: boolean;
  proposedBarterSkill?: string;
  status: BookingStatus;
  meetingLink?: string;
  meetingVenue?: string;
  sessionNotes?: string;
  createdAt: string;
  completedAt?: string;
  hasReview?: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  skillId: string;
  skillTitle: string;
  teacherId: string;
  learnerId: string;
  learnerName: string;
  learnerAvatar: string;
  rating: number;
  communicationRating: number;
  qualityRating: number;
  punctualityRating: number;
  feedback: string;
  createdAt: string;
  isReported?: boolean;
  reportReason?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  bookingId?: string;
  skillTitle?: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'booking_request'
    | 'booking_accepted'
    | 'booking_rejected'
    | 'booking_cancelled'
    | 'session_completed'
    | 'new_review'
    | 'new_message'
    | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface SkillRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterLocality: string;
  title: string;
  category: SkillCategory;
  description: string;
  offeredInReturn: string[];
  preferredMode: LearningMode;
  urgency: 'flexible' | 'this_week' | 'weekend';
  responsesCount: number;
  status: 'open' | 'matched' | 'closed';
  createdAt: string;
}

export interface SkillCircle {
  id: string;
  name: string;
  locality: string;
  category: SkillCategory;
  description: string;
  image: string;
  membersCount: number;
  meetupCadence: string;
  tags: string[];
  joined?: boolean;
}

export interface MatchResult {
  skill: Skill;
  score: number; // 0 to 100
  reasons: string[];
  isReciprocal: boolean;
  reciprocalSkill?: string;
  distanceKm?: number;
}
