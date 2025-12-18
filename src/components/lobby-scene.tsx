"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Environment, Stars, useGLTF, useTexture } from "@react-three/drei"
import * as THREE from "three"
import gsap from "gsap"

interface LobbySceneProps {
  section: number
  mousePosition: { x: number; y: number }
}

const CAMERA_POSITIONS = [
  { position: { x: -8, y: 2, z: 20 }, lookAt: { x: 20, y: 2, z: -100 } }, // Section 0: Hero/Overview
  // Section 1: Maps of West Point — same position as Section 0 but rotated ~90° to the right
  { position: { x: -4, y: 5, z: 20 }, lookAt: { x: 112, y: 12, z: 20 } },
  // Section 2: Greenleaf plan — same camera position, opposite lookAt direction as Section 1
  { position: { x: -3, y: 5, z: 20 }, lookAt: { x: -112, y: 12, z: 20 } },
  { position: { x: -8, y: 2, z: 5 }, lookAt: { x: -8, y: 2, z: -100 } }, // Section 3: Redoubt 4 (left)
  { position: { x: 17, y: 2, z: 5 }, lookAt: { x: 17, y: 2, z: -100 } }, // Section 4: Redoubt 5 (center)
  { position: { x: 42, y: 2, z: 5 }, lookAt: { x: 42, y: 2, z: -100 } }, // Section 5: Coming Soon (right)
]

function LobbyModel() {
  // Load lobby model from public/models/lobby.glb
  const { scene } = useGLTF("/models/lobby.glb")
  return <primitive object={scene} position={[17, 0, 0]} scale={4} />
}

