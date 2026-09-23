# ReCircuit

ReCircuit is an assessment-ready prototype for a second-hand electronics marketplace. It presents working devices, minor-fault listings, repair projects, and parts-only components with responsive browsing and catalogue-grounded AI features.

## Tech stack

- Next.js App Router and TypeScript
- Tailwind CSS
- JSON seeded catalogue data
- Next.js route handlers for AI search and listing Q&A
- Persisted AI tags generated when listings are created
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
lib/product-search-text.ts  Converts recorded listing fields into searchable text
lib/types.ts         Product interface and condition types
lib/ai.ts            Server-only OpenAI-compatible client and search intent parser
public/images/       Local placeholder listing artwork
```

## AI search and listing Q&A

`POST /api/search` uses `gpt-5.6-terra` through the CognitioLabs OpenAI-compatible gateway to extract structured filters. It embeds the shopper query with `openai/text-embedding-3-small`, ranks eligible listings against the pre-generated vectors in `data/product-embeddings.json`, then sends only the top 12 candidates plus the query to `gpt-5.6-terra` for a grounded final ordering. The response includes the selected real product IDs and a short, high-level explanation; the model can reorder only those candidate IDs and cannot provide product details. Listing text is sent to CognitioLabs only when regenerating that artifact; no client receives gateway credentials. Without configuration, the route returns local keyword results with a clear notice.

`POST /api/ask` sends only the selected listing and the question to the server-side model. Its grounding instruction requires the model to say when a detail is not stated in the listing rather than guessing. Both routes validate request size and return clear errors when the gateway cannot respond.

`POST /api/listings` validates and persists a new listing. It generates up to six grounded `aiTags` once at creation through the configured AI gateway. If tag generation fails, the listing is still saved with an empty tag array; tags are never regenerated when listings are read.

To perform a one-time backfill for legacy listings that do not yet have `aiTags`, run `npm run generate:listing-tags`. The script persists generated tags into `data/products.json` and never overwrites an existing `aiTags` array.

The OpenAI SDK reads only server-side variables:

```bash
CLASSGW_KEY=
CLASSGW_BASE_URL=
CLASSGW_MODEL=gpt-5.6-terra
CLASSGW_EMBED_MODEL=openai/text-embedding-3-small
```

Never prefix these variables with `NEXT_PUBLIC_`, `VITE_`, or another public-variable prefix, and never commit any `.env*` file other than `.env.example`. `CLASSGW_BASE_URL` must be the CognitioLabs OpenAI-compatible API base URL. Set `CLASSGW_MODEL` to `gpt-5.6-terra` and `CLASSGW_EMBED_MODEL` to `openai/text-embedding-3-small`.

`COGNITIOLABS_API_KEY` and `COGNITIOLABS_BASE_URL` remain supported for existing deployments, but use the four `CLASSGW_*` variables for new configuration.

To generate a checked-in embedding artifact for the seeded catalogue, run:

```bash
npm run generate:embeddings
```

The script sends the searchable text for each seeded product to CognitioLabs and writes the resulting vectors to `data/product-embeddings.json`. Regenerate it whenever `data/products.json` or the embedding model changes.

## Deploy to Vercel

Push the repository to GitHub, import it into Vercel, and leave the framework preset as Next.js. Add `CLASSGW_KEY`, `CLASSGW_BASE_URL`, `CLASSGW_MODEL`, and `CLASSGW_EMBED_MODEL` in Vercel Project Settings; do not mark any of them as public. Vercel will run the production build automatically. The browser calls only `/api/search`, `/api/ask`, and `/api/listings`; those Node.js route handlers read the environment and call the gateway.
