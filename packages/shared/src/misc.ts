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

export { validateSolanaAddress };
