import { useCallback, useRef, useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export type LaunchStatus =
  | "ready"
  | "target_locked"
  | "countdown"
  | "launching"
  | "in_flight"
  | "arrived";

interface MapSceneProps {
  status: LaunchStatus;
  onTargetSelect: (lat: number, lng: number) => void;
  onStatusChange: (status: LaunchStatus) => void;
  targetCoords: { lat: number; lng: number } | null;
  launchCoords: { lat: number; lng: number };
  triggerLaunch: boolean;
  onFlightComplete: () => void;
}

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4a5568" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2d3748" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0d1b2a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#1a365d" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#16213e" }],
  },
  {
    featureType: "road",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];

const containerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 20, lng: 110 };

function computeGeodesicPath(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  steps = 120
): { lat: number; lng: number }[] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const lat1 = toRad(start.lat);
  const lng1 = toRad(start.lng);
  const lat2 = toRad(end.lat);
  const lng2 = toRad(end.lng);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2
      )
    );

  if (d < 1e-10) return [start, end];

  const points: { lat: number; lng: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    points.push({
      lat: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))),
      lng: toDeg(Math.atan2(y, x)),
    });
  }
  return points;
}

const MapScene = ({
  status,
  onTargetSelect,
  onStatusChange,
  targetCoords,
  launchCoords,
  triggerLaunch,
  onFlightComplete,
}: MapSceneProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const animFrameRef = useRef<number>(0);
  const [missilePos, setMissilePos] = useState<{ lat: number; lng: number } | null>(null);
  const [flightPath, setFlightPath] = useState<{ lat: number; lng: number }[]>([]);
  const [trailPath, setTrailPath] = useState<{ lat: number; lng: number }[]>([]);
  const [explosionVisible, setExplosionVisible] = useState(false);
  const [explosionCircles, setExplosionCircles] = useState<google.maps.Circle[]>([]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (status !== "ready" && status !== "target_locked") return;
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat !== undefined && lng !== undefined) {
        onTargetSelect(lat, lng);
      }
    },
    [status, onTargetSelect]
  );

  // Animate flight
  useEffect(() => {
    if (!triggerLaunch || !targetCoords) return;

    const path = computeGeodesicPath(launchCoords, targetCoords, 120);
    setFlightPath(path);
    setTrailPath([]);
    setMissilePos(path[0]);
    setExplosionVisible(false);

    let step = 0;
    const totalSteps = path.length;
    const duration = 5000; // 5 seconds
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      step = Math.floor(progress * (totalSteps - 1));

      setMissilePos(path[step]);
      setTrailPath(path.slice(0, step + 1));

      if (progress < 0.05 && status === "launching") {
        // still launching
      } else if (progress >= 0.05 && status !== "in_flight" && progress < 1) {
        onStatusChange("in_flight");
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Arrived
        setMissilePos(null);
        setExplosionVisible(true);
        onFlightComplete();
        setTimeout(() => setExplosionVisible(false), 2500);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [triggerLaunch]);

  // Cleanup explosion circles
  useEffect(() => {
    if (explosionVisible && targetCoords && mapRef.current) {
      const circles = [
        new google.maps.Circle({
          center: targetCoords,
          radius: 80000,
          map: mapRef.current,
          fillColor: "#ff4400",
          fillOpacity: 0.6,
          strokeColor: "#ff8800",
          strokeWeight: 2,
          strokeOpacity: 0.8,
        }),
        new google.maps.Circle({
          center: targetCoords,
          radius: 200000,
          map: mapRef.current,
          fillColor: "#ff8800",
          fillOpacity: 0.2,
          strokeColor: "#ffaa00",
          strokeWeight: 1,
          strokeOpacity: 0.4,
        }),
      ];
      setExplosionCircles(circles);

      // Animate expansion
      let radius = 80000;
      const expandInterval = setInterval(() => {
        radius += 15000;
        circles[0]?.setRadius(radius);
        circles[1]?.setRadius(radius * 2.5);
        circles[0]?.setOptions({ fillOpacity: Math.max(0, 0.6 - radius / 500000) });
        circles[1]?.setOptions({ fillOpacity: Math.max(0, 0.2 - radius / 1000000) });
      }, 50);

      return () => {
        clearInterval(expandInterval);
        circles.forEach((c) => c.setMap(null));
      };
    } else {
      explosionCircles.forEach((c) => c.setMap(null));
      setExplosionCircles([]);
    }
  }, [explosionVisible]);

  // Reset
  useEffect(() => {
    if (status === "ready") {
      setMissilePos(null);
      setFlightPath([]);
      setTrailPath([]);
      setExplosionVisible(false);
      explosionCircles.forEach((c) => c.setMap(null));
    }
  }, [status]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-display text-foreground">Map Load Error</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Failed to load Google Maps. Please add your API key as{" "}
            <code className="bg-muted px-2 py-0.5 rounded text-primary text-xs">
              VITE_GOOGLE_MAPS_API_KEY
            </code>{" "}
            in your environment.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-display">
            Loading Map
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={3}
      onLoad={onLoad}
      onClick={handleClick}
      options={{
        styles: MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
        minZoom: 2,
        maxZoom: 12,
        backgroundColor: "#0d1b2a",
        gestureHandling: "greedy",
      }}
    >
      {/* Launch base marker */}
      <Marker
        position={launchCoords}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#22c55e",
          fillOpacity: 0.9,
          strokeColor: "#4ade80",
          strokeWeight: 2,
        }}
        title="Launch Base"
      />

      {/* Target marker */}
      {targetCoords && (
        <Marker
          position={targetCoords}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#ef4444",
            fillOpacity: 0.9,
            strokeColor: "#f87171",
            strokeWeight: 3,
          }}
          title="Target"
        />
      )}

      {/* Flight path polyline */}
      {flightPath.length > 1 && (
        <Polyline
          path={flightPath}
          options={{
            strokeColor: "#ff6644",
            strokeOpacity: 0.4,
            strokeWeight: 2,
            geodesic: true,
          }}
        />
      )}

      {/* Smoke trail */}
      {trailPath.length > 1 && (
        <Polyline
          path={trailPath}
          options={{
            strokeColor: "#ff8844",
            strokeOpacity: 0.7,
            strokeWeight: 4,
            geodesic: true,
          }}
        />
      )}

      {/* Missile position */}
      {missilePos && (
        <Marker
          position={missilePos}
          icon={{
            path: "M 0,-12 L 4,0 L 2,0 L 2,10 L -2,10 L -2,0 L -4,0 Z",
            scale: 1.8,
            fillColor: "#ff4400",
            fillOpacity: 1,
            strokeColor: "#ffaa00",
            strokeWeight: 1.5,
            anchor: new google.maps.Point(0, 0),
          }}
          title="Missile"
        />
      )}
    </GoogleMap>
  );
};

export default MapScene;
