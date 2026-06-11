type Bindings = {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  AGENT_SETTLEMENT_SECRET?: string;
  DB: any;
};

export type Env = Bindings;
