# Cortex

A read-only ambient display that shows what matters right now, filtered by your current cognitive capacity.

**Live:** [cortex-display.vercel.app](https://cortex-display.vercel.app)

## The Idea

Modern knowledge work generates more inputs than any person can process. Every app demands attention. Every notification competes for focus.

Cortex inverts this. Instead of pulling you toward your tools, it projects a calm, glanceable summary onto a passive display — a monitor, a TV, a tablet on your desk. You check in when you're ready. It doesn't interrupt.

## What It Shows

- **Time and date** — large, ambient, always visible
- **Capacity state** — your current energy level, set from Prefrontal or an iOS Shortcut
- **Today's tasks** — filtered by capacity, capped to what you can actually handle
- **Calendar events** — upcoming schedule with relative time, flex event filtering

### Capacity Filtering

| State | Non-anchored tasks shown |
|----------|--------------------------|
| Rest | 0 (anchors only) |
| Low | 1 |
| Moderate | 2 |
| High | 3 |

Anchored (pinned) tasks always appear regardless of capacity state. Tasks are sorted by approval time — earliest approved appears first.

## What It Doesn't Do

Cortex is not a task manager, productivity tracker, or planning tool. It doesn't create urgency, count overdue items, or judge your output. It consumes data from shared state and displays a humane slice of it.

## System Architecture

```
Prefrontal (planning) → Supabase → Cortex (display)
iOS Shortcuts → /api/capacity → Supabase
Google Calendar → /api/calendar → Cortex
```

## Tech Stack

- **Next.js** with App Router
- **Supabase** for Postgres storage
- **TypeScript**
- **Tailwind CSS**
- **Vercel** for deployment

## Companion

This app pairs with **Prefrontal**, the daily planning interface:
[prefrontal-swart.vercel.app](https://prefrontal-swart.vercel.app)
