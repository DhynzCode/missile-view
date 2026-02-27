import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Stars, Float } from "@react-three/drei";
import * as THREE from "three";
import Missile from "@/components/Missile";

const MissileScene = () => {
  return (
    <Canvas
      camera={{ position: [5, 2.5, 6], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        gl.domElement.style.touchAction = "none";
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" castShadow />
      <directionalLight position={[-4, -2, -5]} intensity={0.3} color="#3366ff" />
      <pointLight position={[0, -3, 0]} intensity={1} color="#ff6600" distance={6} />
      <pointLight position={[3, 3, 3]} intensity={0.4} color="#ff9944" distance={10} />
      <spotLight
        position={[0, 8, 4]}
        intensity={0.8}
        angle={0.3}
        penumbra={1}
        color="#ffffff"
        castShadow
      />

      {/* Starfield background */}
      <Stars radius={100} depth={60} count={4000} factor={4} saturation={0.2} fade speed={1.5} />

      {/* Environment */}
      <Environment preset="night" />

      {/* Missile with subtle float */}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        <Missile />
      </Float>

      {/* Ground reflection plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#0a0e14"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Orbit Controls */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={2}
        maxDistance={18}
        zoomSpeed={1.1}
        rotateSpeed={0.7}
        panSpeed={0.8}
        autoRotate={false}
        dampingFactor={0.08}
        enableDamping
        target={[0, 0, 0]}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />

      <fog attach="fog" args={["#060a10", 12, 28]} />
    </Canvas>
  );
};

export default MissileScene;
