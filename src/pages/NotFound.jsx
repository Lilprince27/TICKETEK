import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="shell page narrow">
      <div className="panel empty-state">
        <h1>Page not found</h1>
        <p>That page doesn't exist — it may have sold out and moved on.</p>
        <Link className="btn btn-primary" to="/">
          Browse events
        </Link>
      </div>
    </section>
  );
}
