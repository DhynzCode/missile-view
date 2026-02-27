import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Missile from "@/components/Missile";

const MissileScene = () => {
  return (
    <Canvas
      camera={{ position: [4, 2, 5], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, -2, -4]} intensity={0.4} color="#4488ff" />
      <pointLight position={[0, -3, 0]} intensity={0.8} color="#ff6600" distance={5} />
      <spotLight
        position={[0, 6, 3]}
        intensity={0.6}
        angle={0.4}
        penumbra={0.8}
        color="#ffffff"
      />
      <Environment preset="night" />
      <Missile />
      <fog attach="fog" args={["#0d1117", 8, 20]} />
    </Canvas>
  );
};

export default MissileScene;
