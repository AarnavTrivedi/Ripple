# 🎨 EcoTrackr Onboarding Quiz - Visual Flow Guide

## Quiz Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER LANDS ON APP (/)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Check Quiz     │
                    │ Completion     │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
         ┌──────────┐              ┌──────────┐
         │ Complete │              │ Not Done │
         └─────┬────┘              └─────┬────┘
               │                         │
               ▼                         ▼
        ┌─────────────┐          ┌────────────────┐
        │ Load        │          │ Redirect to    │
        │ Dashboard   │          │ /onboarding    │
        └─────────────┘          └───────┬────────┘
                                         │
        ┌────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────┐
│                     ONBOARDING QUIZ FLOW                          │
└───────────────────────────────────────────────────────────────────┘

STEP 1: Welcome 🌱
┌──────────────────────────────────────────┐
│  Welcome to EcoTrackr!                   │
│  Let's personalize your journey          │
│                                          │
│  What's your name?                       │
│  ┌────────────────────────────────┐     │
│  │ [Enter your first name]        │     │
│  └────────────────────────────────┘     │
│                                          │
│  [Skip for now]          [Continue →]   │
└──────────────────────────────────────────┘
                    ↓

STEP 2: Location 📍
┌──────────────────────────────────────────┐
│  Where are you located?                  │
│  We'll tailor environmental data         │
│                                          │
│  City or County, State                   │
│  ┌────────────────────────────────┐     │
│  │ [e.g., Arlington, Virginia]    │     │
│  └────────────────────────────────┘     │
│                                          │
│  [← Back]               [Continue →]    │
└──────────────────────────────────────────┘
                    ↓

STEP 3: Environmental Goals 🎯
┌──────────────────────────────────────────┐
│  What are your environmental goals?      │
│  Select all that apply                   │
│                                          │
│  ┌────────────────────────────────┐     │
│  │ 🌱 Reduce my carbon footprint   │     │
│  └────────────────────────────────┘     │
│  ┌────────────────────────────────┐     │
│  │ 📊 Track and monitor emissions  │     │
│  └────────────────────────────────┘     │
│  ┌────────────────────────────────┐     │
│  │ 🌳 Discover green spaces nearby │     │
│  └────────────────────────────────┘     │
│  [+ 3 more options]                     │
│                                          │
│  [← Back]               [Continue →]    │
└──────────────────────────────────────────┘
                    ↓

STEP 4: Current Eco Habits 🌿
┌──────────────────────────────────────────┐
│  How would you describe your             │
│  current eco-habits?                     │
│                                          │
│  ○ Just Getting Started                  │
│     New to environmental action          │
│                                          │
│  ○ Making Progress                       │
│     I recycle and make eco choices       │
│                                          │
│  ○ Eco-Conscious                        │
│     I actively track my impact           │
│                                          │
│  ○ Environmental Champion               │
│     I lead by example                    │
│                                          │
│  [← Back]               [Continue →]    │
└──────────────────────────────────────────┘
                    ↓

STEP 5: Transportation Mode 🚗
┌──────────────────────────────────────────┐
│  How do you usually get around?          │
│  Transportation is a major source        │
│                                          │
│  ○ 🚗 Personal Vehicle (Solo)            │
│                                          │
│  ○ 🚙 Carpool/Rideshare                 │
│                                          │
│  ○ 🚌 Public Transportation             │
│                                          │
│  ○ 🚴 Bike or Walk                       │
│                                          │
│  ○ 🔄 Mixed - Varies by Day             │
│                                          │
│  [← Back]               [Continue →]    │
└──────────────────────────────────────────┘
                    ↓

STEP 6: Daily Commute 🛣️
┌──────────────────────────────────────────┐
│  How far do you travel daily?            │
│  This helps calculate your impact        │
│                                          │
│         25 miles                         │
│                                          │
│  ●────────●──────────────────────────    │
│  0        25        50              100  │
│                                          │
│  Work from home     ~25 miles    100+   │
│                                          │
│  [← Back]               [Continue →]    │
└──────────────────────────────────────────┘
                    ↓

