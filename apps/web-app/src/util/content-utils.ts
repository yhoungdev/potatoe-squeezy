const truncateContext = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  return truncated.slice(0, lastSpaceIndex) + "...";
};
const truncateTextWithEllipsis = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  return truncated.slice(0, lastSpaceIndex) + "...";
};

export { truncateContext, truncateText, truncateTextWithEllipsis };
