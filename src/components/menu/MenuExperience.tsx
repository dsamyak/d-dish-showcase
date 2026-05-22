import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, SoftShadows } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MENU } from "./dishes";
import { Dish3D } from "./Dish3D";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import * as THREE from "three";

// Per-category lighting moods (key light color/intensity, rim color, ambient)
const LIGHT_MOODS: Record<
  string,
  { key: string; keyI: number; rim: string; rimI: number; amb: number; fill: string }
> = {
  paneer:  { key: "#ffe1b0", keyI: 2.2, rim: "#ffd0a0", rimI: 1.1, amb: 0.35, fill: "#cfe2ff" },
  chicken: { key: "#ffb070", keyI: 2.6, rim: "#ff7a3a", rimI: 1.4, amb: 0.28, fill: "#9ec4ff" },
  rice:    { key: "#fff0c8", keyI: 2.0, rim: "#ffe8a8", rimI: 0.9, amb: 0.42, fill: "#dbeaff" },
  dosa:    { key: "#ffd28a", keyI: 2.4, rim: "#ffa64a", rimI: 1.2, amb: 0.32, fill: "#bfd8ff" },
  dessert: { key: "#ffe8d8", keyI: 1.8, rim: "#ffc0d8", rimI: 1.0, amb: 0.5,  fill: "#e0d8ff" },
};

// Smoothly tracks pointer for subtle camera parallax
function CameraRig({ pointer }: { pointer: { x: number; y: number } }) {
  const { camera } = useThree();
  useFrame(() => {
    const tx = pointer.x * 0.4;
    const ty = 1.7 + pointer.y * 0.25;
    camera.position.x += (tx - camera.position.x) * 0.06;
    camera.position.y += (ty - camera.position.y) * 0.06;
    camera.lookAt(0, 0.1, 0);
  });
  return null;
}

// Real-time lights that shift with category mood and pointer position
function DynamicLights({
  pointer,
  categoryId,
}: {
  pointer: { x: number; y: number };
  categoryId: string;
}) {
  const keyRef = useRef<THREE.SpotLight>(null);
  const rimRef = useRef<THREE.PointLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const ambRef = useRef<THREE.AmbientLight>(null);

  // Animated current values, smoothly lerped each frame
  const cur = useRef({ keyI: 2.2, rimI: 1.1, amb: 0.35, breathe: 0 });
  const tmpColorKey = useRef(new THREE.Color("#ffe1b0"));
  const tmpColorRim = useRef(new THREE.Color("#ffd0a0"));
  const tmpColorFill = useRef(new THREE.Color("#cfe2ff"));

  useFrame((state, delta) => {
    const mood = LIGHT_MOODS[categoryId] ?? LIGHT_MOODS.paneer;

    // Breathing pulse — subtle, organic
    cur.current.breathe += delta;
    const pulse = 1 + Math.sin(cur.current.breathe * 1.4) * 0.04;

    // Pointer-driven boost: when pointer is high/right, key light gets brighter & rim sharpens
    const pBoostKey = 1 + pointer.y * 0.18;
    const pBoostRim = 1 + Math.abs(pointer.x) * 0.35 + pointer.y * 0.1;

    // Smooth lerp intensities
    const targetKey = mood.keyI * pBoostKey * pulse;
    const targetRim = mood.rimI * pBoostRim;
    const targetAmb = mood.amb + (1 - Math.abs(pointer.x)) * 0.05;
    cur.current.keyI += (targetKey - cur.current.keyI) * 0.08;
    cur.current.rimI += (targetRim - cur.current.rimI) * 0.1;
    cur.current.amb  += (targetAmb - cur.current.amb)  * 0.06;

    // Lerp colors toward mood
    tmpColorKey.current.lerp(new THREE.Color(mood.key), 0.05);
    tmpColorRim.current.lerp(new THREE.Color(mood.rim), 0.05);
    tmpColorFill.current.lerp(new THREE.Color(mood.fill), 0.05);

    if (keyRef.current) {
      keyRef.current.intensity = cur.current.keyI;
      keyRef.current.color.copy(tmpColorKey.current);
      // Key light drifts slightly with pointer for moving specular highlights
      keyRef.current.position.x = 2.5 + pointer.x * 0.9;
      keyRef.current.position.z = 2 + pointer.y * 0.6;
    }
    if (rimRef.current) {
      rimRef.current.intensity = cur.current.rimI;
      rimRef.current.color.copy(tmpColorRim.current);
      // Rim light orbits the plate based on pointer — this is what makes
      // the glossy gravy/syrup highlights slide alive across the surface
      const angle = pointer.x * Math.PI * 0.6;
      rimRef.current.position.x = Math.sin(angle) * 2.4;
      rimRef.current.position.z = -Math.cos(angle) * 2.4;
      rimRef.current.position.y = 1.1 + pointer.y * 0.5;
    }
    if (fillRef.current) {
      fillRef.current.color.copy(tmpColorFill.current);
      fillRef.current.intensity = 0.55 + (1 - pointer.y) * 0.1;
    }
    if (ambRef.current) {
      ambRef.current.intensity = cur.current.amb;
    }
  });

  return (
    <>
      <spotLight
        ref={keyRef}
        position={[2.5, 5, 2]}
        angle={0.55}
        penumbra={0.85}
        intensity={2.2}
        color={"#ffe1b0"}
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-bias={-0.0002}
      />
      <pointLight
        ref={rimRef}
        position={[-2.2, 1.4, -2]}
        intensity={1.1}
        color={"#ffd0a0"}
        distance={8}
        decay={1.8}
      />
      <directionalLight
        ref={fillRef}
        position={[-3, 2.5, -3]}
        intensity={0.55}
        color={"#cfe2ff"}
      />
      <ambientLight ref={ambRef} intensity={0.35} />
    </>
  );
}


