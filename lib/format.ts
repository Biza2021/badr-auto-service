export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Non défini";
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "Non défini";
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export function formatTime(date: Date | string | null | undefined) {
  if (!date) return "Non défini";
  return new Intl.DateTimeFormat("fr-MA", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export function formatMoney(value: number | string | { toString(): string } | null | undefined) {
  const amount = value === null || value === undefined ? 0 : Number(value.toString());
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2
  }).format(amount);
}
