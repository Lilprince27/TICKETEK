import { useEffect, useMemo, useState } from "react";
import EventCard from "../components/EventCard.jsx";
import { fetchEvents } from "../api.js";

export default function Home() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    fetchEvents()
      .then((items) => {
        if (alive) setEvents(items);
      })
      .catch((cause) => {
        if (alive) setError(cause.message);
      });
    return () => {
      alive = false;
    };
  }, []);

  const cities = useMemo(
    () => ["All", ...Array.from(new Set((events ?? []).map((event) => event.city)))],
    [events]
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (events ?? []).filter((event) => {
      if (city !== "All" && event.city !== city) return false;
      if (!needle) return true;
      return `${event.title} ${event.venue} ${event.city} ${event.category}`
        .toLowerCase()
        .includes(needle);
    });
  }, [events, city, query]);

  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <p className="eyebrow">On sale now · Australia</p>
          <h1 className="hero-title">
            Live,
            <br />
            in the room.
          </h1>
          <p className="hero-lede">
            Arena tours, festival afternoons and late-night comedy. Pick a show, choose the seats you
            actually want, and get them before someone else does.
          </p>

          <label className="hero-search">
            <span className="visually-hidden">Search events</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search artists, venues or cities"
            />
          </label>
        </div>
      </section>

      <section className="shell section" aria-labelledby="on-sale-heading">
        <div className="section-head">
          <h2 id="on-sale-heading" className="section-title">
            On sale now
          </h2>
          <p className="section-count">
            {events ? `${visible.length} ${visible.length === 1 ? "event" : "events"}` : "Loading events"}
          </p>
        </div>

        <div className="city-pills" role="group" aria-label="Filter by city">
          {cities.map((option) => (
            <button
              key={option}
              type="button"
              className="pill"
              aria-pressed={city === option}
              onClick={() => setCity(option)}
            >
              {option}
            </button>
          ))}
        </div>

        {error ? (
          <p className="notice notice-error">Couldn't load events: {error}</p>
        ) : null}

        <div className="event-grid">
          {events === null && !error
            ? Array.from({ length: 6 }).map((_, index) => (
                <div className="event-card is-skeleton" key={index} aria-hidden="true" />
              ))
            : null}

          {visible.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {events && visible.length === 0 && !error ? (
          <p className="notice">
            No events match that search. Try another city, or clear the search field.
          </p>
        ) : null}
      </section>
    </>
  );
}
