import { lazy, Suspense } from "react";

const ParticleField = lazy(() => import("./ParticleField"));

export default function ParticleFieldLazy() {
  return (
    <Suspense fallback={null}>
      <ParticleField />
    </Suspense>
  );
}
