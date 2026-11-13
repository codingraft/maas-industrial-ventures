"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <Image
            src="/images/maas-logo-white.svg"
            alt="MAAS Industrial Ventures"
            width={260}
            height={74}
            priority
            style={{ width: "auto", height: "48px" }}
          />
        </div>
        <h1 className="login-title">MAAS Ventures Portal</h1>
        <p className="login-subtitle">Executive Lead CRM & Site Control System</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-row">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-row">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Authenticating…" : "Sign In to Admin Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
