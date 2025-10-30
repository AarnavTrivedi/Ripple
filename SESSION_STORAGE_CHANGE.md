# ⚠️ Quiz Behavior Changed - Refresh Requires Re-Quiz

## What Changed

The quiz system has been modified to use **sessionStorage** instead of **localStorage**, which means:

### Before:
- ✅ Quiz completed once → Persistent across browser refreshes
- ✅ Profile saved permanently
- ✅ Can close browser and return later

### After:
- ⚠️ Quiz completed → Valid for **current browser session only**
- ⚠️ Refresh page → Quiz completion cleared, must retake quiz
- ⚠️ Close browser → All quiz data lost
- ⚠️ Open new tab → Separate session, must complete quiz again

## Technical Changes

All storage functions now use `sessionStorage` instead of `localStorage`:

```javascript
// Before (localStorage - persistent)
localStorage.setItem('ecotrackr_quiz_completed', 'true')

// After (sessionStorage - session only)
sessionStorage.setItem('ecotrackr_quiz_completed', 'true')
```

### Modified Functions:
- `saveQuizProgress()` - Now uses sessionStorage
- `loadQuizProgress()` - Now uses sessionStorage  
- `clearQuizProgress()` - Now clears sessionStorage
- `saveUserProfile()` - Now uses sessionStorage
- `loadUserProfile()` - Now uses sessionStorage
- `isQuizCompleted()` - Now checks sessionStorage
- `resetAllQuizData()` - Now clears sessionStorage
- `updateUserProfile()` - Now updates sessionStorage

## User Experience

### Current Session Flow:
```
1. User visits app → Quiz required
2. Completes quiz → Access granted
3. Navigate between pages → No re-quiz needed
4. Refresh page → Quiz completion cleared → Must retake
```

### New Session Flow:
```
1. Close browser / Open new tab → Quiz completion cleared
2. Visit app again → Quiz required from scratch
```

## What Persists During Session:

✅ **Same Tab Navigation:**
- Quiz completion status
- User profile data
- Quiz progress (if incomplete)

❌ **After Refresh/New Tab:**
- Quiz completion status ❌ CLEARED
- User profile data ❌ CLEARED
- Quiz progress ❌ CLEARED

## Benefits of This Approach:

1. **Enhanced Privacy:** No persistent data stored
2. **Fresh Start:** Each session is independent
3. **Testing Friendly:** Easy to test quiz flow repeatedly
4. **Security:** Data cleared when browser closed
5. **Compliance:** No long-term storage concerns

## Drawbacks:

1. **User Friction:** Must complete quiz on every visit
2. **Lost Progress:** Refresh clears everything
3. **Multiple Tabs:** Each tab needs separate quiz completion
4. **Mobile Inconvenience:** Background apps may clear session

## Testing the New Behavior:

### Test 1: Refresh Clears Quiz
```javascript
// Complete the quiz
// Then refresh the page
window.location.reload()
// Should redirect to /onboarding
```

### Test 2: New Tab Requires Quiz
```javascript
// Complete quiz in Tab 1
// Open new tab and visit app
// Should require quiz again
```

### Test 3: Session Persistence
```javascript
// Complete quiz
// Navigate between pages
// Quiz should NOT be required until refresh
```

## If You Want Persistent Storage Again:

To revert to persistent behavior, change all instances in `src/utils/quizStorage.js`:

```javascript
// Change this:
sessionStorage.setItem(...)
sessionStorage.getItem(...)
sessionStorage.removeItem(...)

// Back to this:
localStorage.setItem(...)
localStorage.getItem(...)
localStorage.removeItem(...)
```

## Recommendation for Production:

Consider a **hybrid approach**:
- Use **localStorage** for quiz completion persistence
- Use **sessionStorage** for sensitive user data
- Add expiration timestamps (e.g., 24-hour validity)
- Implement "Remember Me" checkbox option

Example:
```javascript
export const isQuizCompleted = () => {
  const completedTime = localStorage.getItem('quiz_completed_time')
  if (!completedTime) return false
  
  const now = Date.now()
  const elapsed = now - parseInt(completedTime)
  const hoursSinceComplete = elapsed / (1000 * 60 * 60)
  
  // Require re-quiz after 24 hours
  if (hoursSinceComplete > 24) {
    localStorage.removeItem('quiz_completed_time')
    return false
  }
  
  return true
}
```

---

**Current Status:** ✅ Modified to use sessionStorage - quiz required on every refresh/new session

