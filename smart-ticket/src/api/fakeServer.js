// A simple mock backend using localStorage and CustomEvent for seat updates.
// Enough for frontend dev/demo without a real server.

const STORAGE = {
  USERS: "st_users",
  CURRENT: "st_current",
  EVENTS: "st_events"
};

function seed() {
  if (!localStorage.getItem(STORAGE.EVENTS)) {
    const events = [
      { id: "ev1", name: "Movie: The Great Escape", date: "2025-12-10 18:00", seats: Array(32).fill(0) },
      { id: "ev2", name: "Standup Night", date: "2025-12-11 20:00", seats: Array(24).fill(0) }
    ];
    localStorage.setItem(STORAGE.EVENTS, JSON.stringify(events));
  }
  if (!localStorage.getItem(STORAGE.USERS)) {
    localStorage.setItem(STORAGE.USERS, JSON.stringify([]));
  }
}
seed();

function emitSeats() {
  window.dispatchEvent(new CustomEvent("seatsUpdate", { detail: { time: Date.now() } }));
}

// simulate other users booking occasionally
setInterval(() => {
  const events = JSON.parse(localStorage.getItem(STORAGE.EVENTS) || "[]");
  if (!events.length) return;
  const idx = Math.floor(Math.random() * events.length);
  const e = events[idx];
  const free = e.seats.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
  if (!free.length) return;
  const toBook = Math.floor(Math.random() * 2); // 0 or 1
  for (let i = 0; i < toBook; i++) {
    const pick = free[Math.floor(Math.random() * free.length)];
    if (pick !== undefined) e.seats[pick] = 2; // 2 = booked by others
  }
  events[idx] = e;
  localStorage.setItem(STORAGE.EVENTS, JSON.stringify(events));
  emitSeats();
}, 5000);

const fakeServer = {
  register({ name, email, password }) {
    const users = JSON.parse(localStorage.getItem(STORAGE.USERS) || "[]");
    if (users.find((u) => u.email === email)) throw new Error("Email already in use");
    const id = "u" + Date.now();
    users.push({ id, name, email, password, bookings: [] });
    localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
    return { id, name, email };
  },

  login({ email, password }) {
    const users = JSON.parse(localStorage.getItem(STORAGE.USERS) || "[]");
    const u = users.find((x) => x.email === email && x.password === password);
    if (!u) throw new Error("Invalid credentials");
    localStorage.setItem(STORAGE.CURRENT, JSON.stringify({ id: u.id, name: u.name, email: u.email }));
    window.dispatchEvent(new CustomEvent("authChange"));
    return { id: u.id, name: u.name, email: u.email };
  },

  logout() {
    localStorage.removeItem(STORAGE.CURRENT);
    window.dispatchEvent(new CustomEvent("authChange"));
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE.CURRENT) || "null");
  },

  getEvents() {
    return JSON.parse(localStorage.getItem(STORAGE.EVENTS) || "[]");
  },

  getEvent(eventId) {
    return this.getEvents().find((e) => e.id === eventId);
  },

  bookSeats({ eventId, seats }) {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Not logged in");
    const events = this.getEvents();
    const eidx = events.findIndex((x) => x.id === eventId);
    if (eidx === -1) throw new Error("Event not found");
    const e = events[eidx];
    for (const s of seats) {
      if (e.seats[s] !== 0) throw new Error("One or more seats not available");
    }
    for (const s of seats) e.seats[s] = 1; // 1 = booked by current user
    localStorage.setItem(STORAGE.EVENTS, JSON.stringify(events));
    const users = JSON.parse(localStorage.getItem(STORAGE.USERS) || "[]");
    const uidx = users.findIndex((x) => x.id === user.id);
    if (uidx >= 0) {
      const booking = { id: "b" + Date.now(), eventId, seats, at: new Date().toISOString() };
      users[uidx].bookings = users[uidx].bookings || [];
      users[uidx].bookings.push(booking);
      localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
      emitSeats();
      return booking;
    } else {
      throw new Error("User data missing");
    }
  },

  getUserBookings() {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Not logged in");
    const users = JSON.parse(localStorage.getItem(STORAGE.USERS) || "[]");
    const u = users.find((x) => x.id === user.id);
    return (u && u.bookings) ? u.bookings : [];
  },

  deleteBooking(bookingId) {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Not logged in");
    const users = JSON.parse(localStorage.getItem(STORAGE.USERS) || "[]");
    const uidx = users.findIndex((x) => x.id === user.id);
    if (uidx < 0) throw new Error("User not found");
    const booking = (users[uidx].bookings || []).find((b) => b.id === bookingId);
    if (!booking) throw new Error("Booking not found");
    // free seats in events that were booked by user (1)
    const events = this.getEvents();
    const eidx = events.findIndex((x) => x.id === booking.eventId);
    if (eidx >= 0) {
      for (const s of booking.seats) {
        if (events[eidx].seats[s] === 1) events[eidx].seats[s] = 0;
      }
      localStorage.setItem(STORAGE.EVENTS, JSON.stringify(events));
    }
    users[uidx].bookings = users[uidx].bookings.filter((b) => b.id !== bookingId);
    localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
    emitSeats();
    return true;
  }
};

export default fakeServer;
