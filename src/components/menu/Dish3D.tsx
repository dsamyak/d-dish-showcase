import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { DishCategory } from "./dishes";

type Props = {
  shape: DishCategory["shape"];
  color: string;
  accent: string;
};

// ---------- Helpers ----------

function jitter(seed: number) {
  // deterministic pseudo random
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function Plate() {
  return (
    <group>
      {/* Outer rim */}
      <mesh receiveShadow castShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[1.55, 1.5, 0.06, 96]} />
        <meshPhysicalMaterial
          color="#f8f3ea"
          roughness={0.25}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
        />
      </mesh>
      {/* Inner well */}
      <mesh receiveShadow position={[0, -0.17, 0]}>
        <cylinderGeometry args={[1.25, 1.3, 0.04, 96]} />
        <meshPhysicalMaterial
          color="#efe7d6"
          roughness={0.4}
          clearcoat={0.4}
        />
      </mesh>
      {/* Thin gold ring */}
      <mesh position={[0, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.32, 1.36, 96]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.9} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------- Dish ----------

export function Dish3D({ shape, color, accent }: Props) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.3;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
      <group ref={group} position={[0, -0.15, 0]}>
        <Plate />
        <FoodShape shape={shape} color={color} accent={accent} />
      </group>
    </Float>
  );
}

function FoodShape({ shape, color, accent }: Props) {
  if (shape === "curry") return <CurryDish color={color} accent={accent} />;
  if (shape === "tikka") return <TikkaDish color={color} accent={accent} />;
  if (shape === "rice") return <RiceDish color={color} accent={accent} />;
  if (shape === "dosa") return <DosaDish color={color} accent={accent} />;
  return <DessertDish color={color} accent={accent} />;
}

// ---------- Curry (paneer / gravy) ----------

function CurryDish({ color, accent }: { color: string; accent: string }) {
  const cubes = useMemo(
    () =>
      Array.from({ length: 11 }).map((_, i) => {
        const a = (i / 11) * Math.PI * 2 + jitter(i) * 0.6;
        const r = 0.35 + jitter(i + 7) * 0.45;
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          y: 0.13 + jitter(i + 11) * 0.05,
          rot: jitter(i + 3) * Math.PI,
          tilt: (jitter(i + 5) - 0.5) * 0.4,
          size: 0.2 + jitter(i + 2) * 0.08,
        };
      }),
    []
  );

  return (
    <group position={[0, -0.07, 0]}>
      {/* Gravy pool with subtle gloss */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.2, 64]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.4}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          sheen={0.4}
          sheenColor={"#ffaa66"}
        />
      </mesh>
      {/* Oil shimmer ring */}
      <mesh position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.95, 64]} />
        <meshPhysicalMaterial
          color={"#ffd58a"}
          metalness={0.2}
          roughness={0.15}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Paneer cubes */}
      {cubes.map((c, i) => (
        <mesh
          key={i}
          position={[c.x, c.y, c.z]}
          rotation={[c.tilt, c.rot, c.tilt]}
          castShadow
        >
          <boxGeometry args={[c.size, c.size, c.size]} />
          <meshPhysicalMaterial color={accent} roughness={0.55} clearcoat={0.2} />
        </mesh>
      ))}
      {/* Cream swirl */}
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.03, 12, 48]} />
        <meshStandardMaterial color="#fff6e8" roughness={0.4} />
      </mesh>
      {/* Coriander leaves */}
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.2, 0.18, Math.sin(a) * 0.2]}
            rotation={[Math.PI / 2, 0, a]}
            scale={[0.12, 0.06, 1]}
          >
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color="#2f7a32" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

// ---------- Tikka / Chicken ----------

