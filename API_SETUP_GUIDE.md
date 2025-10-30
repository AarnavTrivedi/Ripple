# API Configuration Guide (Gemini + Mapbox)

The Ripple app uses two main APIs:
- **Gemini AI** for the intelligent chatbot
- **Mapbox** for 3D geospatial mapping

## Setup Instructions

### 1. Get Your API Keys

#### Gemini API Key (for Chatbot)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

#### Mapbox Access Token (for 3D Map)
1. Visit [Mapbox Access Tokens](https://account.mapbox.com/access-tokens/)
2. Sign in or create a Mapbox account
3. Click "Create a token" or use your default token
4. Copy your token (starts with `pk.`)

### 2. Add API Keys to Your Project

Create a `.env` file in the root of your project (if it doesn't exist):

```bash
# .env

# Gemini API Key (for AI Chatbot)
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Mapbox Access Token (for 3D Geospatial Map)
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

**Important:** Replace the placeholder values with your actual API keys from step 1.

### 3. Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Features

### Gemini AI Chatbot
The Gemini-powered chatbot provides:
- ✅ Real-time environmental advice
- ✅ Sustainability tips and eco-friendly recommendations
- ✅ Carbon footprint reduction strategies
- ✅ Climate action insights
- ✅ Friendly, conversational responses with emojis

**Configuration:**
- **Model:** `gemini-pro`
- **Temperature:** 0.7 (balanced creativity)
- **Max tokens:** 1024 (concise responses)
- **Safety filters:** Medium and above blocking for all categories

### Mapbox 3D Geospatial Map
The Mapbox-powered map provides:
- ✅ Real-time 3D terrain visualization
- ✅ Satellite imagery with streets overlay
- ✅ Air quality heatmap overlay
- ✅ Green spaces and eco-infrastructure markers
- ✅ Route tracking and navigation
- ✅ Interactive camera controls (pan, zoom, rotate)

**Features:**
- **Style:** `satellite-streets-v12` (hybrid satellite + roads)
- **3D Buildings:** Extruded building footprints
- **Deck.gl Integration:** High-performance data visualization layers
- **Live Tracking:** GPS-based route history

## Troubleshooting

### Gemini Chatbot Issues

**"API request failed" error:**
- Check that your Gemini API key is correctly set in `.env`
- Ensure the key starts with `VITE_GEMINI_API_KEY`
- Verify your API key is active in Google AI Studio
- Make sure you're not rate-limited (60 requests/min free tier)

**"Please check your API key" error:**
- Ensure `.env` file is in the root directory
- Restart the development server after adding the key
- Check for typos in the environment variable name

### Mapbox 3D Map Issues

**"Mapbox Token Required" screen:**
- Check that your Mapbox token is correctly set in `.env`
- Ensure the token starts with `pk.` (public token)
- Verify your token is active at [Mapbox Dashboard](https://account.mapbox.com/)
- Make sure the key name is exactly `VITE_MAPBOX_TOKEN`

**Map not loading or black screen:**
- Check browser console for errors
- Verify token has appropriate scopes (check Mapbox dashboard)
- Ensure you haven't exceeded free tier limits (50,000 tile requests/month)
- Try using the default public token for testing

**3D layers not rendering:**
- Ensure your browser supports WebGL 2.0
- Check that hardware acceleration is enabled in browser settings
- Try different map styles if satellite view fails

## API Costs & Limits

### Gemini Pro API
- **Free Tier:** 60 requests per minute
- **Cost:** Free for standard usage
- Check [Google AI pricing](https://ai.google.dev/pricing) for current limits

### Mapbox
- **Free Tier:** 50,000 map loads per month
- **Tile Requests:** 200,000 free per month
- **Cost After Free Tier:** ~$5/month for next tier
- Check [Mapbox pricing](https://www.mapbox.com/pricing) for details

**Optimization Tips:**
- Mapbox caches tiles automatically
- Use route tracking sparingly to save requests
- Consider disabling satellite view if hitting limits (uses more tiles)

## Security Note

⚠️ **Never commit your `.env` file to version control!** 

- The `.env` file should already be in `.gitignore`
- API keys are sensitive - treat them like passwords
- Rotate keys immediately if accidentally exposed
- Use separate keys for development and production

## Quick Test

After setup, verify everything works:

1. **Test Chatbot:** Go to Chatbot page → Ask "What are some eco-friendly tips?"
2. **Test Map:** Go to Scanner page → Click "NEW" (globe icon) → See 3D satellite map
3. **Check Console:** No errors about missing tokens

If both work, you're all set! 🎉

