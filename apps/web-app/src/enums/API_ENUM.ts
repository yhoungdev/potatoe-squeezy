enum API_ENDPOINTS {
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
}

export default API_ENDPOINTS;
