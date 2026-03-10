import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import * as THREE from "three";
import Missile, { MissileHandle } from "@/components/Missile";
import Earth, { TargetMarker, EARTH_RADIUS } from "@/components/Earth";
import SmokeTrail from "@/components/SmokeTrail";
import FlightPath from "@/components/FlightPath";

export type LaunchStatus = "ready" | "target_locked" | "countdown" | "launching" | "in_flight" | "arrived";

interface SceneProps {
  status: LaunchStatus;
  targetPosition: THREE.Vector3 | null;
  targetCoords: { lat: number; lng: number } | null;
  onTargetSelect: (pos: THREE.Vector3, lat: number, lng: number) => void;
  onStatusChange: (status: LaunchStatus) => void;
  countdown: number | null;
}

const LAUNCH_POSITION = new THREE.Vector3(0, EARTH_RADIUS + 2, 0);

function SceneContent({ status, targetPosition, targetCoords, onTargetSelect, onStatusChange, countdown }: SceneProps) {
  const missileRef = useRef<MissileHandle>(null);
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  const [flightProgress, setFlightProgress] = useState(0);
  const [trailPositions, setTrailPositions] = useState<THREE.Vector3[]>([]);
  const [missilePos, setMissilePos] = useState(LAUNCH_POSITION.clone());
  const [explosionVisible, setExplosionVisible] = useState(false);
  const flightStartTime = useRef(0);

  // Compute curved path
  const curve = useMemo(() => {
    if (!targetPosition) return null;
    const start = LAUNCH_POSITION.clone();
    const end = targetPosition.clone();
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const altitude = mid.length() + 3;
    mid.normalize().multiplyScalar(altitude);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [targetPosition]);

  // Reset when status goes back to ready
  useEffect(() => {
    if (status === "ready") {
      setFlightProgress(0);
      setTrailPositions([]);
      setMissilePos(LAUNCH_POSITION.clone());
      setExplosionVisible(false);
    }
    if (status === "launching") {
      flightStartTime.current = Date.now();
      setFlightProgress(0);
      setTrailPositions([]);
    }
  }, [status]);

  useFrame((state, delta) => {
    if (!missileRef.current?.group) return;
    const group = missileRef.current.group;

    if (status === "ready" || status === "target_locked" || status === "countdown") {
      // Hover at launch position
      group.position.copy(LAUNCH_POSITION);
      group.position.y += Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      // Point upward
      group.quaternion.identity();
    }

    if (status === "launching" || status === "in_flight") {
      if (!curve) return;

      const elapsed = (Date.now() - flightStartTime.current) / 1000;
      const duration = 5; // 5 second flight
      const t = Math.min(elapsed / duration, 1);
      setFlightProgress(t);

      if (t < 1) {
        if (status === "launching" && t > 0.05) {
          onStatusChange("in_flight");
        }

        // Position along curve
        const pos = curve.getPoint(t);
        group.position.copy(pos);
        setMissilePos(pos.clone());

        // Orient missile along trajectory
        const tangent = curve.getTangent(t);
        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion();
        const lookMatrix = new THREE.Matrix4();
        lookMatrix.lookAt(new THREE.Vector3(), tangent, up);
        quat.setFromRotationMatrix(lookMatrix);
        // Rotate so missile nose (Y+) faces direction
        const correction = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        quat.multiply(correction);
        group.quaternion.copy(quat);

        // Trail
        setTrailPositions((prev) => [...prev.slice(-100), pos.clone()]);

        // Camera follow
        if (controlsRef.current) {
          const lookTarget = pos.clone();
          controlsRef.current.target.lerp(lookTarget, 0.05);
        }
      } else {
        // Arrived
        onStatusChange("arrived");
        setExplosionVisible(true);
        setTimeout(() => setExplosionVisible(false), 2000);
      }
    }
  });

  const handleTargetSelect = useCallback(
    (pos: THREE.Vector3, lat: number, lng: number) => {
      if (status === "ready" || status === "target_locked") {
        onTargetSelect(pos, lat, lng);
      }
    },
    [status, onTargetSelect]
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 8, 5]} intensity={1.8} color="#ffffff" castShadow />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#3366ff" />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" distance={20} />

      {/* Stars */}
      <Stars radius={120} depth={80} count={5000} factor={4} saturation={0.2} fade speed={0.8} />

      {/* Earth */}
      <Earth onTargetSelect={handleTargetSelect} targetPosition={targetPosition} />

      {/* Target marker */}
      {targetPosition && <TargetMarker position={targetPosition} />}

      {/* Flight path arc */}
      {targetPosition && (
        <FlightPath
          start={LAUNCH_POSITION}
          end={targetPosition}
          visible={status === "target_locked" || status === "countdown" || status === "in_flight" || status === "launching"}
        />
      )}

      {/* Missile */}
      <Missile ref={missileRef} visible={status !== "arrived"} />

      {/* Smoke trail */}
      <SmokeTrail positions={trailPositions} visible={status === "in_flight" || status === "launching"} />

      {/* Explosion effect */}
      {explosionVisible && targetPosition && (
        <group position={targetPosition}>
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial color="#ff4400" transparent opacity={0.8} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshBasicMaterial color="#ff8800" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
          </mesh>
          <pointLight color="#ff4400" intensity={10} distance={8} />
        </group>
      )}

      {/* Environment */}
      <Environment preset="night" />

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={6}
        maxDistance={30}
        zoomSpeed={1.1}
        rotateSpeed={0.5}
        dampingFactor={0.08}
        enableDamping
        target={[0, 0, 0]}
      />

      <fog attach="fog" args={["#020408", 25, 60]} />
    </>
  );
}

interface MissileSceneProps {
  status: LaunchStatus;
  targetPosition: THREE.Vector3 | null;
  targetCoords: { lat: number; lng: number } | null;
  onTargetSelect: (pos: THREE.Vector3, lat: number, lng: number) => void;
  onStatusChange: (status: LaunchStatus) => void;
  countdown: number | null;
}

const MissileScene = (props: MissileSceneProps) => {
  return (
    <Canvas
      camera={{ position: [0, 4, 12], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        gl.domElement.style.touchAction = "none";
      }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
};

export default MissileScene;
