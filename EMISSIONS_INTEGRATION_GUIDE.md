# 🌍 County Emissions Data Integration Guide

## Overview
The `EmissionsComparison` component provides visual comparison of county, national, and global CO₂ emissions data. This guide explains how to integrate it into your Eco-Trackr app.

---

## 📦 Component Location
```
src/components/map/EmissionsComparison.jsx
```

---

## 🎯 Usage

### **Option 1: Map Page Overlay (Compact Mode)**

Add emissions data as a floating card on the map:

```javascript
// In src/pages/Map.jsx

import EmissionsComparison from "@/components/map/EmissionsComparison";

// Inside MapPage component, add this to the map overlay section:

{/* Emissions Overlay - Bottom Left */}
<div className="absolute bottom-24 left-4 right-4 z-[1000]">
  <EmissionsComparison 
    emissionData={emissionData}
    currentLocation={locationName || "Your County"}
    compact={true}
  />
</div>
```

**Position Options**:
- Bottom left: `bottom-24 left-4`
- Top right: `top-4 right-4`
- Bottom right: `bottom-24 right-4`

### **Option 2: Layers Sheet Integration**

Add as a collapsible section in the layers control:

```javascript
// In the Layers Sheet section of Map.jsx

<Sheet open={showLayersSheet} onOpenChange={setShowLayersSheet}>
  <SheetContent side="bottom" className="bg-[#0f5132] border-emerald-500/30">
    <SheetHeader>
      <SheetTitle className="text-white">Map Layers</SheetTitle>
    </SheetHeader>
    
    <div className="space-y-4 mt-6 pb-6 max-h-[60vh] overflow-y-auto">
      {/* Existing layer toggles */}
      {/* ... */}
      
      {/* NEW: Emissions Section */}
      <div className="pt-4 border-t border-emerald-500/20">
        <EmissionsComparison 
          emissionData={emissionData}
          currentLocation={locationName}
          compact={false}
        />
      </div>
    </div>
  </SheetContent>
</Sheet>
```

### **Option 3: Analytics Page**

Create a dedicated emissions analytics view:

```javascript
// In src/pages/Analytics.jsx

import EmissionsComparison from "@/components/map/EmissionsComparison";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function Analytics() {
  const { data: emissionData } = useQuery({
    queryKey: ['emissionData'],
    queryFn: () => base44.entities.EmissionData.list('-year', 10), // Last 10 years
    initialData: [],
  });

  return (
    <div className="px-6 pt-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Environmental Analytics</h1>
      
      {/* Emissions Comparison */}
      <EmissionsComparison 
        emissionData={emissionData}
        currentLocation="Henrico County"
        compact={false}
      />
      
      {/* Other analytics components */}
    </div>
  );
}
```

### **Option 4: Dashboard Widget**

Add as a card on the dashboard:

```javascript
// In src/pages/Dashboard.jsx

import EmissionsComparison from "@/components/map/EmissionsComparison";

// Inside Dashboard component, add to the bottom sections:

<div className="px-6 pb-8">
  <h2 className="text-lg font-semibold text-white mb-4">Regional Impact</h2>
  <EmissionsComparison 
    emissionData={emissionData}
    currentLocation={locationName}
    compact={false}
  />
</div>
```

---

## 🔧 Props API

### `emissionData` (Array, optional)
Array of emission records from the database.

**Expected Structure**:
```javascript
[
  {
    id: "123",
    region_type: "county", // "county" | "national" | "global"
    region_name: "Henrico County",
    year: 2024,
    total_emissions: 5420000, // in tons CO₂
    per_capita_emissions: 15.2, // optional
    created_date: "2024-10-26"
  },
  // ... more records
]
```

**Default**: `[]` (empty array)

### `currentLocation` (String, optional)
Name of the user's current county or region.

**Examples**:
- `"Henrico County, VA"`
- `"Richmond"`
- `"Your County"`

**Default**: `"Your County"`

### `compact` (Boolean, optional)
Display mode toggle.

**Values**:
- `true`: Minimal 3-column view (for map overlays)
- `false`: Full detailed view (for dedicated sections)

