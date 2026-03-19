import { AUTH_TOKEN } from "./constants";

export enum Secrete_Enums {}

export const TOKEN_ENUMS = {
  AUTH_TOKEN,
};

export enum NOTIFICATION_TYPE {
  NEW_USER = " A new user has signed up.",
  NEW_MESSAGE = " You have received a new message.",
  TRANSACTION_NOTIFICATION = " Your transaction has been processed successfully.",
  TIP_NOTIFICATION = "You have received a new tip.",
  REMINDER = "This is a reminder for your upcoming event.",
}

export enum NOTIFICATION_STATUS {
  SENT = "sent",
  FAILED = "failed",
  PENDING = "pending",
}

export enum TIPPER_RANK {
  KIND_SPARK = "KIND SPARK",
  CHEERFUL_GIVE = "CHEERFUL GIVE",
  GENEROUS_FORCE = "GENEROUS FORCE",
  POTATOE_PATRON = "POTATOE PATRON",
}

export const TIPPER_RANK_THRESHOLDS: Record<
  TIPPER_RANK,
  { min: number; max: number | null }
> = {
  [TIPPER_RANK.KIND_SPARK]: { min: 1, max: 5 },
  [TIPPER_RANK.CHEERFUL_GIVE]: { min: 6, max: 9 },
  [TIPPER_RANK.GENEROUS_FORCE]: { min: 10, max: 19 },
  [TIPPER_RANK.POTATOE_PATRON]: { min: 20, max: null },
};

export const getTipperRank = (tipCount: number) => {
  const rank = (
    Object.entries(TIPPER_RANK_THRESHOLDS) as Array<
      [TIPPER_RANK, { min: number; max: number | null }]
    >
  ).find(([, threshold]) => {
    const meetsMin = tipCount >= threshold.min;
    const meetsMax = threshold.max === null || tipCount <= threshold.max;
    return meetsMin && meetsMax;
  });

  if (!rank) {
    return null;
  }

  const [name, threshold] = rank;

  return {
    name,
    minTips: threshold.min,
    maxTips: threshold.max,
  };
};

export enum API_ENDPOINTS {
  SIGN_IN_SOCIAL = "/api/auth/sign-in/social",
  GET_SESSION = "/api/auth/get-session",
  SIGN_OUT = "/api/auth/sign-out",

  USER_PROFILE = "/user/profile",
  USER_ALL = "/user/all",
  USER_WALLET = "/wallet",
  USER_NOTIFICATIONS = "/notifications",

  TRANSACTION_RECORDS = "/tx-records",
  LEADERBOARD_GLOBAL = "/leaderboard/global",
  LEADERBOARD_WEEKLY = "/leaderboard/weekly",
  LEADERBOARD_STREAKS = "/leaderboard/streaks",
  BOUNTIES = "/bounties",
}
