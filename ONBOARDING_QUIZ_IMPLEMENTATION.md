# Eco Onboarding Quiz Implementation

## Overview
Created a comprehensive onboarding quiz system inspired by the Claisen health quiz structure, but optimized for eco-tracking and environmental awareness purposes. This replaces traditional authentication with an engaging user experience that gathers preferences and personalizes the app.

## Features Implemented

### 1. **Quiz Type System** (`src/types/ecoQuiz.js`)
- **Question Types:**
  - `TEXT_INPUT`: For name, location entry
  - `SINGLE_CHOICE`: For selecting one option (eco level, transport mode, notifications)
  - `MULTIPLE_CHOICE`: For selecting multiple goals/concerns
  - `SCALE`: For numerical input (daily commute distance)

- **9-Step Onboarding Flow:**
  1. Welcome & name input
  2. Location input
  3. Environmental goals (multi-select)
  4. Current eco habits level
  5. Primary transportation mode
  6. Daily commute distance
  7. Environmental concerns (multi-select)
  8. Notification preferences
  9. Completion screen

### 2. **User Profile Calculation**
- **Emissions Estimation:**
  - Calculates annual CO2 emissions based on transport mode and commute distance
  - Emission factors per mile:
    - Solo car: 0.96 lbs CO2/mile
    - Carpool: 0.48 lbs CO2/mile
    - Public transit: 0.14 lbs CO2/mile
    - Bike/Walk: 0 lbs CO2/mile
    - Mixed: 0.5 lbs CO2/mile (average)

- **Personalized Recommendations:**
  - Transportation suggestions based on current habits
  - Goal-specific action items (e.g., "Explore Green Spaces")
  - Concern-based alerts (e.g., "Enable AQI monitoring")
  - Priority levels (high/medium) for recommendations

- **Eco Level Classification:**
  - Beginner: Just getting started
  - Intermediate: Making progress
  - Advanced: Eco-conscious
  - Expert: Environmental champion

### 3. **Storage System** (`src/utils/quizStorage.js`)
- **Auto-save Progress:**
  - Saves quiz progress to localStorage after each answer
  - Allows users to resume if they leave mid-quiz
  - Automatically clears stale data (>7 days old)

- **Profile Management:**
  - Saves completed profile to localStorage
  - Supports partial updates
  - Tracks quiz completion status

- **Storage Keys:**
  - `ecotrackr_onboarding_quiz`: Quiz progress
  - `ecotrackr_user_profile`: Completed user profile
  - `ecotrackr_quiz_completed`: Completion flag

### 4. **Onboarding UI** (`src/pages/Onboarding.jsx`)
- **Modern, Engaging Design:**
  - Animated progress bar
  - Step-by-step navigation with back button
  - Icon-based visual guidance (Leaf, MapPin, Target, etc.)
  - Glassmorphism cards with emerald theme
  - Smooth transitions between steps

- **Input Validation:**
  - Required field validation
  - Minimum selection enforcement for multi-choice
  - Real-time answer validation
  - Enter key support for text inputs

- **Interactive Elements:**
  - Single/multi-choice buttons with visual feedback
  - Slider with custom labels for distance input
  - Emoji icons for choices
  - "Skip for now" option

### 5. **Completion Screen** (`src/pages/OnboardingComplete.jsx`)
- **Welcome Experience:**
  - Personalized greeting with user's name
  - Custom welcome message based on their answers
  - Animated success celebration

- **Profile Summary Cards:**
  - Eco level badge
  - Annual emissions estimate
  - Active goals count

- **Personalized Recommendations:**
  - Priority-tagged action items
  - Category-based suggestions (transportation, discovery, tracking, health)
  - Visual icons and descriptions

- **Call to Action:**
  - "Start Tracking My Impact" button
  - Note about updating preferences later

### 6. **Routing Integration** (`src/pages/index.jsx`)
- **Protected Routes:**
  - Automatically redirects to `/onboarding` if quiz not completed
  - Checks `isQuizCompleted()` on every protected route
  - Allows access to onboarding pages without protection

- **Layout Handling:**
  - Onboarding pages render WITHOUT bottom navigation
  - Main app pages render WITH layout after quiz completion
  - Seamless transition after onboarding

- **Route Structure:**
  ```
  /onboarding → Quiz flow
  /onboarding-complete → Summary & recommendations
  / (and all other routes) → Protected, require quiz completion
  ```

## User Flow

1. **First Visit:**
   - User lands on `/` → redirected to `/onboarding`
   - Goes through 9-step quiz
   - Completes quiz → navigates to `/onboarding-complete`
   - Views personalized summary and recommendations
   - Clicks "Start Tracking My Impact" → navigates to `/dashboard`

2. **Returning Visit:**
   - Quiz completed: Direct access to all pages
   - Quiz incomplete: Redirected to `/onboarding`
   - Resume from saved progress if available

3. **Skip Option:**
   - User can skip quiz with minimal profile
   - Still gains access to app
   - Can complete quiz later from profile

## Data Structure

### User Profile Schema:
```javascript
{
  name: string,
  location: string,
  ecoLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  primaryGoals: string[],
  transportMode: string,
  dailyCommute: number,
  concerns: string[],
  notifications: 'daily' | 'weekly' | 'important' | 'none',
  estimatedAnnualEmissions: number,
  recommendations: Array<{
    category: string,
    priority: 'high' | 'medium',
    title: string,
    description: string,
    icon: string
  }>,
  welcomeMessage: string,
  completedAt: string
}
```

## Technical Highlights

- **No Backend Required:** Fully client-side using localStorage
- **Progressive Enhancement:** Auto-save ensures no data loss
- **Responsive Design:** Mobile-first with Tailwind CSS
- **Accessible:** Keyboard navigation, ARIA labels
- **Performance:** Optimized with React hooks (useState, useEffect)
- **Modular:** Easily add/remove/modify questions

## Future Enhancements (Ready for Auth Integration)

When adding authentication later:
- Replace `saveUserProfile()` with API call
- Sync localStorage to backend database
- Add JWT token management
- Enable cross-device profile sync
- Add social login options
- Implement email verification

## Benefits Over Traditional Login

1. **Immediate Value:** Users see personalized content before "signing up"
2. **Higher Engagement:** Interactive quiz vs. boring form
3. **Data Collection:** Gather preferences upfront for better UX
4. **Lower Barrier:** No password required initially
5. **Educational:** Users learn about their environmental impact
6. **Personalization:** App feels custom-built for each user

This onboarding system creates a delightful first impression while gathering the data needed to personalize every aspect of the EcoTrackr experience! 🌱

