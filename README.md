# CivicFix AI

**AI-powered multimodal civic complaint management system**

> CivicFix AI turns a citizen's photo, voice, and location into an intelligent civic complaint that can be routed, acted upon, tracked, and automatically verified.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- NeonDB account (free tier)
- Google Gemini API key

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Copy `server/.env.example` → `server/.env` and fill in:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### 3. Setup Database

```bash
cd server
npx drizzle-kit push    # Push schema to NeonDB
npm run seed            # Seed demo data
```

### 4. Run Development

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

Visit `http://localhost:5173`

## Deployment

The frontend is ready for Vercel and the backend is ready for Render.

1. Deploy the `server` directory using the root [`render.yaml`](render.yaml). Set `DATABASE_URL`, `GEMINI_API_KEY`, and `CLIENT_URL` in Render. Render generates `JWT_SECRET` from the Blueprint. `CLIENT_URL` must be the final Vercel URL (or a comma-separated list if you use a custom domain too).
2. Copy the Render service URL, such as `https://civicfix-api.onrender.com`.
3. In Vercel, set the project's root directory to `client`, then add `VITE_API_URL` with the Render URL from step 2. Redeploy after adding it.

The current upload folder is suitable for a demo, but Render's local filesystem is ephemeral. Use object storage (for example, Supabase Storage or Cloudinary) before treating uploaded evidence as durable production data.

## 🏗 Architecture

```
Citizen → React Frontend → Express API → AI Analysis (Gemini) → Agent → Tools → Database
```

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (NeonDB) + Drizzle ORM |
| AI | Google Gemini 2.5 Flash |
| Speech | Browser Web Speech API |

### AI Agent Tools
1. **analyze_complaint** - Multimodal analysis (image + text → structured JSON)
2. **find_previous_complaints** - Duplicate detection within 200m radius
3. **assign_department** - Problem type → department routing
4. **request_human_review** - Low confidence flagging
5. **escalate_complaint** - Priority escalation
6. **request_resolution_evidence** - Post-fix photo request
7. **verify_resolution** - Before/after AI comparison

## 📊 Hackathon Constraints

1. **Multimodal** - Image + Voice + Location fusion
2. **Handle being wrong** - Confidence scoring + human review + conflict detection
3. **Graceful degradation** - Offline queue + auto-sync

## 🖥 Screens

1. **Report Page** - Photo upload + voice recording + GPS
2. **AI Analysis** - Real-time AI classification + agent activity log
3. **Complaint Status** - Timeline + evidence gallery + resolution verification
4. **Operator Dashboard** - Stats + filters + human review modal
5. **Evaluation Harness** - 20 test cases with accuracy metrics
