# 🚀 Chat App — Full Audit, Bug Fix & 3D Redesign Prompt
> Drop this file into your project root and run it with Claude Code.

---

## 🧠 YOUR ROLE

You are a **senior full-stack engineer and creative director** working on a Next.js chat application. Your job has two equally important missions:

1. **Fix everything that is broken** — audit every feature, find every bug, repair every broken flow.
2. **Redesign the entire UI** from scratch — dark glassmorphism + 3D particle aesthetic, Awwwards-caliber quality.

You will execute these in parallel: fix bugs at the code/logic level, then layer the new design on top. **Do not sacrifice functionality for aesthetics. Both must be perfect.**

---

## ⚠️ GROUND RULES

- **Never truncate code.** If a file is long, split your response — but always write complete, working implementations.
- **Never use placeholder comments** like `// ... rest of component` or `// TODO`. Write the full code.
- **Never skip a phase.** Confirm completion of each phase before moving to the next.
- **Always run `npm run build`** at the end and fix every TypeScript error, import error, and lint warning.
- **Never hallucinate APIs or props.** If you are unsure how a library works, check its types or docs before using it.
- **Test every interactive feature** mentally as you write it — trace the data flow end to end.

---

## PHASE 0 — FULL PROJECT AUDIT (Do this before touching anything)

### 0A — Codebase Mapping

Run the following and report the full output:

```bash
# Project structure
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" \) \
  | grep -v node_modules | grep -v .next | grep -v .git | sort

# All CSS/style files
find . -type f \( -name "*.css" -o -name "*.scss" -o -name "*.module.css" \) \
  | grep -v node_modules | grep -v .next

# Package.json dependencies
cat package.json

# Environment variables (keys only, not values)
cat .env.local 2>/dev/null | cut -d= -f1 || echo "No .env.local found"
cat .env 2>/dev/null | cut -d= -f1 || echo "No .env found"
```

### 0B — Feature Inventory

Read every file and build a complete feature map. For each feature, record:

| Feature | Files Involved | Status | Issue (if broken) |
|---|---|---|---|
| User authentication | ... | ✅ / ❌ / ⚠️ | ... |
| Chat messaging (send/receive) | ... | ✅ / ❌ / ⚠️ | ... |
| Real-time updates | ... | ✅ / ❌ / ⚠️ | ... |
| Voice calling | ... | ✅ / ❌ / ⚠️ | ... |
| Video calling | ... | ✅ / ❌ / ⚠️ | ... |
| Media/file uploads | ... | ✅ / ❌ / ⚠️ | ... |
| Notifications | ... | ✅ / ❌ / ⚠️ | ... |
| User search / contact list | ... | ✅ / ❌ / ⚠️ | ... |
| Message history / pagination | ... | ✅ / ❌ / ⚠️ | ... |
| Settings / profile | ... | ✅ / ❌ / ⚠️ | ... |
| Any other features found | ... | ✅ / ❌ / ⚠️ | ... |

### 0C — Bug Classification

For every broken or partially working feature, classify the root cause:

- **[LOGIC]** — wrong business logic, bad state management, race conditions
- **[API]** — broken API call, missing error handling, wrong endpoint, bad types
- **[REALTIME]** — socket/websocket/subscription setup issues
- **[MEDIA]** — WebRTC, camera/mic permissions, stream handling
- **[IMPORT]** — missing imports, circular deps, wrong module resolution
- **[ENV]** — missing or misconfigured environment variables
- **[TYPE]** — TypeScript errors causing runtime failures
- **[STYLE]** — layout/CSS issues breaking usability (separate from redesign)

Output the full audit before writing a single line of new code.

---

## PHASE 1 — BUG FIXES (Fix all broken features before redesigning)

Work through every `❌` and `⚠️` item from Phase 0 systematically.

### Fix Priority Order:
1. **Authentication** — if broken, nothing else works
2. **Real-time layer** (WebSocket/Socket.io/Supabase/Pusher) — core of a chat app
3. **Send & receive messages** — fundamental feature
4. **Voice calling** — establish WebRTC peer connections, handle ICE, STUN/TURN
5. **Video calling** — build on top of voice fixes
6. **File/media uploads** — fix upload handlers and preview
7. **Notifications** — fix badge counts, toast triggers
8. **Search & contacts** — fix query logic and display
9. **Pagination / infinite scroll** — fix message history loading
10. **Settings / profile** — fix form submissions and data persistence

