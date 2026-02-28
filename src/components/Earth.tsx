import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Earth = () => {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.07;
    }
  });

  // Generate procedural earth colors using canvas texture
  const earthTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Ocean base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 256);
    oceanGrad.addColorStop(0, "#1a3a5c");
    oceanGrad.addColorStop(0.3, "#0d4f8b");
    oceanGrad.addColorStop(0.5, "#0a5e9a");
    oceanGrad.addColorStop(0.7, "#0d4f8b");
    oceanGrad.addColorStop(1, "#1a3a5c");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Continents (simplified shapes)
    ctx.fillStyle = "#2d6b3a";
    // North America
    ctx.beginPath();
    ctx.ellipse(120, 70, 45, 35, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(100, 100, 25, 20, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // South America
    ctx.beginPath();
    ctx.ellipse(150, 160, 20, 40, 0.15, 0, Math.PI * 2);
    ctx.fill();
    // Europe/Africa
    ctx.fillStyle = "#3a7a45";
    ctx.beginPath();
    ctx.ellipse(270, 70, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2d6b3a";
    ctx.beginPath();
    ctx.ellipse(275, 140, 22, 40, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Asia
    ctx.fillStyle = "#3a7a45";
    ctx.beginPath();
    ctx.ellipse(350, 75, 55, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(380, 110, 20, 15, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Australia
    ctx.fillStyle = "#8B6914";
    ctx.beginPath();
    ctx.ellipse(420, 170, 18, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Ice caps
    ctx.fillStyle = "#d0dce8";
    ctx.fillRect(0, 0, 512, 15);
    ctx.fillRect(0, 241, 512, 15);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  const cloudTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 512, 256);

    // Wispy cloud patches
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const rx = 10 + Math.random() * 40;
      const ry = 5 + Math.random() * 15;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  return (
    <group ref={earthRef} position={[6, -5, -8]} rotation={[0.4, 0, -0.23]}>
      {/* Earth sphere */}
      <mesh>
        <sphereGeometry args={[4, 64, 64]} />
        <meshPhysicalMaterial
          map={earthTexture}
          roughness={0.7}
          metalness={0.1}
          clearcoat={0.3}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[4.04, 64, 64]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.08}>
        <sphereGeometry args={[4, 64, 64]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

export default Earth;
