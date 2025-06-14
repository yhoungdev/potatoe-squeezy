import { BountyCommand } from '../types/bounty';

export function parseBountyCommand(text: string): BountyCommand | null {
  const bountyRegex = /^\/bounty\s+(\d+(?:\.\d+)?)\s+(\w+)(?:\s+(\d+)d)?(?:\s+(mainnet|devnet))?$/i;
  const match = text.trim().match(bountyRegex);

  if (!match) {
    return null;
  }

  const [, amount, currency, duration, network] = match;

  return {
    amount: parseFloat(amount),
    currency: currency.toUpperCase(),
    duration: duration ? parseInt(duration, 10) : undefined,
    network: (network as 'mainnet' | 'devnet') || 'mainnet',
  };
}

export function parseClaimCommand(text: string): boolean {
  return /^\/claim$/i.test(text.trim());
}

export function parseCancelBountyCommand(text: string): boolean {
  return /^\/cancel-bounty$/i.test(text.trim());
}

export function parseEditBountyCommand(text: string): BountyCommand | null {
  const editRegex = /^\/edit-bounty\s+(\d+(?:\.\d+)?)\s+(\w+)$/i;
  const match = text.trim().match(editRegex);

  if (!match) {
    return null;
  }

  const [, amount, currency] = match;

  return {
    amount: parseFloat(amount),
    currency: currency.toUpperCase(),
  };
}

export function parseExtendBountyCommand(text: string): number | null {
  const extendRegex = /^\/extend-bounty\s+(\d+)d$/i;
  const match = text.trim().match(extendRegex);

  if (!match) {
    return null;
  }

  return parseInt(match[1], 10);
} 