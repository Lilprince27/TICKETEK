const JSON_HEADERS = { "Content-Type": "application/json" };

async function request(path, options = {}) {
  const response = await fetch(path, { headers: JSON_HEADERS, ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Something went wrong (${response.status}).`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export function fetchEvents() {
  return request("/api/events").then((payload) => payload.events ?? []);
}

export function fetchEvent(eventId) {
  return request(`/api/events/${encodeURIComponent(eventId)}`);
}

export function createBooking(payload) {
  return request("/api/bookings", { method: "POST", body: JSON.stringify(payload) }).then(
    (response) => response.booking
  );
}

export function fetchBooking(reference) {
  return request(`/api/bookings/${encodeURIComponent(reference)}`).then((payload) => payload.booking);
}
