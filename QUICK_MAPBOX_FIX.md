# Quick Mapbox Fix - Use Demo Token

## 🚀 Immediate Solution

You're seeing the "Mapbox Token Required" screen because you need to add a Mapbox token to your `.env` file.

### Option 1: Use Demo Token (Instant Access)

**Copy this ENTIRE command and paste in your terminal:**

```bash
cd /Users/aarnavtrivedi/Documents/GitHub/SAT/emptycode/eco-trackr-472abb53 && echo 'VITE_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' >> .env && echo "✅ Demo token added! Now restart: npm run dev"
```

This will:
1. Navigate to your project
2. Add the demo Mapbox token to `.env`
3. Show success message

**Then restart your dev server:**
```bash
npm run dev
```

The map should work immediately! 🗺️

---

### Option 2: Use Your Own Token (Better for Production)

1. **Get your FREE Mapbox token:**
   - Visit: https://account.mapbox.com/access-tokens/
   - Sign up/login
   - Copy your default token (starts with `pk.`)

2. **Add to `.env` file:**
   ```bash
   # Create/edit .env in project root
   VITE_MAPBOX_TOKEN=pk.YOUR_ACTUAL_TOKEN_HERE
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

## 🔧 Manual Method (If Command Doesn't Work)

1. **Create `.env` file** in project root:
   ```bash
   /Users/aarnavtrivedi/Documents/GitHub/SAT/emptycode/eco-trackr-472abb53/.env
   ```

2. **Add this line:**
   ```
   VITE_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw
   ```

3. **Save and restart:**
   ```bash
   npm run dev
   ```

---

## 📝 Complete `.env` Template

If you want both Gemini and Mapbox working:

```bash
# Gemini AI (Chatbot)
VITE_GEMINI_API_KEY=your_gemini_key_here

# Mapbox (3D Map) - Demo token below works for testing
VITE_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw
```

---

## ⚠️ About the Demo Token

The demo token (`pk.eyJ1...`) is:
- ✅ **Safe to use** - It's Mapbox's official public demo token
- ✅ **Good for testing** - Limited to basic usage
- ✅ **Works immediately** - No signup needed
- ⚠️ **Not for production** - Get your own free token for real use

**Free Tier Limits:**
- 50,000 map loads/month (FREE)
- 200,000 tile requests/month (FREE)

---

## ✅ Verification

After adding the token and restarting:

1. Go to Scanner page
2. Click **"NEW"** button (globe icon)
3. You should see the 3D satellite map load
4. No more "Token Required" screen!

---

## 🐛 Still Not Working?

1. **Check `.env` location:**
   - Must be in project ROOT
   - Same folder as `package.json`

2. **Check file name:**
   - Must be exactly `.env` (with the dot)
   - Not `.env.txt` or `env`

3. **Restart dev server:**
   - Stop server (Ctrl+C)
   - Run `npm run dev` again

4. **Clear browser cache:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## 🎉 Success Indicators

When it works, you'll see:
- ✅ 3D satellite map rendering
- ✅ Blue location marker
- ✅ Drag to rotate works
- ✅ Console shows: "✅ Mapbox map loaded successfully!"

---

**Need help?** Check `MAPBOX_COMPLETE_SETUP.md` for detailed troubleshooting.

