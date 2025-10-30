/**
 * Quiz Storage Utilities
 * Handles storing and retrieving quiz data from sessionStorage (per-session only)
 * Quiz must be completed on every app visit/refresh
 */

const QUIZ_STORAGE_KEY = 'ripple_onboarding_quiz';
const PROFILE_STORAGE_KEY = 'ripple_user_profile';
const QUIZ_COMPLETED_KEY = 'ripple_quiz_completed';

/**
 * Save quiz progress (sessionStorage only - cleared on refresh)
 */
export const saveQuizProgress = (answers, currentStep) => {
  try {

    
    const data = {
      answers,
      currentStep,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving quiz progress:', error);
    return false;
  }
};

/**
 * Load quiz progress (sessionStorage only - persists during same tab session)
 */
export const loadQuizProgress = () => {
  try {
    const data = sessionStorage.getItem(QUIZ_STORAGE_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.error('Error loading quiz progress:', error);
    return null;
  }
};

/**
 * Clear quiz progress
 */
export const clearQuizProgress = () => {
  try {
    sessionStorage.removeItem(QUIZ_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing quiz progress:', error);
    return false;
  }
};

/**
 * Save user profile after quiz completion (sessionStorage - valid for current session only)
 */
export const saveUserProfile = (profile) => {
  try {
    sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    sessionStorage.setItem(QUIZ_COMPLETED_KEY, 'true');
    clearQuizProgress(); // Clear quiz progress after completion
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

/**
 * Load user profile (sessionStorage - valid for current session only)
 */
export const loadUserProfile = () => {
  try {
    const data = sessionStorage.getItem(PROFILE_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
};

/**
 * Check if quiz is completed (sessionStorage - valid for current session only)
 */
export const isQuizCompleted = () => {
  try {
    return sessionStorage.getItem(QUIZ_COMPLETED_KEY) === 'true';
  } catch (error) {
    console.error('Error checking quiz completion:', error);
    return false;
  }
};

/**
 * Reset all quiz and profile data (for retaking quiz or logout)
 */
export const resetAllQuizData = () => {
  try {
    sessionStorage.removeItem(QUIZ_STORAGE_KEY);
    sessionStorage.removeItem(PROFILE_STORAGE_KEY);
    sessionStorage.removeItem(QUIZ_COMPLETED_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting quiz data:', error);
    return false;
  }
};

/**
 * Update user profile (partial update, sessionStorage only)
 */
export const updateUserProfile = (updates) => {
  try {
    const currentProfile = loadUserProfile();
    if (!currentProfile) return false;
    
    const updatedProfile = { ...currentProfile, ...updates };
    sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

