# 🚀 Geospatial Scanner Setup Guide

## Quick Start (5 minutes)

### Step 1: Get Mapbox Token
1. Go to [Mapbox Access Tokens](https://account.mapbox.com/access-tokens/)
2. Sign up (free) or log in
3. Click "Create a token"
4. Copy the token (starts with `pk.`)

### Step 2: Add Token to Environment
Create or edit `.env` file in the project root:

```bash
VITE_MAPBOX_TOKEN=pk.your_actual_token_here
```

⚠️ **Important**: Replace `pk.your_actual_token_here` with your real token!

### Step 3: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Test
1. Open `http://localhost:5173`
2. Go to Scanner tab
3. Should see 3D map loading!

---

## What You Get

### ✅ **Working Features**
- 3D terrain visualization (real elevation data)
- Satellite imagery basemap
- Air quality heatmap (3D hexagons)
- Green spaces (parks, forests)
- User location tracking
- Real-time route tracking
- Eco challenges at real coordinates

### 🎮 **Controls**
- **Pan**: Click + drag
- **Rotate**: Right-click + drag (or Cmd+drag on Mac)
- **Zoom**: Scroll or pinch
- **Tilt**: Ctrl+drag up/down

---

## Troubleshooting

### "Mapbox Token Required" screen
- ✅ Check `.env` file exists in project root
- ✅ Check token starts with `pk.`
- ✅ Restart dev server after adding token
- ✅ No quotes needed around token in `.env`

### Map not loading
- ✅ Check browser console for errors
- ✅ Verify Mapbox token is valid (visit Mapbox dashboard)
- ✅ Check you're not hitting rate limits (50k/month free tier)

### Location not showing
- ✅ Allow location permissions in browser
- ✅ Check browser console for geolocation errors
- ✅ Try HTTPS (geolocation requires secure context)

### 3D not working
- ✅ Check browser supports WebGL 2.0
- ✅ Update graphics drivers
- ✅ Try different browser (Chrome recommended)

---

## Mapbox Free Tier Limits

- ✅ **50,000 map loads** per month
- ✅ **Unlimited** users
- ✅ **No credit card** required to start
- ✅ **Full 3D terrain** and satellite imagery

**For ~1000 active users**: Well within free tier
**If you exceed**: Mapbox will email you, ~$5/month for next tier

---

## Next Steps

Once setup is working:

1. **Test with real location data** - Walk around and see route tracking
2. **Complete eco challenges** - They're now at real coordinates!
3. **Explore air quality** - See which streets have cleaner air
4. **Find green spaces** - Discover nearby parks

---

## Advanced Configuration (Optional)

### Custom Map Style
In `GeospatialScanner.jsx`, change `mapStyle`:

```javascript
// Satellite with streets (default)
mapStyle="mapbox://styles/mapbox/satellite-streets-v12"

// Dark mode
mapStyle="mapbox://styles/mapbox/dark-v11"

// Light mode
mapStyle="mapbox://styles/mapbox/light-v11"

// Outdoors
mapStyle="mapbox://styles/mapbox/outdoors-v12"
```

### Terrain Exaggeration
```javascript
terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
// Change 1.5 to 2.0 for more dramatic hills
// Change to 1.0 for realistic elevation
```

### Initial Camera Position
In `INITIAL_VIEW_STATE`:
```javascript
longitude: -122.41669,  // Your city's longitude
latitude: 37.7853,      // Your city's latitude
zoom: 14,               // Higher = closer (max 20)
pitch: 45,              // Tilt angle (0-60)
bearing: 0              // Rotation (0-360)
```

---

## What's Next (Phase 2)

Coming soon:
- [ ] Terrain elevation rendering (full 3D mountains)
- [ ] Building footprints (3D city models)
- [ ] Carbon savings arcs over routes
- [ ] Neighborhood eco-score comparison
- [ ] Challenge proximity detection
- [ ] Social features (see other users' routes)

---

## Need Help?

- Check `GEOSPATIAL_3D_TRANSFORMATION_PLAN.md` for full technical details
- Check `BEFORE_AFTER_COMPARISON.md` to see what's changed
- Review browser console for errors
- Ensure all dependencies installed: `npm install`

**You're now using cutting-edge geospatial visualization!** 🌍✨

