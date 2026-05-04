# VidAI — AI Video Generator

Generate videos from text prompts or images using free AI models.

---

## Setup (5 steps)

### 1. Supabase (free at supabase.com)
1. Create a new project
2. Go to **SQL Editor** → paste contents of `supabase-setup.sql` → Run
3. Go to **Storage** → New Bucket → name it `videos` → set to **Public**
4. Go to **Settings → API** → copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep secret)

### 2. Hugging Face (free at huggingface.co)
1. Sign up at huggingface.co
2. Go to **Settings → Access Tokens** → New Token (read access)
3. Copy the token

### 3. Backend
```bash
cd backend
cp .env.example .env
# Fill in your keys in .env
npm install
npm start
```

### 4. Frontend
Open `www/index.html` and fill in at the top of the `<script>`:
```js
const SUPABASE_URL  = 'https://your-project.supabase.co';
const SUPABASE_ANON = 'your-anon-key';
const BACKEND_URL   = 'http://localhost:3001';
```

### 5. Open the app
```bash
# From the www folder
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## Build Android APK
```bash
npm install
npx cap sync android
cd android && ./gradlew assembleDebug
# APK → android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Notes
- Free Hugging Face tier is **slow** (1–3 min per video) and may return 503 if model is loading — just retry
- Videos are stored in Supabase Storage (1GB free)
- To deploy backend: use Railway, Render, or any Node.js host
