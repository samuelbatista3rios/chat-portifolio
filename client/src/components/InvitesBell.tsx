import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { toast } from "react-toastify";
import { useChat } from "../store/chat";

type InviteLite = {
  _id: string;
  room: { _id: string; name: string };
  status: "pending" | "accepted" | "declined";
  createdAt?: string;
};

export default function InvitesBell() {
  const { fetchRoomsWithLast } = useChat();

  const socket = useMemo(() => getSocket(), []);
  const [invites, setInvites] = useState<InviteLite[]>([]);
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState(0);

  const loadInvites = async () => {
    try {
      const { data } = await api.get<InviteLite[]>("/rooms/me/invites");
      setInvites(data);
      setBadge(data.length);
    } catch {
      // silencioso: se falhar só não mostra
      // console.error("Erro ao carregar convites");
    }
  };

  // eventos do socket (recebimento/aceite/recusa)
  useEffect(() => {
    const onInviteReceived = (inv: InviteLite) => {
      // Toast estilizado com ícone como ReactNode (sem progressStyle)
      toast.info(
        <div>
          <div className="font-semibold">Convite recebido</div>
          <div className="opacity-80">Sala: {inv?.room?.name ?? "?"}</div>
        </div>,
        {
          icon: <span style={{ fontSize: 18 }}>🎟️</span>,
          className:
            "bg-[#0a1625] text-white border border-white/10 rounded-xl shadow-lg",
        }
      );
      loadInvites();
    };

    const onInviteAccepted = () => {
      toast.success("Convite aceito!", {
        icon: <span style={{ fontSize: 18 }}>✅</span>,
        className:
          "bg-[#0a1625] text-white border border-white/10 rounded-xl shadow-lg",
      });
      // ao aceitar, recarregue salas
      fetchRoomsWithLast();
      loadInvites();
    };

    const onInviteDeclined = () => {
      toast.warn("Convite recusado.", {
        icon: <span style={{ fontSize: 18 }}>⚠️</span>,
        className:
          "bg-[#0a1625] text-white border border-white/10 rounded-xl shadow-lg",
      });
      loadInvites();
    };

    socket.on("invite_received", onInviteReceived);
    socket.on("invite_accepted", onInviteAccepted);
    socket.on("invite_declined", onInviteDeclined);

    // primeira carga
    loadInvites();

    return () => {
      socket.off("invite_received", onInviteReceived);
      socket.off("invite_accepted", onInviteAccepted);
      socket.off("invite_declined", onInviteDeclined);
    };
  }, [socket, fetchRoomsWithLast]);

  const act = async (inviteId: string, action: "accept" | "decline") => {
    await api.post(`/rooms/invites/${inviteId}`, { action });
    // remove da lista local e atualiza contador
    setInvites((prev) => {
      const next = prev.filter((i) => i._id !== inviteId);
      setBadge(next.length);
      return next;
    });

    // se aceitou, atualiza as salas para aparecer na sidebar
    if (action === "accept") {
      await fetchRoomsWithLast();
    }
  };

  return (
    <div className="relative">
      <button className="btn btn-icon relative" onClick={() => setOpen(!open)}>
        🔔
        {badge > 0 && (
          <span
            className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-1 rounded-full 
                       bg-[color:var(--accent)] text-[#06121f] font-bold shadow"
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 z-50 rounded-2xl p-4 shadow-xl border border-white/10"
          style={{
            background: "rgba(15, 25, 35, 0.85)", // fundo mais escuro e opaco
            backdropFilter: "blur(10px)", // blur mais intenso
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">
              Convites
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-xs px-2 py-1 bg-white/10 rounded-md hover:bg-white/20"
            >
              Fechar
            </button>
          </div>

          {invites.length === 0 ? (
            <p className="text-sm opacity-70 text-center py-3">Nenhum convite</p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {invites.map((i) => (
                <li
                  key={i._id}
                  className="flex items-center justify-between bg-white/10 hover:bg-white/15 transition rounded-xl px-3 py-2 border border-white/10"
                >
                  <div>
                    <div className="font-medium text-white/90">{i.room.name}</div>
                    <div className="text-xs opacity-60">Convite pendente</div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => act(i._id, "accept")}
                      className="btn btn-xs bg-[color:var(--accent)] text-[#06121f] hover:opacity-90"
                      title="Aceitar"
                    >
                      ✔
                    </button>
                    <button
                      onClick={() => act(i._id, "decline")}
                      className="btn btn-xs bg-white/10 hover:bg-white/20"
                      title="Recusar"
                    >
                      ✖
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
