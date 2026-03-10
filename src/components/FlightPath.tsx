import { useMemo } from "react";
import * as THREE from "three";

interface FlightPathProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  visible: boolean;
}

const FlightPath = ({ start, end, visible }: FlightPathProps) => {
  const curve = useMemo(() => {
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const altitude = mid.length() + 3; // Arc above surface
    mid.normalize().multiplyScalar(altitude);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(80), [curve]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  if (!visible) return null;

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color="#ff6644"
        transparent
        opacity={0.5}
        linewidth={1}
        blending={THREE.AdditiveBlending}
      />
    </line>
  );
};

export default FlightPath;