### For each fix:
- State the exact bug
- Show the broken code
- Show the fixed code
- Explain what was wrong and why the fix works

### Common things to check and fix:
- Missing `await` on async calls
- Unhandled Promise rejections
- `useEffect` missing dependencies or causing infinite loops
- WebSocket connections not being cleaned up on unmount
- `getUserMedia` not handling permission denied
- Race conditions between auth state and data fetching
- Missing null checks on user/session objects
- API routes not returning proper status codes
- CORS issues on API routes
- Missing error boundaries around async components
- Incorrect `key` props causing wrong component reuse
- Stale closures in event handlers
- Server Components accidentally using browser APIs

---

## PHASE 2 — DEPENDENCY INSTALLATION

After all bugs are fixed, install the design and 3D dependencies:

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing
npm install gsap @gsap/react
npm install framer-motion
npm install @studio-freight/lenis
npm install @radix-ui/react-dialog @radix-ui/react-tooltip @radix-ui/react-avatar @radix-ui/react-dropdown-menu
npm install lucide-react
npm install clsx tailwind-merge
```

Verify installation succeeded and add types if needed:
```bash
npm install --save-dev @types/three
```

---

## PHASE 3 — NUKE ALL EXISTING STYLES

1. **Empty every `.module.css` file** — replace contents with `/* cleared for redesign */`
2. **Remove all `styled-components`** — convert to `className` based approach
3. **Remove all inline `style={{}}` props** that set colors, fonts, or spacing
4. **Replace `globals.css` entirely** with the design system below
5. **Update `tailwind.config.ts`** with the extended config below
6. **Keep all className strings** that reference Tailwind utilities — we will rewrite them component by component

---

## PHASE 4 — DESIGN SYSTEM

### `app/globals.css` (Replace entirely)

```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  /* ── Background layers */
  --void:            #03040a;
  --deep:            #070d1a;
  --deep-2:          #0a1020;

  /* ── Glass surfaces */
  --surface:         rgba(255, 255, 255, 0.04);
  --surface-hover:   rgba(255, 255, 255, 0.07);
  --surface-active:  rgba(255, 255, 255, 0.10);

  /* ── Borders */
  --border:          rgba(255, 255, 255, 0.08);
  --border-hover:    rgba(255, 255, 255, 0.14);
  --border-active:   rgba(255, 255, 255, 0.22);

  /* ── Accent palette */
  --accent:          #6c63ff;
  --accent-dim:      rgba(108, 99, 255, 0.18);
  --accent-glow:     rgba(108, 99, 255, 0.35);
  --cyan:            #00d4ff;
  --cyan-dim:        rgba(0, 212, 255, 0.15);
  --cyan-glow:       rgba(0, 212, 255, 0.30);
  --pink:            #ff6b9d;
  --pink-glow:       rgba(255, 107, 157, 0.30);
  --green:           #22c55e;
  --red:             #ef4444;

  /* ── Text */
  --text-primary:    rgba(255, 255, 255, 0.92);
  --text-secondary:  rgba(255, 255, 255, 0.52);
  --text-muted:      rgba(255, 255, 255, 0.28);
  --text-disabled:   rgba(255, 255, 255, 0.18);

  /* ── Glass recipe */
  --glass-bg:        rgba(255, 255, 255, 0.04);
  --glass-border:    rgba(255, 255, 255, 0.09);
  --glass-blur:      blur(20px) saturate(180%);
  --glass-shadow:    0 8px 32px rgba(0, 0, 0, 0.55),
                     inset 0 1px 0 rgba(255, 255, 255, 0.06);

  /* ── Radius scale */
  --r-xs:  4px;
  --r-sm:  8px;
  --r-md:  14px;
  --r-lg:  20px;
  --r-xl:  28px;
  --r-2xl: 40px;
  --r-full: 9999px;

  /* ── Typography */
  --font-display: 'Syne', sans-serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* ── Motion */
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out:    cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast:    150ms;
  --dur-normal:  280ms;
  --dur-slow:    500ms;
  --dur-slower:  800ms;

  /* ── Z-index scale */
  --z-bg:       0;
  --z-grain:    1;
  --z-base:     10;
  --z-sidebar:  20;
  --z-header:   30;
  --z-dropdown: 50;
  --z-modal:    80;
  --z-call:     100;
  --z-toast:    120;
  --z-cursor:   9999;
}

