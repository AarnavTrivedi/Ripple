# 🚀 Quick Start - Testing the Onboarding Quiz

## How to Test

### 1. **Clear Previous Data (First-Time Experience)**

Open browser console and run:
```javascript
localStorage.clear()
window.location.href = '/'
```

You should be **automatically redirected** to `/onboarding`.

---

### 2. **Complete the Quiz**

Walk through all 9 steps:

**Step 1 - Welcome:**
- Enter name: "Sarah" → Click Continue

**Step 2 - Location:**
- Enter: "Arlington, Virginia" → Click Continue

**Step 3 - Goals (Multi-select):**
- Click: "Reduce my carbon footprint"
- Click: "Track and monitor emissions"
- Click: "Improve local air quality"
→ Click Continue

**Step 4 - Eco Habits (Single choice):**
- Select: "Making Progress" → Click Continue

**Step 5 - Transportation:**
- Select: "Personal Vehicle (Solo)" → Click Continue

**Step 6 - Commute Distance:**
- Drag slider to: 25 miles → Click Continue

**Step 7 - Concerns (Multi-select):**
- Click: "Air Quality & Pollution"
- Click: "Climate Change"
→ Click Continue

**Step 8 - Notifications:**
- Select: "Weekly Summaries" → Click Continue

**Step 9 - Completion:**
- Click: "Start Your Journey"

---

### 3. **View Summary Page**

You should see:
- ✨ Animated sparkles
- "Welcome, Sarah! 🌱"
- Personalized welcome message
- 3 summary cards:
  - **Eco Level:** Intermediate
  - **Annual Emissions:** 6,000 lbs CO₂ (25 miles × 2 × 250 days × 0.96)
  - **Active Goals:** 3 Goals Set
- **Personalized Recommendations:**
  - 🚙 Consider Carpooling [High Priority]
  - 📊 Enable Location Tracking [High]
  - 🌫️ Monitor Air Quality [High]

Click: **"Start Tracking My Impact"** → Navigate to Dashboard

---

### 4. **Verify Profile Integration**

Navigate to Profile page (`/profile`):

Should display:
- Name: **Sarah**
- Location: **📍 Arlington, Virginia**
- Eco Level: **🌱 Intermediate Level**
- Eco Points: **1250**

Settings section should have:
- "Retake Onboarding Quiz" button

---

### 5. **Test Resume Functionality**

Open browser console:
```javascript
// Answer 3 questions in the quiz
// Then clear the page without completing
localStorage.getItem('ecotrackr_onboarding_quiz')
// Should show saved progress

// Refresh the page
window.location.reload()
// Should resume at Step 4
```

---

### 6. **Test Skip Functionality**

Clear data and restart:
```javascript
localStorage.clear()
window.location.href = '/onboarding'
```

Click: **"Skip for now"**

Should:
- Create minimal profile
- Navigate directly to `/dashboard`
- Profile shows "Eco Warrior" as default name

---

### 7. **Test Retake Quiz**

From Profile page:
1. Click: "Retake Onboarding Quiz"
2. Confirm dialog should appear
3. Click: "OK"
4. Should redirect to `/onboarding`
5. Quiz should start fresh (all previous answers cleared)

---

### 8. **Test Protected Routes**

Clear quiz data:
```javascript
localStorage.removeItem('ecotrackr_quiz_completed')
window.location.href = '/dashboard'
```

Should **auto-redirect** to `/onboarding`.

Complete quiz, then try:
```javascript
window.location.href = '/dashboard'
```

Should **load Dashboard** directly (no redirect).

---

## Console Commands for Testing

### View Current Profile
```javascript
JSON.parse(localStorage.getItem('ecotrackr_user_profile'))
```

### View Quiz Progress
```javascript
JSON.parse(localStorage.getItem('ecotrackr_onboarding_quiz'))
```

### Check Quiz Completion
```javascript
localStorage.getItem('ecotrackr_quiz_completed')
// Returns: "true" or null
```

