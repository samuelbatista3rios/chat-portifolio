import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useChat } from "../store/chat";
import { getSocket } from "../services/socket";
import api from "../services/api";
import type { Room, Message } from "../types";
import RoomList from "../components/RoomList";
import { isTabActive } from "../services/visibility";
import StickerPicker from "../components/StickerPicker";
import MessageItem from "../components/MessageItem";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const {
    currentRoom,
    selectRoom,
    addMessage,
    updateMessage,
    setTyping,
    setTypingForRoom,
    typingUser,
    messages,
  } = useChat();

  // mobile
  const [openRooms, setOpenRooms] = useState(false);

  const [input, setInput] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const socket = useMemo(() => getSocket(), []);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data: rooms } = await api.get<Room[]>("/rooms");
      const room = rooms.find((r) => r._id === id);
      if (room) {
        await selectRoom(room);
        // rolar para o fim ao entrar
        setTimeout(() => {
          listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "auto",
          });
        }, 150);
      }

      socket.emit("join_room", {
        roomId: id,
        userId: user!._id,
        username: user!.username,
      });
    })();

    const onReceive = (msg: Message) => {
      addMessage(msg);
      const soundOn = localStorage.getItem("sound") !== "0";
      if (!isTabActive() && msg.sender?._id !== user?._id && soundOn) {
        audioRef.current?.play().catch(() => {});
      }
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    };

    const onReacted = (m: Message) => updateMessage(m);

    const onTypingEvt = ({
      roomId,
      username,
    }: {
      roomId: string;
      username: string;
    }) => {
      setTypingForRoom(roomId, username);
      if (roomId === id) setTyping(username);
      setTimeout(() => {
        setTypingForRoom(roomId, null);
        if (roomId === id) setTyping(null);
      }, 1200);
    };

    socket.on("receive_message", onReceive);
    socket.on("message_reacted", onReacted);
    socket.on("user_typing", onTypingEvt);
    socket.on("user_presence_changed", () => {});

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("message_reacted", onReacted);
      socket.off("user_typing", onTypingEvt);
      socket.off("user_presence_changed");
    };
  }, [id, socket, addMessage, updateMessage, setTyping, setTypingForRoom, user]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const sendImage = async (f: File) => {
    const form = new FormData();
    form.append("file", f);
    const { data } = await api.post<{ url: string }>("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    socket.emit("send_message", {
      roomId: id,
      userId: user!._id,
      imageUrl: data.url,
    });
  };

  const sendMessage = async () => {
    if (!id || !user) return;

    if (file) {
      await sendImage(file);
      setFile(null);
      setPreview(null);
      return;
    }

    if (input.trim().startsWith("/")) {
      const [cmd, ...rest] = input.trim().slice(1).split(" ");
      const payload = rest.join(" ").trim();
      const send = (content: string) =>
        socket.emit("send_message", {
          roomId: id,
          userId: user._id,
          content,
        });

      if (cmd === "shrug") send(`${payload} ¯\\_(ツ)_/¯`);
      else if (cmd === "me") send(`*${user.username} ${payload}*`);
      else if (cmd === "time") send(`🕒 ${new Date().toLocaleString()}`);
      else if (cmd === "sticker") {
        const base = import.meta.env.VITE_STICKER_BASE_URL as
          | string
          | undefined;
        const url = payload.startsWith("http")
          ? payload
          : base
          ? `${base}/${payload}`
          : payload;
        socket.emit("send_message", {
          roomId: id,
          userId: user._id,
          imageUrl: url,
        });
      } else send(`Comando /${cmd} não reconhecido`);
      setInput("");
      return;
    }

    if (!input.trim()) return;
    socket.emit("send_message", {
      roomId: id,
      userId: user._id,
      content: input.trim(),
    });
    setInput("");
  };

  const onTyping = (v: string) => {
    setInput(v);
    if (!id || !user) return;
    socket.emit("typing", { roomId: id, username: user.username });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTyping(null), 1200);
  };

  return (
    <div className="mx-auto p-2 sm:p-4 max-w-7xl">
      <div className="flex h-[calc(100vh-6rem)] sm:h-[82vh]">
        {/* Sidebar Desktop */}
        <div className="hidden md:block w-80 mr-4">
          <RoomList />
        </div>

        {/* Drawer Mobile */}
        {openRooms && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpenRooms(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[360px] p-2">
              <RoomList
                onSelect={() => setOpenRooms(false)}
                className="h-full"
              />
            </div>
          </div>
        )}

        {/* Coluna principal (flex-col + min-h-0 para mobile) */}
        <div className="flex-1 card flex flex-col min-h-0 overflow-hidden">
          {/* Header da sala */}
          <div className="flex items-center justify-between px-3 sm:px-5 h-14 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                className="md:hidden btn btn-touch"
                aria-label="Abrir salas"
                onClick={() => setOpenRooms(true)}
                title="Salas"
              >
                ☰
              </button>
              <h1 className="font-semibold text-[color:var(--accent)] truncate">
                #{currentRoom?.name || "..."}
              </h1>
            </div>
            {typingUser && (
              <span className="hidden sm:block text-sm opacity-70">
                {typingUser} está digitando…
              </span>
            )}
          </div>

          {/* Lista de mensagens */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 min-h-0"
          >
            {messages.map((m, i) => (
              <MessageItem
                key={m._id}
                msg={m}
                prev={i > 0 ? messages[i - 1] : null}
              />
            ))}
          </div>

          {/* Composer fixo - não quebra no mobile */}
          <div className="sticky bottom-0 left-0 right-0 p-2 sm:p-3 safe-bottom bg-transparent backdrop-blur-md flex-shrink-0">
            {preview && (
              <div className="mb-2 inline-block glass rounded-xl p-2 border border-white/10">
                <img src={preview} className="max-h-32 rounded-lg msg-image" />
              </div>
            )}

            {/* nowrap + min-w-0 + shrink-0 */}
            <div className="glass rounded-2xl px-2 sm:px-3 py-2 flex items-center gap-2 flex-nowrap overflow-hidden">
              <button
                className="btn btn-touch shrink-0"
                onClick={() => setShowStickers((v) => !v)}
                title="Figurinhas"
              >
                🙂
                <span className="hidden sm:inline">Stickers</span>
              </button>

              <label
                className="btn btn-touch cursor-pointer shrink-0"
                title="Enviar imagem"
              >
                📎 <span className="hidden sm:inline">Imagem</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>

              <input
                className="input flex-1 min-w-0 w-full focus:ring-[color:var(--accent)] text-sm sm:text-base"
                placeholder="Escreva... (use /sticker, /me, /shrug)"
                value={input}
                onChange={(e) => onTyping(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <button
                onClick={sendMessage}
                className="btn btn-accent rounded-xl px-3 py-2 hover:brightness-110 shrink-0 whitespace-nowrap"
              >
                Enviar
              </button>
            </div>

            {showStickers && (
              <div className="relative">
                <div className="absolute bottom-16 left-0">
                  <StickerPicker
                    onPick={(url) => {
                      socket.emit("send_message", {
                        roomId: id!,
                        userId: user!._id,
                        imageUrl: url,
                      });
                      setShowStickers(false);
                    }}
                    onClose={() => setShowStickers(false)}
                  />
                </div>
              </div>
            )}
          </div>

          <audio ref={audioRef} src="/notify.mp3" preload="auto" />
        </div>
      </div>
    </div>
  );
}
