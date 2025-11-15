import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import MyBooking from "./Pages/MyBooking.jsx";
import BookMovie from "./Pages/BookMovie.jsx";
import fakeServer from "./api/fakeServer";
import "./App.css";


export default function App() {
  const [user, setUser] = useState(fakeServer.getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    const onAuth = () => setUser(fakeServer.getCurrentUser());
    window.addEventListener("authChange", onAuth);
    return () => window.removeEventListener("authChange", onAuth);
  }, []);

  const logout = () => {
    fakeServer.logout();
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Smart Ticket Booking</h1>
        <nav className="nav">
          <Link to="/">Book</Link>
          <Link to="/mybooking">My Bookings</Link>
          {user ? (
            <>
              <span className="user-name">Hello, {user.name}</span>
              <button className="link-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<BookMovie />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/mybooking" element={<MyBooking />} />
        </Routes>
      </main>

      <footer className="footer">Prototype — Smart Ticket Booking</footer>
    </div>
  );
}