**Default**: `false`

---

## 🎨 Styling Customization

### Compact Mode Dimensions
```javascript
// Compact card size
width: full (respects parent container)
padding: 12px (p-3)
height: auto (~80px)
```

### Full Mode Dimensions
```javascript
width: full
padding: 24px (p-6)
height: auto (~400px)
```

### Color Scheme Override
To match your app's theme, modify the component:

```javascript
// Change background
className="bg-[#YOUR_COLOR]/95"

// Change border
className="border-[#YOUR_COLOR]/30"

// Change text colors
className="text-[#YOUR_COLOR]"
```

---

## 📊 Database Schema

### Required Entity: `EmissionData`

If not already created, add to your Base44 schema:

```javascript
// In Base44 Admin Panel or schema.json

EmissionData {
  id: UUID (auto)
  region_type: String (required) // "county" | "national" | "global"
  region_name: String (required)
  year: Integer (required)
  total_emissions: Float (required) // tons CO₂
  per_capita_emissions: Float (optional)
  population: Integer (optional)
  created_date: DateTime (auto)
  created_by: String (auto)
}

// Indexes
- year (descending)
- region_type + year
```

### Sample Data

Seed your database with sample data:

```javascript
// County data
{
  region_type: "county",
  region_name: "Henrico County, VA",
  year: 2024,
  total_emissions: 5420000,
  per_capita_emissions: 15.2
}

{
  region_type: "county",
  region_name: "Henrico County, VA",
  year: 2023,
  total_emissions: 5680000,
  per_capita_emissions: 15.8
}

// National data
{
  region_type: "national",
  region_name: "United States",
  year: 2024,
  total_emissions: 5000000000,
  per_capita_emissions: 14.5
}

// Global data
{
  region_type: "global",
  region_name: "World",
  year: 2024,
  total_emissions: 35000000000,
  per_capita_emissions: 4.5
}
```

### Data Sources

**Where to get real emission data**:

1. **County/Local**:
   - EPA FLIGHT Tool: https://ghgdata.epa.gov/ghgp/main.do
   - State environmental agencies
   - Local government sustainability reports

2. **National**:
   - EPA National Emissions Inventory
   - U.S. Energy Information Administration
   - NOAA Carbon Tracker

3. **Global**:
   - World Bank Open Data
   - Global Carbon Project
   - Our World in Data

---

## 🚀 Implementation Steps

### Step 1: Verify Database Entity
```bash
# Check if EmissionData entity exists
# In Base44 admin panel: Entities → Check for "EmissionData"
```

### Step 2: Seed Sample Data
```javascript
// Create seed script or manually add via admin panel
await base44.entities.EmissionData.create({
  region_type: "county",
  region_name: "Henrico County, VA",
  year: 2024,
  total_emissions: 5420000
});

// Add more records for trends
```

### Step 3: Add Component Import
```javascript
// In Map.jsx or desired page
import EmissionsComparison from "@/components/map/EmissionsComparison";
```

### Step 4: Verify Data Query
```javascript
// Already implemented in Map.jsx
const { data: emissionData } = useQuery({
  queryKey: ['emissionData'],
  queryFn: () => base44.entities.EmissionData.list('-year', 1),
  initialData: [],
});
```

### Step 5: Add Component to UI
```javascript
// Choose your preferred integration option from above
<EmissionsComparison 
  emissionData={emissionData}
  currentLocation={locationName}
  compact={true}
/>
```

### Step 6: Test Display
```bash
# Run development server
npm run dev

# Navigate to map page
# Verify emissions card displays correctly
```

---

## 🧪 Testing

### Manual Test Checklist
- [ ] Component renders without data (shows zeros)
- [ ] Component displays with sample data
- [ ] Trends calculate correctly (year-over-year)
- [ ] Compact mode fits in map overlay
- [ ] Full mode displays all sections
- [ ] Colors indicate positive/negative trends
- [ ] Formatting handles large numbers (M/K)
- [ ] Responsive on mobile (iPhone)

### Test Data Scenarios