STEP 7: Environmental Concerns 🌫️
┌──────────────────────────────────────────┐
│  What environmental issues concern you?  │
│  We'll prioritize relevant insights      │
│                                          │
│  ┌────────────────────────────────┐     │
│  │ 🌫️ Air Quality & Pollution      │     │
│  └────────────────────────────────┘     │
│  ┌────────────────────────────────┐     │
│  │ 🌡️ Climate Change               │     │
│  └────────────────────────────────┘     │
│  ┌────────────────────────────────┐     │
│  │ ♻️ Waste & Plastic Pollution    │     │
│  └────────────────────────────────┘     │
│  [+ 3 more options]                     │
│                                          │
│  [← Back]               [Continue →]    │
└──────────────────────────────────────────┘
                    ↓

STEP 8: Notifications 🔔
┌──────────────────────────────────────────┐
│  Stay informed about your impact         │
│  Choose your notification preference     │
│                                          │
│  ○ Daily Updates                         │
│     Daily eco-tips and air quality       │
│                                          │
│  ○ Weekly Summaries                      │
│     Weekly progress reports              │
│                                          │
│  ○ Important Only                        │
│     Critical alerts and milestones       │
│                                          │
│  ○ No Notifications                      │
│     I'll check the app myself            │
│                                          │
│  [← Back]               [Continue →]    │
└──────────────────────────────────────────┘
                    ↓

STEP 9: Completion ✨
┌──────────────────────────────────────────┐
│          ✨                               │
│       (bouncing)                         │
│                                          │
│  You're all set!                         │
│  Let's start your eco journey            │
│                                          │
│  Based on your answers, we've            │
│  personalized your dashboard             │
│                                          │
│  [Start Your Journey ✨]                 │
└──────────────────────────────────────────┘
                    ↓
            [Navigate to Summary]
                    ↓

┌───────────────────────────────────────────────────────────────────┐
│                   ONBOARDING COMPLETE SCREEN                      │
└───────────────────────────────────────────────────────────────────┘

         ✨ (animated sparkles)
         
    Welcome, Sarah! 🌱
    
    We're excited to help you start your
    environmental journey! Every small action counts.
    
    Based on your commute, you currently generate
    approximately 3,000 lbs of CO2 annually from
    transportation. Together, we'll help you reduce
    that number.

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 🏆          │  │ 📉          │  │ 🎯          │
│ Eco Level   │  │ Annual      │  │ Active      │
│             │  │ Emissions   │  │ Goals       │
│ Intermediate│  │ 3,000 lbs   │  │ 3 Goals Set │
└─────────────┘  └─────────────┘  └─────────────┘

    ✨ Your Personalized Recommendations
    
    🚙  Consider Carpooling  [High Priority]
        You could reduce your annual emissions by
        1,500 lbs by carpooling 2-3 days per week.
        
    📊  Enable Location Tracking  [High]
        Track your daily routes to get accurate
        emission calculations and insights.
        
    🌫️  Monitor Air Quality  [High]
        Enable AQI alerts to know when air
        quality is poor in your area.

    ┌──────────────────────────────────────┐
    │  Start Tracking My Impact  →         │
    └──────────────────────────────────────┘
    
    You can update your preferences anytime
    in your profile

                    ↓
            [Navigate to Dashboard]
                    ↓

┌───────────────────────────────────────────────────────────────────┐
│                      MAIN APP EXPERIENCE                          │
└───────────────────────────────────────────────────────────────────┘

Dashboard now shows:
✓ Personalized greeting: "Welcome back, Sarah!"
✓ Transport emissions tracking based on quiz data
✓ Recommended features highlighted
✓ AQI alerts enabled (from concerns)
✓ Weekly notification schedule set

Map page shows:
✓ Green spaces layer pre-enabled (from goals)
✓ AQI Index layer visible (from concerns)
✓ Location set to Arlington, Virginia