/* ── Reset & base ─────────────────────────────────── */

html {
  font-size: 16px;
  scroll-behavior: smooth;
  text-rendering: optimizeLegibility;
}

body {
  background: var(--void);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-weight: 400;
  line-height: 1.6;
  min-height: 100dvh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Noise grain overlay ──────────────────────────── */

body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.032;
  pointer-events: none;
  z-index: var(--z-grain);
  mix-blend-mode: overlay;
}

/* ── Glass utility ────────────────────────────────── */

.glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.glass-hover {
  transition: border-color var(--dur-normal) var(--ease-smooth),
              background var(--dur-normal) var(--ease-smooth);
}

.glass-hover:hover {
  background: var(--surface-hover);
  border-color: var(--border-hover);
}

/* ── Glow utilities ───────────────────────────────── */

.glow-accent { box-shadow: 0 0 40px var(--accent-glow); }
.glow-cyan   { box-shadow: 0 0 40px var(--cyan-glow); }
.glow-pink   { box-shadow: 0 0 40px var(--pink-glow); }

/* ── Typography utilities ─────────────────────────── */

.font-display { font-family: var(--font-display); }
.font-mono    { font-family: var(--font-mono); }

/* ── Scrollbar ────────────────────────────────────── */

::-webkit-scrollbar         { width: 4px; height: 4px; }
::-webkit-scrollbar-track   { background: transparent; }
::-webkit-scrollbar-thumb   { background: var(--border-active); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

/* ── Selection ────────────────────────────────────── */

::selection { background: var(--accent); color: #fff; }

/* ── Focus ring ───────────────────────────────────── */

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--r-sm);
}

/* ── Transitions on all interactives ─────────────── */

button, a, [role="button"] {
  transition: all var(--dur-normal) var(--ease-smooth);
  cursor: pointer;
}

/* ── Reduced motion ───────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* ── Keyframes ────────────────────────────────────── */

