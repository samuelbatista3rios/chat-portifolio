import { Routes, Route, Navigate, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "./store/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Rooms from "./pages/Rooms";
import Chat from "./pages/Chat";
import { useState, useEffect } from "react";
import SettingsDrawer from "./components/SettingsDrawer";
import ThreeBackground from './components/ThreeBackground'

import { getSocket } from "./services/socket";
import { useChat } from "./store/chat";
import InvitesBell from "./components/InvitesBell";

export default function App() {
  const { user, logout } = useAuth();
  const { fetchRoomsWithLast, fetchInvites } = useChat();

  const [openSettings, setOpenSettings] = useState(false);

  // Atalho Ctrl/Cmd + K para abrir ajustes
  useEffect(() => {
    const onK = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenSettings((v) => !v);
      }
    };
    window.addEventListener("keydown", onK);
    return () => window.removeEventListener("keydown", onK);
  }, []);

  // Bootstrap do socket: identificar usuário, buscar dados iniciais e registrar listeners
  useEffect(() => {
    if (!user?._id) return;

    const socket = getSocket();

    // 1) Identifica para receber convites (sala pessoal do usuário)
    socket.emit("identify", user._id);

    // 2) Carregamento inicial
    fetchRoomsWithLast().catch(() => {});
    fetchInvites().catch(() => {});

    // 3) Listeners que atualizam UI
    const onInviteReceived = () => fetchInvites();
    const onInviteAccepted = () => fetchRoomsWithLast();
    const onInviteDeclined = () => fetchInvites();
    const onRoomDeleted = () => fetchRoomsWithLast();
    const onRoomUpdated = () => fetchRoomsWithLast(); // você já tem applyRoomUpdate em outros pontos; aqui garantimos consistência

    socket.on("invite_received", onInviteReceived);
    socket.on("invite_accepted", onInviteAccepted);
    socket.on("invite_declined", onInviteDeclined);
    socket.on("room_deleted", onRoomDeleted);
    socket.on("room_updated", onRoomUpdated);

    return () => {
      socket.off("invite_received", onInviteReceived);
      socket.off("invite_accepted", onInviteAccepted);
      socket.off("invite_declined", onInviteDeclined);
      socket.off("room_deleted", onRoomDeleted);
      socket.off("room_updated", onRoomUpdated);
    };
  }, [user?._id, fetchRoomsWithLast, fetchInvites]);

  return (
    <><ThreeBackground />
    <div className="min-h-screen text-white">
      <ThreeBackground />
      <header className="flex items-center justify-between px-4 h-14 glass sticky top-0 z-10">
        <Link
          to="/"
          className="text-lg font-semibold"
          style={{ color: "var(--accent)" }}
        >
          ChatApp
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              {/* Sininho de convites (com badge e menu de aceitar/recusar) */}
              <InvitesBell />

              <button
                onClick={() => setOpenSettings(true)}
                className="btn"
                title="Ajustes (Ctrl+K)"
              >
                Ajustes
              </button>

              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.username
                  )}`
                }
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover avatar-ring"
                style={{ boxShadow: "0 0 0 3px rgba(255,255,255,.05)" }}
              />

              <button onClick={logout} className="btn">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">
                Entrar
              </Link>
              <Link to="/register" className="btn btn-accent">
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to={user ? "/rooms" : "/login"} />} />
        <Route path="/login" element={user ? <Navigate to="/rooms" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/rooms" /> : <Register />} />
        <Route path="/rooms" element={user ? <Rooms /> : <Navigate to="/login" />} />
        <Route path="/rooms/:id" element={user ? <Chat /> : <Navigate to="/login" />} />
      </Routes>

      {openSettings && <SettingsDrawer onClose={() => setOpenSettings(false)} />}

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
    </>
  );
}
