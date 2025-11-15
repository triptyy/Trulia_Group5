// src/Pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin, emailSignup } from "../firebase";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const onEmail = async (e) => {
    e.preventDefault();
    try {
      await emailSignup(email, password, name);
      setErr("");
      nav("/");
    } catch (error) {
      setErr(error.message);
    }
  };

  const onGoogle = async () => {
    try {
      await googleLogin();
      nav("/");
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="card auth-card">
      <h2>Register</h2>
      <form onSubmit={onEmail}>
        <label>Name<input value={name} onChange={(e)=>setName(e.target.value)} /></label>
        <label>Email<input value={email} onChange={(e)=>setEmail(e.target.value)} required/></label>
        <label>Password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required/></label>
        <button type="submit">Create Account</button>
      </form>

      <button onClick={onGoogle} style={{ marginTop: 8 }}>Sign up with Google</button>
      {err && <div style={{ color: "red" }}>{err}</div>}
    </div>
  );
}
