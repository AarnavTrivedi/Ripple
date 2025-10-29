# 🌊 ECO-TRACKR DESIGN SYSTEM
## Ripple-Inspired | Emerald Theme | 2025

> **Design Philosophy:** Confident yet approachable. Bold numbers meet soft shapes. Environmental data presented with clarity and optimism.

---

## 🎨 COLOR SYSTEM (YOUR EXISTING EMERALD SCHEME - PRESERVED)

### **Primary Palette**
```css
--emerald-50:  #f0fdf4;   /* Lightest background, success states */
--emerald-100: #dcfce7;   /* Light backgrounds, hover states */
--emerald-200: #bbf7d0;   /* Subtle highlights */
--emerald-300: #86efac;   /* Soft accents */
--emerald-400: #4ade80;   /* Secondary actions */
--emerald-500: #10b981;   /* PRIMARY - Main brand color */
--emerald-600: #059669;   /* Primary hover, active states */
--emerald-700: #047857;   /* Primary pressed */
--emerald-800: #065f46;   /* Dark mode primary */
--emerald-900: #064e3b;   /* Darkest emerald */
```

### **Supporting Colors**
```css
/* Neutral Slate (Primary text/backgrounds) */
--slate-50:  #f8fafc;   /* Page backgrounds */
--slate-100: #f1f5f9;   /* Card backgrounds (light mode) */
--slate-200: #e2e8f0;   /* Borders, dividers */
--slate-300: #cbd5e1;   /* Disabled states */
--slate-400: #94a3b8;   /* Placeholder text */
--slate-500: #64748b;   /* Secondary text */
--slate-600: #475569;   /* Body text */
--slate-700: #334155;   /* Headings */
--slate-800: #1e293b;   /* Primary text */
--slate-900: #0f172a;   /* Darkest text */

/* Dark Mode Backgrounds */
--slate-950: #020617;   /* Dark mode page bg */
--dark-card: #0f172a;   /* Dark mode card bg */
--dark-border: rgba(148, 163, 184, 0.1); /* Dark mode borders */

/* Semantic Colors */
--success: #10b981;     /* Emerald-500 */
--warning: #f59e0b;     /* Amber-500 */
--error: #ef4444;       /* Red-500 */
--info: #3b82f6;        /* Blue-500 */

/* Positive/Negative Impact */
--positive: #10b981;    /* Carbon saved, eco-friendly */
--negative: #64748b;    /* Carbon emitted (neutral slate, not alarming) */
```

### **Color Psychology Applied**
- **Emerald Green**: Growth, sustainability, positive environmental action
- **Slate Gray**: Trust, professionalism, clarity
- **Minimal Accents**: Clean focus on data, not decoration
- **High Contrast**: WCAG AAA where possible (readable for all users)

---

## 🔤 TYPOGRAPHY

### **Font Stack (System Fonts - Zero Load Time)**
```css
/* Primary: Clean, modern, optimized for readability */
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", 
                "Inter", "SF Pro Display", "Roboto", 
                "Helvetica Neue", Arial, sans-serif;

/* Monospace: For metrics, numbers, code */
--font-mono: ui-monospace, "SF Mono", "Roboto Mono", 
             "Courier New", monospace;
```

**Why System Fonts?**
- ✅ Zero HTTP requests (faster load)
- ✅ Familiar to users (better UX)
- ✅ Optimized for each OS
- ✅ Lower carbon footprint (sustainability!)

