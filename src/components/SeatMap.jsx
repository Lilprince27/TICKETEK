export default function SeatMap({ rows = [], seats = [], selectedIds, onToggle }) {
  const seatsByRow = new Map();
  for (const row of rows) seatsByRow.set(row, []);
  for (const seat of seats) {
    if (!seatsByRow.has(seat.row)) seatsByRow.set(seat.row, []);
    seatsByRow.get(seat.row).push(seat);
  }
  for (const list of seatsByRow.values()) list.sort((a, b) => a.number - b.number);

  return (
    <div className="seat-map">
      <div className="stage" aria-hidden="true">
        <span>Stage</span>
      </div>

      <div className="seat-rows" role="group" aria-label="Seat map">
        {rows.map((row) => {
          const rowSeats = seatsByRow.get(row) ?? [];
          return (
            <div className="seat-row" key={row}>
              <span className="seat-row-label" aria-hidden="true">
                {row}
              </span>
              <div
                className="seat-row-seats"
                style={{ "--cols": rowSeats.length || 12 }}
              >
                {rowSeats.map((seat) => {
                  const sold = seat.status === "sold";
                  const selected = selectedIds.has(seat.id);
                  return (
                    <button
                      key={seat.id}
                      type="button"
                      className="seat"
                      aria-pressed={selected}
                      disabled={sold}
                      onClick={() => onToggle(seat)}
                      title={`Row ${seat.row}, seat ${seat.number} — ${seat.tierLabel} — $${seat.price}`}
                      aria-label={`Row ${seat.row} seat ${seat.number}, ${seat.tierLabel}, $${seat.price}${
                        sold ? ", sold" : ""
                      }`}
                    />
                  );
                })}
              </div>
              <span className="seat-row-label seat-row-label-end" aria-hidden="true">
                {row}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
