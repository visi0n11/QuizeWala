const STORAGE_KEY_PROFILE = 'mindsprint_user_profile_v1';
const STORAGE_KEY_CUSTOM_QUIZZES = 'mindsprint_custom_quizzes_v1';

export const BADGE_DEFINITIONS = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first quiz',
    icon: 'Compass',
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Score 100% on any quiz',
    icon: 'Target',
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a Speed Sprint mode challenge',
    icon: 'Zap',
  },
  {
    id: 'survivor',
    title: 'Sole Survivor',
    description: 'Conquer Sudden Death survival mode',
    icon: 'Shield',
  },
  {
    id: 'streak_master',
    title: 'Combo Titan',
    description: 'Achieve a 5-question answer streak',
    icon: 'Flame',
  },
  {
    id: 'quiz_architect',
    title: 'Quiz Architect',
    description: 'Create or AI-generate a custom quiz',
    icon: 'Cpu',
  },
  {
    id: 'polymath',
    title: 'Polymath',
    description: 'Complete quizzes across 3 different categories',
    icon: 'Sparkles',
  },
];

export function getStoredProfile() {
  if (typeof window === 'undefined') {
    return createDefaultProfile();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultProfile(),
      ...parsed,
    };
  } catch {
    return createDefaultProfile();
  }
}

function createDefaultProfile() {
  return {
    name: 'Knowledge Seeker',
    xp: 0,
    level: 1,
    streakDays: 1,
    lastPlayedDate: new Date().toISOString().split('T')[0],
    soundEnabled: true,
    darkMode: true,
    attempts: [],
    badges: [],
    bookmarkedQuestionIds: [],
  };
}

export function saveProfile(profile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

export function recordQuizAttempt(attempt) {
  const profile = getStoredProfile();
  const newlyEarnedBadges = [];

  // Update XP & level
  const updatedXp = profile.xp + attempt.xpEarned;
  const updatedLevel = Math.floor(updatedXp / 250) + 1;

  // Streak calculation
  const today = new Date().toISOString().split('T')[0];
  let streak = profile.streakDays;
  if (profile.lastPlayedDate !== today) {
    const lastDate = profile.lastPlayedDate ? new Date(profile.lastPlayedDate) : null;
    if (lastDate) {
      const diffDays = Math.round((new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }
    }
  }

  // Update attempts
  const updatedAttempts = [attempt, ...profile.attempts].slice(0, 100);

  // Check badges
  const currentBadges = new Set(profile.badges);

  // First step
  if (!currentBadges.has('first_step')) {
    currentBadges.add('first_step');
    newlyEarnedBadges.push('first_step');
  }

  // Perfectionist (100% accuracy)
  if (attempt.accuracy === 100 && !currentBadges.has('perfectionist')) {
    currentBadges.add('perfectionist');
    newlyEarnedBadges.push('perfectionist');
  }

  // Speed demon
  if (attempt.gameMode === 'sprint' && !currentBadges.has('speed_demon')) {
    currentBadges.add('speed_demon');
    newlyEarnedBadges.push('speed_demon');
  }

  // Survivor
  if (attempt.gameMode === 'survival' && attempt.correctCount >= 5 && !currentBadges.has('survivor')) {
    currentBadges.add('survivor');
    newlyEarnedBadges.push('survivor');
  }

  // Combo titan
  if (attempt.maxCombo >= 5 && !currentBadges.has('streak_master')) {
    currentBadges.add('streak_master');
    newlyEarnedBadges.push('streak_master');
  }

  // Polymath
  const categoriesPlayed = new Set(updatedAttempts.map(a => a.category));
  if (categoriesPlayed.size >= 3 && !currentBadges.has('polymath')) {
    currentBadges.add('polymath');
    newlyEarnedBadges.push('polymath');
  }

  const updatedProfile = {
    ...profile,
    xp: updatedXp,
    level: updatedLevel,
    streakDays: streak,
    lastPlayedDate: today,
    attempts: updatedAttempts,
    badges: Array.from(currentBadges),
  };

  saveProfile(updatedProfile);
  return { updatedProfile, newlyEarnedBadges };
}

export function getCustomQuizzes() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_QUIZZES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomQuiz(quiz) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomQuizzes();
    const filtered = existing.filter(q => q.id !== quiz.id);
    const updated = [quiz, ...filtered];
    localStorage.setItem(STORAGE_KEY_CUSTOM_QUIZZES, JSON.stringify(updated));

    // Award Quiz Architect badge
    const profile = getStoredProfile();
    if (!profile.badges.includes('quiz_architect')) {
      profile.badges.push('quiz_architect');
      saveProfile(profile);
    }
  } catch (e) {
    console.error('Failed to save custom quiz', e);
  }
}

export function deleteCustomQuiz(quizId) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomQuizzes();
    const updated = existing.filter(q => q.id !== quizId);
    localStorage.setItem(STORAGE_KEY_CUSTOM_QUIZZES, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete custom quiz', e);
  }
}
