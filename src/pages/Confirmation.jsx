import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBooking } from "../api.js";
import { formatDateParts, money } from "../lib/format.js";

export default function Confirmation() {
  const { reference } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setBooking(null);
    setError(null);
    fetchBooking(reference)
      .then((result) => {
        if (alive) setBooking(result);
      })
      .catch((cause) => {
        if (alive) setError(cause.message);
      });
    return () => {
      alive = false;
    };
  }, [reference]);

  if (error) {
    return (
      <section className="shell page narrow">
        <div className="panel empty-state">
          <h1>Booking not found</h1>
          <p>{error}</p>
          <Link className="btn btn-primary" to="/">
            Browse events
          </Link>
        </div>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="shell page narrow">
        <div className="panel is-skeleton" style={{ minHeight: "16rem" }} aria-hidden="true" />
      </section>
    );
  }

  const date = formatDateParts(booking.event.date);

  return (
    <section className="shell page narrow">
      <div className="panel confirmation">
        <p className="eyebrow">Booking confirmed</p>
        <h1 className="confirmation-title">You're going.</h1>
        <p className="confirmation-lede">
          A confirmation has been sent to {booking.email}.
        </p>

        <div className="ref-block">
          <span>Booking reference</span>
          <strong className="ref-code">{booking.reference}</strong>
        </div>

        <dl className="summary-list">
          <div>
            <dt>Event</dt>
            <dd>{booking.event.title}</dd>
          </div>
          <div>
            <dt>When</dt>
            <dd>
              {date.long} · {date.time}
            </dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>
              {booking.event.venue}
              <span className="fact-sub">{booking.event.city}</span>
            </dd>
          </div>
          <div>
            <dt>Seats</dt>
            <dd>{booking.seats.map((seat) => `${seat.id} (${seat.tier})`).join(", ")}</dd>
          </div>
          <div>
            <dt>Name</dt>
            <dd>{booking.name}</dd>
          </div>
          <div className="summary-total">
            <dt>Total paid</dt>
            <dd>{money(booking.total)}</dd>
          </div>
        </dl>

        <div className="confirmation-actions">
          <Link className="btn btn-primary" to="/">
            Browse more events
          </Link>
          <Link className="btn btn-ghost" to={`/events/${booking.event.id}`}>
            View event
          </Link>
        </div>
      </div>
    </section>
  );
}
