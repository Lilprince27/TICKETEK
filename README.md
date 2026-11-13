# TICKETEK

Tickets.

A small box office: browse events, pick seats on a seat map, and check out. The
booking is confirmed with a reference you can look up again.

## Stack

- **Frontend** — React + React Router, served by Vite in development (`src/`)
- **API** — Express (`server/`), storing bookings in a JSON file
- No database server and no external service, so nothing to configure

## Run it

```sh
docker compose -f docker-compose.base44.yml up -d   # Base44 dev environment
```

Locally without Docker:

```sh
npm install
npm run dev     # http://localhost:3000 (proxies /api to the API)
npm run server  # http://localhost:4000
```

## Routes

| Route                   | Page                                         |
| ----------------------- | -------------------------------------------- |
| `/`                     | Events on sale, search and city filter       |
| `/events/:eventId`      | Event details and seat map                   |
| `/checkout`             | Buyer details and order summary              |
| `/confirmation/:ref`    | Booking confirmation                         |

## API

| Endpoint                  | Method | Purpose                              |
| ------------------------- | ------ | ------------------------------------ |
| `/api/health`             | GET    | Liveness                             |
| `/api/events`             | GET    | Events with price-from and sales     |
| `/api/events/:eventId`    | GET    | Event, seat map and price tiers      |
| `/api/bookings`           | POST   | Book seats `{eventId, seatIds, name, email}` |
| `/api/bookings/:reference`| GET    | Look up a booking by reference       |

## Data

Seats are seeded per event (`server/seed.js`) and availability is derived from
those seeded sales plus confirmed bookings, so a booking can never sell a seat
twice. Bookings live in `server/data/db.json` (or `DATA_DIR/db.json` in Docker);
delete that file to reset the demo data.

Checkout is simulated — no card is charged and no real tickets are issued.
