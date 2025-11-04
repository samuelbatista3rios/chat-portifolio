import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

type Props = { scale?: number };

export default function Earth({ scale = 0.45 }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();

  const [colorMap, specularMap, cloudsMap] = useTexture([
    "/earth/earth_daymap.jpg",
    "/earth/earth_specular_map.jpg", // nome corrigido aqui
    "/earth/earth_clouds.jpg",
  ]);

  useEffect(() => {
    [colorMap, cloudsMap].forEach((t) => {
      t.encoding = THREE.sRGBEncoding;
      t.anisotropy = gl.capabilities.getMaxAnisotropy?.() ?? 8;
      t.needsUpdate = true;
    });
  }, [colorMap, cloudsMap, gl.capabilities]);

  useFrame((_state, dt) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += dt * 0.2;
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Nuvens */}
      <mesh>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* Terra */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          specularMap={specularMap}
          shininess={10}
        />
      </mesh>
    </group>
  );
}
