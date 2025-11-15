import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  googleLogin,
  emailLogin,
} from "../firebase";
import "../Style/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const onEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await emailLogin(email, password);
      const user = result.user;

      localStorage.setItem("st_current", JSON.stringify({
        id: user.uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email
      }));

      window.dispatchEvent(new CustomEvent("authChange"));
      navigate("/");
    } catch (error) {
      setErr(error.message);
    }
  };

  const onGoogleLogin = async () => {
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
      <h2>Login</h2>

      <form onSubmit={onEmailLogin} className="form">
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit">Login</button>
      </form>

      <button className="google-btn" onClick={onGoogleLogin}>
        Login with Google
      </button>

      {err && <div className="error">{err}</div>}
    </div>
  );
}
