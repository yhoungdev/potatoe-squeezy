const PRICES_USD: Record<string, number> = {
  USDC: 1,
  SOL: 100,
  XLM: 0.12,
};

export const toUsd = (amount: number, token: string) => {
  const key = token.toUpperCase();
  const price = PRICES_USD[key] ?? 0;
  return amount * price;
};
