# 🛒→📌 PinIt Pro — Amazon to Pinterest Automation

Full-stack tool that turns any Amazon product link into a viral Pinterest pin with AI-generated content, affiliate tracking, and scheduled publishing.

## Architecture

```
amazon-to-pinterest/
├── backend/          # NestJS API (port 3001)
│   └── src/
│       └── modules/
│           ├── scraper/       # Amazon product extraction
│           ├── ai/            # Claude AI content generation
│           ├── pin-designer/  # SVG pin image generation
│           ├── pinterest/     # Pinterest API scheduling
│           └── affiliate/     # Click & conversion tracking
└── frontend/         # React + Vite (port 3000)
    └── src/
        ├── components/
        │   ├── StepExtract.tsx
        │   ├── StepGenerate.tsx
        │   ├── StepDesign.tsx
        │   ├── StepSchedule.tsx
        │   ├── StepTrack.tsx
        │   └── Dashboard.tsx
        └── services/api.ts
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/scraper/extract | Extract Amazon product data |
| POST | /api/ai/generate | Generate Pinterest content via Claude |
| POST | /api/pin-designer/design | Generate pin SVG image |
| POST | /api/pinterest/boards | Get Pinterest boards |
| POST | /api/pinterest/schedule | Schedule/publish pin |
| GET  | /api/pinterest/pins | List all scheduled pins |
| POST | /api/affiliate/generate | Generate affiliate tracking link |
| GET  | /api/affiliate/stats | Get click/conversion stats |
| GET  | /api/affiliate/links | List all affiliate links |

## Quick Start

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm install
npm run start:dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional - for real Pinterest publishing
PINTEREST_ACCESS_TOKEN=...

# Optional - your Amazon Associates tag
AMAZON_AFFILIATE_TAG=your-tag-20
```

## Getting API Keys

### Anthropic (Required for AI content)
1. Go to https://console.anthropic.com
2. Create API key
3. Add to `backend/.env`

### Pinterest API (Optional - for real scheduling)
1. Go to https://developers.pinterest.com
2. Create app → get access token
3. Add to `backend/.env` or paste in the UI

### Amazon Associates (Optional - for commissions)
1. Join https://affiliate-program.amazon.com
2. Get your associate tag (e.g. `yourname-20`)
3. Enter in the UI when creating pins

## Features

- **Amazon Scraper** — Extracts title, price, rating, images, features
- **AI Content Generation** — Claude writes Pinterest-optimized titles, descriptions, hashtags, SEO keywords
- **Pin Designer** — Generates 600×900 SVG pins in 4 themes (Bold, Elegant, Fresh, Warm)
- **Pinterest Scheduler** — Publishes directly via Pinterest API (or demo mode)
- **Affiliate Tracking** — Generates tagged Amazon URLs, tracks clicks & conversions
- **Dashboard** — Full analytics view with pins, links, revenue

## Demo Mode

Run without any API keys — use `demo` as the Pinterest access token. The full UI flow works; only real Pinterest publishing and real Amazon scraping require keys.

## Production Notes

- Replace in-memory stores with PostgreSQL/Redis
- Add Pinterest OAuth flow for multi-user
- Add job queue (Bull) for scheduled pins
- Add webhook receiver for Amazon conversion events
- Deploy backend to Railway/Render, frontend to Vercel
