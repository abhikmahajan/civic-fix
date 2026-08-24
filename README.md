# BetterBharat AI

**AI-powered multimodal civic complaint management system designed for scale.**

> CivicFix AI turns a citizen's photo, voice, and location into an intelligent civic complaint that can be routed, acted upon, tracked, and automatically verified using AI.

## 🌟 Features

- **AI Complaint Analysis:** Uses Google Gemini Vision to automatically extract the problem type, severity, and responsible department from a user's uploaded photo and description.
- **AI Resolution Verification:** When management uploads a photo to prove a job is done, Gemini AI compares the "Before" and "After" photos to mathematically verify if the issue was actually resolved.
- **Role-Based Access Control:** Secure JWT authentication separating Citizens (can only view/track their own complaints) and Management (can view all complaints, change statuses, and submit verification evidence).
- **Intelligent State Machine:** Built-in transition rules for complaints (`Pending` -> `In Progress` -> `Awaiting Verification` -> `Resolved`).
- **Serverless-Ready Architecture:** Includes client-side image compression and Base64 database image storage, bypassing traditional file-system limits and making it 100% compatible with Vercel's serverless environment.

---

## 🚀 Quick Start Local Development

### Prerequisites
- Node.js 18+
- NeonDB account (Serverless PostgreSQL)
- Google Gemini API key

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/abhikmahajan/better-bharat.git
cd civic-fix-ai

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

**Backend (`server/.env`)**
Create a `.env` file in the `server` directory:
```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=generate_a_secure_random_string
CLIENT_URL=http://localhost:5173
```

**Frontend (`client/.env`)**
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Setup Database

```bash
cd server
npx drizzle-kit push    # Push schema to NeonDB
npm run seed            # Seed demo data (creates test accounts and complaints)
```
*Test Accounts created by the seed script:*
- **Citizen:** `rahul@example.com` / `password123`
- **Management:** `priya@example.com` / `password123`

### 4. Run Development

```bash
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client
cd client
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## 🌍 Vercel Deployment

Both the Frontend and Backend are fully optimized to run on **Vercel**.

### Deploying the Backend (API)
1. Import your GitHub repository to Vercel.
2. Set the **Root Directory** to `server`.
3. Add your Environment Variables: `DATABASE_URL`, `GEMINI_API_KEY`, `JWT_SECRET`.
4. Deploy the project. Note the resulting URL (e.g., `https://civicfix-api.vercel.app`).

### Deploying the Frontend (Web)
1. Import the same GitHub repository to Vercel as a new project.
2. Set the **Root Directory** to `client`.
3. Vercel will auto-detect **Vite**.
4. Add the Environment Variable: `VITE_API_URL` set to your backend URL (e.g., `https://civicfix-api.vercel.app/api`).
5. Deploy the project. Note the resulting URL (e.g., `https://civicfix-web.vercel.app`).

### Finalizing CORS
1. Go back to your **Backend** project settings in Vercel.
2. Add the `CLIENT_URL` environment variable and set it to your frontend URL.
3. Redeploy the backend.

---

## 🏗 Architecture

```
Citizen → React Frontend → Express API → AI Agent Pipeline (Gemini) → Database
```

### Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite + Tailwind CSS v4 + Lucide React |
| **Backend** | Node.js + Express.js + Multer (Memory Storage) |
| **Database** | PostgreSQL (NeonDB) + Drizzle ORM |
| **AI** | Google Gemini (Vision & Text) |
| **Deployment**| Vercel Serverless Functions (`vercel.json` configured) |

---

## 🛠 Design Decisions & Constraints Handled

1. **Vercel Serverless File Storage:** Traditional Express apps use `multer.diskStorage` to save files locally. Because Vercel's file system is read-only and ephemeral, this app converts uploaded images into heavily compressed Base64 Data URIs and stores them directly in NeonDB, enabling a flawless zero-config serverless deployment.
2. **Vercel Payload Limits:** Vercel strictly kills requests with payloads larger than 4.5MB. To prevent users from uploading massive 10MB iPhone photos that crash the API, the React frontend utilizes an HTML5 Canvas utility to intelligently resize and compress images to ~500KB *before* transmitting them over the network.
3. **AI Timeouts:** Analyzing multiple images simultaneously takes time. Vercel's backend functions are explicitly configured (`maxDuration: 60` in `vercel.json`) to allow up to 60 seconds of processing time, avoiding `504 Gateway Timeout` errors.
4. **Graceful Degradation:** The frontend includes an Offline Queue system that caches reports locally when the user loses internet connection, automatically syncing them when connectivity is restored.
