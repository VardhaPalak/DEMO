export const DEFAULT_CURRENCY = {
  code: "INR",
  symbol: "\u20B9",
  locale: "en-IN",
  position: "before"
};
export function formatPrice(amount, currency = DEFAULT_CURRENCY) {
  const value = Number.isFinite(amount) ? amount : 0;
  const number = new Intl.NumberFormat(currency.locale || "en-IN", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0
  }).format(value);
  return currency.position === "after" ? `${number} ${currency.symbol}` : `${currency.symbol}${number}`;
}
export function formatDate(value) {
  if (!value) return "\u2014";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "\u2014";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}
export function formatDateTime(value) {
  if (!value) return "\u2014";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "\u2014";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
export function timeAgo(value) {
  if (!value) return "\u2014";
  const date = value instanceof Date ? value : new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 6e4);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}
