# SupportDesk — Datastraw CRM

> A world-class Customer Support Ticketing CRM built for the Datastraw Technologies internship assessment.

**Live Demo:** `[https://crm-datastraw.vercel.app]`
**GitHub:** `[https://github.com/Vaidik-7781/crm-datastraw]`
**Demo Video:** `[https://www.loom.com/share/dd2ce777361149b388637796ad4d5819]`

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend  | Next.js API Routes (REST)         |
| Database | Supabase (PostgreSQL)             |
| AI       | Anthropic Claude API (claude-haiku-4-5) |
| Charts   | Recharts                          |
| Deploy   | Vercel (frontend + API) + Supabase (DB) |

---

## Features

### Core (All 5 Required)
- ✅ **Create Tickets** — Full form with validation, auto-generated TKT-001 IDs + timestamps
- ✅ **List All Tickets** — Sortable table with ID, name, subject, status, priority, date
- ✅ **Search** — Debounced live search across name, email, ID, subject, description
- ✅ **Filter by Status** — Filter by Open / In Progress / Closed / Resolved + Priority + Category
- ✅ **View & Update** — Detailed view with inline status/priority/assignee update + notes

### Bonus Features
- 🤖 **AI Analysis** — Claude AI auto-detects category, priority, customer sentiment + generates draft response
- 📊 **Analytics Dashboard** — Charts for volume trends, category breakdown, priority distribution, resolution rates
- ⏱️ **SLA Indicators** — Warning at 24h, Overdue badge at 48h for open tickets
- ✅ **Bulk Actions** — Select multiple tickets → bulk status change in one click
- 📥 **CSV Export** — Download filtered ticket list instantly
- 🌙 **Dark Mode** — Full dark theme, persisted preference
- 📋 **Activity Audit Log** — Complete history of every change on each ticket
- 📝 **Notes & Comments** — Add internal notes with author + timestamp
- 📄 **Pagination** — 25 tickets per page with full navigation
- 🔢 **Analytics Page** — 30-day trend, sentiment pie, top customers, resolution rates

---

## Database Schema

```
tickets
  id, ticket_id (TKT-001), customer_name, customer_email
  subject, description, status, priority, category
  assigned_to, ai_category, ai_priority, ai_sentiment
  ai_summary, ai_suggested_response
  resolved_at, created_at, updated_at

notes
  id, ticket_id (fk), note_text, author, created_at

activity_log
  id, ticket_id (fk), action, old_value, new_value
  performed_by, created_at
```

---

## API Endpoints

### Required 4
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets` | Create ticket |
| `GET`  | `/api/tickets?status=&search=&priority=&category=&sortBy=&page=` | List with filters |
| `GET`  | `/api/tickets/:id` | Get single ticket + notes + activity |
| `PUT`  | `/api/tickets/:id` | Update status, priority, category, assignee, note |

### Bonus 8
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/tickets/stats` | Dashboard statistics |
| `POST` | `/api/tickets/:id/analyze` | Run AI analysis (Claude) |
| `POST` | `/api/tickets/:id/notes` | Add note to ticket |
| `GET`  | `/api/tickets/:id/activity` | Audit log for ticket |
| `GET`  | `/api/tickets/export` | Download CSV |
| `PUT`  | `/api/tickets/bulk` | Bulk status update |

---

## Local Setup

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/crm-datastraw.git
cd crm-datastraw
npm install
```

### 2. Supabase Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `supabase/schema.sql`
3. Optionally run `supabase/seed.sql` for sample data
4. Copy your project URL and anon key from **Settings → API**

### 3. Environment Variables
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-anthropic-key   # Optional — AI features
```

### 4. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

```bash
# Push to GitHub first
git add . && git commit -m "feat: initial crm build" && git push

# Then:
# 1. Go to vercel.com → Import GitHub repo
# 2. Add environment variables in Vercel dashboard
# 3. Deploy — done in ~2 minutes
```

---

## Architecture

```
Browser
  │
  ├── Next.js 14 App Router (Vercel)
  │     ├── Server Components → direct Supabase queries (fast initial load)
  │     ├── Client Components → interactive UI (search, filters, forms)
  │     └── API Routes → mutations, AI calls, CSV export
  │
  └── Supabase (PostgreSQL)
        ├── tickets table
        ├── notes table
        └── activity_log table
```

---

## Project Structure

```
crm-datastraw/
├── app/
│   ├── page.tsx                    # Dashboard (server)
│   ├── layout.tsx                  # Root layout + sidebar
│   ├── tickets/
│   │   ├── page.tsx                # Ticket list (client)
│   │   ├── new/page.tsx            # Create form (client)
│   │   └── [id]/page.tsx           # Ticket detail (server+client)
│   ├── analytics/page.tsx          # Analytics (server+client)
│   └── api/tickets/
│       ├── route.ts                # GET list, POST create
│       ├── stats/route.ts          # Dashboard stats
│       ├── export/route.ts         # CSV download
│       ├── bulk/route.ts           # Bulk update
│       └── [id]/
│           ├── route.ts            # GET one, PUT update
│           ├── notes/route.ts      # POST note
│           ├── analyze/route.ts    # POST AI analysis
│           └── activity/route.ts   # GET audit log
├── components/
│   ├── layout/                     # Sidebar, Header, ThemeProvider
│   ├── tickets/                    # TicketTable, TicketDetail, NotesSection, etc.
│   └── dashboard/                  # StatsCards, DashboardCharts, AnalyticsCharts
├── lib/
│   ├── types.ts                    # TypeScript interfaces
│   ├── utils.ts                    # Helpers, color maps
│   └── supabase/                   # Client + Server Supabase clients
├── hooks/useDebounce.ts
├── supabase/
│   ├── schema.sql                  # DB tables, indexes, RLS
│   └── seed.sql                    # 15 sample tickets + notes
└── middleware.ts
```

---

## What I'd Add With More Time
- Email notifications via Resend when ticket is created/updated
- Supabase Realtime for live ticket updates across agents
- Full team/agents management page
- Saved quick-reply templates
- Keyboard command palette (Ctrl+K)
- Customer portal for ticket status self-service

---

## Approach

Built with Next.js 14 App Router + Supabase for a single-repo, single-deploy architecture. Server components handle initial data fetching for fast page loads; client components power all interactive features. The AI integration uses Claude claude-haiku-4-5 for fast, cost-effective ticket analysis. Every design decision prioritized shipping a stable, polished product over feature quantity.
