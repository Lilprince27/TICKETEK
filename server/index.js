import crypto from "node:crypto";
import express from "express";
import { buildSeats, compareSeats, ROWS, SEATS_PER_ROW, TIERS } from "./layout.js";
import { dataFile, getDb, updateDb } from "./store.js";

const PORT = Number(process.env.PORT || 4000);
const MAX_SEATS_PER_ORDER = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const app = express();
app.use(express.json({ limit: "64kb" }));

function publicEvent(event, bookings) {
  const seats = buildSeats(event, bookings);
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    tagline: event.tagline,
    description: event.description,
    venue: event.venue,
    city: event.city,
    date: event.date,
    timeZone: event.timeZone,
    doors: event.doors,
    gradient: event.gradient,
    fromPrice: Math.min(...seats.map((seat) => seat.price)),
    seatsTotal: seats.length,
    seatsSold: seats.filter((seat) => seat.status === "sold").length
  };
}

function eventSnapshot(event) {
  return {
    id: event.id,
    title: event.title,
    venue: event.venue,
    city: event.city,
    date: event.date,
    timeZone: event.timeZone,
    gradient: event.gradient
  };
}

function makeReference() {
  return `TK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, events: getDb().events.length });
});

app.get("/api/events", (req, res) => {
  const { events, bookings } = getDb();
  res.json({ events: events.map((event) => publicEvent(event, bookings)) });
});

app.get("/api/events/:eventId", (req, res) => {
  const { events, bookings } = getDb();
  const event = events.find((item) => item.id === req.params.eventId);
  if (!event) return res.status(404).json({ error: "That event could not be found." });

  res.json({
    event: publicEvent(event, bookings),
    seats: buildSeats(event, bookings),
    rows: ROWS,
    seatsPerRow: SEATS_PER_ROW,
    tiers: TIERS.map((tier) => ({
      key: tier.key,
      label: tier.label,
      price: event.prices?.[tier.key] ?? tier.price
    }))
  });
});

app.post("/api/bookings", (req, res) => {
  const body = req.body ?? {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const eventId = typeof body.eventId === "string" ? body.eventId : "";
  const seatIds = Array.isArray(body.seatIds)
    ? [...new Set(body.seatIds.filter((id) => typeof id === "string").map((id) => id.toUpperCase()))]
    : [];

  if (!eventId) return res.status(400).json({ error: "Choose an event before booking." });
  if (seatIds.length === 0) return res.status(400).json({ error: "Choose at least one seat." });
  if (seatIds.length > MAX_SEATS_PER_ORDER) {
    return res.status(400).json({ error: `You can book up to ${MAX_SEATS_PER_ORDER} seats in one order.` });
  }
  if (name.length < 2) return res.status(400).json({ error: "Enter the name the booking is for." });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Enter a valid email address." });

  const outcome = updateDb((db) => {
    const event = db.events.find((item) => item.id === eventId);
    if (!event) return { status: 404, error: "That event could not be found." };

    const seats = buildSeats(event, db.bookings);
    const byId = new Map(seats.map((seat) => [seat.id, seat]));

    const unknown = seatIds.filter((id) => !byId.has(id));
    if (unknown.length > 0) {
      return { status: 400, error: `These seats don't exist: ${unknown.join(", ")}.` };
    }

    const taken = seatIds.filter((id) => byId.get(id).status !== "available");
    if (taken.length > 0) {
      return {
        status: 409,
        error: `Those seats were just taken: ${taken.join(", ")}. Please choose again.`,
        seats: taken
      };
    }

    const chosen = seatIds.map((id) => byId.get(id)).sort(compareSeats);
    const booking = {
      reference: makeReference(),
      eventId,
      event: eventSnapshot(event),
      seats: chosen.map((seat) => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        tier: seat.tierLabel,
        price: seat.price
      })),
      total: chosen.reduce((sum, seat) => sum + seat.price, 0),
      name,
      email,
      status: "confirmed",
      createdAt: new Date().toISOString()
    };

    db.bookings.unshift(booking);
    return { status: 201, booking };
  });

  if (outcome.status !== 201) {
    return res.status(outcome.status).json({ error: outcome.error, seats: outcome.seats });
  }
  res.status(201).json({ booking: outcome.booking });
});

app.get("/api/bookings/:reference", (req, res) => {
  const reference = String(req.params.reference || "").toUpperCase();
  const booking = getDb().bookings.find((item) => item.reference === reference);
  if (!booking) return res.status(404).json({ error: "We couldn't find that booking." });
  res.json({ booking });
});

app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[ticketek] API listening on http://0.0.0.0:${PORT}`);
  console.log(`[ticketek] data file: ${dataFile}`);
});
