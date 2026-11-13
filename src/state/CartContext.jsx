import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ticketek.selection";

const CartContext = createContext(null);

function readStoredSelection() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.event?.id && Array.isArray(parsed.seats) ? parsed : null;
  } catch {
    return null;
  }
}

function eventSnapshot(event) {
  return {
    id: event.id,
    title: event.title,
    venue: event.venue,
    city: event.city,
    date: event.date,
    gradient: event.gradient
  };
}

function seatSnapshot(seat) {
  return {
    id: seat.id,
    row: seat.row,
    number: seat.number,
    tier: seat.tierLabel ?? seat.tier,
    price: seat.price
  };
}

function sortSeats(a, b) {
  return a.row.localeCompare(b.row) || a.number - b.number;
}

export function CartProvider({ children }) {
  const [selection, setSelection] = useState(readStoredSelection);

  useEffect(() => {
    try {
      if (selection) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable in private modes; selection still works in memory.
    }
  }, [selection]);

  const toggleSeat = useCallback((event, seat) => {
    setSelection((current) => {
      const seats = current?.event.id === event.id ? current.seats : [];
      const alreadyPicked = seats.some((item) => item.id === seat.id);
      const nextSeats = alreadyPicked
        ? seats.filter((item) => item.id !== seat.id)
        : [...seats, seatSnapshot(seat)].sort(sortSeats);

      if (nextSeats.length === 0) return null;
      return { event: eventSnapshot(event), seats: nextSeats };
    });
  }, []);

  const clear = useCallback(() => setSelection(null), []);

  const value = useMemo(
    () => ({
      selection,
      toggleSeat,
      clear,
      seatIds: selection ? selection.seats.map((seat) => seat.id) : [],
      total: selection ? selection.seats.reduce((sum, seat) => sum + seat.price, 0) : 0
    }),
    [selection, toggleSeat, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a CartProvider");
  return context;
}