export function MenuExperience() {
  const [catIndex, setCatIndex] = useState(0);
  const [varIndex, setVarIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });

  // Pointer parallax
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const category = MENU[catIndex];
  const variant = category.variants[varIndex];
  const variantsLen = category.variants.length;

  // Reset variant when category changes
  useEffect(() => {
    setVarIndex(0);
  }, [catIndex]);

  const nextVar = useCallback(
    () => setVarIndex((i) => Math.min(variantsLen - 1, i + 1)),
    [variantsLen]
  );
  const prevVar = useCallback(() => setVarIndex((i) => Math.max(0, i - 1)), []);
  const nextCat = useCallback(
    () => setCatIndex((i) => Math.min(MENU.length - 1, i + 1)),
    []
  );
  const prevCat = useCallback(() => setCatIndex((i) => Math.max(0, i - 1)), []);

  // Wheel & touch navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const triggerLock = () => {
      lockRef.current = true;
      window.setTimeout(() => (lockRef.current = false), 520);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (lockRef.current) return;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (horizontal) {
        if (e.deltaX > 18) { nextVar(); triggerLock(); }
        else if (e.deltaX < -18) { prevVar(); triggerLock(); }
      } else {
        if (e.deltaY > 18) { nextCat(); triggerLock(); }
        else if (e.deltaY < -18) { prevCat(); triggerLock(); }
      }
    };

    let tx = 0, ty = 0;
    const onTouchStart = (e: TouchEvent) => {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -40) nextVar();
        else if (dx > 40) prevVar();
      } else {
        if (dy < -40) nextCat();
        else if (dy > 40) prevCat();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [nextVar, prevVar, nextCat, prevCat]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextVar();
      else if (e.key === "ArrowLeft") prevVar();
      else if (e.key === "ArrowDown") nextCat();
      else if (e.key === "ArrowUp") prevCat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextVar, prevVar, nextCat, prevCat]);

  // Memoize Canvas children that don't change across dish swaps
  const stageStatic = useMemo(
    () => (
      <>
        <SoftShadows size={24} samples={12} focus={0.6} />
        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[6, 64]} />
          <meshStandardMaterial color={"#3a2418"} roughness={0.85} metalness={0.05} />
        </mesh>
        <ContactShadows
          position={[0, -0.44, 0]}
          opacity={0.7}
          blur={2.6}
          far={4}
          resolution={512}
          color={"#1a0f08"}
        />
        <Environment preset="apartment" />
      </>
    ),
    []
  );

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-background text-foreground select-none touch-none grain vignette"
    >
      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-30 flex items-start justify-between px-6 py-5 md:px-10 md:py-7">
        <div>
          <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Maison Spice · Est. 1972
          </div>
          <div className="mt-1 font-serif italic text-lg md:text-xl">The 3D Menu</div>
        </div>
        <div className="hidden text-right text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:block">
          <div>Scroll ↕ categories</div>
          <div>Swipe ↔ dishes</div>
        </div>
      </header>

      {/* Top progress bar (category) */}
      <div className="absolute left-0 right-0 top-0 z-30 h-[2px] bg-foreground/5">
        <div
          className="h-full bg-gradient-to-r from-accent via-primary to-accent transition-all duration-500 ease-out"
          style={{ width: `${((catIndex + 1) / MENU.length) * 100}%` }}
        />
      </div>

      {/* Vertical category rail (left) */}
      <nav className="absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 space-y-3 md:block">
        {MENU.map((c, i) => {
          const active = i === catIndex;
          return (
            <button
              key={c.id}
              onClick={() => setCatIndex(i)}
              className={`group block text-left transition-all duration-300 ${
                active ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-px transition-all duration-500 ${
                    active ? "w-8 bg-foreground" : "w-3 bg-muted-foreground/40 group-hover:w-5"
                  }`}
                />
                <span
                  className={`font-serif leading-none transition-all ${
                    active ? "text-2xl" : "text-base"
                  }`}
                >
                  {c.category}
                </span>
              </div>
              {active && (
                <div className="ml-11 mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {c.tagline}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3D Stage */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [0, 1.7, 3.4], fov: 36 }}
          gl={{ antialias: true, toneMappingExposure: 1.05, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#f3ebdc"]} />
          <fog attach="fog" args={["#f3ebdc", 6, 14]} />
          <CameraRig pointer={pointerRef.current} />
          {stageStatic}
          <group key={`${category.id}-${varIndex}`}>
            <Dish3D shape={category.shape} color={variant.color} accent={variant.accent} />
          </group>
        </Canvas>
      </div>

      {/* Dish info card (right) */}
      <div className="pointer-events-none absolute right-6 top-1/2 z-30 w-[320px] max-w-[42vw] -translate-y-1/2 text-right md:right-14">
        <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Dish {varIndex + 1} / {variantsLen}
        </div>
        <h1
          key={variant.name}
          className="dish-fade mt-3 font-serif text-3xl leading-tight md:text-4xl"
        >
          {variant.name}
        </h1>
        <p
          key={variant.description}
          className="text-rise mt-3 text-sm leading-relaxed text-muted-foreground"
        >
          {variant.description}
        </p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <span className="h-px w-10 bg-foreground/40" />
          <span className="font-serif text-2xl">{variant.price}</span>
        </div>
      </div>

      {/* Mobile category title (top center, only when rail hidden) */}
      <div className="absolute left-1/2 top-20 z-30 -translate-x-1/2 text-center md:hidden">
        <div className="font-serif text-2xl">{category.category}</div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {category.tagline}
        </div>
      </div>

      {/* Horizontal variant pager (bottom) */}
      <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-5 md:bottom-10 md:gap-6">
        <button
          onClick={prevVar}
          disabled={varIndex === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 backdrop-blur-md transition hover:bg-card hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
          aria-label="Previous dish"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          {category.variants.map((_, i) => (
            <button
              key={i}
              onClick={() => setVarIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === varIndex
                  ? "w-8 bg-foreground"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Dish ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={nextVar}
          disabled={varIndex === variantsLen - 1}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 backdrop-blur-md transition hover:bg-card hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
          aria-label="Next dish"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Vertical pager (bottom-right corner, out of card's way) */}
      <div className="absolute bottom-8 right-6 z-30 flex flex-col items-center gap-2 md:bottom-10">
        <button
          onClick={prevCat}
          disabled={catIndex === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70 backdrop-blur-md transition hover:bg-card disabled:opacity-30"
          aria-label="Previous category"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground tabular-nums">
          {String(catIndex + 1).padStart(2, "0")}
          <span className="mx-1 opacity-50">/</span>
          {String(MENU.length).padStart(2, "0")}
        </div>
        <button
          onClick={nextCat}
          disabled={catIndex === MENU.length - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70 backdrop-blur-md transition hover:bg-card disabled:opacity-30"
          aria-label="Next category"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
