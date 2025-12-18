"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Environment, Stars, Text, useGLTF, useTexture } from "@react-three/drei"
import * as THREE from "three"
import type { ViewMode } from "@/types/view-mode"
import gsap from "gsap"

interface RedoubtSceneProps {
  type: ViewMode
  section: number
  mousePosition: { x: number; y: number }
  isGPRActive: boolean
}

const CAMERA_POSITIONS: Record<ViewMode, Array<{ position: { x: number; y: number; z: number }; lookAt: { x: number; y: number; z: number } }>> = {
  lobby: [],
  "redoubt-4": [
    { position: { x: 150, y: 50, z: 100 }, lookAt: { x: 0, y: 0, z: 100 } },
    { position: { x: -150, y: 55, z: 125 }, lookAt: { x: 0, y: 32, z: -50 } },
    { position: { x: 125, y: 60, z: -200 }, lookAt: { x: 0, y: 38, z: 50 } },
    { position: { x: -175, y: 48, z: -150 }, lookAt: { x: 0, y: 40, z: -25 } },
  ],
  "redoubt-5": [
    { position: { x: 0, y: 2, z: 8 }, lookAt: { x: 0, y: 0, z: 0 } },
    { position: { x: -6, y: 3, z: 6 }, lookAt: { x: 0, y: 0, z: 0 } },
    { position: { x: -8, y: 2, z: 0 }, lookAt: { x: 0, y: 0, z: 0 } },
    { position: { x: -6, y: 4, z: -6 }, lookAt: { x: 0, y: 0, z: 0 } },
  ],
  "coming-soon": [
    { position: { x: 0, y: 2, z: 8 }, lookAt: { x: 0, y: 0, z: 0 } },
    { position: { x: 0, y: 5, z: 5 }, lookAt: { x: 0, y: 0, z: 0 } },
    { position: { x: 5, y: 2, z: 5 }, lookAt: { x: 0, y: 0, z: 0 } },
    { position: { x: -5, y: 3, z: 5 }, lookAt: { x: 0, y: 0, z: 0 } },
  ],
}

export function RedoubtScene({ type, section, mousePosition, isGPRActive }: RedoubtSceneProps) {
  const { camera, gl } = useThree()
  const fortRef = useRef<THREE.Group>(null)
  const cameraTargetRef = useRef(new THREE.Vector3(0, 2, 0))
  const easedLookAtRef = useRef(new THREE.Vector3(0, 2, 0))
  const targetDirectionRef = useRef(new THREE.Vector3(0, 0, -1))
  const originalCameraPositionRef = useRef(new THREE.Vector3())
  const isGPRModeRef = useRef(false)

  useEffect(() => {
    gl.localClippingEnabled = true
  }, [gl])

  useEffect(() => {
    if (isGPRModeRef.current) {
      return
    }

    const positions = CAMERA_POSITIONS[type] || CAMERA_POSITIONS["redoubt-4"]
    const cameraSetting = positions[section] || positions[0]
    const newPosition = cameraSetting.position
    const newLookAt = cameraSetting.lookAt

    originalCameraPositionRef.current.set(newPosition.x, newPosition.y, newPosition.z)

    gsap.to(camera.position, {
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
      duration: 4,
      ease: "power2.inOut",
    })

    gsap.to(cameraTargetRef.current, {
      x: newLookAt.x,
      y: newLookAt.y,
      z: newLookAt.z,
      duration: 1.5,
      ease: "power2.inOut",
    })
  }, [section, camera, type])

  useEffect(() => {
    if (isGPRActive && type === "redoubt-4" && section === 0) {
      if (!isGPRModeRef.current) {
        isGPRModeRef.current = true
        const positions = CAMERA_POSITIONS[type]
        const cameraSetting = positions[section]
        const lookAtPos = cameraSetting.lookAt
        const perpendicularOffset = 15
        const gprCameraPos = new THREE.Vector3(lookAtPos.x + perpendicularOffset, lookAtPos.y, lookAtPos.z)

        gsap.to(camera.position, {
          x: gprCameraPos.x,
          y: gprCameraPos.y,
          z: gprCameraPos.z,
          duration: 2,
          ease: "power2.inOut",
        })
      }
    } else {
      if (isGPRModeRef.current) {
        isGPRModeRef.current = false
      }
    }
  }, [isGPRActive, type, section, camera])

  useEffect(() => {
    const maxAngleRadiansX = 20 * (Math.PI / 180)
    const maxAngleRadiansY = 20 * (Math.PI / 180)

    targetDirectionRef.current.x = THREE.MathUtils.clamp(
      mousePosition.x * maxAngleRadiansX,
      -maxAngleRadiansX,
      maxAngleRadiansX,
    )
    targetDirectionRef.current.y = THREE.MathUtils.clamp(
      -mousePosition.y * maxAngleRadiansY,
      -maxAngleRadiansY,
      maxAngleRadiansY,
    )
  }, [mousePosition])

  useFrame(() => {
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
      <ambientLight intensity={0.1} />
      <hemisphereLight intensity={0.1} groundColor="#444444" />
      <directionalLight position={[10, 10, 5]} intensity={0.2} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.1} />
      <pointLight position={[0, 5, 0]} intensity={0.2} color="#ffffff" />

      <Environment preset="sunset" />
      {type !== "redoubt-4" && (
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      )}

      <axesHelper args={[10]} />
      <gridHelper args={[20, 20]} />

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>

      {CAMERA_POSITIONS[type]?.map((cameraSetting, index) => (
        <group key={index} position={[cameraSetting.lookAt.x, cameraSetting.lookAt.y, cameraSetting.lookAt.z]}>
          <mesh>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshBasicMaterial color={section === index ? "#00ff00" : "#ffff00"} />
          </mesh>
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
            toneMapped={false}
            depthTest={false}
            renderOrder={10}
          >
            {`Pos ${index + 1}`}
          </Text>
        </group>
      ))}

      {isGPRActive && type === "redoubt-4" && section === 0 && (
        <GPRVisualization lookAtPosition={CAMERA_POSITIONS["redoubt-4"][0].lookAt} />
      )}

      <group ref={fortRef}>
        <PlaceholderModel isGPRActive={isGPRActive} type={type} section={section} />
      </group>
    </>
  )
}

