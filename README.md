# ReCircuit

ReCircuit is an assessment-ready prototype for a second-hand electronics marketplace. It presents working devices, minor-fault listings, repair projects, and parts-only components with responsive browsing and catalogue-grounded AI features.

## Tech stack

- Next.js App Router and TypeScript
- Tailwind CSS
- JSON seeded catalogue data
- Next.js route handlers for AI search and listing Q&A
- OpenAI SDK configured for a CognitioLabs-compatible gateway
- Vercel deployment target

## Run locally

1. Install Node.js 20.9 or later.
2. Copy `.env.example` to `.env.local` and add your gateway settings to enable AI features.
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
lib/catalogue.ts     Typed catalogue access and deterministic ranking
lib/types.ts         Product interface and condition types
lib/ai.ts            Server-only OpenAI-compatible client and search intent parser
public/images/       Local placeholder listing artwork
```

## AI search and listing Q&A

`POST /api/search` sends the shopper query to the configured OpenAI-compatible gateway to extract structured filters: terms, category, condition, and maximum price. The application then filters and ranks the local catalogue deterministically; the model never receives the catalogue data. Without configuration, the route returns local keyword results with a clear notice.

`POST /api/ask` sends only the selected listing and the question to the server-side model. Its grounding instruction requires the model to say when a detail is not stated in the listing rather than guessing. Both routes validate request size and return clear errors when the gateway cannot respond.

The OpenAI SDK reads only server-side variables:

```bash
CLASSGW_KEY=
CLASSGW_BASE_URL=
CLASSGW_MODEL=
```

Never prefix these variables with `NEXT_PUBLIC_` and never commit `.env.local`. `CLASSGW_BASE_URL` must be the compatible gateway API base URL and `CLASSGW_MODEL` its chat-completions model identifier.

## Deploy to Vercel

Push the repository to GitHub, import it into Vercel, and leave the framework preset as Next.js. Add the three `CLASSGW_*` variables in Vercel Project Settings. Vercel will run the production build automatically.
