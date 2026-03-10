import { useMemo, useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";

interface FlightPathProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  visible: boolean;
}

const FlightPath = ({ start, end, visible }: FlightPathProps) => {
  const points = useMemo(() => {
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const altitude = mid.length() + 3;
    mid.normalize().multiplyScalar(altitude);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(80).map(p => [p.x, p.y, p.z] as [number, number, number]);
  }, [start, end]);

  if (!visible) return null;

  return (
    <Line
      points={points}
      color="#ff6644"
      lineWidth={1.5}
      transparent
      opacity={0.5}
      blending={THREE.AdditiveBlending}
    />
  );
};

export default FlightPath;