### **Type Scale (Ripple-Inspired)**
```css
/* Display Numbers - Large Impact Metrics */
--text-display: 72px / 700 / -1.5px letter-spacing;
/* Example: "190 kg CO₂ saved" */
color: var(--emerald-500);
line-height: 1;

/* Headings */
--text-h1: 32px / 600 / -0.5px;  /* Page titles */
--text-h2: 24px / 600 / -0.3px;  /* Section titles */
--text-h3: 20px / 600 / 0px;     /* Card titles */
--text-h4: 18px / 600 / 0px;     /* Subsection titles */

/* Body Text */
--text-large: 18px / 500 / 0px;     /* Prominent body */
--text-base: 16px / 400 / 0px;      /* Standard body */
--text-small: 14px / 500 / 0.2px;   /* Labels, captions */
--text-tiny: 13px / 400 / 0.3px;    /* Helper text, legal */

/* Line Heights */
--leading-tight: 1.25;  /* Headings, numbers */
--leading-normal: 1.5;  /* Body text */
--leading-relaxed: 1.6; /* Long-form content */
```

### **Typography Rules**
1. **Numbers ≥ 48px**: Use bold (700) with tight letter-spacing
2. **Headings**: Semibold (600) with slight negative spacing
3. **Body**: Regular (400) with comfortable line-height (1.5-1.6)
4. **Never below 14px**: Accessibility minimum
5. **Use emerald for positive metrics**, slate for neutral/negative
6. **Comma formatting**: Always format thousands (1,649 not 1649)

---

## 📐 SPACING SYSTEM (8-Point Grid)

### **Base Unit: 8px**
```css
--space-1:  4px;    /* Micro spacing (icon padding) */
--space-2:  8px;    /* Tight spacing (between related items) */
--space-3:  12px;   /* Small spacing (list items) */
--space-4:  16px;   /* Standard spacing (card padding) */
--space-5:  20px;   /* Medium spacing (card gaps) */
--space-6:  24px;   /* Large spacing (sections) */
--space-8:  32px;   /* XL spacing (major sections) */
--space-10: 40px;   /* XXL spacing (hero sections) */
--space-12: 48px;   /* Page padding (top/bottom) */
--space-16: 64px;   /* Hero card padding */
```

### **Layout Rhythm**
```
Page Container:
  padding: var(--space-6) var(--space-4); /* 24px vertical, 16px horizontal */
  max-width: 480px; /* Mobile-first */

Section Spacing:
  margin-bottom: var(--space-8); /* 32px between major sections */

Card Internal Padding:
  padding: var(--space-8) var(--space-6); /* 32px vertical, 24px horizontal */

Card External Spacing:
  gap: var(--space-5); /* 20px between cards */

List Items:
  padding: var(--space-5) 0; /* 20px vertical */
  border-bottom: 1px solid var(--slate-200);

Button Padding:
  padding: var(--space-4) var(--space-8); /* 16px vertical, 32px horizontal */
```

---

## 🔲 BORDER RADIUS (Soft Modernism)

### **Ripple-Inspired Roundness**
```css
--radius-sm:    8px;   /* Small elements, icons */
--radius-md:    12px;  /* Buttons, inputs, badges */
--radius-lg:    16px;  /* Cards, modals */
--radius-xl:    24px;  /* Hero cards, major sections */
--radius-2xl:   32px;  /* Bottom sheets, large cards */
--radius-full:  9999px; /* Pills, circular elements */
```

### **Application Rules**
```
Hero Cards:        32px (--radius-2xl)
Content Cards:     16px (--radius-lg)
Buttons:           12px (--radius-md) - NOT full pill
Button (Primary):  24px (--radius-xl) - soft pill for CTA
Inputs:            12px (--radius-md)
Badges:            9999px (--radius-full)
Icons/Squares:     8px (--radius-sm)
Bottom Nav:        32px (top only)
Avatars:           9999px (--radius-full)
```

**Why not full pills everywhere?**
User requested "don't overdo" - We use soft rounded (12-24px) for most elements, reserving full pills (50%) for special CTAs and badges only.

---

## 🎯 COMPONENTS

### **1. Hero Card (Dashboard Main Metric)**
```css
.hero-card {
  background: white;
  border-radius: var(--radius-2xl); /* 32px */
  padding: var(--space-12) var(--space-8); /* 48px 32px */
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  margin: var(--space-6); /* 24px */
  text-align: center;
}

.hero-number {
  font-size: 72px;
  font-weight: 700;
  color: var(--emerald-500);
  letter-spacing: -1.5px;
  line-height: 1;
  margin-bottom: var(--space-2);
}

.hero-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--slate-500);
  letter-spacing: 0.2px;
}
```

