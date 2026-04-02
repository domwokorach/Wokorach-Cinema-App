# CLAUDE.md - CineMatch Project Instructions

## Project
CineMatch is an AI-powered movie recommendation app. Users describe what they want to watch in natural language, and the AI returns personalized picks filtered to their streaming services.

## Tech Stack
- Next.js 15 (App Router, Server Components)
- TypeScript (strict mode)
- Supabase (PostgreSQL + pgvector + Auth)
- Anthropic Claude Sonnet 4 (recommendations)
- TMDB API (movie data + streaming availability)
- Tailwind CSS + shadcn/ui (dark theme)
- Zustand (client state)
- Zod (validation)
- Stripe (payments)
- Vercel (deployment)

## Architecture Principles
- AI-native: LLM is core logic, not a wrapper
- Ground truth: NEVER return movies not in our DB
- Every recommendation must have a valid tmdb_id
- Streaming responses for recommendation results
- Mobile-first responsive design
- Dark mode default

## Key Files
- lib/ai/recommend.ts: 5-step recommendation pipeline (parse -> vector -> filter -> LLM -> validate)
- lib/ai/prompts/: all LLM prompt templates
- lib/tmdb/client.ts: TMDB API with caching
- lib/import/: Letterboxd, IMDb, CSV parsers + matcher
- lib/supabase/: client, server, admin clients
- supabase/migrations/: DB schema (pgvector)

## Conventions
- Use server actions for mutations when possible
- Use Route Handlers for complex API logic
- Zod schemas for all API input validation
- Error handling: return typed errors, never throw unhandled in API routes
- Components: one component per file, default export, co-locate types
- Imports: use @/ path alias

## Common Commands
```
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npx supabase db push # Push migrations
npx tsx scripts/sync-tmdb.ts    # Sync movies
npx tsx scripts/generate-embeddings.ts # Embeddings
```
