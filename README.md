# Cortex

A read-only ambient display that shows what matters right now, filtered by your current capacity.

## What it does

Cortex displays a minimal view of your reality: the time, your current focus mode, and a handful of tasks appropriate to your energy level. Nothing else.

- **Low** — One task. Anchors only.
- **Moderate** — Two tasks. Contained scope.
- **High** — Three tasks. Still capped.
- **Rest** — No tasks. Time only.

## What it doesn't do

Cortex is not a task manager, productivity tracker, or planning tool. It doesn't create urgency, count overdue items, or judge your output. It consumes data from your existing systems and displays a humane slice of it.

## Why

Modern knowledge work generates more inputs than any person can process. Every app demands attention. Every notification competes for your focus.

Cortex inverts this. Instead of pulling you toward your tools, it projects a calm, glanceable summary onto a passive display — a monitor, a TV, a tablet on your desk. You check in when you're ready. It doesn't interrupt.

## How it works

- **Display**: Next.js app deployed to Vercel
- **Data**: Supabase (Postgres)
- **Capacity control**: iOS Shortcut calls a simple API
- **Task source**: Manual entry or sync from Reminders (roadmap)

## Setup

1. Clone this repo
2. Create a Supabase project
3. Run the schema (see `/docs/schema.sql`)
4. Deploy to Vercel
5. Set environment variables
6. Create iOS Shortcut to set capacity

## Roadmap

- [ ] Apple Reminders sync
- [ ] Google Calendar integration (next event)
- [ ] Apple TV native app
- [ ] Widgets for iOS/macOS

## License

MIT
