# 📱 Eco-Trackr Map - Visual Implementation Guide

## UI Layout Reference

### Main Map View (Default State)

```
┌─────────────────────────────────────┐
│  📍 Eco Map            [🔲] [➕]    │  ← Compact Header
├─────────────────────────────────────┤
│                                     │
│         🗺️  MAP AREA               │
│                                     │
│     • Waypoints (colored markers)   │
│     • Heatmap (color gradient)      │
│     • Your location (green circle)  │
│                                     │
│                                     │
│                                     │
│  ┌────── Start Journey ──────┐     │  ← Journey Button
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Active Journey State

```
┌─────────────────────────────────────┐
│  📍 Eco Map            [🔲] [➕]    │
├─────────────────────────────────────┤
│ ┌─ Journey Active ─────────── [×] ┐│  ← Stats Overlay
│ │ 1.2mi │ 0.5kg │ 15min │ 92    ││
│ └───────────────────────────────────┘│
│                                     │
│         🗺️  MAP AREA               │
│                                     │
│     • Route line (green/purple)     │
│     • Your location (moving)        │
│     • Waypoints visible             │
│                                     │
│                                     │
│  ┌─[🚶]─┐  ┌──── Stop Journey ───┐ │  ← Controls
│  └──────┘  └────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Transport Mode Selection Sheet

```
┌─────────────────────────────────────┐
│                                     │
│         🗺️  MAP VISIBLE            │
│              (Dimmed)               │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Select Transport Mode              │  ← Bottom Sheet
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  │
│  │    🚶       │  │    🚴       │  │
│  │  Walking    │  │  Cycling    │  │
│  └─────────────┘  └─────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  │
│  │    🚆       │  │    🚗       │  │
│  │   Transit   │  │  Driving    │  │
│  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────┘
```

### Layers Control Sheet

```
┌─────────────────────────────────────┐
│                                     │
│         🗺️  MAP VISIBLE            │
│              (Dimmed)               │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Map Layers                         │  ← Bottom Sheet
├─────────────────────────────────────┤
│  📊 Heatmap              [👁️ ON]   │
│  📍 Eco Waypoints        [👁️ ON]   │
│  ⚡ Green Actions        [👁️ ON]   │
│  ⚠️  Hazard Zones        [👁️ OFF]  │
│  🛣️  Route History       [👁️ ON]   │
│  ─────────────────────────────────  │
│  📅 Add Volunteer Event             │  ← Quick Action
└─────────────────────────────────────┘
```

---

## Color Coding System

### Transport Modes
```
🚶 Walking       → 💚 Green (#10b981)
🚴 Cycling       → 💜 Purple (#8b5cf6)
🚆 Public Transit → 💙 Blue (#3b82f6)
🚗 Driving       → 🟠 Orange (#f59e0b)
```

### Waypoint Types
```
🌳 Parks              → 🟢 Bright Green (#22c55e)
♻️  Recycling Centers → 🟢 Emerald (#10b981)
⚡ EV Charging        → 🔵 Blue (#3b82f6)
🚲 Bike Stations      → 🟣 Purple (#8b5cf6)
🌱 Community Gardens  → 🟢 Lime (#84cc16)
💧 Water Refill       → 🔵 Cyan (#06b6d4)
🏪 Eco Stores         → 🟠 Amber (#f59e0b)
```

### Heatmap Gradient
```
0%   Low Eco      → 🔴 Red (#ff0000)
30%  Medium-Low   → 🟠 Orange (#ff6600)
50%  Medium       → 🟡 Yellow (#ffff00)
70%  Good         → 💚 Light Green (#90ee90)
100% Excellent    → 💚 Emerald (#10b981)
```

### Hazard Zones
```
High (60-100)    → 🔴 Red (#ef4444)
Medium (40-60)   → 🟠 Orange (#f59e0b)
Low (0-40)       → 🟡 Yellow (#fbbf24)
```

---

## User Flow Diagrams

### Starting a Journey

```
┌───────────────┐
│  User Opens   │
│   Map Page    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Grant Location│
│  Permission?  │
└───────┬───────┘
        │ Yes
        ▼
┌───────────────┐
│ Map Displays  │
│ User Location │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Tap "Start   │
│   Journey"    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Select Trans- │
│  port Mode    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Journey Active│
│ Stats Updating│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Tap "Stop    │
│   Journey"    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Journey Saved │
│ Stats Display │
└───────────────┘
```

