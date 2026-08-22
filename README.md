# matcha

A dating web app to meet people

## Stack

- **Backend** — [Bun](https://bun.sh) + Express + Socket.IO, PostgreSQL (via `pg`).
  Clean architecture: `core/` (entities/interfaces), `app/` (use cases), `infra/`
  (HTTP routers, repositories, socket registry).
- **Frontend** — React 19 + Vite, shadcn/ui + TailwindCSS, react-router, Leaflet maps.
- **Infra** — Docker Compose, nginx (serves the built SPA and reverse-proxies
  `/api` and `/socket.io` to the backend), Mailpit (dev mail catcher), Adminer (DB UI).

## Build & run

Requires Docker + Docker Compose. Create the three env files first (copy the
provided examples and adjust as needed):

```sh
cp backend/.env-example  backend/.env
cp frontend/.env.example frontend/.env
cp db/.env-example       db/.env
```

The Postgres credentials in `db/.env` (`POSTGRES_USER` / `POSTGRES_PASSWORD` /
`POSTGRES_DB`) must match `PGUSER` / `PGPASSWORD` / `PGDATABASE` in `backend/.env`.

### Production

```sh
docker compose up -d --build
```

Then open **http://localhost**. On its first boot the backend entrypoint
automatically restores the bundled seed (500+ profiles), runs migrations, and
downloads the seed profile images — so the app is populated out of the box.

- App: http://localhost
- Mailpit (read verification / password-reset emails): http://localhost:8025
- Adminer (inspect the database): http://localhost:8080

> After changing frontend or backend source, rebuild the image — a plain
> `docker compose up -d` reuses the old build:
> `docker compose up -d --build frontend` (or `backend`).

### Development

`./run-dev.sh -d` starts source-mounted containers; then run the dev servers inside them:

```sh
docker exec -it matcha-back  bun run dev
docker exec -it matcha-front bun run dev
```

## Matching algorithm

Matchmaking has two independent paths.

### 1. Suggestions (the Browse page)

Suggestions are generated per user (`SuggestionService.generateSuggestions`) and
regenerated each time the Browse page is opened:

1. **Locate** — build a ~50 km bounding box around the user's `(lat, lon)` and
   fetch every profile inside it.
2. **Filter** each candidate, keeping only those that:
   - are not the user themselves and have a completed profile;
   - are a **mutual orientation match** — the candidate satisfies the user's
     gender + sex preference *and* the user satisfies the candidate's, where a
     preference of `any` acts as a wildcard;
   - fall within the user's **preferred age range**.
3. **Enrich** each survivor with the exact **distance** and the set of
   **shared interest tags**, and store the result.
4. On read, profiles the user has **blocked** (in either direction) are excluded.

The Browse UI then lets the user **sort** the suggestions by distance, fame
rating, or number of common tags (ascending/descending).

### 2. Search (the Search page)

A manual query with combinable filters — name, age range, fame-rating range,
maximum distance, interest tags, and gender / sex — plus sorting by age,
location, fame rating or common tags. Filtering happens in SQL against
`users_details`.

### Fame rating

Each profile carries a `fame_rating` that is nudged up or down by interactions
(likes, visits, etc.) and clamped at zero. It is used as a ranking signal in both
suggestions and search.
