# Server

## Run

Install dependencies:

```sh
bun install
```

Start development server:

```sh
bun run dev
```

Note: `bun run dev` runs Drizzle migrations on startup. Make sure Postgres is running and `DATABASE_URL` is set in `apps/server/.env` (or `.env.local`).

Run migrations manually:

```sh
bun run db:migrate
```

Run with Docker dev setup:

```sh
docker compose -f docker-compose.dev.yml up --build
```

Base URL:

```txt
http://localhost:3000
```

## API Docs

Swagger UI:

```txt
GET /docs
```

OpenAPI JSON:

```txt
GET /docs/openapi.json
```

## Authentication

- GitHub OAuth is handled by:
  - `GET /auth/login` (starts OAuth)
  - `GET /auth/callback` (OAuth callback)
- GitHub OAuth callback URL must match `GITHUB_CALLBACK_URL` (or `GITHUB_REDIRECT_URI` as fallback).
- If you hit `email_not_found`, your GitHub auth token didn’t have access to your email. For GitHub Apps, enable **Account permissions → Email addresses: Read-only**, then re-authorize. As a fallback, set `GITHUB_ALLOW_NOREPLY_EMAIL=true` to use a `users.noreply.github.com` email.

## Routes

### System

#### `GET /`

Returns API metadata.

#### `GET /db-test`

Checks database connectivity.

## Auth

#### `GET /auth/login`

Redirects to GitHub OAuth authorize.

#### `GET /auth/callback`

Exchanges OAuth code, syncs user, redirects to frontend with `token`.

## Wallets

#### `POST /wallet`

Create or replace a wallet for a chain.

Body:

```json
{
  "chain": "solana",
  "address": "wallet-address"
}
```

Response:

- `200` created wallet
- `400` missing fields

#### `PUT /wallet`

Update wallet address for a chain.

Body:

```json
{
  "chain": "solana",
  "address": "new-wallet-address"
}
```

Response:

- `200` updated wallet
- `400` missing fields

#### `GET /wallet/user`

Fetch authenticated user's wallets.

Response:

- `200` wallet list

## Users

#### `GET /user/profile`

Authenticated user profile.

Headers:

- `Authorization: Bearer <jwt>`

Response:

- `200` user profile with wallet join
- `404` user not found

#### `PUT /user/profile`

Update authenticated user profile fields.

Body:

```json
{
  "displayName": "Obi Abo",
  "twitterUrl": "https://x.com/obiabo"
}
```

Response:

- `200` updated user profile with wallet join
- `400` validation error

#### `GET /user/all`

List all users with wallet joins.

Response:

- `200` users list
- `404` no users found

#### `GET /users/:username/profile`

Public developer profile with stats, badges, contributions, created bounties, earned networks.

Response:

- `200` profile payload
- `404` user not found

## Transactions

#### `GET /tx-records`

List latest transaction records.

Response:

- `200` records list

#### `POST /tx-records`

Create transaction record.

Body:

```json
{
  "amount": 1.5,
  "senderAddress": "sender-wallet",
  "senderId": 1,
  "recipientAddress": "recipient-wallet",
  "recipientId": 2
}
```

Response:

- `200` created transaction
- `400` missing required fields

## Leaderboards

#### `GET /leaderboard/global`

Global ranking by points.

Query params:

- `limit` number, default `20`, min `1`, max `100`

#### `GET /leaderboard/weekly`

Weekly ranking by points.

Query params:

- `limit` number, default `20`, min `1`, max `100`

#### `GET /leaderboard/streaks`

Streak-based ranking.

Query params:

- `limit` number, default `20`, min `1`, max `100`

Response for leaderboard routes:

- `200` array of ranked rows:

```json
[
  {
    "rank": 1,
    "userId": 1,
    "username": "dev",
    "avatarUrl": null,
    "totalPoints": 123.5,
    "totalEarnedUSD": 80,
    "mergedPRCount": 4,
    "consecutiveDays": 3,
    "difficultySum": 10,
    "badges": []
  }
]
```

## Bounties

#### `GET /bounties`

List verified bounties only.

Query params:

- `status` one of `pending | open | completed | cancelled`
- `limit` number, default `50`, min `1`, max `100`

Response:

- `200` array of Potatoe Squeezy bot-verified bounties with creator metadata and merged contribution count

## GitHub Webhook

#### `POST /github/webhook`

Consumes GitHub webhook events for bounty creation and payout flows.

Required headers:

- `x-hub-signature-256`
- `x-github-event`
- `x-github-delivery` optional but recommended

Supported events:

- `issue_comment`
- `pull_request`
- `pull_request_review`

Response:

- `200` processed or duplicate event
- `401` invalid signature
- `500` processing error
