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

- Protected routes require `Authorization: Bearer <jwt>`.
- JWT is issued by `GET /auth/callback` after GitHub OAuth.

## Routes

### System

#### `GET /`

Returns API metadata.

#### `GET /db-test`

Checks database connectivity.

## Auth

#### `GET /auth/login`

Starts GitHub OAuth flow.

Response:
- `302` redirect

#### `GET /auth/callback`

GitHub OAuth callback.

Response:
- `302` redirect to frontend with token query param
- `401` when GitHub auth payload is missing
- `500` on DB failure

#### `POST /auth/logout`

Revokes GitHub token and clears cookies.

Response:
- `200` logout success
- `500` revoke failure

## Wallets

#### `POST /wallet`

Create wallet.

Body:

```json
{
  "userId": 1,
  "address": "wallet-address"
}
```

Response:
- `200` created wallet
- `400` missing fields

#### `PUT /wallet`

Update wallet address.

Body:

```json
{
  "walletId": 1,
  "address": "new-wallet-address"
}
```

Response:
- `200` updated wallet
- `400` missing fields

#### `GET /wallet/user/:userId`

Fetch wallets by user id.

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

List bounties.

Query params:
- `status` one of `pending | open | completed | cancelled`
- `limit` number, default `50`, min `1`, max `100`

Response:
- `200` array of bounties with creator metadata and merged contribution count

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