### Clear All Quiz Data
```javascript
localStorage.removeItem('ecotrackr_onboarding_quiz')
localStorage.removeItem('ecotrackr_user_profile')
localStorage.removeItem('ecotrackr_quiz_completed')
window.location.reload()
```

### Simulate Stale Data (8 days old)
```javascript
const staleData = {
  answers: { welcome: "Test" },
  currentStep: 2,
  timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
}
localStorage.setItem('ecotrackr_onboarding_quiz', JSON.stringify(staleData))
window.location.reload()
// Should auto-clear and start fresh
```

---

## Expected Calculations

### Emissions Formula
```
Annual CO₂ = Daily Commute × 2 (round trip) × 250 (work days) × Emission Factor

Examples:
- 10 miles, solo car:    10 × 2 × 250 × 0.96 = 4,800 lbs CO₂
- 25 miles, solo car:    25 × 2 × 250 × 0.96 = 12,000 lbs CO₂
- 25 miles, carpool:     25 × 2 × 250 × 0.48 = 6,000 lbs CO₂
- 25 miles, public:      25 × 2 × 250 × 0.14 = 1,750 lbs CO₂
- 10 miles, bike:        0 lbs CO₂
```

### Recommendation Logic

**Carpool Recommendation (High Priority):**
- Triggers if: `transportMode === 'car_solo' && dailyCommute > 10`
- Shows potential savings: 50% reduction

**Bike Recommendation (Medium Priority):**
- Triggers if: `dailyCommute < 5 && transportMode !== 'bike_walk'`

**Green Spaces Recommendation:**
- Triggers if: `primaryGoals.includes('find_green_spaces')`

**AQI Monitoring Recommendation:**
- Triggers if: `concerns.includes('air_quality')`

**Location Tracking Recommendation:**
- Triggers if: `primaryGoals.includes('track_emissions')`

---

## Visual Checklist

- [ ] Progress bar animates smoothly
- [ ] Step icons change for each question
- [ ] Back button appears from Step 2 onwards
- [ ] Text inputs support Enter key
- [ ] Multi-select choices show checkmarks
- [ ] Single-select choices have radio behavior
- [ ] Slider shows current value in large font
- [ ] Completion screen has bouncing animation
- [ ] Summary cards display correctly
- [ ] Recommendations show priority tags
- [ ] "Start Tracking" button has gradient
- [ ] Profile page shows quiz data
- [ ] Retake quiz shows confirmation dialog

---

## Common Issues & Solutions

### Issue: Quiz doesn't redirect
**Solution:** Check `isQuizCompleted()` returns false
```javascript
import { isQuizCompleted } from '@/utils/quizStorage'
console.log(isQuizCompleted()) // Should be false
```

### Issue: Progress not saving
**Solution:** Check localStorage quota
```javascript
try {
  localStorage.setItem('test', 'test')
  console.log('LocalStorage available')
} catch (e) {
  console.error('LocalStorage full or disabled')
}
```

### Issue: Recommendations not showing
**Solution:** Check answer data structure
```javascript
const profile = JSON.parse(localStorage.getItem('ecotrackr_user_profile'))
console.log(profile.recommendations)
```

---

## Performance Checks

All transitions should be **< 200ms**.

To test:
1. Open DevTools → Performance tab
2. Start recording
3. Click "Continue" through quiz
4. Stop recording
5. Check transition timings

Expected:
- State update: ~10ms
- Animation: 200ms
- Total perceived latency: ~210ms ✅

---

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all inputs
- [ ] Enter key submits text inputs
- [ ] Space bar toggles choices
- [ ] Arrow keys move slider
- [ ] Focus indicators visible

### Screen Reader
- [ ] All inputs have labels
- [ ] Buttons have descriptive text
- [ ] Progress announced
- [ ] Error messages readable

---

## Browser Compatibility

Tested in:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

localStorage is supported in all modern browsers.

---

**Ready to Test!** 🚀

Start with: `localStorage.clear()` and visit `/` to experience the full onboarding flow!

