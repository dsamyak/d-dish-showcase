import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, SoftShadows } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { MENU } from "./dishes";
import { Dish3D } from "./Dish3D";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

export function MenuExperience() {
  const [catIndex, setCatIndex] = useState(0);
  const [varIndex, setVarIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);

  const category = MENU[catIndex];
  const variant = category.variants[varIndex];

  // Reset variant when category changes
  useEffect(() => {
    setVarIndex(0);
  }, [catIndex]);

  // Wheel & touch navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const triggerLock = () => {
      lockRef.current = true;
      window.setTimeout(() => (lockRef.current = false), 550);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (lockRef.current) return;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (horizontal) {
        if (e.deltaX > 20) {
          setVarIndex((i) => Math.min(category.variants.length - 1, i + 1));
          triggerLock();
        } else if (e.deltaX < -20) {
          setVarIndex((i) => Math.max(0, i - 1));
          triggerLock();
        }
      } else {
        if (e.deltaY > 20) {
          setCatIndex((i) => Math.min(MENU.length - 1, i + 1));
          triggerLock();
        } else if (e.deltaY < -20) {
          setCatIndex((i) => Math.max(0, i - 1));
          triggerLock();
        }
      }
    };

    let tx = 0;
    let ty = 0;
    const onTouchStart = (e: TouchEvent) => {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -40) setVarIndex((i) => Math.min(category.variants.length - 1, i + 1));
        else if (dx > 40) setVarIndex((i) => Math.max(0, i - 1));
      } else {
        if (dy < -40) setCatIndex((i) => Math.min(MENU.length - 1, i + 1));
        else if (dy > 40) setCatIndex((i) => Math.max(0, i - 1));
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [category.variants.length]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setVarIndex((i) => Math.min(category.variants.length - 1, i + 1));
      else if (e.key === "ArrowLeft") setVarIndex((i) => Math.max(0, i - 1));
      else if (e.key === "ArrowDown") setCatIndex((i) => Math.min(MENU.length - 1, i + 1));
      else if (e.key === "ArrowUp") setCatIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [category.variants.length]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-background text-foreground select-none touch-none grain vignette"
    >
      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-8 py-6">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Maison Spice · Est. 1972</div>
          <div className="mt-1 text-lg font-serif italic">The 3D Menu</div>
        </div>
        <div className="text-right text-xs uppercase tracking-[0.25em] text-muted-foreground">
          <div>Scroll ↕ categories</div>
          <div>Swipe ↔ dishes</div>
        </div>
      </header>

      {/* Vertical category rail (left) */}
      <nav className="absolute left-8 top-1/2 z-20 -translate-y-1/2 space-y-3">
        {MENU.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setCatIndex(i)}
            className={`block text-left transition-all duration-300 ${
              i === catIndex
                ? "text-foreground"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          >
            <div
              className={`font-serif ${i === catIndex ? "text-2xl" : "text-base"} leading-none transition-all`}
            >
              {c.category}
            </div>
            {i === catIndex && (
              <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {c.tagline}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* 3D Stage */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 1.7, 3.4], fov: 36 }}
          gl={{ antialias: true, toneMappingExposure: 1.05 }}
        >
          <color attach="background" args={["#f3ebdc"]} />
          <fog attach="fog" args={["#f3ebdc", 6, 14]} />
          <SoftShadows size={28} samples={16} focus={0.6} />

          {/* Warm key light (overhead pendant feel) */}
          <spotLight
            position={[2.5, 5, 2]}
            angle={0.55}
            penumbra={0.8}
            intensity={2.2}
            color={"#ffe1b0"}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0002}
          />
          {/* Cool rim from behind */}
          <directionalLight position={[-3, 2.5, -3]} intensity={0.5} color={"#cfe2ff"} />
          {/* Soft fill */}
          <ambientLight intensity={0.35} />

          {/* Wooden table */}
          <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[6, 64]} />
            <meshStandardMaterial color={"#3a2418"} roughness={0.85} metalness={0.05} />
          </mesh>

          <group key={`${category.id}-${varIndex}`}>
            <Dish3D shape={category.shape} color={variant.color} accent={variant.accent} />
          </group>

          <ContactShadows position={[0, -0.44, 0]} opacity={0.7} blur={2.6} far={4} resolution={1024} color={"#1a0f08"} />
          <Environment preset="apartment" />
        </Canvas>
      </div>


      {/* Dish info card (right) */}
      <div className="pointer-events-none absolute right-8 top-1/2 z-20 w-[340px] max-w-[40vw] -translate-y-1/2 text-right">
        <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Dish {varIndex + 1} / {category.variants.length}
        </div>
        <h1
          key={variant.name}
          className="mt-3 font-serif text-4xl leading-tight animate-[fadeIn_0.5s_ease-out]"
        >
          {variant.name}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {variant.description}
        </p>
        <div className="mt-5 font-serif text-2xl">{variant.price}</div>
      </div>

      {/* Horizontal variant pager (bottom) */}
      <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 flex items-center gap-6">
        <button
          onClick={() => setVarIndex((i) => Math.max(0, i - 1))}
          disabled={varIndex === 0}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 backdrop-blur transition hover:bg-card disabled:opacity-30"
          aria-label="Previous dish"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          {category.variants.map((_, i) => (
            <button
              key={i}
              onClick={() => setVarIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === varIndex ? "w-8 bg-foreground" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Dish ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => setVarIndex((i) => Math.min(category.variants.length - 1, i + 1))}
          disabled={varIndex === category.variants.length - 1}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 backdrop-blur transition hover:bg-card disabled:opacity-30"
          aria-label="Next dish"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Vertical pager (right edge) */}
      <div className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3">
        <button
          onClick={() => setCatIndex((i) => Math.max(0, i - 1))}
          disabled={catIndex === 0}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/60 backdrop-blur transition hover:bg-card disabled:opacity-30"
          aria-label="Previous category"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground rotate-90 origin-center py-3">
          {catIndex + 1} / {MENU.length}
        </div>
        <button
          onClick={() => setCatIndex((i) => Math.min(MENU.length - 1, i + 1))}
          disabled={catIndex === MENU.length - 1}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/60 backdrop-blur transition hover:bg-card disabled:opacity-30"
          aria-label="Next category"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
