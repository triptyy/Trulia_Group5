import React, { useState, useEffect } from "react";
import "../Style/BookMovie.css";
import { listenEvents, bookSeats } from "../api/firestoreService";

export default function BookMovie({ user }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const unsub = listenEvents((data) => setEvents(data));
    return () => unsub();
  }, []);

  const toggleSeat = (index) => {
    if (!selectedEvent) return;

    const isTaken = selectedEvent.seats[index] !== 0;
    if (isTaken) return;

    if (selectedSeats.includes(index)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== index));
    } else {
      setSelectedSeats([...selectedSeats, index]);
    }
  };

  const handleBook = async () => {
    if (!user) {
      alert("Please login to book seats");
      return;
    }
    if (!selectedEvent) return;
    if (!selectedSeats.length) return;

    setBooking(true);
    try {
      await bookSeats(selectedEvent.id, selectedSeats, user);
      alert("Booked!");
      setSelectedSeats([]);
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
        {events.length === 0 && <p>Loading events...</p>}

        {events.map((event) => (
          <div
            key={event.id}
            className={`event-card ${
              selectedEvent?.id === event.id ? "selected" : ""
            }`}
            onClick={() => {
              setSelectedEvent(event);
              setSelectedSeats([]);
            }}
          >
            <h2>{event.name}</h2>
            <p>{event.date}</p>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="seats-section">
          <h2>Select Seats for {selectedEvent.name}</h2>

          <div className="seats-grid">
            {selectedEvent.seats.map((seat, index) => {
              const isTaken = seat !== 0;
              const isSelected = selectedSeats.includes(index);

              return (
                <div
                  key={index}
                  className={`seat 
                    ${isTaken ? "taken" : ""} 
                    ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleSeat(index)}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>

          <button
            className="book-btn"
            disabled={selectedSeats.length === 0 || booking}
            onClick={handleBook}
          >
            {booking ? "Booking..." : "Book Selected Seats"}
          </button>
        </div>
      )}
    </div>
  );
}
