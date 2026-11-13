import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createBooking } from "../api.js";
import { formatDateParts, money } from "../lib/format.js";
import { useCart } from "../state/CartContext.jsx";

export default function Checkout() {
  const { selection, total, clear } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!selection) {
    return (
      <section className="shell page narrow">
        <div className="panel empty-state">
          <h1>Nothing in your order yet</h1>
          <p>Pick a show and choose your seats to start a booking.</p>
          <Link className="btn btn-primary" to="/">
            Browse events
          </Link>
        </div>
      </section>
    );
  }

  const date = formatDateParts(selection.event.date, selection.event.timeZone);
  const groups = selection.seats.reduce((acc, seat) => {
    const group = acc.find((item) => item.tier === seat.tier);
    if (group) group.seats.push(seat);
    else acc.push({ tier: seat.tier, price: seat.price, seats: [seat] });
    return acc;
  }, []);

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking({
        eventId: selection.event.id,
        seatIds: selection.seats.map((seat) => seat.id),
        name,
        email
      });
      clear();
      navigate(`/confirmation/${booking.reference}`, { replace: true });
    } catch (cause) {
      setError(cause.message);
      setSubmitting(false);
    }
  }

  return (
    <section className="shell page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Events</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/events/${selection.event.id}`}>{selection.event.title}</Link>
        <span aria-hidden="true">/</span>
        <span>Checkout</span>
      </nav>

      <h1 className="page-heading">Checkout</h1>

      <div className="checkout-grid">
        <form className="panel checkout-form" onSubmit={handleSubmit}>
          <h2 className="panel-title">Your details</h2>
          <p className="panel-note">Tickets are sent to this email address.</p>

          <label className="field">
            <span>Full name</span>
            <input
              type="text"
              value={name}
              onChange={(changeEvent) => setName(changeEvent.target.value)}
              autoComplete="name"
              required
              minLength={2}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(changeEvent) => setEmail(changeEvent.target.value)}
              autoComplete="email"
              required
            />
          </label>

          {error ? <p className="notice notice-error">{error}</p> : null}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Confirming…" : `Confirm booking · ${money(total)}`}
          </button>
          <p className="panel-note demo-note">
            Demo checkout — no card is charged and no real tickets are issued.
          </p>
        </form>

        <aside className="panel order-summary" aria-label="Order summary">
          <div
            className="summary-poster"
            style={{ "--grad-a": selection.event.gradient[0], "--grad-b": selection.event.gradient[1] }}
          >
            <span className="poster-category">{date.day} {date.month}</span>
            <span className="poster-title">{selection.event.title}</span>
          </div>

          <p className="summary-meta">
            {date.long} · {date.time}
            <br />
            {selection.event.venue} · {selection.event.city}
          </p>

          <ul className="order-groups">
            {groups.map((group) => (
              <li key={group.tier}>
                <div className="order-group-head">
                  <span>{group.tier}</span>
                  <span>{group.seats.length} × {money(group.price)}</span>
                </div>
                <p className="order-seats">{group.seats.map((seat) => seat.id).join(", ")}</p>
              </li>
            ))}
          </ul>

          <div className="order-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>

          <Link className="btn btn-ghost btn-block" to={`/events/${selection.event.id}`}>
            Change seats
          </Link>
        </aside>
      </div>
    </section>
  );
}
