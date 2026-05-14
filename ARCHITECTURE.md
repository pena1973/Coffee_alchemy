# Coffee Alchemy Next Architecture

## Stack

- Next.js App Router + TypeScript
- SQLite through `better-sqlite3`
- DigitalOcean AI Inference through server-side API route
- Secrets in environment variables only

## Data

SQLite file:

```text
DATABASE_PATH=../data/coffee.sqlite
```

Tables:

- `ingredients`
- `recipes`
- `generation_events`

For local development, the default path keeps the database in `D:\coffe\data\coffee.sqlite`, outside the project folder `D:\coffe\coffe`. For DigitalOcean production, attach persistent storage if you keep SQLite. Without persistent storage, an app redeploy can lose local disk data.

## AI Generation

Recommended starter model:

```text
DO_RECIPE_MODEL=llama3.3-70b-instruct
```

The app calls:

```text
POST https://inference.do-ai.run/v1/chat/completions
```

with:

```text
Authorization: Bearer $MODEL_ACCESS_KEY
```

Secrets:

```text
MODEL_ACCESS_KEY=...
DO_INFERENCE_BASE_URL=https://inference.do-ai.run/v1
```

Never expose `MODEL_ACCESS_KEY` to browser code.

## API Shape

- `GET /api/recipes` lists recipes from SQLite.
- `POST /api/recipes` saves a recipe.
- `PATCH /api/recipes/:id` updates `prepared`, `rating`, or `inMenu`.
- `DELETE /api/recipes/:id` deletes a recipe.
- `POST /api/generate` calls DigitalOcean AI Inference and optionally saves the generated recipe.

## Next Step

Install dependencies and initialize the database:

```bash
npm install
npm run db:migrate
npm run dev
```
