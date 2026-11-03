# FreightIQ Demo

FreightIQ is a rate confirmation review demo with a Documents page and a Demo Guide.

## Run locally

1. Copy `.env.example` to `.env.local` and set `OPENROUTER_API_KEY` for document extraction.
2. Run `pnpm install` and `pnpm dev`.
3. Open `http://localhost:3000`; the root route redirects to Documents.

The app uses `OPENROUTER_MODEL` when set, otherwise it defaults to `nvidia/nemotron-3.5-super-vl:free`.