function TikkaDish({ color, accent }: { color: string; accent: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 0.5;
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          rot: a,
          tilt: (jitter(i) - 0.5) * 0.4,
          size: 0.26 + jitter(i + 4) * 0.08,
        };
      }),
    []
  );

  return (
    <group position={[0, -0.06, 0]}>
      {/* Onion bed */}
      <mesh position={[0, 0.0, 0]} castShadow>
        <cylinderGeometry args={[0.95, 0.95, 0.06, 48]} />
        <meshStandardMaterial color="#f3d8b5" roughness={0.8} />
      </mesh>
      {pieces.map((p, i) => (
        <group key={i} position={[p.x, 0.1, p.z]} rotation={[p.tilt, p.rot, p.tilt]}>
          <mesh castShadow>
            <sphereGeometry args={[p.size, 24, 24]} />
            <meshPhysicalMaterial
              color={color}
              roughness={0.65}
              clearcoat={0.4}
              clearcoatRoughness={0.4}
              sheen={0.3}
              sheenColor={"#3a1a0a"}
            />
          </mesh>
          {/* char spots */}
          <mesh position={[p.size * 0.5, p.size * 0.4, 0]}>
            <sphereGeometry args={[p.size * 0.18, 12, 12]} />
            <meshStandardMaterial color="#2a0f08" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Center piece */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <sphereGeometry args={[0.34, 32, 32]} />
        <meshPhysicalMaterial color={accent} roughness={0.55} clearcoat={0.3} />
      </mesh>
      {/* Lemon wedge */}
      <group position={[0.95, 0.08, 0.35]} rotation={[0, 0.6, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 24, 24, 0, Math.PI, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f4d23a" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.22, 24]} />
          <meshStandardMaterial color="#fff6b8" roughness={0.4} />
        </mesh>
      </group>
      {/* Mint chutney drizzle */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.7, 0.08, Math.sin(a) * 0.7]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color="#5fa84a" roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

// ---------- Rice / Biryani ----------

function RiceDish({ color, accent }: { color: string; accent: string }) {
  const grains = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => {
        const a = jitter(i) * Math.PI * 2;
        const r = jitter(i + 9) * 0.85;
        const y = 0.05 + jitter(i + 1) * 0.45;
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          y,
          rot: jitter(i + 2) * Math.PI,
          tilt: jitter(i + 3) * Math.PI,
          tint: jitter(i + 4),
        };
      }),
    []
  );

  return (
    <group position={[0, -0.05, 0]}>
      {/* Mound */}
      <mesh castShadow>
        <coneGeometry args={[0.95, 0.6, 48]} />
        <meshStandardMaterial color="#f5ecd2" roughness={0.95} />
      </mesh>
      {/* Saffron strands */}
      {grains.map((g, i) => (
        <mesh
          key={i}
          position={[g.x * 0.9, g.y, g.z * 0.9]}
          rotation={[g.tilt, g.rot, g.tilt * 0.5]}
        >
          <capsuleGeometry args={[0.025, 0.07, 4, 8]} />
          <meshStandardMaterial
            color={g.tint > 0.7 ? color : g.tint > 0.45 ? accent : "#f8efd4"}
            roughness={0.85}
          />
        </mesh>
      ))}
      {/* Whole spices */}
      <mesh position={[0.3, 0.4, 0.2]} rotation={[0.5, 0.3, 0]}>
        <coneGeometry args={[0.05, 0.18, 12]} />
        <meshStandardMaterial color="#4a2a18" roughness={0.85} />
      </mesh>
      <mesh position={[-0.25, 0.42, -0.1]} rotation={[1.2, 0.6, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#3a1a0a" roughness={0.85} />
      </mesh>
      {/* Mint */}
      <mesh position={[0, 0.62, 0]} rotation={[0.3, 0, 0]} scale={[0.14, 0.07, 1]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color="#3a8a3a" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ---------- Dosa ----------

function DosaDish({ color, accent }: { color: string; accent: string }) {
  return (
    <group position={[0, -0.05, 0]} rotation={[0, 0.25, 0]}>
      {/* Rolled dosa */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.2, 2.0, 48, 1, false]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.7}
          clearcoat={0.3}
          clearcoatRoughness={0.6}
        />
      </mesh>
      {/* Crispy ends */}
      <mesh position={[-1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.21, 0.15, 0.1, 32]} />
        <meshStandardMaterial color="#8a4a1a" roughness={0.9} />
      </mesh>
      <mesh position={[1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.21, 0.1, 32]} />
        <meshStandardMaterial color="#8a4a1a" roughness={0.9} />
      </mesh>
      {/* Coconut chutney bowl */}
      <group position={[-0.7, 0.0, 0.7]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.26, 0.2, 0.16, 32]} />
          <meshStandardMaterial color="#ddd5c2" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.22, 0.18, 0.06, 32]} />
          <meshPhysicalMaterial color={accent} roughness={0.4} clearcoat={0.5} />
        </mesh>
      </group>
      {/* Sambar bowl */}
      <group position={[0.7, 0.0, 0.7]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.26, 0.2, 0.16, 32]} />
          <meshStandardMaterial color="#ddd5c2" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.22, 0.18, 0.06, 32]} />
          <meshPhysicalMaterial color="#c8531e" roughness={0.45} clearcoat={0.5} />
        </mesh>
      </group>
    </group>
  );
}

// ---------- Dessert ----------

function DessertDish({ color, accent }: { color: string; accent: string }) {
  return (
    <group position={[0, -0.02, 0]}>
      {/* Syrup pool */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.06, 64]} />
        <meshPhysicalMaterial
          color={accent}
          roughness={0.2}
          metalness={0.1}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Dumplings */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = i === 5 ? 0 : 0.5;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, 0.18, Math.sin(a) * r]}
            castShadow
          >
            <sphereGeometry args={[0.28, 32, 32]} />
            <meshPhysicalMaterial
              color={color}
              roughness={0.45}
              clearcoat={0.7}
              clearcoatRoughness={0.2}
              sheen={0.5}
              sheenColor={"#ffb86a"}
            />
          </mesh>
        );
      })}
      {/* Pistachio crumbs */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = jitter(i) * Math.PI * 2;
        const r = jitter(i + 4) * 0.7;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.36, Math.sin(a) * r]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#7aa84a" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}
