// src/App.jsx
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
    <div>
      <header className="header">
        <h1>Smart Ticket</h1>
        <div className="nav">
          <Link to="/">Book</Link>
          <Link to="/my">My Booking</Link>
          {user ? (
            <>
              <span className="user-name">{user.displayName || user.email}</span>
              <button className="link-btn" onClick={() => logoutFirebase()}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign up</Link>
            </>
          )}
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<BookMovie user={user} />} />
          <Route path="/my" element={<MyBooking user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </div>
  );
}