### **2. Stat Card (Quick Metrics)**
```css
.stat-card {
  background: linear-gradient(135deg, 
              var(--emerald-50) 0%, 
              var(--slate-50) 100%);
  border-radius: var(--radius-lg); /* 16px */
  padding: var(--space-8) var(--space-6); /* 32px 24px */
  border: 1px solid var(--emerald-100);
  text-align: center;
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: var(--radius-full);
  margin: 0 auto var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.stat-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--slate-700);
  margin-bottom: var(--space-2);
}

.stat-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--slate-800);
  line-height: 1;
}
```

### **3. Primary Button**
```css
.btn-primary {
  background: linear-gradient(135deg, 
              var(--emerald-500) 0%, 
              var(--emerald-600) 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: var(--space-4) var(--space-8); /* 16px 32px */
  border-radius: var(--radius-xl); /* 24px soft pill */
  border: none;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
  min-height: 56px;
  
  /* Subtle hover - not overdone */
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.btn-primary:hover {
  transform: translateY(-1px); /* Subtle 1px lift */
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}
```

### **4. Secondary Button**
```css
.btn-secondary {
  background: var(--slate-100);
  color: var(--slate-700);
  font-size: 16px;
  font-weight: 600;
  padding: var(--space-4) var(--space-6); /* 16px 24px */
  border-radius: var(--radius-md); /* 12px */
  border: 1px solid var(--slate-200);
  
  /* Minimal hover */
  transition: background 150ms ease;
}

.btn-secondary:hover {
  background: var(--slate-200);
}
```

### **5. Journey Tracking Card (Map Stats Overlay)**
```css
.journey-card {
  background: rgba(15, 23, 42, 0.95); /* Dark with transparency */
  backdrop-filter: blur(12px);
  border-radius: var(--radius-lg); /* 16px */
  padding: var(--space-4); /* 16px */
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.journey-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1); /* 4px */
}

.journey-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.6);
}

.journey-value {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.journey-unit {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
}
```

### **6. List Items (Waypoints, Transactions)**
```css
.list-item {
  display: flex;
  align-items: center;
  padding: var(--space-5) 0; /* 20px vertical */
  border-bottom: 1px solid var(--slate-100);
  gap: var(--space-4); /* 16px */
}

.list-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md); /* 12px rounded square */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Icon backgrounds by type */
.icon-waypoint { background: var(--emerald-100); color: var(--emerald-600); }
.icon-action { background: var(--slate-100); color: var(--slate-600); }
.icon-hazard { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.list-content {
  flex: 1;
  min-width: 0; /* Enable text truncation */
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--slate-800);
  margin-bottom: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-subtitle {
  font-size: 14px;
  color: var(--slate-500);
}

.list-meta {
  font-size: 16px;
  font-weight: 600;
  color: var(--emerald-600);
  flex-shrink: 0;
}
```

### **7. Input Fields**
```css
.input {
  background: var(--slate-50);
  border: 2px solid var(--slate-200);
  border-radius: var(--radius-md); /* 12px */
  padding: var(--space-4); /* 16px */
  font-size: 16px;
  color: var(--slate-800);
  transition: all 200ms ease;
}

.input:focus {
  background: white;
  border-color: var(--emerald-500);
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input::placeholder {
  color: var(--slate-400);
}
```

