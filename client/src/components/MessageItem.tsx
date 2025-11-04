import type { Message } from "../types";
import MessageReactions from "./MessageReactions";
import { useAuth } from "../store/auth";
import ImgBubble from "./ImgBubble";

type Props = {
  msg: Message;
  prev?: Message | null;
};

export default function MessageItem({ msg, prev }: Props) {
  const { user } = useAuth();
  const mine = msg.sender._id === user?._id;
  const showName = !prev || prev.sender._id !== msg.sender._id;
  const showDay =
    !prev ||
    new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

  return (
    <>
      {showDay && (
        <div className="my-3 text-center text-xs opacity-60">
          {new Date(msg.createdAt).toLocaleDateString()}
        </div>
      )}

      <div className={`flex gap-3 ${mine ? "justify-end" : "justify-start"}`}>
        {!mine && (
          <img
            className="w-9 h-9 rounded-full avatar-ring"
            src={
              msg.sender.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.username)}`
            }
            alt={msg.sender.username}
          />
        )}

        <div className={`max-w-[70%] ${mine ? "items-end text-right" : ""}`}>
          {showName && (
            <div className="text-xs opacity-70 mb-1">{msg.sender.username}</div>
          )}

          {msg.kind === "image" && msg.imageUrl ? (
            <ImgBubble src={msg.imageUrl} alt="imagem" mine={mine} />
          ) : (
            <div
              className={`msg-bubble rounded-2xl px-4 py-2 border border-white/10 ${
                mine ? "bg-[color:var(--accent)]/20" : "bg-white/10"
              }`}
            >
              {msg.content}
            </div>
          )}

          <div className={`mt-1 flex items-center ${mine ? "justify-end" : "justify-start"}`}>
            <span className="text-[10px] opacity-60">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <MessageReactions msg={msg} />
        </div>

        {mine && (
          <img
            className="w-9 h-9 rounded-full avatar-ring"
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}`
            }
            alt={user?.username}
          />
        )}
      </div>
    </>
  );
}
