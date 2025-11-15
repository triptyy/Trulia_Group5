import React, { useEffect, useState } from "react";
import fakeServer from "../api/fakeServer";
import "../Style/BookMovie.css";

export default function BookMovie() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [msg, setMsg] = useState("");

  const load = () => setEvents(fakeServer.getEvents());

  // Load events + listen for seat updates
  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener("seatsUpdate", onUpdate);
    return () => window.removeEventListener("seatsUpdate", onUpdate);
  }, []);

  // Refresh selected event when events array changes
  useEffect(() => {
    if (selectedEvent) {
      const updated = fakeServer.getEvent(selectedEvent.id);
      if (updated) setSelectedEvent(updated);
    }
  }, [events]);

  const openEvent = (ev) => {
    setSelectedEvent(ev);
    setSelectedSeats([]);
    setMsg("");
  };

  const toggleSeat = (idx) => {
    if (!selectedEvent) return;
    const ev = fakeServer.getEvent(selectedEvent.id);
    if (!ev) return;

    if (ev.seats[idx] !== 0) return; // only free seats

    setSelectedSeats((prev) =>
      prev.includes(idx)
        ? prev.filter((x) => x !== idx)
        : [...prev, idx]
    );
  };

  const doBook = () => {
    try {
      fakeServer.bookSeats({
        eventId: selectedEvent.id,
        seats: selectedSeats,
      });

      setMsg("Booked successfully!");
      setSelectedSeats([]);
      setEvents(fakeServer.getEvents());
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Book a Show</h2>

      <div className="events-row">
        {/* Event List */}
        <div className="events-list">
          {events.map((ev) => (
            <div
              key={ev.id}
              className={`event-item ${
                selectedEvent && selectedEvent.id === ev.id ? "active" : ""
              }`}
              onClick={() => openEvent(ev)}
            >
              <div className="event-name">{ev.name}</div>
              <div className="event-date">{ev.date}</div>
              <div className="muted">
                Available: {ev.seats.filter((s) => s === 0).length}
              </div>
            </div>
          ))}
        </div>

        {/* Seat Selection */}
        <div className="event-detail">
          {!selectedEvent ? (
            <div className="muted">Select an event to see seats</div>
          ) : (
            <>
              <h3>{selectedEvent.name}</h3>

              <div className="seat-grid">
                {selectedEvent.seats.map((s, i) => {
                  const cls =
                    s === 0
                      ? selectedSeats.includes(i)
                        ? "seat selected"
                        : "seat free"
                      : s === 1
                      ? "seat mine"
                      : "seat taken";

                  return (
                    <div
                      key={i}
                      className={cls}
                      onClick={() => toggleSeat(i)}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>

              <div className="controls">
                <div>
                  Selected:{" "}
                  {selectedSeats.length > 0
                    ? selectedSeats.join(", ")
                    : "-"}
                </div>

                <button
                  onClick={doBook}
                  disabled={selectedSeats.length === 0}
                >
                  Book Selected
                </button>
              </div>

              {msg && <div className="info">{msg}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
