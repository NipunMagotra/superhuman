# Pigeon Command Center

An ultra-minimalist, keyboard-first, high-speed unified workspace client for Gmail and Google Calendar. Built with Next.js (App Router), Tailwind CSS v4, Corsair SDK, OpenAI, and Supabase (Postgres + pgvector cache).

---

## 🏗️ Architecture & System Design

```
                     ┌────────────────────────┐
                     │    Browser UI Client   │
                     │  (React / Tailwind v4) │
                     └───────────┬────────────┘
                                 │ HTTP / API
                                 ▼
                     ┌────────────────────────┐
                     │   Next.js App Router   │
                     │    (Route Handlers)    │
                     └─────┬────────────┬─────┘
                           │            │
             Supabase SQL  │            │ Corsair MCP
                           ▼            ▼
             ┌───────────────┐        ┌────────────────┐
             │ Supabase DB   │        │  Corsair SDK   │
             │ (pgvector)    │        │ (Gmail / GCal) │
             └───────────────┘        └────────┬───────┘
                                               │ Google OAuth
                                               ▼
                                      ┌────────────────┐
                                      │  Google APIs   │
                                      └────────────────┘
```

---

## 💻 Tech Stack & Key Dependencies

| Dependency | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `16.2.9` | Core App Router framework |
| **React** | `19.2.4` | Component tree rendering |
| **Tailwind CSS** | `v4.0` | Design token declarations & utility layout styling |
| **Corsair SDK** | `0.1.76` | OAuth credential handshakes and connection management |
| **Supabase SDK** | `2.108.2` | Data sync cache layers and metadata queries |
| **Vercel AI SDK** | `6.0.206` | Streaming OpenAI command prompts with Corsair tools |
| **cmdk** | `1.1.1` | Command palette panel |
| **pg** | `8.21.0` | Connection pooling driver required by Corsair management database |

---

## 📂 Codebase Directory Map

```
c:/Users/Nipun Magotra/Downloads/clearlyy-landing-page
├── supabase/
│   └── schema.sql                  # Database caching tables, pgvector HNSW index & cosine similarity RPC
├── src/
│   ├── app/
│   │   ├── page.tsx                # Redesigned interactive landing homepage
│   │   ├── layout.tsx              # Font loader (Space Grotesk, Inter, JetBrains Mono) & global layout metadata
│   │   ├── dashboard/page.tsx      # Main dashboard wrapper (Email Split-Pane & Calendar Grid)
│   │   ├── auth/page.tsx           # Integrations Status Panel & Google OAuth flows triggers
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── status/route.ts # Connections verification route
│   │       │   └── corsair/route.ts# OAuth redirect callback handler
│   │       ├── emails/
│   │       │   ├── route.ts        # Fetch cached emails & send outbound emails
│   │       │   ├── [id]/route.ts   # Individual email details, status changes, and inline replies
│   │       │   ├── search/route.ts # Cosine similarity pgvector search endpoint
│   │       │   └── sync/route.ts   # Incremental fetch & priority score builder
│   │       ├── calendar/
│   │       │   ├── route.ts        # List schedule events & create events
│   │       │   └── [id]/route.ts   # Update & cancel calendar events
│   │       ├── chat/route.ts       # Vercel AI SDK OpenAI agent with Corsair tools
│   │       └── webhooks/
│   │           └── corsair/route.ts# Real-time webhook listener
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Outer framework layout, top sync bar, and slide-in drawer
│   │   │   └── Sidebar.tsx         # Left panel navigation icons & hotkey reference panel
│   │   ├── command-palette/
│   │   │   ├── CommandPalette.tsx  # Cmd+K fuzzy-search command overlay
│   │   │   └── useKeyboardShortcuts.ts # Global hotkey event listener
│   │   ├── email/
│   │   │   ├── EmailList.tsx       # Inbox rows, read/unread states, and priority score status
│   │   │   ├── EmailDetail.tsx     # Message content iframe viewer and inline replies form
│   │   │   └── ComposeModal.tsx    # Outgoing mail compose modal
│   │   ├── calendar/
│   │   │   ├── CalendarView.tsx    # Event scheduler timeline UI
│   │   │   └── EventModal.tsx      # Calendar create/update dialog
│   │   ├── chat/
│   │   │   └── AIChatBar.tsx       # Floating sliding right AI chat drawer
│   │   └── ui/
│   │       └── SearchBar.tsx       # Dual Keyword / Semantic focus input
│   └── lib/
│       ├── db.ts                   # Postgres client pooling
│       ├── corsair.ts              # Corsair client initialization
│       ├── supabase.ts             # Supabase browser & backend clients
│       ├── gmail.ts                # Gmail operations wrapper
│       ├── calendar.ts             # Google Calendar operations wrapper
│       ├── embeddings.ts           # OpenAI embeddings generation
│       └── priority.ts             # GPT-4o-mini priority classifier
```

