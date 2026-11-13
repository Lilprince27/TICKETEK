const DATE_LOCALE = "en-AU";

// `timeZone` is the venue's timezone (e.g. "Australia/Sydney"): events are
// shown in local venue time, not the visitor's timezone. Without one we fall
// back to the browser's timezone.
export function formatDateParts(iso, timeZone) {
  const date = new Date(iso);
  const zone = timeZone ? { timeZone } : {};
  return {
    weekday: date.toLocaleDateString(DATE_LOCALE, { weekday: "short", ...zone }),
    day: date.toLocaleDateString(DATE_LOCALE, { day: "2-digit", ...zone }),
    month: date.toLocaleDateString(DATE_LOCALE, { month: "short", ...zone }).toUpperCase(),
    year: date.toLocaleDateString(DATE_LOCALE, { year: "numeric", ...zone }),
    long: date.toLocaleDateString(DATE_LOCALE, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      ...zone
    }),
    time: date.toLocaleTimeString(DATE_LOCALE, { hour: "numeric", minute: "2-digit", ...zone })
  };
}

export function money(amount) {
  return `$${Number(amount).toFixed(2)}`;
}
