"use client"
import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

function ScalesModel() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  const goldMaterial = { color: '#D4A94E', metalness: 0.85, roughness: 0.15 }
  const darkGold = { color: '#B8912F', metalness: 0.9, roughness: 0.1 }

  return (
    <group ref={group} scale={[0.9, 0.9, 0.9]} position={[0, -0.8, 0]}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.9, 0.15, 48]} />
        <meshStandardMaterial {...darkGold} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.08, 48]} />
        <meshStandardMaterial {...goldMaterial} />
      </mesh>

      {/* Center Pillar */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 3.3, 24]} />
        <meshStandardMaterial {...goldMaterial} />
      </mesh>

      {/* Pillar top sphere */}
      <mesh position={[0, 3.55, 0]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial {...goldMaterial} />
      </mesh>

      {/* Top Beam */}
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[3.4, 0.12, 0.12]} />
        <meshStandardMaterial {...goldMaterial} />
      </mesh>

      {/* Left Side */}
      <group position={[-1.6, 3.4, 0]}>
        {/* 3 chain strings */}
        {[-0.15, 0, 0.15].map((z, i) => (
          <mesh key={`l-${i}`} position={[0, -0.75, z]}>
            <cylinderGeometry args={[0.015, 0.015, 1.5, 8]} />
            <meshStandardMaterial {...darkGold} />
          </mesh>
        ))}
        {/* Pan */}
        <mesh position={[0, -1.55, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.06, 48]} />
          <meshStandardMaterial {...goldMaterial} />
        </mesh>
        {/* Pan rim */}
        <mesh position={[0, -1.52, 0]}>
          <torusGeometry args={[0.52, 0.025, 12, 48]} />
          <meshStandardMaterial {...darkGold} />
        </mesh>
      </group>

      {/* Right Side */}
      <group position={[1.6, 3.4, 0]}>
        {[-0.15, 0, 0.15].map((z, i) => (
          <mesh key={`r-${i}`} position={[0, -0.75, z]}>
            <cylinderGeometry args={[0.015, 0.015, 1.5, 8]} />
            <meshStandardMaterial {...darkGold} />
          </mesh>
        ))}
        <mesh position={[0, -1.55, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.06, 48]} />
          <meshStandardMaterial {...goldMaterial} />
        </mesh>
        <mesh position={[0, -1.52, 0]}>
          <torusGeometry args={[0.52, 0.025, 12, 48]} />
          <meshStandardMaterial {...darkGold} />
        </mesh>
      </group>
    </group>
  )
}

export default function ScalesOfJustice3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1.8, 6], fov: 40 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} />
        <pointLight position={[0, 5, 0]} intensity={0.3} color="#D4A94E" />
        <Float
          speed={1.5}
          rotationIntensity={0.2}
          floatIntensity={0.3}
          floatingRange={[-0.05, 0.05]}
        >
          <ScalesModel />
        </Float>
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
