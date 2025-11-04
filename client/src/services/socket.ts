// src/services/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const WS_ROOT = (import.meta.env.VITE_WS_URL ?? "http://localhost:4000").replace(/\/+$/, "");

export function getSocket() {
  if (!socket) {
    socket = io(WS_ROOT, {
      withCredentials: true,
      transports: ["websocket"], // evita long-polling
    });
  }
  return socket;
}