@keyframes pulse-ring {
  0%   { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px var(--accent-glow); }
  50%       { box-shadow: 0 0 50px var(--accent-glow), 0 0 80px var(--cyan-glow); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
```

### `tailwind.config.ts` (Replace entirely)

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void:  "#03040a",
        deep:  "#070d1a",
        accent: {
          DEFAULT: "#6c63ff",
          cyan:    "#00d4ff",
          pink:    "#ff6b9d",
          green:   "#22c55e",
          red:     "#ef4444",
        },
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      backdropBlur: {
        glass: "20px",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glass:       "0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        glow:        "0 0 40px rgba(108,99,255,0.35)",
        "glow-cyan": "0 0 40px rgba(0,212,255,0.30)",
        "glow-pink": "0 0 40px rgba(255,107,157,0.30)",
        "glow-sm":   "0 0 20px rgba(108,99,255,0.25)",
      },
      animation: {
        "pulse-slow":   "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":    "spin-slow 8s linear infinite",
        "glow-pulse":   "glow-pulse 3s ease infinite",
        "fade-up":      "fade-up 0.5s var(--ease-smooth) forwards",
        "float":        "float 4s ease-in-out infinite",
        "pulse-ring":   "pulse-ring 1.5s ease-out infinite",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## PHASE 5 — 3D PARTICLE BACKGROUND

Create `components/3d/ParticleField.tsx`:

```tsx
"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

/* ── Particle cloud ───────────────────────────── */
function Particles({ count = 4000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

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
        color="#6c63ff"
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
  const orb1 = useRef<THREE.Mesh>(null);
  const orb2 = useRef<THREE.Mesh>(null);
  const orb3 = useRef<THREE.Mesh>(null);

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
          color="#6c63ff" emissive="#6c63ff" emissiveIntensity={0.5}
          transparent opacity={0.10} roughness={0.1} metalness={0.9}
        />
      </mesh>
      <mesh ref={orb2} position={[-4.5, 1.5, -7]}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial
          color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.6}
          transparent opacity={0.08} roughness={0.1} metalness={0.9}
        />
      </mesh>
      <mesh ref={orb3} position={[1, -3, -4]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#ff6b9d" emissive="#ff6b9d" emissiveIntensity={0.5}
          transparent opacity={0.09}
        />
      </mesh>
    </>
  );
}

/* ── Mouse-responsive camera ──────────────────── */
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useMemo(() => {
    if (typeof window === "undefined") return;
    const handler = (e: MouseEvent) => {
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
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.4} color="#6c63ff" />
        <pointLight position={[-10, -5, -10]} intensity={0.2} color="#00d4ff" />
        <CameraRig />
        <Particles />
        <AmbientOrbs />
        <EffectComposer>
          <Bloom
            intensity={1.4}
            luminanceThreshold={0.08}
            luminanceSmoothing={0.9}
            blendFunction={BlendFunction.ADD}
          />
          <ChromaticAberration
            offset={[0.0006, 0.0006] as unknown as THREE.Vector2}
            blendFunction={BlendFunction.NORMAL}
          />
          <Vignette offset={0.45} darkness={0.65} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
```

Create `components/3d/ParticleFieldLazy.tsx`:

```tsx
"use client";
import dynamic from "next/dynamic";

const ParticleField = dynamic(() => import("./ParticleField"), {
  ssr: false,
  loading: () => null,
});

export default ParticleField;
```

---

## PHASE 6 — ROOT LAYOUT

Update `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import ParticleField from "@/components/3d/ParticleFieldLazy";
import SmoothScroll from "@/components/providers/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";

export const metadata: Metadata = {
  title: "Chat App",
  description: "Next-generation communication",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Layer 0: 3D particle background — never blocks UI */}
        <ParticleField />

        {/* Layer 10+: All app UI */}
        <SmoothScroll>
          {children}
        </SmoothScroll>

        {/* Layer 9999: Custom cursor */}
        <CustomCursor />
      </body>
    </html>
  );
}
```

---

## PHASE 7 — SMOOTH SCROLL PROVIDER

Create `components/providers/SmoothScroll.tsx`:

```tsx
"use client";
import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
```

---

## PHASE 8 — CUSTOM CURSOR

Create `components/ui/CustomCursor.tsx`:

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch devices

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const moveDot  = gsap.quickTo(dot,  "css", { duration: 0.1, ease: "power3.out" });
    const moveRing = gsap.quickTo(ring, "css", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      moveDot({ x: e.clientX, y: e.clientY });
      moveRing({ x: e.clientX, y: e.clientY });
    };

    const onEnterLink = () => {
      gsap.to(ring, { scale: 1.8, borderColor: "var(--cyan)", duration: 0.3 });
      gsap.to(dot,  { scale: 0,   duration: 0.3 });
    };

    const onLeaveLink = () => {
      gsap.to(ring, { scale: 1, borderColor: "rgba(108,99,255,0.7)", duration: 0.3 });
      gsap.to(dot,  { scale: 1, duration: 0.3 });
    };

    window.addEventListener("mousemove", onMove);
    document.querySelectorAll("a, button, [role='button'], input, textarea")
      .forEach((el) => {
        el.addEventListener("mouseenter", onEnterLink);
        el.addEventListener("mouseleave", onLeaveLink);
      });

    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 8, height: 8,
          background: "var(--accent)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%, -50%)",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 36, height: 36,
          border: "1.5px solid rgba(108,99,255,0.7)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          transform: "translate(-50%, -50%)",
        }}
      />
    </>
  );
}
```

---

## PHASE 9 — APP SHELL & SIDEBAR

Create `components/layout/AppShell.tsx`:

```tsx
"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
        position: "relative",
        zIndex: 10,
      }}
    >
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded((v) => !v)} />
      <main
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 300ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
```

Create `components/layout/Sidebar.tsx` with these exact specs:
- Width: `72px` collapsed, `240px` expanded
- Transition: `width 300ms var(--ease-smooth)`
- Background: `rgba(3, 4, 10, 0.7)`, `backdrop-filter: blur(24px)`
- Right edge: `border-right: 1px solid var(--border)` + right-side gradient fade `background: linear-gradient(to right, transparent, rgba(0,0,0,0.3))`
- Top section: user avatar with gradient rotating ring, 44px size
- Nav items: use Lucide icons (MessageSquare, Phone, Video, Users, Bell, Settings)
- Active state: left accent bar `2px solid var(--accent)`, background `var(--accent-dim)`
- Hover state: background `var(--surface-hover)`, translate X 3px
- Bottom section: avatar + logout icon
- Conversation list (when expanded): each item is a glass card with avatar, name, last message snippet, unread badge, timestamp in mono font

---

## PHASE 10 — CHAT SCREEN REDESIGN

### Header (`components/chat/ChatHeader.tsx`)
- Height: 60px
- Glass: `rgba(3,4,10,0.75)`, `backdrop-filter: blur(20px)`, `border-bottom: 1px solid var(--border)`
- Left: avatar (with online dot), name in Syne font, status in DM Sans text-secondary
- Right: call button (Phone icon, glass pill), video button (Video icon, glass pill), more options
- Call/video buttons: on hover → border color becomes `var(--cyan)`, soft cyan glow

### Message List (`components/chat/MessageList.tsx`)
- Scrollable, flex-column, padding: `20px 24px`, gap: `6px`
- Date separators: centered pill, glass, font-mono, text-muted, `font-size: 11px`
- Messages animate in with `animation: fade-up 0.3s var(--ease-smooth) forwards`
- Scroll to bottom button: glass pill, bottom-right, appears when scrolled up 200px+

### Message Bubble (`components/chat/MessageBubble.tsx`)

**Outgoing (sent by me):**
```
background: linear-gradient(135deg, rgba(108,99,255,0.22), rgba(108,99,255,0.09))
border: 1px solid rgba(108,99,255,0.22)
border-radius: 18px 18px 4px 18px
align-self: flex-end
max-width: 68%
padding: 10px 14px
```

**Incoming (received):**
```
background: var(--glass-bg)
backdrop-filter: var(--glass-blur)
border: 1px solid var(--glass-border)
border-radius: 18px 18px 18px 4px
align-self: flex-start
max-width: 68%
padding: 10px 14px
```

**Both:**
- Text: `font-size: 14px`, `line-height: 1.55`
- Timestamp: font-mono, 10px, text-muted, opacity 0 → 1 on bubble hover, `transition: opacity 200ms`
- Message status icons (sent/delivered/read): 12px, text-secondary, after timestamp
- Reaction row: appears below on hover, small glass pill with emoji + count

### Chat Input Bar (`components/chat/ChatInput.tsx`)
```
position: fixed (or sticky) bottom 0
width: calc(100% - sidebar width)
background: rgba(3,4,10,0.85)
backdrop-filter: blur(30px)
border-top: 1px solid var(--border)
box-shadow: 0 -20px 60px rgba(3,4,10,0.8)
padding: 12px 20px 16px
```

Inner container: glass card, `border-radius: var(--r-xl)`, flex row, align-items center

- Attach button: 36px glass circle, Paperclip icon, text-secondary
- Emoji button: 36px glass circle, Smile icon
- Textarea: flex-1, transparent bg, no border, resize none, font-body 14px, max-height 120px, auto-resize via `onInput` with `scrollHeight`
- Placeholder: `"Type a message..."`, text-muted
- Send button: 40px circle, `background: linear-gradient(135deg, var(--accent), var(--cyan))`, glow on hover, Paper-plane / Send icon in white
- On send: GSAP scale animation `1 → 0.85 → 1.08 → 1` over 0.3s
- Voice message button (when textarea empty): Mic icon instead of Send

---

## PHASE 11 — VIDEO CALL SCREEN REDESIGN

This screen activates as a full-viewport overlay (z-index: 100) when a video call is active.

Create `components/call/VideoCallScreen.tsx`:

### Layout:
```
Full viewport overlay
├── Background layer: blurred/darkened remote video feed
│   └── gradient overlay: radial-gradient(ellipse at center, rgba(7,13,26,0.4) 0%, rgba(3,4,10,0.9) 100%)
├── Remote video tile: centered, max 85vw × 85vh, rounded-3xl, glass border
│   └── Speaking indicator: animated gradient border (conic-gradient rotation) when speaking
├── Local video PiP: bottom-right, 200×130px, draggable, rounded-2xl, glass border
│   └── "Drag to reposition" tooltip on first render
├── Top bar (glass strip, height 56px):
│   ├── Left: call type badge ("Video Call", glass pill, mono font)
│   ├── Center: participant name, Syne font
│   └── Right: call timer (mono font, text-secondary)
└── Bottom control bar (glass pill, floating 28px from bottom):
    ├── Mic toggle (active: glass | muted: rgba(239,68,68,0.25) border + red icon)
    ├── Camera toggle
    ├── Screen share (active: cyan glow)
    ├── Effects / background blur
    ├── Add participants
    └── End call: wider pill, background: linear-gradient(135deg, #ef4444, #dc2626), "End" text + phone-off icon
```

Control bar CSS:
```css
background: rgba(0, 0, 0, 0.65);
backdrop-filter: blur(40px);
border: 1px solid rgba(255,255,255,0.10);
border-radius: 9999px;
padding: 10px 20px;
display: flex;
align-items: center;
gap: 8px;
```

Each control button:
```css
width: 48px;
height: 48px;
border-radius: 50%;
border: 1px solid rgba(255,255,255,0.10);
background: rgba(255,255,255,0.06);
display: flex;
align-items: center;
justify-content: center;
transition: all 200ms var(--ease-smooth);
```

On hover: `background: rgba(255,255,255,0.12)`, `border-color: rgba(255,255,255,0.2)`

---

## PHASE 12 — VOICE CALL SCREEN REDESIGN

Create `components/call/VoiceCallScreen.tsx`:

This renders as a centered modal over a glass backdrop blur overlay.

### 3D Orb Component (inside the voice call modal):

Create `components/3d/VoiceOrb.tsx`:

```tsx
"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";

function PulsingOrb({ isSpeaking }: { isSpeaking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

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
        color="#6c63ff"
        emissive="#6c63ff"
        emissiveIntensity={isSpeaking ? 0.6 : 0.3}
        distort={isSpeaking ? 0.4 : 0.15}
        speed={isSpeaking ? 4 : 1.5}
        roughness={0.1}
        metalness={0.8}
        transparent
        opacity={0.85}
      />
    </Sphere>
  );
}

export default function VoiceOrb({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div style={{ width: 200, height: 200 }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[2, 2, 2]} intensity={1} color="#6c63ff" />
        <pointLight position={[-2, -2, -2]} intensity={0.5} color="#00d4ff" />
        <PulsingOrb isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
}
```

### Voice Call Modal layout:
```
Glass modal: 400px wide, auto height, centered, rounded-3xl
├── Top: caller name (Syne, 24px bold), "Voice Call" label (mono, cyan, 12px)
├── Center: VoiceOrb component (200×200px)
├── Below orb: avatar ring with gradient border animation
├── Duration timer: mono font, text-secondary, "00:00" format
└── Controls (glass pill, same pattern as video): mute, speaker, add call, end call
```

---

## PHASE 13 — INCOMING CALL NOTIFICATION

Create `components/call/IncomingCallToast.tsx`:

```tsx
// Glass card slides up from bottom-right
// Avatar + name + call type
// Two buttons: Accept (green gradient) | Decline (red gradient)
// Ringtone animation: VoiceOrb at mini size, pulsing
// Auto-dismiss after 30 seconds
// GSAP slide-in: y: 100 → 0, opacity: 0 → 1, spring ease
```

---

## PHASE 14 — GSAP ANIMATIONS SETUP

Create `lib/animations.ts`:

```ts
import { gsap } from "gsap";

// Page enter animation
export function pageEnter(element: HTMLElement) {
  return gsap.fromTo(element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
  );
}

// Stagger children in
export function staggerIn(elements: HTMLElement[], delay = 0) {
  return gsap.fromTo(elements,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, delay, ease: "power3.out" }
  );
}

// Message appear
export function messageAppear(element: HTMLElement) {
  return gsap.fromTo(element,
    { opacity: 0, y: 8, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
  );
}

// Button press
export function buttonPress(element: HTMLElement) {
  return gsap.timeline()
    .to(element, { scale: 0.88, duration: 0.1, ease: "power2.in" })
    .to(element, { scale: 1.06, duration: 0.15, ease: "power2.out" })
    .to(element, { scale: 1,    duration: 0.1, ease: "power2.inOut" });
}

// Notification badge pop
export function badgePop(element: HTMLElement) {
  return gsap.fromTo(element,
    { scale: 0 },
    { scale: 1, duration: 0.4, ease: "back.out(2)" }
  );
}

// Call overlay enter
export function callOverlayEnter(element: HTMLElement) {
  return gsap.fromTo(element,
    { opacity: 0, scale: 0.96, y: 20 },
    { opacity: 1, scale: 1,    y: 0, duration: 0.5, ease: "power3.out" }
  );
}

// Toast slide in
export function toastSlideIn(element: HTMLElement) {
  return gsap.fromTo(element,
    { x: 120, opacity: 0 },
    { x: 0,   opacity: 1, duration: 0.5, ease: "back.out(1.4)" }
  );
}
```

Wire these animations in each component using `useEffect` with `useRef` on the container element.

---

## PHASE 15 — UI COMPONENT LIBRARY

Create these reusable components under `components/ui/`:

### `GlassCard.tsx`
```tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "purple" | "cyan" | "pink" | "none";
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
// Implement with CSS vars. No styled-components.
```

### `GlassButton.tsx`
```tsx
interface GlassButtonProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}
// accent variant: gradient background, glow on hover
// danger variant: rgba(239,68,68,0.2) bg, red border, red glow on hover
// ghost variant: transparent bg, border only
// icon size: perfect circle
```

### `Avatar.tsx`
```tsx
interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
  speaking?: boolean; // animated gradient ring
}
// Fallback: gradient background (based on name hash) + initials, font-mono
// Online dot: green, bottom-right, with pulse animation
// Speaking ring: conic-gradient rotating animation
```

### `Badge.tsx`
```tsx
// Unread count badge
// Max shows "99+"
// Appears with badgePop animation
// Glass or accent variant
```

### `StatusDot.tsx`
```tsx
// Online: green with subtle pulse
// Away: yellow, no pulse
// Busy: red, no pulse
// Offline: gray, no pulse
```

---

## PHASE 16 — FINAL QA CHECKLIST

After completing all phases, verify every item:

### Functionality
- [ ] Login / sign up flow works end to end
- [ ] Sending a message works and shows immediately
- [ ] Receiving messages in real-time works
- [ ] Message history loads on conversation open
- [ ] Infinite scroll / pagination works
- [ ] Voice call can be initiated, accepted, declined
- [ ] Video call can be initiated, accepted, declined
- [ ] Mic mute / unmute works in call
- [ ] Camera on/off works in call
- [ ] Call timer increments correctly
- [ ] Hanging up ends the call cleanly
- [ ] File/image upload works
- [ ] Notifications appear and clear correctly
- [ ] User search works
- [ ] Contact list loads correctly
- [ ] Settings can be saved
- [ ] Profile can be updated
- [ ] Auth persists across page refresh
- [ ] Logout works

### Design
- [ ] ParticleField renders on all routes
- [ ] No leftover old styles visible anywhere
- [ ] Glass morphism applied consistently
- [ ] Fonts (Syne, DM Sans, JetBrains Mono) loading correctly
- [ ] Dark background (`#03040a`) visible, no white flash
- [ ] Custom cursor working on desktop
- [ ] Smooth scroll working
- [ ] GSAP animations triggering correctly
- [ ] Video call screen looks correct
- [ ] Voice call orb rendering and pulsing
- [ ] Incoming call toast slides in
- [ ] All buttons have hover states
- [ ] Unread badges appearing correctly
- [ ] Sidebar collapse/expand working
- [ ] Mobile layout not broken (sidebar collapses to bottom nav or hamburger)

### Build
- [ ] `npm run build` passes with zero errors
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)
- [ ] No console errors in browser
- [ ] No hydration mismatch warnings
- [ ] Three.js / Canvas not running on server (SSR: false confirmed)
- [ ] Lenis and GSAP only initialized client-side

---

## QUESTIONS TO ASK ME IF NEEDED

If you encounter any of the following, stop and ask me before proceeding:

1. **Video/voice call library** — What are you using? (LiveKit / Agora / Daily.co / raw WebRTC / other)
2. **Real-time layer** — What powers your live messaging? (Socket.io / Supabase Realtime / Pusher / Firebase / other)
3. **Auth provider** — How is auth handled? (NextAuth / Clerk / Supabase Auth / Firebase Auth / other)
4. **Database / API** — Where does message data come from? (Prisma+Postgres / Supabase / Firebase / custom API)
5. **Existing `.env` keys** — If any API calls are failing due to missing keys, tell me what keys are missing.

Do not guess at these. Ask me, get the answer, then wire everything correctly.

---

*Generated for: Next.js + Tailwind CSS + CSS Modules + Styled Components | Dark Glassmorphism + 3D Particles | Awwwards-level redesign*
