const DATE_LOCALE = "en-AU";
const OFFSET_RE = /([+-])(\d{2}):(\d{2})$/;

// Event times come from Ticketek as an ISO string carrying the venue's Australian
// offset, e.g. "2027-02-14T19:30:00+11:00". We show that wall-clock time exactly as
// provided, so the Sydney show always reads 7:30 pm no matter what timezone the
// visitor's browser is in (and no matter what timezone the server runs in).
export function formatDateParts(iso) {
  let instant = new Date(iso);
  const offset = OFFSET_RE.exec(iso);

  if (offset) {
    const sign = offset[1] === "-" ? -1 : 1;
    const offsetMinutes = sign * (Number(offset[2]) * 60 + Number(offset[3]));
    instant = new Date(instant.getTime() + offsetMinutes * 60_000);
  }

  // Format the shifted instant in UTC: that reads back the time as provided.
  const zone = offset ? { timeZone: "UTC" } : {};
  return {
    weekday: instant.toLocaleDateString(DATE_LOCALE, { weekday: "short", ...zone }),
    day: instant.toLocaleDateString(DATE_LOCALE, { day: "2-digit", ...zone }),
    month: instant.toLocaleDateString(DATE_LOCALE, { month: "short", ...zone }).toUpperCase(),
    year: instant.toLocaleDateString(DATE_LOCALE, { year: "numeric", ...zone }),
    long: instant.toLocaleDateString(DATE_LOCALE, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      ...zone
    }),
    time: instant.toLocaleTimeString(DATE_LOCALE, { hour: "numeric", minute: "2-digit", ...zone })
  };
}

export function money(amount) {
  return `$${Number(amount).toFixed(2)}`;
}
