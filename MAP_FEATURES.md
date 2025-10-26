# 📍 Eco-Trackr Map Features Documentation

## Overview
The Eco-Trackr map is a comprehensive, mobile-first tracking system designed specifically for iPhone screens. It combines real-time location tracking, eco-friendliness visualization, and community-driven environmental awareness.

---

## 🎯 Core Features

### 1. **Real-Time Location Tracking**
- **GPS Accuracy Display**: Shows real-time position with accuracy radius
- **High-Precision Tracking**: Uses `enableHighAccuracy: true` for best results
- **Auto-centering**: Map smoothly follows your location with `flyTo` animations
- **Continuous Updates**: Location refreshes every few seconds for accurate tracking

### 2. **Journey Tracking System**
Track your environmental impact in real-time:

#### Transport Modes
- 🚶 **Walking** - 100% eco-friendly (0 CO₂)
- 🚴 **Cycling** - 95% eco-friendly (0 CO₂)
- 🚆 **Public Transport** - 75% eco-friendly (0.14 kg CO₂/mile)
- 🚗 **Driving** - 30% eco-friendly (0.404 kg CO₂/mile)

#### Real-Time Metrics
- **Distance**: Track miles traveled during journey
- **Carbon Saved**: Calculate CO₂ prevented vs. driving
- **Duration**: Monitor journey time in minutes
- **Eco Score**: Dynamic score based on transport choice and duration

#### How to Use
1. Tap **"Start Journey"** button
2. Select your transport mode from bottom sheet
3. Watch stats update in real-time overlay
4. Change transport mode mid-journey if needed
5. Tap **"Stop Journey"** to end and save stats

### 3. **Heatmap Visualization**
Visual representation of eco-friendliness across your area:

#### Color Legend
- 🔴 **Red**: Low eco-friendliness (0-30%)
- 🟠 **Orange**: Medium-low (30-50%)
- 🟡 **Yellow**: Medium (50-70%)
- 🟢 **Light Green**: Good (70-90%)
- 💚 **Emerald**: Excellent (90-100%)

#### Data Sources
- Eco waypoints with ratings
- Green action event locations
- Inverse mapping of hazard zones
- User-contributed eco spots

### 4. **Interactive Map Layers**

#### Eco Waypoints (Green Markers)
- Parks and green spaces
- Recycling centers
- EV charging stations
- Bike sharing stations
- Community gardens
- Water refill stations
- Eco-friendly stores

**Each waypoint displays:**
- Name and description
- Type of facility
- Eco rating (0-100)

#### Green Actions (Yellow Markers)
Community-driven environmental events:
- Tree planting events
- Beach cleanups
- Repair cafés
- Donation drives
- Environmental workshops
- Volunteer opportunities

**Each action shows:**
- Event title and description
- Date and time
- Eco points reward
- Distance from your location

#### Hazard Zones (Colored Circles)
Environmental hazards to avoid:
- 🔴 High hazard (60-100)
- 🟠 Medium hazard (40-60)
- 🟡 Low hazard (0-40)

Displays hazard level and description.

#### Route History (Colored Lines)
- 💚 Green: Walking routes
- 💜 Purple: Cycling routes
- 💙 Blue: Public transport routes
- 🟠 Orange: Driving routes

### 5. **Mobile-Optimized UI**

#### Compact Header
- Map title with icon
- Layers control button
- Quick add button for waypoints

#### Floating Stats Overlay
Displays during active journey:
- Distance traveled
- CO₂ saved
- Journey duration
- Real-time eco score
- Minimizable with eye icon

#### Bottom Sheet Controls
Two sheets accessible via buttons:

**Transport Mode Sheet**
- Grid layout with 4 transport options
- Large icons for easy tapping
- Current mode highlighted
- Quick switching during journey

**Layers Control Sheet**
- Toggle visibility of each layer
- Quick access to add events
- Clean toggle switches
- Organized by category

### 6. **Waze-Style User Contributions**

#### Add Eco Spots
Users can contribute waypoints:
1. Tap "+" button in header
2. Fill in details (name, description, type)
3. Location auto-fills from GPS
4. Submit to share with community

**Types of spots:**
- Parks
- Recycling centers
- EV charging stations
- Bike stations
- Community gardens
- Water refill points
- Eco stores

#### Add Volunteer Events
Share environmental events:
1. Tap layers → "Add Volunteer Event"
2. Enter event details
3. Set date and points reward
4. Location auto-captured
5. Appears on map for others

**Event types:**
- Volunteer opportunities
- Tree planting
- Cleanup events
- Workshops
- Donation drives
- Repair cafés

---

## 🎨 Design Philosophy

### Mobile-First Approach
- **Touch-optimized**: Large tap targets (minimum 44x44px)
- **Thumb-friendly**: Important controls at bottom
- **Minimal header**: Saves vertical screen space
- **Bottom sheets**: Native mobile pattern for iPhone
- **Responsive overlays**: Adapt to screen size

