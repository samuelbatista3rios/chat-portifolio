/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { useChat } from "../store/chat";
import { getSocket } from "../services/socket";
import RoomActions from "./RoomActions";

type Props = {
  /** chamado quando o usuário seleciona uma sala (útil pra fechar o drawer no mobile) */
  onSelect?: () => void;
  /** classes extras para o wrapper, ex: "h-full" quando usado no drawer */
  className?: string;
};

export default function RoomList({ onSelect, className = "" }: Props) {
  const { rooms, fetchRoomsWithLast, typingByRoom, applyRoomUpdate } =
    useChat();
  const location = useLocation();
  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    fetchRoomsWithLast();
  }, [fetchRoomsWithLast]);

  useEffect(() => {
    const handler = ({
      roomId,
      lastMessage,
    }: {
      roomId: string;
      lastMessage: any;
    }) => {
      applyRoomUpdate(roomId, lastMessage);
    };

    socket.on("room_updated", handler);

    // ✅ cleanup precisa retornar void
    return () => {
      socket.off("room_updated", handler);
    };
  }, [socket, applyRoomUpdate]);

  useEffect(() => {
    const onAdded = () => {
      fetchRoomsWithLast(); // ou append, como preferir
    };

    socket.on("room_added", onAdded);

    // ✅ cleanup correto (sem retornar o Socket)
    return () => {
      socket.off("room_added", onAdded);
    };
  }, [socket, fetchRoomsWithLast]);
  return (
    <aside className={`card ${className}`}>
      <div className="flex items-center justify-between px-4 h-12 border-b border-white/10 rounded-t-2xl">
        <span className="text-sm uppercase tracking-wide opacity-70">
          Conversas
        </span>
      </div>

      <ul className="divide-y divide-white/10">
        {rooms.map((r) => {
          const active = location.pathname.endsWith(r._id);
          const typing = typingByRoom[r._id];

          return (
            <li key={r._id} className={active ? "bg-white/5" : ""}>
              {/* linha com link (área grande) + ações (botão ⋯) */}
              <div className="flex items-stretch">
                <Link
                  to={`/rooms/${r._id}`}
                  className="flex-1 px-4 py-3 hover:bg-white/5 transition"
                  onClick={onSelect}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">#{r.name}</div>
                    {r.lastMessage && (
                      <span className="text-xs opacity-60">
                        {dayjs(r.lastMessage.createdAt).format("HH:mm")}
                      </span>
                    )}
                  </div>

                  {typing ? (
                    <div className="text-xs mt-1 text-[color:var(--accent)]">
                      ✍️ {typing} está digitando…
                    </div>
                  ) : r.lastMessage ? (
                    <div className="text-xs opacity-70 mt-1 truncate">
                      {r.lastMessage.sender?.username}:{" "}
                      {r.lastMessage.content || "imagem"}
                    </div>
                  ) : (
                    <div className="text-xs opacity-50 mt-1">Sem mensagens</div>
                  )}
                </Link>

                {/* ações da sala: manter fora do <Link/> pra não navegar ao clicar */}
                <div
                  className="px-2 py-2"
                  onClick={(e) => {
                    // evitar que clique no botão ⋯ acione o Link
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <RoomActions room={r as any} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
