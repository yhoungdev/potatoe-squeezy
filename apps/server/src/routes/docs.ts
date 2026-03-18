import { Hono } from 'hono';

const docsRoute = new Hono();

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Potatoe Squeezy API',
    version: '1.0.0',
    description:
      'Cross-chain GitHub tipping, bounties, leaderboard, and developer profile API',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://potato-squeezy.up.railway.app',
      description: 'Production server',
    },
  ],
  tags: [
    { name: 'System' },
    { name: 'Auth' },
    { name: 'Wallets' },
    { name: 'Users' },
    { name: 'Transactions' },
    { name: 'Leaderboards' },
    { name: 'Bounties' },
    { name: 'GitHub Webhooks' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      githubWebhookSignature: {
        type: 'apiKey',
        in: 'header',
        name: 'x-hub-signature-256',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'string' },
        },
      },
      Wallet: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          address: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TxRecord: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          amount: { type: 'string' },
          senderAddress: { type: 'string' },
          recipientAddress: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      LeaderboardRow: {
        type: 'object',
        properties: {
          rank: { type: 'integer' },
          userId: { type: 'integer' },
          username: { type: 'string' },
          avatarUrl: { type: ['string', 'null'] },
          totalPoints: { type: 'number' },
          totalEarnedUSD: { type: 'number' },
          mergedPRCount: { type: 'integer' },
          consecutiveDays: { type: 'integer' },
          difficultySum: { type: 'integer' },
          badges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
      Bounty: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          repo: { type: 'string' },
          issueNumber: { type: 'integer' },
          amount: { type: 'string' },
          token: { type: 'string' },
          network: { type: 'string', enum: ['solana', 'stellar'] },
          status: {
            type: 'string',
            enum: ['pending', 'open', 'completed', 'cancelled'],
          },
          escrowTxHash: { type: 'string' },
          payoutTxHash: { type: ['string', 'null'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      PublicProfileResponse: {
        type: 'object',
        properties: {
          user: { type: 'object' },
          stats: { type: 'object' },
          badges: { type: 'array', items: { type: 'object' } },
          recentContributions: { type: 'array', items: { type: 'object' } },
          createdBounties: { type: 'array', items: { type: 'object' } },
          earnedNetworks: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'API info and health message',
        responses: {
          '200': {
            description: 'Service metadata',
          },
        },
      },
    },
    '/db-test': {
      get: {
        tags: ['System'],
        summary: 'Database connectivity check',
        responses: {
          '200': { description: 'Database connected' },
          '500': { description: 'Database connection failed' },
        },
      },
    },
    '/auth/login': {
      get: {
        tags: ['Auth'],
        summary: 'Start GitHub OAuth flow',
        parameters: [
          {
            name: 'returnTo',
            in: 'query',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '302': { description: 'Redirects to GitHub authorization URL' },
        },
      },
    },
    '/auth/callback': {
      get: {
        tags: ['Auth'],
        summary: 'GitHub OAuth callback',
        parameters: [
          {
            name: 'code',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'state',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '302': { description: 'Redirects back to the frontend with token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and clear auth cookies',
        responses: {
          '200': { description: 'Logout success' },
        },
      },
    },
    '/wallet': {
      post: {
        tags: ['Wallets'],
        summary: 'Create wallet for user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'address'],
                properties: {
                  userId: { type: 'integer' },
                  address: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Wallet created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Wallet' },
              },
            },
          },
          '400': { description: 'Validation error' },
        },
      },
      put: {
        tags: ['Wallets'],
        summary: 'Update existing wallet address',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['walletId', 'address'],
                properties: {
                  walletId: { type: 'integer' },
                  address: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Wallet updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Wallet' },
              },
            },
          },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/wallet/user/{userId}': {
      get: {
        tags: ['Wallets'],
        summary: 'List wallets by user id',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Wallet list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Wallet' },
                },
              },
            },
          },
        },
      },
    },
    '/user/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Profile with wallet join' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/user/all': {
      get: {
        tags: ['Users'],
        summary: 'List all users with wallets',
        responses: {
          '200': { description: 'Users list' },
          '404': { description: 'No users found' },
        },
      },
    },
    '/users/{username}/profile': {
      get: {
        tags: ['Users'],
        summary: 'Public developer profile',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Developer profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PublicProfileResponse' },
              },
            },
          },
          '404': { description: 'User not found' },
        },
      },
    },
    '/tx-records': {
      get: {
        tags: ['Transactions'],
        summary: 'Recent transaction records',
        responses: {
          '200': {
            description: 'Transaction list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TxRecord' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Transactions'],
        summary: 'Create transaction record',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'senderAddress', 'recipientAddress'],
                properties: {
                  amount: { type: 'number' },
                  senderAddress: { type: 'string' },
                  senderId: { type: 'integer' },
                  recipientAddress: { type: 'string' },
                  recipientId: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Transaction created' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/leaderboard/global': {
      get: {
        tags: ['Leaderboards'],
        summary: 'Global leaderboard',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Global leaderboard rows',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/LeaderboardRow' },
                },
              },
            },
          },
        },
      },
    },
    '/leaderboard/weekly': {
      get: {
        tags: ['Leaderboards'],
        summary: 'Weekly leaderboard',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Weekly leaderboard rows',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/LeaderboardRow' },
                },
              },
            },
          },
        },
      },
    },
    '/leaderboard/streaks': {
      get: {
        tags: ['Leaderboards'],
        summary: 'Streak leaderboard',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Streak leaderboard rows',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/LeaderboardRow' },
                },
              },
            },
          },
        },
      },
    },
    '/bounties': {
      get: {
        tags: ['Bounties'],
        summary: 'List bounties',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['pending', 'open', 'completed', 'cancelled'],
            },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50, minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Bounty list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Bounty' },
                },
              },
            },
          },
        },
      },
    },
    '/github/webhook': {
      post: {
        tags: ['GitHub Webhooks'],
        summary: 'GitHub webhook receiver',
        security: [{ githubWebhookSignature: [] }],
        parameters: [
          {
            name: 'x-github-event',
            in: 'header',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'x-github-delivery',
            in: 'header',
            required: false,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: true,
              },
            },
          },
        },
        responses: {
          '200': { description: 'Processed or duplicate delivery' },
          '401': { description: 'Invalid webhook signature' },
          '500': { description: 'Processing failure' },
        },
      },
    },
  },
};

docsRoute.get('/openapi.json', (c) => {
  return c.json(openApiSpec);
});

docsRoute.get('/', (c) => {
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Potatoe Squeezy API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({
        url: '/docs/openapi.json',
        dom_id: '#swagger-ui',
      })
    </script>
  </body>
</html>`;

  return c.html(html);
});

export default docsRoute;
