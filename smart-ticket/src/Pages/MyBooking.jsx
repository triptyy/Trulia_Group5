import React, { useEffect, useState } from "react";
import fakeServer from "../api/fakeServer";
import "../Style/MyBooking.css";

export default function MyBooking() {
  const [bookings, setBookings] = useState([]);
  const [err, setErr] = useState("");

  const load = () => {
    try {
      setBookings(fakeServer.getUserBookings());
      setErr("");
    } catch (error) {
      setErr(error.message);
      setBookings([]);
    }
  };

  useEffect(() => {
    load();
    window.addEventListener("seatsUpdate", load);
    window.addEventListener("authChange", load);

    return () => {
      window.removeEventListener("seatsUpdate", load);
      window.removeEventListener("authChange", load);
    };
  }, []);

  const handleDelete = (id) => {
    if (!confirm("Delete booking?")) return;

    try {
      fakeServer.deleteBooking(id);
      load();
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="card">
      <h2>My Bookings</h2>

      {err && <div className="error">{err}</div>}

      {bookings.length === 0 ? (
        <div>No bookings yet</div>
      ) : (
        <ul className="bookings-list">
          {bookings.map((b) => {
            const event = fakeServer.getEvent(b.eventId) || {
              name: "Unknown Event",
            };

            return (
              <li key={b.id} className="booking-item">
                <div className="booking-row">
                  <div>
                    <strong>{event.name}</strong>
                    <div className="muted">Seats: {b.seats.join(", ")}</div>
                    <div className="muted">
                      Booked: {new Date(b.at).toLocaleString()}
                    </div>
                  </div>

                  <button
                    className="danger"
                    onClick={() => handleDelete(b.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
