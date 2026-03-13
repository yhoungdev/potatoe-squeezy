enum API_ENDPOINTS {
  GITHUB_AUTH = "/auth/login",
  GOOGLE_AUTH = "/auth/google",
  SIGN_OUT = "/auth/logout",

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
