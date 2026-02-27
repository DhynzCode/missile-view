import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Missile = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const bodyMaterial = (
    <meshStandardMaterial
      color="#8a8a8a"
      metalness={0.85}
      roughness={0.2}
    />
  );

  const noseMaterial = (
    <meshStandardMaterial
      color="#cc3333"
      metalness={0.7}
      roughness={0.3}
    />
  );

  const finMaterial = (
    <meshStandardMaterial
      color="#5a5a5a"
      metalness={0.9}
      roughness={0.15}
    />
  );

  const nozzleMaterial = (
    <meshStandardMaterial
      color="#333333"
      metalness={0.95}
      roughness={0.1}
    />
  );

  return (
    <group ref={groupRef} rotation={[0.3, 0, 0.1]}>
      {/* Missile body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 4, 32]} />
        {bodyMaterial}
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.3, 1.2, 32]} />
        {noseMaterial}
      </mesh>

      {/* Nose tip */}
      <mesh position={[0, 3.2, 0]}>
        <coneGeometry args={[0.08, 0.4, 16]} />
        {noseMaterial}
      </mesh>

      {/* Body ring details */}
      {[-0.5, 0.5, 1.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.31, 0.02, 8, 32]} />
          <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Exhaust nozzle */}
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[0.25, 0.18, 0.4, 32]} />
        {nozzleMaterial}
      </mesh>

      {/* Inner nozzle glow */}
      <mesh position={[0, -2.45, 0]}>
        <circleGeometry args={[0.16, 32]} />
        <meshBasicMaterial color="#ff6600" />
      </mesh>

      {/* Four fins */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[0.3, -1.6, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.6, 0.8, 0.04]} />
            {finMaterial}
          </mesh>
          {/* Fin leading edge */}
          <mesh position={[0.55, -1.2, 0]} rotation={[0, 0, -0.6]}>
            <boxGeometry args={[0.15, 0.5, 0.04]} />
            {finMaterial}
          </mesh>
        </group>
      ))}

      {/* Small canard fins near nose */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group key={`canard-${i}`} rotation={[0, angle, 0]}>
          <mesh position={[0.25, 1.5, 0]} rotation={[0, 0, -0.15]}>
            <boxGeometry args={[0.25, 0.3, 0.02]} />
            {finMaterial}
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default Missile;
