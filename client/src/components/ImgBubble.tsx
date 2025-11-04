/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";

/** Normaliza links do Giphy para um endpoint de imagem direto confiável */
function normalizeGif(url: string) {
  try {
    const u = new URL(url);

    // 1) Se já for .gif direto, mantém
    if (/\.(gif|webp|png|jpg|jpeg)$/i.test(u.pathname)) return url;

    // 2) Se for página html do giphy, tenta transformar em .gif direto
    // Ex: https://giphy.com/gifs/<slug>-<id>
    //     -> https://i.giphy.com/media/<id>/giphy.gif
    const slugMatch = u.pathname.match(/\/gifs\/.+-(\w+)$/i);
    if (slugMatch?.[1]) {
      const id = slugMatch[1];
      return `https://i.giphy.com/media/${id}/giphy.gif`;
    }

    // 3) Se for media.giphy.com/media/<id>/giphy.gif (ou variantes), ok.
    const mediaMatch = u.pathname.match(/\/media\/([^/]+)\/[^/]+\.(gif|webp|png|jpg)/i);
    if (mediaMatch?.[1]) {
      const id = mediaMatch[1];
      return `https://i.giphy.com/media/${id}/giphy.gif`;
    }

    // 4) Se não reconheceu, retorna o original (pode ser um PNG/WEBP válido)
    return url;
  } catch {
    return url;
  }
}

type ImgBubbleProps = {
  src: string;
  alt?: string;
  mine?: boolean;
};

export default function ImgBubble({ src, alt = "imagem", mine }: ImgBubbleProps) {
  const [imgSrc, setImgSrc] = useState(normalizeGif(src));
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`rounded-2xl overflow-hidden border border-white/10 ${
        mine ? "bg-[color:var(--accent)]/15" : "bg-white/10"
      }`}
    >
      {!failed ? (
        <img
          src={imgSrc}
          alt={alt}
          className="rounded-xl max-w-[70vw] sm:max-w-[55%] h-auto object-contain select-none msg-image"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="px-4 py-3 text-sm opacity-70">Não foi possível carregar a imagem</div>
      )}
    </div>
  );
}