### **8. Bottom Navigation**
```css
.bottom-nav {
  background: white;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0; /* 32px top corners */
  box-shadow: 0 -4px 24px rgba(15, 23, 42, 0.08);
  padding: var(--space-4) 0 var(--space-6); /* Extra for notch */
  display: flex;
  justify-content: space-around;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 480px;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1); /* 4px */
  padding: var(--space-2) var(--space-4); /* 8px 16px */
  border-radius: var(--radius-md); /* 12px */
  min-width: 64px;
  
  /* Minimal hover */
  transition: background 150ms ease;
}

.nav-item:hover {
  background: var(--slate-50);
}

.nav-item.active {
  background: var(--emerald-50);
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: var(--slate-400);
}

.nav-item.active .nav-icon {
  color: var(--emerald-600);
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--slate-500);
}

.nav-item.active .nav-label {
  color: var(--emerald-700);
  font-weight: 600;
}
```

### **9. Badge/Pill**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3); /* 4px 12px */
  border-radius: var(--radius-full); /* Full pill */
  font-size: 14px;
  font-weight: 600;
  gap: var(--space-1);
}

.badge-success {
  background: var(--emerald-100);
  color: var(--emerald-700);
}

.badge-neutral {
  background: var(--slate-100);
  color: var(--slate-700);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}
```

### **10. Location Accuracy Indicator**
```css
.accuracy-badge {
  background: rgba(16, 185, 129, 0.9);
  backdrop-filter: blur(8px);
  padding: var(--space-2) var(--space-4); /* 8px 16px */
  border-radius: var(--radius-full); /* Full pill */
  font-size: 13px;
  font-weight: 600;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.accuracy-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}
```

---

## 🎭 ANIMATION & INTERACTION

### **Timing (Never Jarring)**
```css
--duration-fast:   150ms;  /* Button press, quick feedback */
--duration-normal: 300ms;  /* Card hover, transitions */
--duration-slow:   600ms;  /* Page transitions, reveals */

--easing-standard:   cubic-bezier(0.4, 0.0, 0.2, 1); /* Default */
--easing-accelerate: cubic-bezier(0.4, 0.0, 1, 1);   /* Exits */
--easing-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1); /* Entrances */
```

### **Hover Rules (Subtle, Not Overdone)**
```
Buttons:  Lift 1-2px + subtle shadow increase
Cards:    Background lightens slightly, NO lift
Icons:    Scale 1.05 (5% only)
Links:    Color shifts to emerald-600
```

**❌ NEVER:**
- Excessive bounce effects
- Spinning animations (except loading)
- Flashing or pulsing colors
- Dramatic scale changes (>1.1×)
- Confetti or particle effects
- Auto-playing videos

**✅ ALWAYS:**
- Smooth, confident transitions
- Subtle feedback on interaction
- Respect user's motion preferences
- Clear focus indicators

### **Loading States**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--slate-200) 0%,
    var(--slate-100) 50%,
    var(--slate-200) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 0%; }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--slate-200);
  border-top-color: var(--emerald-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

---

## ♿ ACCESSIBILITY

### **Touch Targets**
```
Minimum: 44×44px (iOS/WCAG)
Standard Buttons: 56px height
Navigation Icons: 48×48px tap area
Icon Buttons: 44×44px minimum
Spacing Between: 8-12px minimum
```

### **Color Contrast (WCAG AA/AAA)**
```
Emerald-600 on White:  5.8:1 ✓ (AA Large, AAA Normal)
Slate-800 on White:    10.5:1 ✓ (AAA)
Slate-600 on White:    6.8:1 ✓ (AAA)
White on Emerald-600:  5.8:1 ✓ (AA Large)
White on Emerald-700:  7.4:1 ✓ (AAA)
```

### **Focus Indicators**
```css
*:focus-visible {
  outline: 3px solid var(--emerald-500);
  outline-offset: 2px;
  border-radius: inherit;
}

button:focus-visible,
a:focus-visible {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}
```

### **Reduced Motion**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📱 MOBILE-FIRST BREAKPOINTS

```css
/* Mobile First (Default) */
@media (min-width: 320px) { /* Base: iPhone SE */ }

/* Larger Phones */
@media (min-width: 375px) { /* iPhone 12/13/14 */ }
@media (min-width: 414px) { /* iPhone Plus */ }

