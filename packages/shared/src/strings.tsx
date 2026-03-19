

const truncateString = (str: string, maxLength: number): string => {
  if (maxLength <= 3) return str.slice(0, maxLength);
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + "...";
};

const truncateMiddle = (str: string, maxLength: number): string => {
  if (maxLength <= 3) return str.slice(0, maxLength);
  if (str.length <= maxLength) {
    return str;
  }
  const visibleChars = maxLength - 3;
  const start = Math.ceil(visibleChars / 2);
  const end = str.length - Math.floor(visibleChars / 2);
  return str.slice(0, start) + "..." + str.slice(end);
};


const shortenAddress = (
  address: string,
  start: number = 6,
  end: number = 4
): string => {
  if (!address) return "";
  if (address.length <= start + end) return address;
  return address.slice(0, start) + "..." + address.slice(-end);
};


const normalizeAddress = (address: string, prefix: string = "0x"): string => {
  const trimmed = address.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (prefix && !lower.startsWith(prefix.toLowerCase())) {
    return prefix.toLowerCase() + lower;
  }
  return lower;
};


const maskString = (
  str: string,
  visibleStart: number = 2,
  visibleEnd: number = 2,
  maskChar: string = "*"
): string => {
  if (!str) return "";
  if (str.length <= visibleStart + visibleEnd) {
    return maskChar.repeat(str.length);
  }
  const start = str.slice(0, visibleStart);
  const end = str.slice(str.length - visibleEnd);
  const maskedLength = str.length - visibleStart - visibleEnd;
  return start + maskChar.repeat(maskedLength) + end;
};

/**
 * Convert string to a safe "tag" for slugs, ids, CSS, etc.
 * Example: "Frontend Bounty #1" -> "frontend-bounty-1"
 */
const toSlug = (str: string): string => {
  return str
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};


const normalizeHandle = (handle: string): string => {
  return handle
    .trim()
    .replace(/^@+/, "") 
    .replace(/[^a-zA-Z0-9._]+/g, "") 
    .slice(0, 32); 
};


const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word =>
      word.length === 0
        ? ""
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

/**
 * Highlight a term (for search / filtering UI).
 */
const highlight = (
  str: string,
  term: string,
  prefix: string = "<mark>",
  suffix: string = "</mark>",
  caseSensitive: boolean = false
): string => {
  if (!term) return str;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(escaped, flags);

  return str.replace(regex, match => `${prefix}${match}${suffix}`);
};

const truncateAtWord = (
  str: string,
  maxLength: number,
  suffix: string = "..."
): string => {
  if (str.length <= maxLength) return str;
  if (maxLength <= suffix.length) return str.slice(0, maxLength);

  const limit = maxLength - suffix.length;
  let cut = str.lastIndexOf(" ", limit);

  if (cut === -1 || cut < limit * 0.5) {
    cut = limit;
  }

  return str.slice(0, cut).trimEnd() + suffix;
};

const normalizeWhitespace = (str: string): string => {
  return str.trim().replace(/\s+/g, " ");
};


const isSameAddress = (a: string, b: string): boolean => {
  return normalizeAddress(a) === normalizeAddress(b);
};

export {
  truncateString,
  truncateMiddle,
  shortenAddress,
  normalizeAddress,
  maskString,
  toSlug,
  normalizeHandle,
  toTitleCase,
  highlight,
  truncateAtWord,
  normalizeWhitespace,
  isSameAddress,
};
