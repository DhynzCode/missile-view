import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Missile = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing hover effect
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.3, 0, 0.1]}>
      {/* Missile body - main cylinder */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 4, 48]} />
        <meshPhysicalMaterial
          color="#7a8090"
          metalness={0.92}
          roughness={0.12}
          clearcoat={0.4}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[0.3, 1.2, 48]} />
        <meshPhysicalMaterial
          color="#cc2222"
          metalness={0.75}
          roughness={0.2}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
        />
      </mesh>

      {/* Nose tip */}
      <mesh position={[0, 3.2, 0]}>
        <coneGeometry args={[0.08, 0.4, 24]} />
        <meshPhysicalMaterial
          color="#dd3333"
          metalness={0.8}
          roughness={0.15}
          emissive="#330000"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Body ring details */}
      {[-0.8, -0.2, 0.4, 1.0, 1.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.315, 0.015, 8, 48]} />
          <meshPhysicalMaterial color="#555" metalness={0.95} roughness={0.08} />
        </mesh>
      ))}

      {/* Warning stripe band */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.305, 0.305, 0.15, 48]} />
        <meshPhysicalMaterial
          color="#ddaa00"
          metalness={0.6}
          roughness={0.3}
          emissive="#443300"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Exhaust nozzle outer */}
      <mesh position={[0, -2.15, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.22, 0.5, 48]} />
        <meshPhysicalMaterial
          color="#222222"
          metalness={0.97}
          roughness={0.08}
          clearcoat={0.3}
        />
      </mesh>

      {/* Exhaust nozzle inner */}
      <mesh position={[0, -2.35, 0]}>
        <cylinderGeometry args={[0.18, 0.14, 0.15, 32]} />
        <meshPhysicalMaterial color="#111" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Nozzle glow */}
      <mesh position={[0, -2.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 32]} />
        <meshBasicMaterial color="#ff5500" />
      </mesh>

      {/* Exhaust glow halo */}
      <pointLight position={[0, -2.5, 0]} intensity={0.6} color="#ff4400" distance={3} />

      {/* Four main tail fins */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group key={`fin-${i}`} rotation={[0, angle, 0]}>
          <mesh position={[0.35, -1.6, 0]} rotation={[0, 0, -0.2]} castShadow>
            <boxGeometry args={[0.65, 0.85, 0.035]} />
            <meshPhysicalMaterial
              color="#4a5060"
              metalness={0.92}
              roughness={0.1}
              clearcoat={0.5}
            />
          </mesh>
          <mesh position={[0.6, -1.2, 0]} rotation={[0, 0, -0.6]}>
            <boxGeometry args={[0.15, 0.55, 0.035]} />
            <meshPhysicalMaterial color="#4a5060" metalness={0.92} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Canard fins near nose */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group key={`canard-${i}`} rotation={[0, angle, 0]}>
          <mesh position={[0.25, 1.5, 0]} rotation={[0, 0, -0.15]}>
            <boxGeometry args={[0.25, 0.3, 0.018]} />
            <meshPhysicalMaterial
              color="#5a6070"
              metalness={0.9}
              roughness={0.12}
              clearcoat={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default Missile;
