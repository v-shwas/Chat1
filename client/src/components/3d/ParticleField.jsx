import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

/* ── Particle cloud ───────────────────────────── */
function Particles({ count = 4000 }) {
  const ref = useRef(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.025;
    ref.current.rotation.x = Math.sin(t * 0.018) * 0.12;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#d4af37"
        size={0.028}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.65}
      />
    </Points>
  );
}

/* ── Floating ambient orbs ────────────────────── */
function AmbientOrbs() {
  const orb1 = useRef(null);
  const orb2 = useRef(null);
  const orb3 = useRef(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (orb1.current) {
      orb1.current.position.y = Math.sin(t * 0.35) * 1.8;
      orb1.current.position.x = Math.cos(t * 0.28) * 2.2;
    }
    if (orb2.current) {
      orb2.current.position.y = Math.sin(t * 0.42 + 2) * 1.4;
      orb2.current.position.x = Math.cos(t * 0.35 + 1) * 2.8;
    }
    if (orb3.current) {
      orb3.current.position.y = Math.sin(t * 0.30 + 4) * 1.0;
      orb3.current.position.x = Math.cos(t * 0.25 + 3) * 1.5;
    }
  });

  return (
    <>
      <mesh ref={orb1} position={[3.5, 0, -6]}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial
          color="#d4af37" emissive="#d4af37" emissiveIntensity={0.35}
          transparent opacity={0.08} roughness={0.4} metalness={0.7}
        />
      </mesh>
      <mesh ref={orb2} position={[-4.5, 1.5, -7]}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial
          color="#b8c7bd" emissive="#b8c7bd" emissiveIntensity={0.32}
          transparent opacity={0.055} roughness={0.4} metalness={0.7}
        />
      </mesh>
      <mesh ref={orb3} position={[1, -3, -4]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#c28468" emissive="#c28468" emissiveIntensity={0.28}
          transparent opacity={0.06}
        />
      </mesh>
    </>
  );
}

/* ── Mouse-responsive camera ──────────────────── */
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.04;
    camera.position.y += (mouse.current.y * 0.3 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ── Main export ──────────────────────────────── */
export default function ParticleField() {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        zIndex: 0, pointerEvents: "none",
        userSelect: "none",
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.28} color="#d4af37" />
        <pointLight position={[-10, -5, -10]} intensity={0.14} color="#b8c7bd" />
        <CameraRig />
        <Particles />
        <AmbientOrbs />
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.08}
            luminanceSmoothing={0.9}
            blendFunction={BlendFunction.ADD}
          />
          <Vignette offset={0.45} darkness={0.65} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
