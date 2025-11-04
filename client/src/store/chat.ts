import { create } from "zustand";
import api from "../services/api";
import type { Message, Room } from "../types";
import type { Invitation } from "../types";

export type RoomWithLast = Room & {
  lastMessage?: Message | null;
  updatedAt?: string;
};

type ChatState = {
  rooms: RoomWithLast[];
  invites: Invitation[];
  currentRoom: Room | null;
  messages: Message[];
  typingUser: string | null;
  typingByRoom: Record<string, string | null>;

  // loaders
  fetchRooms: () => Promise<void>;
  fetchRoomsWithLast: () => Promise<void>;
  fetchInvites: () => Promise<void>;

  // room mgmt / invites
  deleteRoom: (roomId: string) => Promise<void>;
  sendInvite: (roomId: string, toUserId: string) => Promise<void>;
  actOnInvite: (inviteId: string, action: "accept" | "decline") => Promise<void>;

  // chat flow
  selectRoom: (room: Room) => Promise<void>;
  fetchMessages: (roomId: string) => Promise<void>;
  addMessage: (m: Message) => void;
  updateMessage: (m: Message) => void;

  // typing
  setTyping: (username: string | null) => void;
  setTypingForRoom: (roomId: string, username: string | null) => void;

  // realtime update (sidebar)
  applyRoomUpdate: (roomId: string, lastMessage: Message) => void;
};

export const useChat = create<ChatState>((set, get) => ({
  rooms: [],
  invites: [],
  currentRoom: null,
  messages: [],
  typingUser: null,
  typingByRoom: {},

  // -------------------- LOADERS --------------------
  fetchRooms: async () => {
    const { data } = await api.get<Room[]>("/rooms");
    set({ rooms: (data as unknown) as RoomWithLast[] });
  },

  // tenta /rooms/with-last (se existir no backend); se não, cai pra /rooms
  fetchRoomsWithLast: async () => {
    try {
      const { data } = await api.get<RoomWithLast[]>("/rooms/with-last");
      set({ rooms: data });
    } catch {
      const { data } = await api.get<Room[]>("/rooms");
      set({ rooms: (data as unknown) as RoomWithLast[] });
    }
  },

  fetchInvites: async () => {
    const { data } = await api.get<Invitation[]>("/rooms/me/invites");
    set({ invites: data });
  },

  // -------------------- ROOM MGMT / INVITES --------------------
  deleteRoom: async (roomId) => {
    await api.delete(`/rooms/${roomId}`);
    set((s) => {
      const isCurrent = s.currentRoom?._id === roomId;
      return {
        rooms: s.rooms.filter((r) => r._id !== roomId),
        currentRoom: isCurrent ? null : s.currentRoom,
        messages: isCurrent ? [] : s.messages,
      };
    });
  },

  sendInvite: async (roomId, toUserId) => {
    await api.post(`/rooms/${roomId}/invite`, { to: toUserId });
  },

  actOnInvite: async (inviteId, action) => {
    await api.post(`/rooms/invites/${inviteId}`, { action });
    // refresh básico após aceitar/recusar
    await get().fetchInvites();
    await get().fetchRoomsWithLast();
  },

  // -------------------- CHAT FLOW --------------------
  selectRoom: async (room) => {
    set({ currentRoom: room, messages: [] });
    const { data } = await api.get<Message[]>(`/messages/${room._id}`);
    set({ messages: data });
  },

  fetchMessages: async (roomId) => {
    const { data } = await api.get<Message[]>(`/messages/${roomId}`);
    set({ messages: data });
  },

  addMessage: (m) =>
    set((s) => ({
      messages: [...s.messages, m],
    })),

  updateMessage: (m) =>
    set((s) => ({
      messages: s.messages.map((x) => (x._id === m._id ? m : x)),
      rooms: s.rooms.map((r) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        r._id === (m as any).room ? { ...r, lastMessage: m } : r
      ),
    })),

  // -------------------- TYPING --------------------
  setTyping: (u) => set({ typingUser: u }),

  setTypingForRoom: (roomId, username) =>
    set((s) => ({
      typingByRoom: { ...s.typingByRoom, [roomId]: username },
    })),

  // -------------------- REALTIME SIDEBAR --------------------
  applyRoomUpdate: (roomId, lastMessage) =>
    set((s) => {
      const updated = s.rooms.map((r) =>
        r._id === roomId
          ? { ...r, lastMessage, updatedAt: new Date().toISOString() }
          : r
      );
      updated.sort(
        (a, b) =>
          new Date(b.updatedAt || b.lastMessage?.createdAt || 0).getTime() -
          new Date(a.updatedAt || a.lastMessage?.createdAt || 0).getTime()
      );
      return { rooms: updated };
    }),
}));
