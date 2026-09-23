# ReCircuit

ReCircuit is an assessment-ready prototype for a second-hand electronics marketplace. It presents fully working devices, minor-fault listings, repair projects, and parts-only components with a responsive browse flow and catalogue-grounded AI integration hooks.

## Tech stack

- Next.js App Router and TypeScript
- Tailwind CSS
- JSON seeded catalogue data
- Next.js route handlers for search and Q&A
- OpenAI SDK configured for the CognitioLabs OpenAI-compatible gateway
- Vercel deployment target

## Run locally

1. Install Node.js 20.9 or later.
2. Copy `.env.example` to `.env.local` if you want to configure the future AI gateway. The UI and placeholder endpoints work without it.
3. Install and start:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful validation commands:

```bash
npm run lint
npm run build
```

## Project structure

```text
app/                 App Router pages and server API route handlers
components/          Reusable browse, listing, and detail UI
data/products.json   Fictional seeded development catalogue
lib/catalogue.ts     Typed catalogue access and deterministic search
lib/types.ts         Product interface and condition types
lib/ai.ts            Server-only CognitioLabs-compatible OpenAI client hook
public/images/       Local placeholder listing artwork
```

## Search and AI direction

`POST /api/search` validates `{ "query": "..." }` and currently performs a basic deterministic text search. Its TODOs mark the intended future flow: backend query → CognitioLabs model structured intent → deterministic catalogue filters/ranking.

`POST /api/ask` validates `{ "productId": "...", "question": "..." }`, finds one catalogue item, and returns a placeholder response. A future server-only model call should receive only the selected listing, the question, and a grounding instruction requiring it to identify missing information rather than invent details.

The OpenAI SDK reads only server-side variables:

```bash
CLASSGW_KEY=
CLASSGW_BASE_URL=
CLASSGW_MODEL=
```

Never prefix these variables with `NEXT_PUBLIC_` and never commit `.env.local`. Semantic retrieval may be added later, but this scaffold intentionally has no embeddings, vector database, or external retrieval infrastructure.

## Deploy to Vercel

Push the repository to GitHub, import it into Vercel, and leave the framework preset as Next.js. Add the three `CLASSGW_*` variables in Vercel Project Settings only when enabling model calls. Vercel will run the production build automatically.

## Initial Git commit

```bash
git init
git add .
git commit -m "Initial ReCircuit scaffold"
```
