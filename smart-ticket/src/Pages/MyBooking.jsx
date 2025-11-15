// src/Pages/MyBooking.jsx
import React, { useEffect, useState } from "react";
import { listenUserBookings, deleteBooking } from "../api/firestoreService";
import "../Style/MyBooking.css";

export default function MyBooking({ user }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    const unsub = listenUserBookings(user.uid, setBookings);
    return () => unsub();
  }, [user]);

  const handleDelete = async (booking) => {
    if (!booking) return;
    if (!window.confirm("Cancel booking and free seats?")) return;
    try {
      await deleteBooking(booking);
      alert("Booking cancelled");
    } catch (err) {
      alert(err.message || "Cancel failed");
    }
  };

  return (
    <div className="my-booking-container">
      <h1>My Bookings</h1>

      {bookings.length === 0 && <p>No bookings yet</p>}

      {bookings.map((booking) => (
        <div key={booking.id} className="booking-card">
          <h2>{booking.eventName}</h2>
          <p>Date: {booking.eventDate || booking.date || "—"}</p>
          <p>
            Seats: <strong>{Array.isArray(booking.seats) ? booking.seats.map((s) => s + 1).join(", ") : "-"}</strong>
          </p>
          <button onClick={() => handleDelete(booking)}>Cancel Booking</button>
        </div>
      ))}
    </div>
  );
}
