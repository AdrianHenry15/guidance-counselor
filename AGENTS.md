<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Guidance Counselor Agent Instructions

## Client state

Transcript analysis and generated plans currently use in-memory React context.

Do not persist transcript or plan data to localStorage during the prototype phase.

A browser refresh may reset the current workflow.

When authentication and real user data are introduced, persist transcript
analysis and generated plans through the server and database. Do not use
localStorage as the authoritative source of user academic data.

## Project purpose

Guidance Counselor is a Next.js application that:

- uploads student transcripts
- extracts transcript coursework
- normalizes course names
- lets users review and include or exclude courses
- calculates earned credits
- generates deterministic semester-by-semester academic plans

The current focus is college transcript analysis and generalized degree planning.

## Technology

- Next.js 16 App Router
- React
- TypeScript
- Tailwind CSS v4
- Lucide React
- Local React context and localStorage persistence
- Node.js API routes

## Core directories

- `app/api/transcript` — transcript analysis endpoints
- `app/api/planner` — academic plan generation endpoints
- `app/(application)` — authenticated-style application pages
- `components/providers` — shared application state
- `lib/transcript` — transcript extraction, parsing, and normalization
- `lib/planner` — deterministic academic planning
- `types` — application domain types
- `data` — degree and subject data

## Domain rules

### Transcript courses

Use these fields:

```ts
completionStatus:
  | "passed"
  | "failed"
  | "withdrawn"
  | "in_progress"
  | "unknown"

includedInPlan: boolean
```

````md
Do not use the deprecated field:

```ts
completed: boolean
```
````
