import { useRef, useMemo, useCallback } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

interface EarthProps {
  onTargetSelect?: (position: THREE.Vector3, lat: number, lng: number) => void;
  targetPosition?: THREE.Vector3 | null;
}

const EARTH_RADIUS = 4;

const Earth = ({ onTargetSelect, targetPosition }: EarthProps) => {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const markerRef = useRef<THREE.Group>(null);
  const markerPulseRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.03;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.045;
    }
    if (markerPulseRef.current) {
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.3;
      markerPulseRef.current.scale.set(scale, scale, scale);
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const point = e.point;
      // Convert world point to local earth group space
      if (earthRef.current) {
        const local = earthRef.current.worldToLocal(point.clone());
        const normalized = local.clone().normalize();
        const lat = Math.asin(normalized.y) * (180 / Math.PI);
        const lng = Math.atan2(normalized.x, normalized.z) * (180 / Math.PI);
        // Position on earth surface
        const surfacePos = normalized.multiplyScalar(EARTH_RADIUS * 1.01);
        // Convert back to world
        const worldPos = earthRef.current.localToWorld(surfacePos.clone());
        onTargetSelect?.(worldPos, lat, lng);
      }
    },
    [onTargetSelect]
  );

  const earthTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Ocean
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGrad.addColorStop(0, "#0a2a4a");
    oceanGrad.addColorStop(0.3, "#0d4f8b");
    oceanGrad.addColorStop(0.5, "#0a5e9a");
    oceanGrad.addColorStop(0.7, "#0d4f8b");
    oceanGrad.addColorStop(1, "#0a2a4a");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Continents
    const drawContinent = (cx: number, cy: number, rx: number, ry: number, color: string, rot = 0) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
    };

    // North America
    drawContinent(240, 130, 90, 70, "#1a5c2a", -0.3);
    drawContinent(200, 200, 50, 40, "#2d6b3a", 0.2);
    drawContinent(260, 200, 30, 25, "#22613a");
    // South America
    drawContinent(300, 310, 40, 80, "#2d6b3a", 0.15);
    drawContinent(290, 280, 25, 30, "#3a7a45");
    // Europe
    drawContinent(540, 120, 50, 30, "#3a7a45", 0.1);
    drawContinent(560, 100, 30, 20, "#2d6b3a");
    // Africa
    drawContinent(550, 240, 50, 90, "#4a7a35", -0.1);
    drawContinent(530, 200, 30, 40, "#3a7a45");
    // Asia
    drawContinent(700, 130, 120, 60, "#3a7a45", 0.05);
    drawContinent(760, 200, 45, 35, "#2d6b3a", 0.3);
    drawContinent(650, 170, 40, 30, "#4a7a35");
    // Australia
    drawContinent(840, 340, 40, 30, "#8B7514", 0.2);
    // Antarctica
    ctx.fillStyle = "#c0d4e8";
    ctx.fillRect(0, 470, 1024, 42);
    // Arctic
    ctx.fillStyle = "#d0dce8";
    ctx.fillRect(0, 0, 1024, 25);

    // Add some noise/detail
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  const cloudTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 1024, 512);

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const rx = 15 + Math.random() * 60;
      const ry = 5 + Math.random() * 20;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  // Convert world target position to local for marker rendering
  const localTarget = useMemo(() => {
    if (!targetPosition || !earthRef.current) return null;
    return targetPosition;
  }, [targetPosition]);

  return (
    <group ref={earthRef} position={[0, 0, 0]}>
      {/* Earth sphere - clickable */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshPhysicalMaterial
          map={earthTexture}
          roughness={0.65}
          metalness={0.05}
          clearcoat={0.2}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[EARTH_RADIUS * 1.01, 64, 64]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere glow - inner */}
      <mesh scale={1.05}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Atmosphere glow - outer */}
      <mesh scale={1.12}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color="#3388ff"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Target marker - rendered in world space, so we need to handle it outside the rotating group */}
    </group>
  );
};

// Separate target marker component rendered in world space
export const TargetMarker = ({ position }: { position: THREE.Vector3 }) => {
  const pulseRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (pulseRef.current) {
      const s = 1 + Math.sin(Date.now() * 0.006) * 0.4;
      pulseRef.current.scale.set(s, s, s);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
    }
  });

  // Orient marker to face outward from earth center
  const normal = position.clone().normalize();
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

  return (
    <group position={position} quaternion={quaternion}>
      {/* Core dot */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ff3333" />
      </mesh>
      {/* Pulse ring */}
      <mesh ref={pulseRef}>
        <ringGeometry args={[0.12, 0.18, 32]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Outer ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.22, 0.26, 6]} />
        <meshBasicMaterial color="#ff6666" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Glow light */}
      <pointLight color="#ff3333" intensity={2} distance={3} />
    </group>
  );
};

export { EARTH_RADIUS };
export default Earth;