### Color System
- **Primary**: Emerald green (#10b981) - eco-friendly actions
- **Warning**: Amber (#f59e0b) - events and alerts
- **Danger**: Red (#ef4444) - hazards
- **Info**: Blue (#3b82f6) - public transport
- **Purple**: (#8b5cf6) - cycling

### Visual Hierarchy
1. **Real-time stats** (top overlay)
2. **Map content** (main focus)
3. **Journey controls** (bottom center)
4. **Layer settings** (bottom sheet)

---

## 🔧 Technical Implementation

### Dependencies
```json
{
  "leaflet": "^1.9.x",
  "react-leaflet": "^4.2.x",
  "leaflet.heat": "^0.2.x",
  "date-fns": "^3.6.x"
}
```

### Key Components

#### HeatmapLayer
Custom React component using leaflet.heat plugin:
- Dynamic gradient based on eco-friendliness
- Adjustable radius and blur
- Performance-optimized for mobile

#### LocationMarker
Enhanced user location display:
- Accuracy circle visualization
- Pulsing center marker
- Smooth map following

#### Route Tracking
Real-time polyline rendering:
- Color-coded by transport mode
- Opacity for visibility
- Historical route display

### Carbon Calculation
Based on EPA emission standards:
```javascript
const emissionFactors = {
  walking: 0,              // kg CO₂ per mile
  cycling: 0,
  public_transport: 0.14,  // vs car baseline
  driving: 0.404           // average passenger car
};

carbonSaved = (carEmissions - modeEmissions) * distance
```

### Eco Score Algorithm
```javascript
baseScore = transportModeScore (30-100)
durationBonus = min(minutes * 0.5, 20)
carbonBonus = min(carbonSaved * 10, 30)
ecoScore = min(baseScore + bonuses, 100)
```

---

## 📱 iPhone-Specific Optimizations

### Viewport Configuration
- Height: 100vh for full-screen map
- Safe area insets respected
- No horizontal scroll
- Optimized for notch/Dynamic Island

### Touch Gestures
- **Pinch**: Zoom in/out
- **Drag**: Pan map
- **Tap marker**: Show popup
- **Long press**: (Future: Add waypoint)

### Performance
- Lazy loading of map tiles
- Efficient re-renders with React.memo
- Debounced location updates
- Optimized heatmap rendering

---

## 🚀 Future Enhancements

### Planned Features
1. **County Emissions Data** - Compare local vs. global averages
2. **Historical Journey View** - See past routes and stats
3. **Achievements System** - Unlock badges for eco-friendly travel
4. **Social Sharing** - Share eco scores with friends
5. **Offline Maps** - Cache tiles for offline use
6. **Route Planning** - Suggest eco-friendly routes
7. **Public Transit Integration** - Real-time bus/train locations
8. **Gamification** - Compete with community members
9. **Push Notifications** - Nearby eco events alerts
10. **AR View** - Point camera to see eco spots

### API Integrations (Roadmap)
- OpenStreetMap for detailed POI data
- EPA for real-time air quality
- Local transit APIs for schedules
- Weather API for outdoor event planning
- Carbon footprint databases

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Location Permission**: Requires user to grant GPS access
2. **Battery Usage**: Continuous GPS tracking drains battery
3. **Data Connection**: Requires internet for map tiles
4. **Heatmap Performance**: May lag with >500 data points
5. **iOS Safari**: May need user gesture to start geolocation

### Workarounds
- **Battery**: Stop journey when not actively tracking
- **Offline**: Tiles are cached after initial load
- **Permission**: Clear prompts guide user

---

## 📊 Data Privacy

### Location Data
- **Real-time only**: Not stored on servers
- **Route history**: Stored locally in browser
- **User control**: Can clear data anytime
- **Anonymous**: Contributed spots don't include user ID

### Best Practices
- Location accuracy shared only when needed
- No tracking when journey inactive
- User consent required for all features
- Transparent data usage

---

## 🎓 User Guide

### Getting Started
1. **Allow Location**: Tap "Allow" when prompted
2. **Explore Map**: Pinch/drag to navigate
3. **Toggle Layers**: Use layers button to customize view
4. **Start Journey**: Tap green button to begin tracking
5. **Add Spots**: Contribute eco-friendly locations

### Tips for Best Experience
- Use on WiFi initially to cache map tiles
- Enable "High Accuracy" in iOS Location Settings
- Keep app open during journey for best tracking
- Toggle off unused layers for cleaner map
- Check heatmap to find eco-friendly areas

### Troubleshooting
- **Location not working?** Check Settings → Privacy → Location Services
- **Map not loading?** Check internet connection
- **Stats not updating?** Ensure journey is active (green indicator)
- **Heatmap not visible?** Toggle layers and check if it's enabled

---

## 🏆 Credits & Attribution

### Map Data
- © OpenStreetMap contributors
- Leaflet.js mapping library
- Leaflet.heat heatmap plugin

### Icons
- Lucide React icon library
- Custom eco-themed markers

### Inspiration
- Waze community reporting
- Strava activity tracking
- Google Maps UI patterns
- Apple Maps iOS design

---

## 📝 Changelog

### Version 2.0 (Current)
- ✅ Real-time journey tracking
- ✅ Transport mode selection
- ✅ Heatmap visualization
- ✅ Route history display
- ✅ Mobile-optimized bottom sheets
- ✅ Layer control system
- ✅ Carbon calculation engine
- ✅ Eco score algorithm
- ✅ User contributions (waypoints & events)
- ✅ Enhanced map markers with popups

### Version 1.0 (Previous)
- Basic map display
- Static waypoints
- Simple location tracking
- Basic add dialog

---

## 🤝 Contributing

Want to improve the map? Here's how:

1. **Add Eco Spots**: Use the app to contribute locations
2. **Report Issues**: Submit bugs via GitHub
3. **Suggest Features**: Share ideas in discussions
4. **Test on iPhone**: Help us optimize for iOS
5. **Share Feedback**: Tell us what works and what doesn't

---

## 📞 Support

For questions or issues:
- 📧 Email: support@eco-trackr.app
- 💬 GitHub: Open an issue
- 📱 In-app: Feedback button

---

**Built with 💚 for a sustainable future**

