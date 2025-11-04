import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

type Props = { scale?: number };

export default function Earth({ scale = 1 }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
    "/earth/earth_daymap.jpg",
    "/earth/earth_specular_map.jpg.jpg",
    "/earth/earth_clouds.jpg",
  ]);

  useFrame((_state, dt) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += dt * 0.2; // velocidade de rotação
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Nuvens (ligeiramente maiores) */}
      <mesh>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>

      {/* Terra */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={10}
        />
      </mesh>
    </group>
  );
}
