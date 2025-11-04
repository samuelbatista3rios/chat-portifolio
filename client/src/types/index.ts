// 🧍 Usuário
export type User = {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  online?: boolean;
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
};

// 💬 Reação
export type Reaction = {
  emoji: string;
  user: string | User;
  createdAt: string;
};

// 💭 Mensagem
export type Message = {
  _id: string;
  room: string; // id da sala
  sender: Pick<User, "_id" | "username" | "avatar">;
  content?: string;
  imageUrl?: string;
  kind: "text" | "image";
  reactions?: Reaction[];
  createdAt: string;
  updatedAt?: string;
};

// 🏠 Sala
export type Room = {
  _id: string;
  name: string;
  owner?: string | User;
  members?: (string | User)[];
  createdAt?: string;
  updatedAt?: string;
  lastMessage?: Message | null;
};

// ✉️ Convite
export interface Invitation {
  _id: string;
  room:
    | string
    | {
        _id: string;
        name: string;
        owner?: string | User;
      };
  from:
    | string
    | {
        _id: string;
        username: string;
      };
  to:
    | string
    | {
        _id: string;
        username: string;
      };
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  updatedAt: string;
}
