// src/Pages/BookMovie.jsx
import React, { useState, useEffect } from "react";
import "../Style/BookMovie.css";
import { listenEvents, bookSeats } from "../api/firestoreService";

export default function BookMovie({ user }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [booking, setBooking] = useState(false);

  // subscribe to events
  useEffect(() => {
    const unsub = listenEvents((data) => setEvents(data));
    return () => unsub();
  }, []);

  // keep selectedEvent synced with live updates (so booked seats update UI)
  useEffect(() => {
    if (!selectedEvent) return;
    const updated = events.find((e) => e.id === selectedEvent.id);
    if (updated) {
      setSelectedEvent(updated);
      // remove any selected seats that are no longer available
      const stillSelectable = selectedSeats.filter((s) => updated.seats && updated.seats[s] === 0);
      if (stillSelectable.length !== selectedSeats.length) setSelectedSeats(stillSelectable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const availableCount = (ev) => {
    if (!ev || !Array.isArray(ev.seats)) return 0;
    return ev.seats.filter((s) => s === 0).length;
  };

  const toggleSeat = (index) => {
    if (!selectedEvent) return;
    const seatVal = selectedEvent.seats?.[index];
    const isTaken = seatVal !== 0;
    if (isTaken) return;

    setSelectedSeats((prev) => {
      if (prev.includes(index)) return prev.filter((s) => s !== index);
      return [...prev, index];
    });
  };

  const handleBook = async () => {
    if (!user) {
      alert("Please login to book seats");
      return;
    }
    if (!selectedEvent) return;
    if (selectedSeats.length === 0) {
      alert("Select at least one seat");
      return;
    }

    setBooking(true);
    try {
      // attempt to book multiple seats at once
      await bookSeats(selectedEvent.id, selectedSeats, user);
      alert(`Booked ${selectedSeats.length} seat(s)`);
      setSelectedSeats([]);
      // selectedEvent will update through onSnapshot
    } catch (err) {
      alert(err.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="book-movie-container">
      <h1>Book a Show</h1>

      <div className="events-list">
        {events.map((event) => (
          <div
            key={event.id}
            className={`event-card ${selectedEvent?.id === event.id ? "selected" : ""}`}
            onClick={() => {
              setSelectedEvent(event);
              setSelectedSeats([]);
            }}
          >
            <h2>{event.name}</h2>
            <p>{event.date}</p>
            <p style={{ marginTop: 8, color: "#374151" }}>
              Available: <strong>{availableCount(event)}</strong>
            </p>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="seats-section">
          <h2>Select Seats for {selectedEvent.name}</h2>
          <p style={{ color: "#374151" }}>
            Remaining seats: <strong>{availableCount(selectedEvent)}</strong>
          </p>

          <div className="seats-grid" role="grid">
            {Array.isArray(selectedEvent.seats) ? (
              selectedEvent.seats.map((seat, index) => {
                const isTaken = seat !== 0;
                const isSelected = selectedSeats.includes(index);
                return (
                  <div
                    key={index}
                    role="button"
                    aria-disabled={isTaken}
                    className={`seat ${isTaken ? "taken" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleSeat(index)}
                  >
                    {index + 1}
                  </div>
                );
              })
            ) : (
              <p>No seat data available</p>
            )}
          </div>

          <button
            className="book-btn"
            onClick={handleBook}
            disabled={booking || selectedSeats.length === 0}
            style={{ marginTop: 16 }}
          >
            {booking ? "Booking…" : `Book ${selectedSeats.length ? selectedSeats.length + " Seat(s)" : "Seats"}`}
          </button>
        </div>
      )}
    </div>
  );
}
