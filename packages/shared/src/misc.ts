import bs58 from "bs58";

const validateSolanaAddress = (address: string): boolean => {
  if (typeof address !== "string") return false;

  const trimmed = address.trim();
  if (trimmed.length === 0) return false;

  try {
    const decoded = bs58.decode(trimmed);
    return decoded.length === 32;
  } catch {
    return false;
  }
};

const validateStellarAddress = (address: string): boolean => {
  if (typeof address !== "string") return false;

  const trimmed = address.trim();
  if (trimmed.length !== 56) return false;

  return /^G[A-Z2-7]{55}$/.test(trimmed);
};

const validateWalletAddress = (chain: string, address: string): boolean => {
  const normalizedChain = chain.trim().toLowerCase();

  if (normalizedChain === "solana") {
    return validateSolanaAddress(address);
  }

  if (normalizedChain === "stellar") {
    return validateStellarAddress(address);
  }

  return false;
};

export { validateSolanaAddress, validateStellarAddress, validateWalletAddress };