### Adding an Eco Spot

```
┌───────────────┐
│  Tap + Button │
│   (Top Right) │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Dialog Opens  │
│ GPS Captures  │
│  Coordinates  │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Fill Form:   │
│  - Name       │
│  - Desc       │
│  - Type       │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Tap "Add Eco │
│     Spot"     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Waypoint Added│
│ Marker Appears│
│   on Map      │
└───────────────┘
```

---

## Interactive Elements

### Tap Targets (All ≥44px)

```
Header Buttons:
┌────────┐  ┌────────┐
│ Layers │  │   +    │  (48px × 32px)
└────────┘  └────────┘

Journey Controls:
┌──────────────────┐
│  Start Journey   │  (Large button, 60px height)
└──────────────────┘

┌──────┐  ┌──────────────┐
│  🚶  │  │ Stop Journey │  (During journey)
└──────┘  └──────────────┘

Transport Mode Grid:
┌───────────┐  ┌───────────┐
│    🚶     │  │    🚴     │
│  Walking  │  │  Cycling  │  (96px height each)
└───────────┘  └───────────┘
```

### Gestures Supported

```
Map Interactions:
• Pinch        → Zoom in/out
• Drag         → Pan map
• Tap Marker   → Show popup
• Double Tap   → Zoom in

UI Interactions:
• Tap Button   → Action
• Swipe Down   → Close sheet
• Tap Outside  → Dismiss dialog
```

---

## Marker Types Visual Reference

### Standard Waypoints
```
    📍              Location marker icon
   /│\             Color-coded by type
  / | \            Size: 32×32px
 ───────           Drop shadow
   │ │
   └─┘             Anchor point
```

### User Location
```
    ⊚              Pulsing circle
   ◯◯◯             Green (#10b981)
  ◯   ◯            Inner: 10px radius
  ◯ • ◯            Outer: accuracy radius
   ◯◯◯             Semi-transparent
    ◯
```

### Route Line
```
Start ●───────────● Waypoint
       ╲         ╱
        ╲       ╱   Color: Transport mode
         ╲     ╱    Width: 4px
          ╲   ╱     Opacity: 0.7
           ╲ ╱
            ● End
```

### Hazard Zone
```
      ╱─────╲
     ╱       ╲      Semi-transparent circle
    │    ⚠️   │     Radius: hazard_level × 10
    │         │     Color: Red/Orange/Yellow
     ╲       ╱      Fill opacity: 0.2
      ╲─────╱       Border: 2px
```

---

## Stats Overlay Layout

### Expanded View
```
┌──────────────────────────────┐
│ ⚡ Journey Active        [×] │  ← Header with close
├──────────────────────────────┤
│  DIST  │  CO₂  │ TIME │SCORE│
│ 1.2mi  │ 0.5kg │ 15m  │ 92  │  ← 4-column grid
└──────────────────────────────┘
```

### Collapsed (Just icon visible)
```
┌────┐
│ 👁️ │  ← Tap to expand
└────┘
```

---

## Popup Content Structure

### Waypoint Popup
```
┌──────────────────────────┐
│  Park Name               │  ← Bold heading
├──────────────────────────┤
│ Description of the park  │  ← Gray text
│ and its eco features.    │
├──────────────────────────┤
│ 🏞️ Park    ⭐ 85/100    │  ← Type + Rating
└──────────────────────────┘
```

### Green Action Popup
```
┌──────────────────────────┐
│  Beach Cleanup Event     │  ← Bold heading
├──────────────────────────┤
│ Join us for a community  │  ← Description
│ beach cleanup!           │
├──────────────────────────┤
│ 📅 Oct 28, 2025, 10am   │  ← Date
│ 🏆 +50 Eco Points       │  ← Reward
└──────────────────────────┘
```

### Hazard Zone Popup
```
┌──────────────────────────┐
│ ⚠️ Air Quality Alert     │  ← Bold with icon
├──────────────────────────┤
│ High pollen count in     │  ← Description
│ this area today.         │
├──────────────────────────┤
│ Hazard Level: 75/100     │  ← Color-coded
└──────────────────────────┘
```

---

## Responsive Breakpoints

