import { create } from "zustand";
import api from "../services/api";
import type { User } from "../types";

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User) => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  loading: false,
  setUser: (u) => {
    localStorage.setItem("user", JSON.stringify(u));
    set({ user: u });
  },
  login: async (email, password) => {
    set({ loading: true });
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ token: data.token, user: data.user, loading: false });
  },
  register: async (username, email, password) => {
    set({ loading: true });
    const { data } = await api.post("/auth/register", { username, email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ token: data.token, user: data.user, loading: false });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));
