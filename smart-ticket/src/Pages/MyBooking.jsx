// src/Pages/MyBooking.jsx
import React, { useEffect, useState } from "react";
import { listenUserBookings, deleteBooking } from "../api/firestoreService";
import "../Style/MyBooking.css";

export default function MyBooking({ user }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = listenUserBookings(user.uid, (data) => setBookings(data));
    return () => unsub();
  }, [user]);

  if (!user) return <div className="card">Please login to see your bookings.</div>;

  const handleCancel = async (b) => {
    if (!confirm("Cancel booking?")) return;
    try {
      await deleteBooking(b);
      alert("Canceled");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? <div>No bookings</div> : bookings.map(b=>(
        <div key={b.id} className="booking-item" style={{ padding: 8, borderBottom: "1px solid #eee" }}>
          <strong>{b.eventName}</strong>
          <div>Seats: {b.seats.map(x=>x+1).join(", ")}</div>
          <div>Booked by: {b.userName}</div>
          <div style={{ marginTop: 8 }}>
            <button onClick={()=>handleCancel(b)}>Cancel</button>
          </div>
        </div>
      ))}
    </div>
  );
}
