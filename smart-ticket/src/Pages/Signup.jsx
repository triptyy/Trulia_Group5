import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  googleLogin,
  emailSignup,
} from "../firebase";
import "../Style/Signup.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const onEmailSignup = async (e) => {
    e.preventDefault();

    try {
      const result = await emailSignup(email, password);
      const user = result.user;

      localStorage.setItem("st_current", JSON.stringify({
        id: user.uid,
        name,
        email: user.email
      }));

      window.dispatchEvent(new CustomEvent("authChange"));
      navigate("/");
    } catch (error) {
      setErr(error.message);
    }
  };

  const onGoogleSignup = async () => {
    try {
      const result = await googleLogin();
      const user = result.user;

      localStorage.setItem("st_current", JSON.stringify({
        id: user.uid,
        name: user.displayName,
        email: user.email
      }));

      window.dispatchEvent(new CustomEvent("authChange"));
      navigate("/");
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="card auth-card">
      <h2>Register</h2>

      <form className="form" onSubmit={onEmailSignup}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Create Account</button>
      </form>

      <button className="google-btn" onClick={onGoogleSignup}>
        Sign Up with Google
      </button>

      {err && <div className="error">{err}</div>}
    </div>
  );
}