function PictureFrame({
  position,
  imageUrl,
  rotation,
  scale,
}: {
  position: [number, number, number]
  imageUrl: string
  rotation?: [number, number, number]
  scale?: number
}) {
  const texture = useTexture(imageUrl)

  return (
    <group position={position} rotation={rotation} scale={scale ?? 1}>
      {/* Frame border */}
      <mesh>
        <boxGeometry args={[8.4, 6.4, 0.3]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>
      {/* Image */}
      <mesh position={[0, 0, 0.16]}>
        <planeGeometry args={[7.6, 5.6]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function LobbyScene({ section, mousePosition }: LobbySceneProps) {
  const { camera } = useThree()
  const groupRef = useRef<any>(null)
  const cameraTargetRef = useRef(new THREE.Vector3(17, 2, -100))
  const easedLookAtRef = useRef(new THREE.Vector3(17, 2, -100))
  const targetDirectionRef = useRef(new THREE.Vector3(0, 0, -1))
  const isTransitioningRef = useRef<boolean>(false)
  const prevLookAtRef = useRef(new THREE.Vector3(17, 2, -100))
  const transitionStartRef = useRef(0)
  const transitionDurationMsRef = useRef(4000)
  const endLookAtRef = useRef(new THREE.Vector3(17, 2, -100))

  useEffect(() => {
    const cameraSetting = CAMERA_POSITIONS[section] || CAMERA_POSITIONS[0]
    const newPosition = cameraSetting.position
    const newLookAt = cameraSetting.lookAt
    // Capture stable start and end states for the transition
    prevLookAtRef.current.copy(cameraTargetRef.current)
    endLookAtRef.current.set(newLookAt.x, newLookAt.y, newLookAt.z)
    isTransitioningRef.current = true
    transitionStartRef.current = performance.now()

    gsap.to(camera.position, {
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
      duration: 4,
      ease: "power2.inOut",
    })

    // Set the target immediately; we will animate yaw manually for smoothness
    cameraTargetRef.current.set(newLookAt.x, newLookAt.y, newLookAt.z)
  }, [section, camera])

  useEffect(() => {
    const maxAngleRadiansX = 20 * (Math.PI / 180)
    const maxAngleRadiansY = 20 * (Math.PI / 180)

    targetDirectionRef.current.x = THREE.MathUtils.clamp(
      mousePosition.x * maxAngleRadiansX,
      -maxAngleRadiansX,
      maxAngleRadiansX,
    )
    targetDirectionRef.current.y = THREE.MathUtils.clamp(
      mousePosition.y * maxAngleRadiansY,
      -maxAngleRadiansY,
      maxAngleRadiansY,
    )
  }, [mousePosition])

  useFrame(() => {
    if (isTransitioningRef.current) {
      const now = performance.now()
      let t = (now - transitionStartRef.current) / transitionDurationMsRef.current
      if (t >= 1) {
        t = 1
        isTransitioningRef.current = false
        // Snap eased target to final to avoid handoff jerk on next frame
        easedLookAtRef.current.copy(cameraTargetRef.current)
      }

      // Eased interpolation (smooth in/out)
      const easeInOut = (p: number) =>
        p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
      const et = easeInOut(t)

      // Interpolate yaw only (horizontal), interpolate XZ radius and Y for smoothness
      const camPos = camera.position
      const startYaw = Math.atan2(prevLookAtRef.current.z - camPos.z, prevLookAtRef.current.x - camPos.x)
      const endYaw = Math.atan2(endLookAtRef.current.z - camPos.z, endLookAtRef.current.x - camPos.x)
      let delta = endYaw - startYaw
      delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI
      const yaw = startYaw + delta * et
      const startRadius = new THREE.Vector2(
        prevLookAtRef.current.x - camPos.x,
        prevLookAtRef.current.z - camPos.z,
      ).length()
      const endRadius = new THREE.Vector2(
        endLookAtRef.current.x - camPos.x,
        endLookAtRef.current.z - camPos.z,
      ).length()
      const radius = THREE.MathUtils.lerp(startRadius, endRadius, et)
      const lookY = THREE.MathUtils.lerp(prevLookAtRef.current.y, endLookAtRef.current.y, et)
      const lookX = camPos.x + Math.cos(yaw) * radius
      const lookZ = camPos.z + Math.sin(yaw) * radius
      camera.lookAt(lookX, lookY, lookZ)
      return
    }

    const direction = new THREE.Vector3()
    direction.set(targetDirectionRef.current.x, targetDirectionRef.current.y, -1).normalize()
    direction.applyQuaternion(camera.quaternion)

    const rawLookAtTarget = camera.position.clone().add(direction.multiplyScalar(50))

    easedLookAtRef.current.lerp(rawLookAtTarget, 0.07)

    const finalLookAt = cameraTargetRef.current.clone().lerp(easedLookAtRef.current, 0.3)
    camera.lookAt(finalLookAt)
  })

  return (
    <>
      <ambientLight intensity={5} color="#c0c9fc" />
      <pointLight position={[2, -5, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />

      <Environment preset="sunset" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <group ref={groupRef}>
        {/* Picture frame for Redoubt 4 - Section 1: lookAt (-8, 2, -100) + 0.9 * (camera (-8, 2, 5) - lookAt) */}
        <PictureFrame position={[-6.5, 3.2, -5.5]} imageUrl="/images/redoubt4.png" />

        {/* Picture frame for Redoubt 5 - Section 2: lookAt (17, 2, -100) + 0.9 * (camera (17, 2, 5) - lookAt) */}
        <PictureFrame position={[18.5, 3.2, -5.5]} imageUrl="/images/ccaa-logo-square.jpg" />

        {/* Picture frame for Coming Soon - Section 3: lookAt (42, 2, -100) + 0.9 * (camera (42, 2, 5) - lookAt) */}
        <PictureFrame position={[43.5, 3.2, -5.5]} imageUrl="/images/ccaa-logo-square.jpg" />

        {/* Maps of West Point framed image at absolute position, facing -X */}
        <PictureFrame
          position={[4, 6, 22]}
          imageUrl="/images/west point redoubts map.png"
          rotation={[0, -Math.PI / 2, 0]}
          scale={1.5}
        />

        {/* Captain Moses Greenleaf plan, same size/distance, facing +X (opposite) */}
        <PictureFrame
          position={[-12, 6, 18]}
          imageUrl="/images/greenleaf.png"
          rotation={[0, Math.PI / 2, 0]}
          scale={1.5}
        />

        {/* Lobby environment model */}
        <LobbyModel />
      </group>
    </>
  )
}

// Preload GLTF to avoid runtime fetch hitches
useGLTF.preload("/models/lobby.glb")
// Preload textures used in picture frames
useTexture.preload("/images/redoubt4.png")
useTexture.preload("/images/ccaa-logo-square.jpg")
useTexture.preload("/images/west point redoubts map.png")
useTexture.preload("/images/greenleaf.png")