Profile page shows:
✓ Name: Sarah
✓ Location: 📍 Arlington, Virginia
✓ Eco Level: 🌱 Intermediate Level
✓ Option to "Retake Onboarding Quiz"
```

## Progress Bar States

```
Step 1/9: [▮▯▯▯▯▯▯▯▯] 11%  "Welcome"
Step 2/9: [▮▮▯▯▯▯▯▯▯] 22%  "Location"
Step 3/9: [▮▮▮▯▯▯▯▯▯] 33%  "Goals"
Step 4/9: [▮▮▮▮▯▯▯▯▯] 44%  "Habits"
Step 5/9: [▮▮▮▮▮▯▯▯▯] 56%  "Transport"
Step 6/9: [▮▮▮▮▮▮▯▯▯] 67%  "Commute"
Step 7/9: [▮▮▮▮▮▮▮▯▯] 78%  "Concerns"
Step 8/9: [▮▮▮▮▮▮▮▮▯] 89%  "Notifications"
Step 9/9: [▮▮▮▮▮▮▮▮▮] 100% "Complete"
```

## Color Scheme

```
┌─────────────────────────────────────┐
│ Primary Colors                      │
├─────────────────────────────────────┤
│ █ Emerald-500  (Primary buttons)    │
│ █ Emerald-400  (Icons, accents)     │
│ █ Emerald-900  (Dark backgrounds)   │
│ █ Amber-400    (Eco points, badges) │
│ █ Red-500      (Logout, warnings)   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Background Gradient                 │
├─────────────────────────────────────┤
│ Top:    Emerald-900                 │
│ Middle: #1a2f26                     │
│ Bottom: #0f1f18                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Card Styles                         │
├─────────────────────────────────────┤
│ bg-emerald-950/40                   │
│ border-2 border-emerald-500/20      │
│ backdrop-blur-xl                    │
└─────────────────────────────────────┘
```

## Animations

```
Transition between steps:
  opacity: 1 → 0 → 1  (200ms)
  scale: 1 → 0.95 → 1 (200ms)

Progress bar:
  width: animated with ease-out (300ms)

Completion screen:
  Sparkle icon: bounce animation
  Background rings: ping animation (slower)
  Cards: fade-in with stagger

Button hover:
  bg-color transition (200ms)
  scale: 1 → 1.02 (150ms)
  shadow intensity increase
```

## Responsive Breakpoints

```
Mobile (< 640px):
  - Single column layout
  - Full-width cards
  - Larger touch targets (48px min)
  - Bottom navigation sticky

Tablet (640px - 1024px):
  - 2-column grid for summary cards
  - Wider max-width (640px)
  - Side padding increase

Desktop (> 1024px):
  - 3-column grid for summary cards
  - Max-width container (1024px)
  - Hover states enabled
  - Larger text sizes
```

## User Flow Edge Cases

```
Case 1: Mid-quiz Exit
  User answers 3 questions → closes browser
  ↓
  localStorage saves progress automatically
  ↓
  User returns later
  ↓
  Quiz resumes at Step 4

Case 2: Skip Quiz
  User clicks "Skip for now"
  ↓
  Minimal profile created
  ↓
  Navigate directly to Dashboard
  ↓
  Profile shows "Retake Onboarding Quiz" option

Case 3: Retake Quiz
  User completes quiz → goes to Profile → clicks "Retake"
  ↓
  Confirmation dialog appears
  ↓
  User confirms
  ↓
  All quiz data cleared
  ↓
  Redirect to /onboarding (clean slate)

Case 4: Stale Data
  Quiz progress saved 8 days ago
  ↓
  User returns to app
  ↓
  Storage utility detects stale data (> 7 days)
  ↓
  Automatically clears and starts fresh
```

---

**Visual Design Inspiration:** Modern, clean, eco-friendly aesthetic with smooth animations and delightful micro-interactions throughout the journey! 🌱✨

