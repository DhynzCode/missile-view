import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SmokeTrailProps {
  positions: THREE.Vector3[];
  visible: boolean;
}

const SmokeTrail = ({ positions, visible }: SmokeTrailProps) => {
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = Math.min(positions.length * 3, 300);
    const posArray = new Float32Array(count * 3);
    const sizeArray = new Float32Array(count);
    const opacityArray = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const idx = Math.floor((i / count) * positions.length);
      const pos = positions[idx] || new THREE.Vector3();
      posArray[i * 3] = pos.x + (Math.random() - 0.5) * 0.15;
      posArray[i * 3 + 1] = pos.y + (Math.random() - 0.5) * 0.15;
      posArray[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.15;
      sizeArray[i] = 0.08 + Math.random() * 0.12;
      opacityArray[i] = 1 - i / count;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizeArray, 1));
    return geometry;
  }, [positions]);

  if (!visible || positions.length < 2) return null;

  return (
    <points ref={meshRef} geometry={particles}>
      <pointsMaterial
        color="#ff8844"
        size={0.1}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

export default SmokeTrail;