**Scenario 1: No Data**
```javascript
emissionData = []
// Should display: 0 values, no trends
```

**Scenario 2: Single Year**
```javascript
emissionData = [{ year: 2024, total_emissions: 5000000, ... }]
// Should display: values, 0% trend (no comparison)
```

**Scenario 3: Multi-Year**
```javascript
emissionData = [
  { year: 2024, total_emissions: 5000000, ... },
  { year: 2023, total_emissions: 5200000, ... }
]
// Should display: values, -3.8% trend (improvement)
```

---

## 🎯 Recommended Integration

For **best user experience**, I recommend:

### **Primary**: Map Page - Compact Overlay
Position at bottom of screen, above journey controls:

```javascript
// In Map.jsx, before journey control buttons

{/* Emissions Overlay */}
{!isTracking && (
  <div className="absolute bottom-24 left-4 right-4 z-[1000]">
    <EmissionsComparison 
      emissionData={emissionData}
      currentLocation={locationName}
      compact={true}
    />
  </div>
)}
```

**Why**: 
- Always visible context
- Doesn't interfere with journey tracking
- Educates users during idle time

### **Secondary**: Analytics Page - Full View
Dedicated section for detailed analysis:

```javascript
// In Analytics.jsx

<section>
  <EmissionsComparison 
    emissionData={emissionData}
    currentLocation={locationName}
    compact={false}
  />
</section>
```

**Why**:
- Users seeking details find it here
- Room for full context and actions
- Natural fit with analytics content

---

## 🔄 Data Update Strategy

### Frequency
- **Real-time**: Not required (annual data)
- **Recommended**: Quarterly updates
- **Minimum**: Annual refresh

### Update Process
```javascript
// Automated fetch script (optional)
const updateEmissionsData = async () => {
  // Fetch from EPA API or similar
  const latestData = await fetchFromEPA();
  
  // Create records in database
  for (const record of latestData) {
    await base44.entities.EmissionData.create(record);
  }
};

// Run annually or quarterly
```

### Cache Strategy
```javascript
// React Query config
const { data: emissionData } = useQuery({
  queryKey: ['emissionData'],
  queryFn: () => base44.entities.EmissionData.list('-year', 10),
  staleTime: 1000 * 60 * 60 * 24, // 24 hours
  cacheTime: 1000 * 60 * 60 * 24 * 7, // 7 days
});
```

---

## 📈 Future Enhancements

### Phase 2 Features
1. **Historical Chart**: Line graph showing 5-10 year trends
2. **Sector Breakdown**: Pie chart of emission sources
3. **County Ranking**: Compare to neighboring counties
4. **Projections**: Forecast future emissions
5. **User Impact**: Show how individual actions affect total

### Component Extensions
```javascript
// EmissionsChart.jsx - Line chart over time
// EmissionsSectors.jsx - Breakdown by source
// EmissionsLeaderboard.jsx - County rankings
```

---

## 🤝 Contributing

To improve the emissions component:

1. **Add Data Sources**: Integrate EPA API
2. **Enhance Visuals**: Add charts and graphs
3. **Improve Calculations**: Add per-capita views
4. **Localization**: Support multiple regions
5. **Accessibility**: Add ARIA labels

---

## 📞 Support

For integration issues:
- Check console for data fetch errors
- Verify EmissionData entity exists
- Ensure data has correct structure
- Test with sample data first

---

## ✅ Completion Checklist

Before marking this feature complete:

- [ ] EmissionData entity created in database
- [ ] Sample data added (county, national, global)
- [ ] Component imported in desired page(s)
- [ ] Data query verified working
- [ ] Component renders correctly
- [ ] Tested on mobile (iPhone)
- [ ] Trends calculate accurately
- [ ] Colors indicate correctly
- [ ] Compact mode fits overlay
- [ ] Full mode displays all sections

---

**Integration Time**: ~30 minutes  
**Difficulty**: Easy  
**Prerequisites**: EmissionData entity in database  
**Status**: ✅ Component Ready, Awaiting Integration

**Built with 💚 for environmental awareness**