---

## 🗄️ Database Cache Schema (`supabase/schema.sql`)

### 1. `cached_emails`
Stores messages locally for high-speed indexing, filtering, and vector matching.
* `gmail_id` (text, PK): Gmail ID identifier.
* `thread_id` (text): Thread ID grouping.
* `from_address` / `from_name` (text): Sender details.
* `to_addresses` (jsonb): Array of recipients.
* `subject` / `snippet` (text): Content summaries.
* `body_text` / `body_html` (text): Message payload cache.
* `labels` (text[]): Inbox, Unread, Starred status labels.
* `is_read` / `is_starred` (boolean): Boolean helpers.
* `priority_score` (float): AI-calculated urgency status (0.0 to 1.0).
* `received_at` (timestamptz): Incoming timestamp.
* `embedding` (vector(1536)): Generated from subject + body for semantic searching.

### 2. `cached_events`
Caches Google Calendar dates for timeline views.
* `gcal_id` (text, PK): Google Calendar Event ID.
* `summary` / `description` / `location` (text): Event parameters.
* `start_time` / `end_time` (timestamptz): Timeframe.
* `attendees` (jsonb): Invitees list.
* `status` (text): confirmed / tentative / cancelled.

---

## ⌨️ Keyboard Shortcut Controls

The application is fully navigateable via hotkeys. Global listeners intercept inputs (unless focused inside input fields):

| Key Binding | Action | Target Page |
| :--- | :--- | :--- |
| **`d`** or **`l`** | Transition to main Client Dashboard | Landing Page |
| **`i`** or **`a`** | Transition to OAuth Connection Settings | Landing Page |
| **`c`** | Compose a new email draft | Dashboard / Landing Preview |
| **`/`** | Focus Keyword/Semantic Search input | Dashboard / Landing Preview |
| **`j`** / **`k`** | Scroll Selection Down / Up in Email List | Dashboard |
| **`e`** | Archive current active email | Dashboard |
| **`s`** | Toggle Star status on current email | Dashboard |
| **`r`** | Expand Inline Reply Form for selected email | Dashboard |
| **`g i`** | Route view to Inbox list | Dashboard |
| **`g c`** | Route view to Calendar Timeline | Dashboard |
| **`g s`** | Route view to Settings / OAuth | Dashboard |
| **`⌘ K`** (or `Ctrl+K`) | Open command palette dialog | Global |
| **`Esc`** | Close current modal / blur active input | Global |

---

## 🎨 UI & Design Guidelines

The interface adheres to an **editorial dark theme** with custom-tailored elements:
1. **Fonts**:
   * Header typography uses **Space Grotesk** (`font-display`).
   * Shortcuts, badges, status logs, and mock containers use **JetBrains Mono** (`font-mono`).
   * Dashboard control elements use **Inter** (`font-sans`).
2. **Colors**:
   * Deep pitch background: `#050506`.
   * Cobalt Blue accent: `#2563eb` (primary selections and Keyword mode highlights).
   * Crimson Red accent: `#dc2626` (high priority markers, Calendar dialogs, and Semantic search highlights).
3. **Glassmorphism**:
   * Boundary borders: `1px solid rgba(255, 255, 255, 0.05)`.
   * Floating cards: `background: rgba(11, 11, 13, 0.7); backdrop-filter: blur(12px)`.
4. **UI Transitions**:
   * Drawer slide animation (`animate-slide-left`): A smooth slide transition in from the right edge for the AI Chat Panel.
   * Toggle highlight: Input glow shadows shift color based on active search modes.

---

## ⚙️ How to Setup & Run

1. **Local environment configuration**:
   Fill out the credentials inside [.env.local](file:///c:/Users/Nipun%20Magotra/Downloads/clearlyy-landing-page/.env.local):
   ```env
   SUPABASE_URL="https://your-project-id.supabase.co"
   SUPABASE_ANON_KEY="..."
   SUPABASE_SERVICE_ROLE_KEY="..."
   DATABASE_URL="postgresql://..."
   CORSAIR_KEK="..."
   OPENAI_API_KEY="..."
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
2. **Launch dev server**:
   ```bash
   npm run dev
   ```
3. **Production build**:
   ```bash
   npm run build
   ```
