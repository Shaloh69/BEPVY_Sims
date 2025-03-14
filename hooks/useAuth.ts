"use client";

import { useState } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  async function register(name: string, email: string, password: string) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  }

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
    }
    return data;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setToken(null);
  }

  return { token, login, logout, register };
}
