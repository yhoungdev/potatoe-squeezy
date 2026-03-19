

const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

const formatCurrency = (
  num: number,
  currency: string = "USD",
  locale: string = "en-US",
  decimals: number = 2
): string => {
  const int = Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return int.format(num);
};

const formatPercent = (
  num: number,
  decimals: number = 2,
  locale: string = "en-US"
): string => {
  const int = Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return int.format(num);
};

const formatCompact = (
  num: number,
  decimals: number = 2,
  locale: string = "en-US"
): string => {
  const int = Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: decimals,
  });
  return int.format(num);
};

const formatWithThousands = (
  num: number,
  decimals: number = 2,
  locale: string = "en-US"
): string => {
  const int = Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return int.format(num);
};

const formatAccountingCurrency = (
  num: number,
  currency: string = "USD",
  locale: string = "en-US",
  decimals: number = 2
): string => {
  const int = Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencySign: "accounting", 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return int.format(num);
};

const formatSignedNumber = (
  num: number,
  decimals: number = 2,
  locale: string = "en-US"
): string => {
  const int = Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: "always", 
  });
  return int.format(num);
};

export {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatCompact,
  formatWithThousands,
  formatAccountingCurrency,
  formatSignedNumber,
};
