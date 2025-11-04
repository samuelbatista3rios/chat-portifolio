/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../store/auth";
import { useChat } from "../store/chat";
import type { Room } from "../types";
import api from "../services/api";
import { toast } from "react-toastify";

type UserLite = { _id: string; username: string; avatar?: string };

export default function RoomActions({
  room,
}: {
  room: Room & { members?: string[]; owner?: string | { _id: string } };
}) {
  const { user } = useAuth();
  const { deleteRoom, sendInvite } = useChat();

  const isOwner = useMemo(() => {
    const ownerId =
      typeof (room as any).owner === "object"
        ? (room as any).owner?._id
        : (room as any).owner;
    return ownerId && user?._id && String(ownerId) === String(user._id);
  }, [room, user]);

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(false);

  // debounced search
  const tRef = useRef<number | null>(null);
  useEffect(() => {
    if (!open) return;
    if (tRef.current) window.clearTimeout(tRef.current);
    if (q.trim().length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    tRef.current = window.setTimeout(async () => {
      try {
        const { data } = await api.get<UserLite[]>(
          `/users?search=${encodeURIComponent(q.trim())}`
        );
        setUsers(data);
      } catch {
        toast.error("Erro ao buscar usuários");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, [q, open]);

  const handleInvite = async (toUserId: string, username: string) => {
    try {
      await sendInvite(room._id, toUserId);
      toast.success(`Convite enviado para ${username}!`);
      setQ("");
      setUsers([]);
      setOpen(false);
    } catch {
      toast.error("Erro ao enviar convite");
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    if (!confirm(`Apagar a sala "${room.name}"? Essa ação é permanente.`))
      return;
    try {
      await deleteRoom(room._id);
      toast.success("Sala apagada");
    } catch {
      toast.error("Não foi possível apagar a sala");
    }
  };

  return (
    <div className="relative">
      <button
        className="btn btn-touch"
        onClick={() => setOpen((v) => !v)}
        title="Mais ações"
      >
        ⋯
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 glass rounded-2xl p-3 z-30 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Sala #{room.name}</h4>
            <button className="btn btn-xs" onClick={() => setOpen(false)}>
              Fechar
            </button>
          </div>

          {/* Convidar */}
          <div className="mt-3">
            <div className="text-xs opacity-70 mb-1">Adicionar membro</div>
            <div className="relative mt-2">
              <input
                className="input w-full"
                placeholder="Buscar usuário..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {!!q && (
                <div className="absolute w-full bg-black/80 rounded-lg mt-1 max-h-40 overflow-y-auto z-30 border border-white/10">
                  {loading && (
                    <div className="px-3 py-2 text-sm opacity-60">
                      Buscando...
                    </div>
                  )}
                  {!loading &&
                    users.map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 cursor-pointer"
                        onClick={() => handleInvite(u._id, u.username)}
                      >
                        <img
                          src={
                            u.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              u.username
                            )}`
                          }
                          alt={u.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="truncate">{u.username}</span>
                      </div>
                    ))}
                  {!loading && users.length === 0 && q.length >= 2 && (
                    <div className="px-3 py-2 text-sm opacity-60">
                      Nenhum usuário encontrado
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Apagar sala (somente dono) */}
          {isOwner && (
            <>
              <div className="border-t border-white/10 my-3" />
              <button
                className="btn w-full bg-red-600/80 hover:bg-red-600 text-white"
                onClick={handleDelete}
              >
                Apagar sala
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
