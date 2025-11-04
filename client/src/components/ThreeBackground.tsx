import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, Environment, PerformanceMonitor } from "@react-three/drei";
import Earth from "./Earth";

/** Pausa a renderização quando a aba não está ativa (economiza CPU) */
function useVisibilityPause() {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const onVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  return active;
}

export default function ThreeBackground() {
  const active = useVisibilityPause();

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* cai o DPR se a GPU estiver sofrendo */}
        <PerformanceMonitor onDecline={() => null} />

        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} />
        {/* luz ambiente HDRI bem leve */}
        <Environment preset="sunset" />

        

        <Suspense fallback={null}>
          <group position={[0, -0.15, 0]}>
            <Earth scale={0.5} />
          </group>
          <Stars
            radius={90}
            depth={40}
            count={5000}
            factor={2}
            saturation={0}
            fade
            speed={0.4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
