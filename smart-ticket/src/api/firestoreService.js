// src/api/firestoreService.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

const eventsRef = collection(db, "events");
const bookingsRef = collection(db, "bookings");

// Listen all events in real-time
export const listenEvents = (cb) => {
  return onSnapshot(
    eventsRef,
    (snap) => {
      const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(events);
    },
    (err) => {
      console.error("listenEvents error:", err);
    }
  );
};

// Transactional booking: atomically check seats, update event, and create booking
export const bookSeats = async (eventId, seats, user) => {
  if (!user) throw new Error("Not authenticated");
  if (!Array.isArray(seats) || seats.length === 0) throw new Error("No seats selected");

  const eventRef = doc(db, "events", eventId);

  return runTransaction(db, async (tx) => {
    const eventSnap = await tx.get(eventRef);
    if (!eventSnap.exists()) throw new Error("Event not found");
    const event = eventSnap.data();
    const seatsArr = Array.isArray(event.seats) ? [...event.seats] : [];

    // Validate indexes
    for (const s of seats) {
      if (typeof s !== "number" || s < 0 || s >= seatsArr.length) {
        throw new Error(`Invalid seat index: ${s}`);
      }
    }

    // Check availability
    for (const s of seats) {
      if (seatsArr[s] !== 0) {
        throw new Error(`Seat ${s + 1} is already booked`);
      }
    }

    // Reserve seats (store uid)
    for (const s of seats) seatsArr[s] = user.uid;

    tx.update(eventRef, { seats: seatsArr });

    // create booking doc with event date for convenience
    const newBookingRef = doc(bookingsRef);
    tx.set(newBookingRef, {
      userId: user.uid,
      userName: user.displayName || user.email || "User",
      eventId,
      eventName: event.name || "",
      eventDate: event.date || "",
      seats,
      createdAt: serverTimestamp()
    });

    return { bookingId: newBookingRef.id };
  });
};

// Listen bookings for a user in real-time
export const listenUserBookings = (uid, cb) => {
  if (!uid) return () => {};
  const q = query(bookingsRef, where("userId", "==", uid));
  return onSnapshot(
    q,
    (snap) => {
      const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(bookings);
    },
    (err) => {
      console.error("listenUserBookings error:", err);
    }
  );
};

// Cancel booking: free seats and delete booking (transactional)
export const deleteBooking = async (booking) => {
  if (!booking || !booking.id) throw new Error("Invalid booking");
  const eventRef = doc(db, "events", booking.eventId);
  const bookingRef = doc(db, "bookings", booking.id);

  return runTransaction(db, async (tx) => {
    const eventSnap = await tx.get(eventRef);
    if (!eventSnap.exists()) throw new Error("Event not found");
    const event = eventSnap.data();
    const seatsArr = Array.isArray(event.seats) ? [...event.seats] : [];

    // free seats only if they were reserved by this user
    for (const s of booking.seats) {
      if (seatsArr[s] === booking.userId) seatsArr[s] = 0;
    }

    tx.update(eventRef, { seats: seatsArr });
    tx.delete(bookingRef);
  });
};
