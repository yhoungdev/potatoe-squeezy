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

export enum API_ENDPOINTS {
  SIGN_IN_SOCIAL = "/api/auth/sign-in/social",
  GET_SESSION = "/api/auth/get-session",
  SIGN_OUT = "/api/auth/sign-out",

  USER_PROFILE = "/user/profile",
  USER_ALL = "/user/all",
  USER_WALLET = "/wallet",

  TRANSACTION_RECORDS = "/tx-records",
  LEADERBOARD_GLOBAL = "/leaderboard/global",
  LEADERBOARD_WEEKLY = "/leaderboard/weekly",
  LEADERBOARD_STREAKS = "/leaderboard/streaks",
  BOUNTIES = "/bounties",
  BOUNTIES_SYNC = "/bounties/sync",
}
