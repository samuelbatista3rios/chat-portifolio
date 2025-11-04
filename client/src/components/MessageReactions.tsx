import { useMemo } from "react";
import { useAuth } from "../store/auth";
import { getSocket } from "../services/socket";
import type { Message } from "../types";

const EMOJIS = ["👍", "🔥", "😂", "😮", "❤️", "🎉"];

type Props = { msg: Message };

export default function MessageReactions({ msg }: Props) {
  const { user } = useAuth();
  const socket = useMemo(() => getSocket(), []);

  const myReacted = (emoji: string) =>
    (msg.reactions || []).some((r) => r.emoji === emoji && r.user === user?._id);

  const toggle = (emoji: string) => {
    if (!user) return;
    if (myReacted(emoji)) {
      socket.emit("unreact_message", {
        messageId: msg._id,
        emoji,
        userId: user._id,
      });
    } else {
      socket.emit("react_message", {
        messageId: msg._id,
        emoji,
        userId: user._id,
      });
    }
  };

  const counts = Object.entries(
    (msg.reactions || []).reduce<Record<string, number>>((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {})
  );

  return (
    <div className="mt-1 flex items-center gap-1">
      {/* reações existentes com contagem */}
      {counts.map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => toggle(emoji)}
          className={`px-2 h-6 rounded-full text-xs border transition
            ${myReacted(emoji) ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5"}
          `}
          title="Clique para alternar sua reação"
        >
          {emoji} {count}
        </button>
      ))}

      {/* picker rápido */}
      <div className="group relative">
        <button
          className="px-2 h-6 rounded-full text-xs border border-white/10 bg-white/5"
          title="Adicionar reação"
        >
          +
        </button>
        <div
          className="absolute hidden group-hover:flex gap-1 p-1 bg-panel2 border border-white/10 rounded-xl top-7 left-0 z-10"
          role="menu"
        >
          {EMOJIS.map((e) => (
            <button
              key={e}
              className="px-2 py-1 text-lg hover:scale-110 transition-transform"
              onClick={() => toggle(e)}
              role="menuitem"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
