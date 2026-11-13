// Seat layout shared by the API: 8 rows (A is closest to the stage) of 12 seats.
// Price tiers are per row, and each event can override the tier prices.

export const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
export const SEATS_PER_ROW = 12;

export const TIERS = [
  { key: "premium", label: "Premium", price: 189, rows: ["A", "B"] },
  { key: "standard", label: "Standard", price: 129, rows: ["C", "D", "E"] },
  { key: "economy", label: "Economy", price: 79, rows: ["F", "G", "H"] }
];

const tierByRow = new Map();
for (const tier of TIERS) {
  for (const row of tier.rows) tierByRow.set(row, tier);
}

export function tierForRow(row) {
  return tierByRow.get(row) ?? TIERS[TIERS.length - 1];
}

export function priceForRow(event, row) {
  const tier = tierForRow(row);
  return event.prices?.[tier.key] ?? tier.price;
}

export function compareSeats(a, b) {
  return a.row.localeCompare(b.row) || a.number - b.number;
}

// Every seat for an event, with availability derived from the event's seeded
// sales plus every confirmed booking. Bookings are the only stored state, so
// removing a booking puts its seats back on sale.
export function buildSeats(event, bookings = []) {
  const booked = new Set();
  for (const booking of bookings) {
    if (booking.eventId !== event.id) continue;
    for (const seat of booking.seats) booked.add(seat.id);
  }
  const seeded = new Set(event.seededSold ?? []);

  const seats = [];
  for (const row of ROWS) {
    const tier = tierForRow(row);
    for (let number = 1; number <= SEATS_PER_ROW; number += 1) {
      const id = `${row}${number}`;
      const sold = seeded.has(id) || booked.has(id);
      seats.push({
        id,
        row,
        number,
        tier: tier.key,
        tierLabel: tier.label,
        price: priceForRow(event, row),
        status: sold ? "sold" : "available"
      });
    }
  }
  return seats;
}
