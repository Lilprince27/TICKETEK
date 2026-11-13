import { Link } from "react-router-dom";
import { formatDateParts, money } from "../lib/format.js";

export default function EventCard({ event }) {
  const date = formatDateParts(event.date);
  const soldPercent = Math.round((event.seatsSold / event.seatsTotal) * 100);
  const leftPercent = Math.max(0, 100 - soldPercent);

  return (
    <Link
      to={`/events/${event.id}`}
      className="event-card"
      style={{ "--grad-a": event.gradient[0], "--grad-b": event.gradient[1] }}
    >
      <div className="event-poster">
        <span className="poster-category">{event.category}</span>
        <div className="poster-date">
          <span className="poster-day">{date.day}</span>
          <span className="poster-month">{date.month}</span>
          <span className="poster-year">{date.year}</span>
        </div>
        <span className="poster-title">{event.title}</span>
      </div>

      <div className="event-body">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-meta">
          {event.venue} · {event.city}
        </p>
        <p className="event-tagline">{event.tagline}</p>

        <div className="event-footer">
          <span className="event-price">from {money(event.fromPrice)}</span>
          <span className="event-availability">
            <span className="availability-bar" aria-hidden="true">
              <span className="availability-fill" style={{ width: `${soldPercent}%` }} />
            </span>
            {leftPercent}% left
          </span>
        </div>
      </div>
    </Link>
  );
}
