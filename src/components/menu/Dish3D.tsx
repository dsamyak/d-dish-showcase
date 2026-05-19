import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { DishCategory } from "./dishes";

type Props = {
  shape: DishCategory["shape"];
  color: string;
  accent: string;
};

// Procedural 3D dish — plate + food on top, parameterized by shape preset.
export function Dish3D({ shape, color, accent }: Props) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.35;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={group} position={[0, -0.2, 0]}>
        {/* Plate */}
        <mesh receiveShadow castShadow position={[0, -0.18, 0]}>
          <cylinderGeometry args={[1.4, 1.3, 0.08, 64]} />
          <meshStandardMaterial color="#f6f1e7" roughness={0.4} metalness={0.05} />
        </mesh>
        <mesh receiveShadow position={[0, -0.13, 0]}>
          <cylinderGeometry args={[1.15, 1.15, 0.04, 64]} />
          <meshStandardMaterial color="#ece4d3" roughness={0.6} />
        </mesh>

        <FoodShape shape={shape} color={color} accent={accent} />
      </group>
    </Float>
  );
}

function FoodShape({ shape, color, accent }: Props) {
  if (shape === "curry") {
    return (
      <group position={[0, -0.08, 0]}>
        {/* Gravy disc */}
        <mesh castShadow>
          <cylinderGeometry args={[1.0, 1.0, 0.18, 48]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
        {/* Paneer cubes */}
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2;
          const r = 0.45 + (i % 2) * 0.2;
          return (
            <mesh key={i} position={[Math.cos(a) * r, 0.13, Math.sin(a) * r]} rotation={[0, a, 0]} castShadow>
              <boxGeometry args={[0.22, 0.22, 0.22]} />
              <meshStandardMaterial color={accent} roughness={0.5} />
            </mesh>
          );
        })}
        {/* Garnish */}
        <mesh position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#3a7a3a" />
        </mesh>
      </group>
    );
  }

  if (shape === "tikka") {
    return (
      <group position={[0, -0.05, 0]}>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2;
          const r = 0.55;
          return (
            <mesh key={i} position={[Math.cos(a) * r, 0.05, Math.sin(a) * r]} rotation={[0, a, 0.2]} castShadow>
              <sphereGeometry args={[0.28, 24, 24]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          );
        })}
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.32, 24, 24]} />
          <meshStandardMaterial color={accent} roughness={0.6} />
        </mesh>
        {/* lemon */}
        <mesh position={[0.85, 0.0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
          <meshStandardMaterial color="#f4d23a" />
        </mesh>
      </group>
    );
  }

  if (shape === "rice") {
    return (
      <group position={[0, -0.05, 0]}>
        <mesh castShadow>
          <coneGeometry args={[0.95, 0.55, 48]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        {/* spice / topping flecks */}
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const r = 0.3 + Math.random() * 0.5;
          return (
            <mesh key={i} position={[Math.cos(a) * r, 0.15 + Math.random() * 0.15, Math.sin(a) * r]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color={accent} />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (shape === "dosa") {
    return (
      <group position={[0, -0.05, 0]} rotation={[0, 0.3, 0]}>
        {/* rolled cone */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.28, 0.18, 1.8, 32]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        {/* chutney bowl */}
        <mesh position={[-0.7, 0.05, 0.6]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.18, 32]} />
          <meshStandardMaterial color={accent} roughness={0.6} />
        </mesh>
        <mesh position={[0.7, 0.05, 0.6]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.18, 32]} />
          <meshStandardMaterial color="#e85a2a" roughness={0.6} />
        </mesh>
      </group>
    );
  }

  // dessert
  return (
    <group position={[0, -0.02, 0]}>
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        const r = 0.45;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.1, Math.sin(a) * r]} castShadow>
            <sphereGeometry args={[0.28, 32, 32]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        );
      })}
      {/* syrup pool */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.06, 48]} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.1} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
