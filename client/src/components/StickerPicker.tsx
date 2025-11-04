import { useEffect, useState } from "react";

type Props = {
  onPick: (url: string) => void;
  onClose: () => void;
};

/** Twemoji via jsDelivr (muito estável) */
const TWEMOJI = [
  // 🎉 party popper
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f389.svg",
  // 😀 grinning face
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f600.svg",
  // 😮 face with open mouth
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f62e.svg",
];

/** Alguns GIFs do GIPHY (opcional, animados) */
const GIPHY = [
  "https://media.giphy.com/media/qQdL532ZANbjy/giphy.gif",
  "https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif",
];

function joinURL(base: string, file: string) {
  return `${base.replace(/\/+$/, "")}/${file.replace(/^\/+/, "")}`;
}

export default function StickerPicker({ onPick, onClose }: Props) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    // Se VITE_STICKER_BASE_URL estiver definido, tenta usar.
    // Caso contrário, cai no fallback (Twemoji + GIPHY).
    const BASE = (import.meta.env.VITE_STICKER_BASE_URL as string | undefined)?.trim();

    if (BASE) {
      const files = ["smile.png", "party.webp", "wow.png"];
      setItems(files.map((f) => joinURL(BASE, f)));
    } else {
      setItems([...TWEMOJI, ...GIPHY]);
    }
  }, []);

  return (
    <div className="absolute bottom-16 left-4 glass p-2 rounded-xl w-60 grid grid-cols-3 gap-2 border border-white/10 z-20">
      {items.map((u) => (
        <button
          key={u}
          className="aspect-square rounded-lg overflow-hidden transition hover:ring-2 hover:ring-[color:var(--accent)]"
          onClick={() => {
            onPick(u);
            onClose();
          }}
          title="Enviar figurinha"
        >
          <img
            src={u}
            alt="sticker"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      ))}
      <button onClick={onClose} className="col-span-3 btn mt-1">
        Fechar
      </button>
    </div>
  );
}