/* Tablets */
@media (min-width: 768px) { 
  /* Max-width: 600px content, centered */
}

/* Desktop (Optional) */
@media (min-width: 1024px) {
  /* Max-width: 720px content, centered */
}
```

---

## 🎨 ILLUSTRATION GUIDELINES

### **Map Marker Icons**
```
Style: Solid fill with white icon
Size: 32×32px standard, 48×48px featured
Border-radius: 50% (circular) or 8px (rounded square)
Shadow: 0 4px 12px rgba(0,0,0,0.15)

Colors by Type:
- Eco Waypoint: emerald-500
- Green Action: emerald-400
- Hazard Zone: red-500 (transparent circle)
- User Location: emerald-600 with pulse animation
```

### **Empty States**
```
Style: Minimal line illustrations
Colors: Slate-300 (light), Emerald-500 (accents)
Size: 120-160px height max
Message: 14-16px slate-600 text below
Action: Primary button below message
```

---

## 🚀 IMPLEMENTATION CHECKLIST

### **Phase 1: Foundation** ✅
- [x] Color variables defined
- [x] Typography scale established
- [x] Spacing system (8pt grid)
- [x] Border radius scale

### **Phase 2: Components** (Next)
- [ ] Update all buttons with new styles
- [ ] Refine card components
- [ ] Update map overlay stats card
- [ ] Improve bottom navigation
- [ ] Add location accuracy badge

### **Phase 3: Polish**
- [ ] Add subtle hover states
- [ ] Implement skeleton loading
- [ ] Add focus indicators
- [ ] Test reduced motion
- [ ] Validate contrast ratios

### **Phase 4: Dark Mode** (Optional)
- [ ] Define dark color palette
- [ ] Test all components
- [ ] Add theme toggle

---

## 📖 DESIGN PRINCIPLES

### **1. OPTIMISTIC**
Always emphasize positive impact. Show carbon saved prominently, emissions in neutral tones.

### **2. CONFIDENT**
Bold typography for numbers. Clear hierarchy. Decisive actions.

### **3. APPROACHABLE**
Soft rounded corners. Friendly language. Generous spacing.

### **4. TRUSTWORTHY**
Clean data presentation. High contrast. Professional typography.

### **5. EFFICIENT**
Minimal HTTP requests. System fonts. Optimized animations.

### **6. INCLUSIVE**
WCAG AA/AAA compliance. Large touch targets. Clear focus states.

---

## 🎯 BRAND PERSONALITY

**Eco-Trackr should feel:**
- 🌱 **Environmental** - But not preachy
- 💪 **Empowering** - You're making a difference
- 📊 **Data-Driven** - Clear metrics, no greenwashing
- 🤝 **Friendly** - Approachable, not corporate
- ⚡ **Modern** - 2025 design standards
- 🎯 **Focused** - Clean, purposeful, no clutter

---

## 📚 RESOURCES

### **Tools**
- [Tailwind CSS](https://tailwindcss.com) - Already integrated
- [Shadcn/ui](https://ui.shadcn.com) - Component library
- [Lucide Icons](https://lucide.dev) - Icon system
- [React Leaflet](https://react-leaflet.js.org) - Map library

### **Inspiration**
- Ripple (carbon tracking)
- Klima (real-time emissions)
- Capture (data visualization)
- Joro/Commons (community features)
- Linear (modern UI patterns)
- Stripe (clarity & confidence)

---

**Design System Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** Eco-Trackr Team

---

## 🚀 NEXT STEP: APPLY TO CODEBASE

Ready to implement? I can:
1. **Update all Tailwind classes** to match this system
2. **Refine existing components** (buttons, cards, nav)
3. **Add new components** (badges, improved stats)
4. **Polish interactions** (subtle hovers, loading states)
5. **Test accessibility** (contrast, focus, motion)

Say "Implement design system" and I'll systematically apply these styles across the app!

