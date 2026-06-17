# Pigeon

A keyboard-first Gmail and Google Calendar client. Built with Next.js (App Router), Tailwind CSS v4, and the Corsair SDK for direct Google API access.

---

## Architecture

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
                     └───────────┬────────────┘
                                 │
                    Postgres     │ Corsair SDK
                    (OAuth only) │
                                 ▼
                        ┌────────────────┐
                        │  Corsair SDK   │
                        │ (Gmail / GCal) │
                        └────────┬───────┘
                                 │ Google OAuth
                                 ▼
                        ┌────────────────┐
                        │  Google APIs   │
                        └────────────────┘
```

Emails and calendar events are fetched live from Google. Postgres is used only for Corsair OAuth credential storage.

---

## Tech Stack

| Dependency | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `16.2.9` | App Router framework |
| **React** | `19.2.4` | UI components |
| **Tailwind CSS** | `v4.0` | Styling |
| **Corsair SDK** | `0.1.76` | OAuth and Gmail / Calendar API access |
| **cmdk** | `1.1.1` | Command palette |
| **pg** | `8.21.0` | Postgres driver for Corsair credential tables |

---

## Features

- **Gmail inbox** — read, compose, reply, archive, star, and trash
- **Email folders** — Inbox, Sent, and Archived views
- **Keyword search** — filter by sender, subject, or snippet
- **Google Calendar** — view, create, edit, and delete events
- **Keyboard shortcuts** — navigate and act without the mouse
- **Command palette** — `⌘K` / `Ctrl+K` quick actions
- **OAuth connections** — connect Gmail and Google Calendar from Settings

---

## Project Structure

```
├── supabase/
│   └── schema.sql              # Corsair OAuth tables only
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/page.tsx  # Email split-pane and calendar views
│   │   ├── auth/page.tsx       # Google OAuth connection settings
│   │   └── api/
│   │       ├── auth/           # OAuth status, connect, disconnect
│   │       ├── emails/         # List, read, send, archive, star, reply
│   │       └── calendar/       # List, create, update, delete events
│   ├── components/
│   │   ├── layout/             # AppShell, Sidebar
│   │   ├── email/              # EmailList, EmailDetail, ComposeModal, folder tabs
│   │   ├── calendar/           # CalendarView, EventModal
│   │   ├── command-palette/    # Command palette and keyboard shortcuts
│   │   └── ui/                 # SearchBar, ThemeToggle, PigeonLogo
│   └── lib/
│       ├── corsair.ts          # Corsair client
│       ├── db.ts               # Postgres connection pool
│       ├── gmail.ts            # Gmail API helpers
│       └── calendar.ts         # Google Calendar API helpers
```

---

## Keyboard Shortcuts

| Key Binding | Action |
| :--- | :--- |
| **`d`** or **`l`** | Open dashboard (landing page) |
| **`i`** or **`a`** | Open connection settings (landing page) |
| **`c`** | Compose email |
| **`/`** | Focus search input |
| **`j`** / **`k`** | Move selection down / up in email list |
| **`e`** | Archive selected email |
| **`s`** | Toggle star on selected email |
| **`r`** | Reply to selected email |
| **`g i`** | Go to Inbox |
| **`g t`** | Go to Sent |
| **`g a`** | Go to Archived |
| **`g c`** | Go to Calendar |
| **`g s`** | Go to Settings |
| **`⌘K`** / **`Ctrl+K`** | Open command palette |
| **`Esc`** | Close modal or blur input |

---

## Setup

1. **Environment variables** in `.env.local`:

   ```env
   DATABASE_URL="postgresql://..."
   CORSAIR_KEK="..."
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

2. **Run the dev server**:

   ```bash
   npm run dev
   ```

3. **Production build**:

   ```bash
   npm run build
   ```

4. Connect Gmail and Google Calendar from `/auth`, then open `/dashboard`.
