// src/api/firestoreService.js  — replace file with this
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase"; // make sure path matches your structure

const eventsRef = collection(db, "events");
const bookingsRef = collection(db, "bookings");

// Listen all events (real-time)
export const listenEvents = (cb) => {
  return onSnapshot(eventsRef, (snap) => {
    const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(events);
  }, (err) => {
    console.error("listenEvents error:", err);
  });
};

// Book seats (simple version — see note about transactions later)
export const bookSeats = async (eventId, seats, user) => {
  if (!user) throw new Error("Not authenticated");
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) throw new Error("Event not found");

  const event = eventSnap.data();
  const seatsArr = Array.isArray(event.seats) ? [...event.seats] : [];

  // check availability
  for (const s of seats) {
    if (seatsArr[s] !== 0) throw new Error(`Seat ${s + 1} not available`);
    seatsArr[s] = user.uid;
  }

  // update event seats
  await updateDoc(eventRef, { seats: seatsArr });

  // create booking record
  const bookingDoc = await addDoc(bookingsRef, {
    userId: user.uid,
    userName: user.displayName || user.email || "User",
    eventId,
    eventName: event.name || "",
    seats,
    createdAt: Date.now()
  });

  return { id: bookingDoc.id };
};

// Listen user bookings (real-time)
export const listenUserBookings = (uid, cb) => {
  const q = query(bookingsRef, where("userId", "==", uid));
  return onSnapshot(q, (snap) => {
    const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(bookings);
  }, (err) => {
    console.error("listenUserBookings error:", err);
  });
};

// Delete booking and free seats
export const deleteBooking = async (booking) => {
  const eventRef = doc(db, "events", booking.eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) throw new Error("Event not found");
  const event = eventSnap.data();
  const seatsArr = Array.isArray(event.seats) ? [...event.seats] : [];

  for (const s of booking.seats) {
    if (seatsArr[s] === booking.userId) seatsArr[s] = 0;
  }

  await updateDoc(eventRef, { seats: seatsArr });
  await deleteDoc(doc(db, "bookings", booking.id));
};
