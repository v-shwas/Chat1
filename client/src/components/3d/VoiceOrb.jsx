import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";

function PulsingOrb({ isSpeaking }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const targetScale = isSpeaking
      ? 1 + Math.sin(t * 8) * 0.08 + 0.05
      : 1 + Math.sin(t * 2) * 0.02;
    meshRef.current.scale.setScalar(
      meshRef.current.scale.x + (targetScale - meshRef.current.scale.x) * 0.1
    );
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color="#d4af37"
        emissive="#d4af37"
        emissiveIntensity={isSpeaking ? 0.6 : 0.3}
        distort={isSpeaking ? 0.4 : 0.15}
        speed={isSpeaking ? 4 : 1.5}
        roughness={0.35}
        metalness={0.72}
        transparent
        opacity={0.85}
      />
    </Sphere>
  );
}

export default function VoiceOrb({ isSpeaking }) {
  return (
    <div style={{ width: 200, height: 200 }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[2, 2, 2]} intensity={0.8} color="#d4af37" />
        <pointLight position={[-2, -2, -2]} intensity={0.35} color="#b8c7bd" />
        <PulsingOrb isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
}
