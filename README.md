# H2Know

Personal study-tracking dashboard for H2Know water bottles. Each bottle's QR code opens a unique dashboard at `/u/H2KNOW-XXX`.

**Tagline:** Drink Smarter with H2Know

---

## What's included

- Stream & subject tracking (Science / Commerce / Arts — Indian 10+2)
- Goals, study logs, streaks
- Timetable generator
- Planned vs Actual charts
- Gemini AI career & study insights
- Celebration confetti + sounds when you hit daily goals
- Break timer (10 min default, 5 min short, 30 min meal)

---

## Deploy to Vercel (step-by-step)

You only need a GitHub account, Vercel account, and a free Gemini API key. No coding required after setup.

### Step 1 — Install Node.js (one time, on your PC)

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version and install it
3. Restart your computer

### Step 2 — Push code to GitHub

1. Create a new repository on [github.com](https://github.com) named `h2know`
2. Open **PowerShell** and run:

```powershell
cd C:\Users\User\Documents\h2know
git init
git add .
git commit -m "Initial H2Know app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/h2know.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your `h2know` repository
4. Click **Deploy** (defaults are fine)

### Step 4 — Add Vercel KV (storage)

1. In your Vercel project, open the **Storage** tab
2. Click **Create Database → KV**
3. Connect it to your project (one click)
4. Vercel auto-adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`

### Step 5 — Add Gemini API key

1. Get a free key at [Google AI Studio](https://aistudio.google.com/apikey)
2. In Vercel: **Settings → Environment Variables**
3. Add:
   - Name: `GEMINI_API_KEY`
   - Value: your key
4. Click **Redeploy** on the latest deployment

### Step 6 — Point your QR code

Your bottle QR code should link to:

```
https://h2know.vercel.app/u/H2KNOW-102
```

(Use your actual Vercel URL if the project name differs.)

---

## Test locally (optional)

```powershell
cd C:\Users\User\Documents\h2know
copy .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000/u/H2KNOW-102](http://localhost:3000/u/H2KNOW-102)

Without KV env vars, data is stored in memory (resets when you stop the server). For real persistence locally, connect Vercel KV and copy the env vars into `.env.local`.

---

## User IDs

| ID | Notes |
|----|-------|
| `H2KNOW-102` | Pre-loaded with sample data on first visit |
| `H2KNOW-103` | Empty dashboard (for a second bottle later) |

Each user's data is fully isolated — no shared storage between IDs.

---

## Environment variables

| Variable | Required | Source |
|----------|----------|--------|
| `GEMINI_API_KEY` | Yes (for AI) | Google AI Studio |
| `KV_REST_API_URL` | Yes (production) | Vercel KV integration |
| `KV_REST_API_TOKEN` | Yes (production) | Vercel KV integration |

---

## Sounds

Celebration and alert sounds live in `/public/sounds/`:

- `celebration.mp3` — plays when you hit a daily study goal
- `alert.mp3` — plays 1 minute before break ends

Free CC0 sounds can be downloaded from [mixkit.co](https://mixkit.co/free-sound-effects/) if you want to replace them.

---

## Tech stack

- Next.js 14 (App Router)
- React + Tailwind CSS
- Chart.js / react-chartjs-2
- Google Gemini (`gemini-1.5-flash`)
- Vercel KV (Upstash Redis)
- canvas-confetti
