import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { onAuthChanged, logoutFirebase } from "./firebase";
import BookMovie from "./Pages/BookMovie";
import MyBooking from "./Pages/MyBooking";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <>
      <header className="header">
        <h1>Smart Ticket</h1>
        <nav>
          <Link to="/">Book</Link>
          <Link to="/my">My Booking</Link>
          {user ? (
            <>
              <span>{user.displayName || user.email}</span>
              <button onClick={logoutFirebase}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<BookMovie user={user} />} />
        <Route path="/my" element={<MyBooking user={user} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}
