import { User, Skill, MatchResult } from '../types';

/**
 * Calculates the Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Normalizes text for keyword matching.
 */
function clean(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
}

/**
 * Skill matching algorithm that ranks opportunities for a given user.
 */
export function computeSkillMatch(user: User, skill: Skill): MatchResult {
  // If user is the teacher, score is 0
  if (user.id === skill.teacherId) {
    return {
      skill,
      score: 0,
      reasons: ['Offered by you'],
      isReciprocal: false,
    };
  }

  let score = 0;
  const reasons: string[] = [];
  let isReciprocal = false;
  let reciprocalSkill: string | undefined = undefined;

  const skillText = clean(
    `${skill.title} ${skill.category} ${skill.description} ${skill.tags.join(' ')}`
  );

  // 1. Topic & Learning Interest Alignment (Up to 40 pts)
  let interestMatched = false;
  let matchedInterestName = '';

  for (const learnSkill of user.learnSkills) {
    const term = clean(learnSkill);
    if (!term) continue;

    // Direct token or phrase match
    const words = term.split(/\s+/).filter(w => w.length > 2);
    const matchesAllWords = words.length > 0 && words.every(w => skillText.includes(w));
    const matchesAnySignificantWord = words.some(w => skillText.includes(w));

    if (matchesAllWords) {
      score += 40;
      interestMatched = true;
      matchedInterestName = learnSkill;
      reasons.push(`Direct match for your interest: "${learnSkill}"`);
      break;
    } else if (matchesAnySignificantWord && !interestMatched) {
      score += 25;
      interestMatched = true;
      matchedInterestName = learnSkill;
      reasons.push(`Relates to your interest in "${learnSkill}"`);
    }
  }

  if (!interestMatched) {
    // Check general category relevance
    score += 10;
  }

  // 2. Reciprocal Skill Barter Match (Up to 25 pts)
  // Check if current user teaches something this skill's teacher wants to learn
  // (We check user's teachSkills vs teacher's profile/skills if available, or common exchange keywords)
  for (const teachSkill of user.teachSkills) {
    const tTerm = clean(teachSkill);
    if (!tTerm) continue;

    // Check if the skill mentions barter or prerequisites matching,
    // or if we match against known teacher desired skills
    const teachWords = tTerm.split(/\s+/).filter(w => w.length > 2);
    const matchesTeach = teachWords.some(w => clean(skill.prerequisites).includes(w) || clean(skill.description).includes(w));

    if (matchesTeach) {
      score += 25;
      isReciprocal = true;
      reciprocalSkill = teachSkill;
      reasons.push(`Reciprocal opportunity: Teacher seeks expertise in "${teachSkill}"`);
      break;
    }
  }

  // Also check direct user list cross-check if we know the teacher's desired skills
  // (e.g. Maya teaches UI/UX and Elena wants UI/UX)
  if (!isReciprocal && user.teachSkills.length > 0) {
    const knownTeachers: Record<string, string[]> = {
      'user-elena': ['UI/UX Design', 'Figma Prototyping', 'Authentic Mexican Cooking'],
      'user-david': ['Acoustic Guitar', 'French Language', 'Portrait Photography'],
      'user-carlos': ['Full-Stack React', 'TypeScript Mastery', 'Portrait Photography'],
      'user-priya': ['Public Speaking', 'UI/UX Design', 'Watercolor Painting'],
      'user-marcus': ['Acoustic Guitar', 'Spanish Conversational', 'Italian Cooking'],
      'user-maya': ['Python Programming', 'Spanish Conversational', 'Sourdough Bread Making']
    };

    const teacherWants = knownTeachers[skill.teacherId] || [];
    for (const want of teacherWants) {
      if (user.teachSkills.some(t => clean(t).includes(clean(want)) || clean(want).includes(clean(t)))) {
        score += 25;
        isReciprocal = true;
        reciprocalSkill = want;
        reasons.push(`Perfect Barter Match: Teacher wants to learn "${want}"!`);
        break;
      }
    }
  }

  // 3. Preferred Learning Mode Alignment (Up to 15 pts)
  if (user.preferredMode === 'both' || skill.mode === 'both' || user.preferredMode === skill.mode) {
    score += 15;
    const modeLabel = skill.mode === 'both' ? 'Flexible (Online & In-Person)' : skill.mode;
    reasons.push(`Matches your preferred mode (${modeLabel})`);
  } else {
    score += 5;
  }

  // 4. Locality & Proximity (Up to 15 pts)
  let distanceKm: number | undefined = undefined;
  if (
    user.latitude !== undefined &&
    user.longitude !== undefined &&
    skill.latitude !== undefined &&
    skill.longitude !== undefined
  ) {
    distanceKm = calculateHaversineDistance(
      user.latitude,
      user.longitude,
      skill.latitude,
      skill.longitude
    );

    if (distanceKm <= 5) {
      score += 15;
      reasons.push(`Nearby: approx ${distanceKm} km away`);
    } else if (distanceKm <= 15) {
      score += 10;
      reasons.push(`In your metro area: approx ${distanceKm} km away`);
    } else {
      score += 5;
      reasons.push(`Located ${distanceKm} km away`);
    }
  } else if (
    user.locality &&
    skill.locality &&
    (user.locality.toLowerCase().includes(skill.locality.toLowerCase()) ||
      skill.locality.toLowerCase().includes(user.locality.toLowerCase()) ||
      (user.city && skill.locality.toLowerCase().includes(user.city.toLowerCase())))
  ) {
    score += 12;
    reasons.push(`Matches your locality (${skill.locality})`);
  }

  // 5. Mentor Rating & Trust (Up to 5 pts)
  if (skill.rating >= 4.8) {
    score += 5;
    reasons.push(`Highly rated mentor: ★ ${skill.rating.toFixed(1)} (${skill.reviewCount} reviews)`);
  } else if (skill.rating >= 4.0) {
    score += 3;
  }

  // Cap score between 10 and 100
  const finalScore = Math.min(100, Math.max(15, score));

  return {
    skill,
    score: finalScore,
    reasons: reasons.slice(0, 3), // Top 3 highlights
    isReciprocal,
    reciprocalSkill,
    distanceKm,
  };
}

/**
 * Rank an array of skills for a user by match score.
 */
export function rankSkillsForUser(user: User, skills: Skill[]): MatchResult[] {
  return skills
    .map(skill => computeSkillMatch(user, skill))
    .filter(match => match.skill.teacherId !== user.id)
    .sort((a, b) => b.score - a.score);
}
