import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SeatMap from "../components/SeatMap.jsx";
import { fetchEvent } from "../api.js";
import { formatDateParts, money } from "../lib/format.js";
import { useCart } from "../state/CartContext.jsx";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { selection, toggleSeat, total } = useCart();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(null);
    fetchEvent(eventId)
      .then((payload) => {
        if (alive) setData(payload);
      })
      .catch((cause) => {
        if (alive) setError(cause.message);
      });
    return () => {
      alive = false;
    };
  }, [eventId]);

  const sameEvent = selection?.event.id === eventId;
  const selectedIds = useMemo(
    () => new Set(sameEvent ? selection.seats.map((seat) => seat.id) : []),
    [selection, sameEvent]
  );
  const selectionTotal = sameEvent ? total : 0;

  if (error) {
    return (
      <section className="shell page narrow">
        <div className="panel empty-state">
          <h1>Event unavailable</h1>
          <p>{error}</p>
          <Link className="btn btn-primary" to="/">
            Browse events
          </Link>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="shell page">
        <div className="event-page">
          <div className="event-hero is-skeleton" aria-hidden="true" />
          <div className="panel is-skeleton" aria-hidden="true" />
        </div>
      </section>
    );
  }

  const { event, seats, rows, tiers } = data;
  const date = formatDateParts(event.date, event.timeZone);
  const selectedSeats = seats
    .filter((seat) => selectedIds.has(seat.id))
    .sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number);

  return (
    <section className="shell page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Events</Link>
        <span aria-hidden="true">/</span>
        <span>{event.title}</span>
      </nav>

      <div className="event-page">
        <div className="event-column">
          <div
            className="event-hero"
            style={{ "--grad-a": event.gradient[0], "--grad-b": event.gradient[1] }}
          >
            <span className="poster-category">{event.category}</span>
            <div className="poster-date">
              <span className="poster-day">{date.day}</span>
              <span className="poster-month">{date.month}</span>
              <span className="poster-year">{date.year}</span>
            </div>
            <span className="poster-title">{event.title}</span>
          </div>

          <h1 className="event-heading">{event.title}</h1>
          <p className="event-tagline">{event.tagline}</p>

          <dl className="event-facts">
            <div>
              <dt>Date</dt>
              <dd>{date.long}</dd>
            </div>
            <div>
              <dt>Start</dt>
              <dd>{date.time}</dd>
            </div>
            <div>
              <dt>Doors</dt>
              <dd>{event.doors}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>
                {event.venue}
                <span className="fact-sub">{event.city}</span>
              </dd>
            </div>
          </dl>

          <p className="event-copy">{event.description}</p>

          <div className="tier-list">
            {tiers.map((tier) => (
              <div className="tier" key={tier.key}>
                <span className="tier-dot" data-tier={tier.key} aria-hidden="true" />
                <span className="tier-label">{tier.label}</span>
                <span className="tier-price">{money(tier.price)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel seat-card">
          <div className="seat-card-head">
            <h2>Choose your seats</h2>
            <p>
              {event.seatsTotal - event.seatsSold} of {event.seatsTotal} seats available
            </p>
          </div>

          <div className="legend" aria-hidden="true">
            <span className="legend-item">
              <span className="legend-swatch" data-state="available" /> Available
            </span>
            <span className="legend-item">
              <span className="legend-swatch" data-state="selected" /> Selected
            </span>
            <span className="legend-item">
              <span className="legend-swatch" data-state="sold" /> Sold
            </span>
          </div>

          <SeatMap
            rows={rows}
            seats={seats}
            selectedIds={selectedIds}
            onToggle={(seat) => toggleSeat(event, seat)}
          />

          <div className="selection-panel">
            {selectedSeats.length === 0 ? (
              <p className="selection-empty">Tap a seat to pick it. Seats you pick here replace any seats held from another event.</p>
            ) : (
              <ul className="chip-list">
                {selectedSeats.map((seat) => (
                  <li key={seat.id}>
                    <button
                      type="button"
                      className="chip"
                      onClick={() => toggleSeat(event, seat)}
                      aria-label={`Remove seat ${seat.row}${seat.number}`}
                    >
                      {seat.row}
                      {seat.number}
                      <span>{money(seat.price)}</span>
                      <span className="chip-remove" aria-hidden="true">
                        ×
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="selection-total">
              <span>
                {selectedSeats.length} {selectedSeats.length === 1 ? "seat" : "seats"} selected
              </span>
              <strong>{money(selectionTotal)}</strong>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={selectedSeats.length === 0}
              onClick={() => navigate("/checkout")}
            >
              Continue to checkout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