function GPRVisualization({ lookAtPosition }: { lookAtPosition: { x: number; y: number; z: number } }) {
  const gprTexture = useTexture("/images/gpr-placeholder.png")
  const planeWidth = 15
  const planeHeight = 10
  const soilPlaneWidth = 500
  const soilPlaneHeight = 500

  return (
    <>
      <mesh
        position={[lookAtPosition.x - 1, lookAtPosition.y, lookAtPosition.z]}
        rotation={[0, Math.PI / 2, 0]}
        renderOrder={2}
      >
        <planeGeometry args={[soilPlaneWidth, soilPlaneHeight]} />
        <meshBasicMaterial color="#6B4423" side={THREE.DoubleSide} transparent opacity={0.6} depthWrite={false} />
      </mesh>

      <mesh
        position={[lookAtPosition.x - 0.5, lookAtPosition.y - planeHeight / 2, lookAtPosition.z]}
        rotation={[0, Math.PI / 2, 0]}
        renderOrder={3}
      >
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial map={gprTexture} side={THREE.DoubleSide} transparent opacity={0.95} />
      </mesh>
    </>
  )
}

useTexture.preload("/images/gpr-placeholder.png")

function PlaceholderModel({ isGPRActive, type, section }: { isGPRActive: boolean; type: ViewMode; section: number }) {
  const modelRef = useRef<THREE.Group>(null)
  const { camera, gl } = useThree()
  const clippingPlaneRef = useRef<THREE.Plane | null>(null)
  const materialsRef = useRef<THREE.Material[]>([])
  const { scene } = useGLTF("/models/castle-placeholder.glb")

  useEffect(() => {
    // Collect placeholder materials
    const materials: THREE.Material[] = []
    if (scene) {
      scene.traverse((child) => {
        const mesh = child as unknown as THREE.Mesh
        if (mesh && mesh.isMesh && mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          mats.forEach((mat) => {
            const material = mat as THREE.MeshStandardMaterial
            material.side = THREE.DoubleSide
            material.depthWrite = true
            materials.push(material)
          })
          mesh.renderOrder = 1
        }
      })
    }
    materialsRef.current = materials
  }, [])

  useEffect(() => {
    if (!materialsRef.current.length) return

    if (isGPRActive && type === "redoubt-4" && section === 0) {
      const lookAtPos = CAMERA_POSITIONS["redoubt-4"][0].lookAt
      const gprPosition = new THREE.Vector3(lookAtPos.x, lookAtPos.y, lookAtPos.z)

      const planeNormal = new THREE.Vector3(-1, 0, 0)
      clippingPlaneRef.current = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, gprPosition)

      console.log("[v0] Applying YZ clipping plane at position:", gprPosition)
      console.log("[v0] Plane normal (should be -1,0,0):", planeNormal)

      materialsRef.current.forEach((material) => {
        const mat = material as any
        mat.clippingPlanes = [clippingPlaneRef.current!]
        mat.clipShadows = true
        mat.needsUpdate = true
      })
    } else {
      if (clippingPlaneRef.current) {
        console.log("[v0] Removing clipping plane")
        clippingPlaneRef.current = null
        materialsRef.current.forEach((material) => {
          const mat = material as any
          mat.clippingPlanes = []
          mat.needsUpdate = true
        })
      }
    }
  }, [isGPRActive, type, section])

  return <primitive ref={modelRef} object={scene.clone()} position={[0, 0, 0]} scale={2} />
}

useGLTF.preload("/models/castle-placeholder.glb")
