// src/services/api.ts
import axios from "axios";

const ROOT = (import.meta.env.VITE_API_URL ?? "http://localhost:4000")
  .replace(/\/+$/, "");            // remove barra no fim

const API_BASE = `${ROOT}/api`;    // garante /api

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;