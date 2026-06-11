const BOUNTY_LABELS = new Set(['bounty', 'open bounty']);

const BOT_MESSAGE_PATTERNS = [
  /this issue has been labeled as a bounty/i,
  /bounty registered:/i,
  /bounty opened:/i,
  /potatoe squeezy bot help/i,
  /failed to lock escrow for bounty creation/i,
  /is claiming this bounty\./i,
  /bounty updated\./i,
];

type GitHubUserPayload = Record<string, unknown> | undefined;
type GitHubCommentPayload = Record<string, unknown> | undefined;
type GitHubIssuePayload = Record<string, unknown> | undefined;

const normalizeLabelName = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

export const hasBountyLabel = (issue: GitHubIssuePayload) => {
  const labels = Array.isArray(issue?.labels) ? issue.labels : [];

  return labels.some((label) => {
    if (typeof label === 'string') {
      return BOUNTY_LABELS.has(normalizeLabelName(label));
    }

    return BOUNTY_LABELS.has(
      normalizeLabelName((label as Record<string, unknown> | undefined)?.name),
    );
  });
};

export const parseBountyCommand = (body: string | undefined) => {
  const match = String(body ?? '')
    .trim()
    .match(/^\/bounty\s+(\d+(?:\.\d+)?)\s+([a-zA-Z0-9]+)$/i);

  if (!match) {
    return null;
  }

  return {
    amount: Number(match[1]),
    token: match[2].toUpperCase(),
  };
};

const isKnownBotLogin = (login: string) => {
  const configured = [
    process.env.GITHUB_BOUNTY_BOT_LOGIN,
    process.env.GITHUB_APP_BOT_LOGIN,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  if (configured.length === 0) {
    return false;
  }

  return configured.includes(login);
};

export const isBotActor = (user: GitHubUserPayload) => {
  const login = String(user?.login ?? '')
    .trim()
    .toLowerCase();
  const type = String(user?.type ?? '')
    .trim()
    .toLowerCase();

  if (!login) {
    return false;
  }

  return isKnownBotLogin(login) || type === 'bot' || login.endsWith('[bot]');
};

export const isPotatoeBotComment = (comment: GitHubCommentPayload) => {
  if (!isBotActor(comment?.user as GitHubUserPayload)) {
    return false;
  }

  const body = String(comment?.body ?? '').trim();

  return BOT_MESSAGE_PATTERNS.some((pattern) => pattern.test(body));
};

export const getBotLogin = (user: GitHubUserPayload) => {
  const login = String(user?.login ?? '').trim();
  return login || null;
};
