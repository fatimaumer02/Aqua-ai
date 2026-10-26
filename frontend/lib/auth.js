// Real authentication against the Node.js backend.
// Token is stored in localStorage and attached to every request in lib/api.js.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const TOKEN_KEY = "aquaguard_token";
const USER_KEY = "aquaguard_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeSession(token, user) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

async function authRequest(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export async function signUp({ name, email, password, role }) {
  const data = await authRequest("/api/auth/signup", { name, email, password, role });
  storeSession(data.token, data.user);
  return data.user;
}

export async function signIn({ email, password }) {
  const data = await authRequest("/api/auth/signin", { email, password });
  storeSession(data.token, data.user);
  return data.user;
}

export async function fetchCurrentUser() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    clearSession();
    return null;
  }

  const data = await res.json();
  return data.user;
}