### iPhone Models
```
iPhone SE (375px):
├─ Header: Compact
├─ Buttons: Stacked
└─ Sheets: Full width

iPhone 12/13 (390px):
├─ Header: Comfortable
├─ Buttons: Side-by-side
└─ Sheets: Full width

iPhone 14 Pro Max (430px):
├─ Header: Spacious
├─ Buttons: Side-by-side
└─ Sheets: Full width
```

---

## Animation Timings

```
Map Transitions:
• flyTo (location)     → 500ms
• Marker appear        → 300ms
• Popup open           → 200ms

UI Transitions:
• Sheet slide up       → 300ms
• Button press         → 150ms
• Layer toggle         → 100ms
• Stats update         → 0ms (instant)

Route Drawing:
• Polyline append      → 0ms (instant)
• Color change         → 200ms
```

---

## Z-Index Layers

```
Layer Stack (bottom to top):
━━━━━━━━━━━━━━━━━━━━━━━━━
2000 │ Add Dialog
1001 │ Header
1000 │ Overlays (Stats, Emissions)
 999 │ Bottom Sheets
 500 │ Journey Controls
   1 │ Map Markers & Popups
   0 │ Map Base (tiles, heatmap)
━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Data Flow Visual

### Real-Time Journey Tracking
```
GPS Device
    ↓
[watchPosition API]
    ↓
Location Update
    ↓
┌───────────────┐
│ useState      │ → userLocation
│ setUserLocation
└───────────────┘
    ↓
Is Tracking?
    │ Yes ↓
Route History ← Append location
    ↓
Calculate Distance
    ↓
Calculate Carbon Saved
    ↓
Calculate Eco Score
    ↓
┌───────────────┐
│ Update Stats  │ → journeyStats
└───────────────┘
    ↓
UI Updates (Real-time)
```

### Heatmap Generation
```
Database Entities:
├─ EcoWaypoint (eco_rating)
├─ GreenAction (location)
└─ HazardZone (inverse)
    ↓
[useMemo Hook]
    ↓
Generate Point Array:
[lat, lon, intensity]
    ↓
Leaflet.heat Plugin
    ↓
Render Gradient Map
    ↓
Display on Map Layer
```

---

## Mobile Optimization Checklist

### Touch-Friendly ✓
- ✅ Buttons ≥44px tap target
- ✅ Bottom sheet accessible with thumb
- ✅ Swipe gestures enabled
- ✅ No hover-only interactions

### Performance ✓
- ✅ Lazy loading map tiles
- ✅ Memoized heatmap data
- ✅ Debounced location updates
- ✅ Efficient re-renders

### Visual ✓
- ✅ High contrast colors
- ✅ Large readable text
- ✅ Clear icons (32px+)
- ✅ Visual feedback on tap

### Layout ✓
- ✅ Safe area insets respected
- ✅ Compact header saves space
- ✅ Full-screen map
- ✅ Bottom navigation clear

---

## Quick Reference: Component Props

### EmissionsComparison
```javascript
<EmissionsComparison 
  emissionData={[...]}      // Array of records
  currentLocation="County"   // String
  compact={true}            // Boolean
/>
```

### HeatmapLayer
```javascript
<HeatmapLayer 
  points={[[lat, lon, intensity], ...]}
  intensity={0.6}           // 0-1
/>
```

### LocationMarker
```javascript
<LocationMarker 
  position={[lat, lon]}     // [number, number]
  accuracy={100}            // meters
/>
```

---

## Development Workflow

### Making Changes
```
1. Edit src/pages/Map.jsx
2. Save (auto-reload)
3. Check console for errors
4. Test on device/simulator
5. Commit changes
```

### Testing Flow
```
1. Start dev server (npm run dev)
2. Open in browser/iPhone
3. Allow location permission
4. Test each feature:
   - Journey tracking
   - Layer toggles
   - Adding waypoints
   - Transport modes
   - Stats display
5. Verify no errors
6. Check performance
```

---

**Visual Guide Complete!**

This guide provides visual references for:
- ✅ UI layouts
- ✅ User flows
- ✅ Color coding
- ✅ Interactive elements
- ✅ Component structures
- ✅ Data flows
- ✅ Mobile optimizations

**Ready to build amazing eco-friendly maps! 🗺️💚**

