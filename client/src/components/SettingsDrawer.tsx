import { useEffect, useState } from "react";

const BG_PRESETS = [
  // aurora + abstratos escuros (Unsplash)
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2100&q=80",
  "https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&w=2100&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2100&q=80",
  "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=2100&q=80",
  "https://images.unsplash.com/photo-1505483531331-205d04a72d6b?auto=format&fit=crop&w=2100&q=80",
];

export default function SettingsDrawer({ onClose }: { onClose: () => void }) {
  const [accent, setAccent] = useState(localStorage.getItem("accent") || "#22d3ee");
  const [dense, setDense] = useState(localStorage.getItem("dense") === "1");
  const [sound, setSound] = useState(localStorage.getItem("sound") !== "0");

  // fundo
  const [bgUrl, setBgUrl] = useState(
    localStorage.getItem("bgUrl") ||
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2100&q=80"
  );
  const [bgOpacity, setBgOpacity] = useState(
    parseFloat(localStorage.getItem("bgOpacity") || "0.35")
  );
  const [bgBlur, setBgBlur] = useState(
    parseInt(localStorage.getItem("bgBlur") || "6", 10)
  );

  // aplicar tema
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    localStorage.setItem("accent", accent);
  }, [accent]);

  useEffect(() => {
    document.body.dataset.dense = dense ? "1" : "0";
    localStorage.setItem("dense", dense ? "1" : "0");
  }, [dense]);

  useEffect(() => localStorage.setItem("sound", sound ? "1" : "0"), [sound]);

  // aplicar fundo
  useEffect(() => {
    document.documentElement.style.setProperty("--bg-url", `url('${bgUrl}')`);
    localStorage.setItem("bgUrl", bgUrl);
  }, [bgUrl]);

  useEffect(() => {
    document.documentElement.style.setProperty("--bg-opacity", String(bgOpacity));
    localStorage.setItem("bgOpacity", String(bgOpacity));
  }, [bgOpacity]);

  useEffect(() => {
    document.documentElement.style.setProperty("--bg-blur", `${bgBlur}px`);
    localStorage.setItem("bgBlur", String(bgBlur));
  }, [bgBlur]);

  const resetBg = () => {
    const def = BG_PRESETS[0];
    setBgUrl(def);
    setBgOpacity(0.35);
    setBgBlur(6);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <aside
        className="absolute right-0 top-0 h-full w-[380px] glass p-5 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "var(--accent)" }}>
            Ajustes
          </h2>
          <button className="btn" onClick={onClose}>Fechar</button>
        </div>

        {/* Acento */}
        <section>
          <h3 className="text-sm opacity-80 mb-2">Acento</h3>
          <div className="grid grid-cols-6 gap-2">
            {["#22d3ee","#8b5cf6","#00f5d4","#ff4d6d","#f59e0b","#22c55e"].map(c => (
              <button
                key={c}
                className="h-9 rounded-xl border border-white/10"
                style={{ background:c }}
                onClick={()=>setAccent(c)}
              />
            ))}
            <input
              type="color"
              value={accent}
              onChange={(e)=>setAccent(e.target.value)}
              className="h-9 w-full rounded-xl border border-white/10 bg-transparent col-span-2"
              title="Cor personalizada"
            />
          </div>
        </section>

        {/* Fundo */}
        <section>
          <h3 className="text-sm opacity-80 mb-2">Imagem de fundo</h3>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {BG_PRESETS.map((url) => (
              <button
                key={url}
                className={`h-14 rounded-xl overflow-hidden border ${bgUrl===url ? "border-[color:var(--accent)]" : "border-white/10"}`}
                onClick={() => setBgUrl(url)}
                title="Aplicar este fundo"
              >
                <img src={url} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <label className="block text-xs opacity-70 mb-1">URL personalizada</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Cole uma URL de imagem…"
              value={bgUrl}
              onChange={(e)=>setBgUrl(e.target.value)}
            />
            <button className="btn" onClick={resetBg}>Resetar</button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs opacity-70 mb-1">
                Opacidade: {bgOpacity.toFixed(2)}
              </label>
              <input
                type="range" min={0} max={1} step={0.01}
                value={bgOpacity}
                onChange={(e)=>setBgOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs opacity-70 mb-1">
                Blur: {bgBlur}px
              </label>
              <input
                type="range" min={0} max={18} step={1}
                value={bgBlur}
                onChange={(e)=>setBgBlur(parseInt(e.target.value,10))}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Preferências */}
        <section className="flex items-center justify-between">
          <span>Densidade compacta</span>
          <input type="checkbox" checked={dense} onChange={(e)=>setDense(e.target.checked)} />
        </section>

        <section className="flex items-center justify-between">
          <span>Som de mensagens</span>
          <input type="checkbox" checked={sound} onChange={(e)=>setSound(e.target.checked)} />
        </section>

        <p className="text-xs opacity-60">
          Dica: <kbd className="px-1 rounded bg-white/10">Ctrl</kbd> + <kbd className="px-1 rounded bg-white/10">K</kbd> abre/fecha este painel.
        </p>
      </aside>
    </div>
  );
}
