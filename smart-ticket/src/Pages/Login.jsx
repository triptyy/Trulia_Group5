// src/Pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin, emailLogin } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const onEmail = async (e) => {
    e.preventDefault();
    try {
      await emailLogin(email, password);
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
      <h2>Login</h2>
      <form onSubmit={onEmail}>
        <label>Email<input value={email} onChange={(e)=>setEmail(e.target.value)} required/></label>
        <label>Password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required/></label>
        <button type="submit">Login</button>
      </form>

      <button onClick={onGoogle} style={{ marginTop: 8 }}>Login with Google</button>
      {err && <div style={{ color: "red" }}>{err}</div>}
    </div>
  );
}
