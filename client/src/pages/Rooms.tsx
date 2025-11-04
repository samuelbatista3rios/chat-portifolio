// src/pages/Rooms.tsx
import { useEffect, useState } from "react";
import { useChat } from "../store/chat";
import api from "../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import AvatarUploader from "../components/AvatarUploader";
import { useAuth } from "../store/auth";

export default function Rooms() {
  const { rooms, fetchRoomsWithLast } = useChat();
  const [name, setName] = useState("");
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // busca inicial das salas (somente do usuário)
  useEffect(() => {
    fetchRoomsWithLast().catch(() => {});
  }, [fetchRoomsWithLast]);

  // cria sala privada por padrão
  const createRoom = async () => {
    if (!name.trim()) return toast.warn("Digite o nome da sala!");
    setLoading(true);
    try {
      await api.post("/rooms", { name, isPrivate: true }); // sala privada padrão
      setName("");
      await fetchRoomsWithLast();
      toast.success("Sala criada com sucesso!");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Erro ao criar sala");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="glass border border-white/10 rounded-2xl p-5 space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-wide">Suas Salas</h1>
          <div className="flex items-center gap-3">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.username || "User"
                )}`
              }
              className="w-8 h-8 rounded-full avatar-ring"
              alt="avatar"
            />
            <AvatarUploader />
          </div>
        </div>

        {/* Criação de sala */}
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 p-2 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-[color:var(--accent)] transition"
            placeholder="Nome da nova sala..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createRoom()}
          />
          <button
            onClick={createRoom}
            disabled={loading}
            className="btn btn-accent whitespace-nowrap"
          >
            {loading ? "Criando..." : "Criar"}
          </button>
        </div>

        {/* Lista de salas */}
        {rooms.length === 0 ? (
          <p className="text-sm opacity-70 text-center py-4">
            Você ainda não participa de nenhuma sala.
            <br />
            Crie uma ou aguarde convites!
          </p>
        ) : (
          <ul className="space-y-2">
            {rooms.map((r) => (
              <li
                key={r._id}
                className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 transition"
              >
                <div>
                  <span className="font-semibold">#{r.name}</span>
                  {r.lastMessage && (
                    <p className="text-xs opacity-60 mt-0.5">
                      {r.lastMessage.sender?.username}: {r.lastMessage.content}
                    </p>
                  )}
                </div>
                <Link
                  to={`/rooms/${r._id}`}
                  className="btn btn-sm btn-accent"
                  title="Entrar na sala"
                >
                  Entrar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
