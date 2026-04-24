"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Billboard, Environment, RoundedBox, Stars, Text, useGLTF, useTexture } from "@react-three/drei"
import * as THREE from "three"

/** Configure a texture for high-resolution display on 3D frames (sharp filtering, anisotropy, correct color space). */
function useHighQualityTexture(imageUrl: string) {
  const gl = useThree((s) => s.gl)
  const texture = useTexture(imageUrl, (tex: THREE.Texture) => {
    tex.minFilter = THREE.LinearMipmapLinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = true
    tex.colorSpace = THREE.SRGBColorSpace
  })
  useEffect(() => {
    if (!texture || typeof (gl as { getMaxAnisotropy?: () => number }).getMaxAnisotropy !== "function") return
    const maxAnisotropy = (gl as { getMaxAnisotropy: () => number }).getMaxAnisotropy()
    texture.anisotropy = maxAnisotropy
  }, [texture, gl])
  return texture
}
import gsap from "gsap"

interface LobbySceneProps {
  section: number
  mousePosition: { x: number; y: number }
  onFrameClick?: (imageUrl: string) => void
  /** Desktop Redoubt 4 (section 3): 3D LiDAR tour CTA — same intent as primary CSS buttons */
  onLidarTourClick?: () => void
}

const CAMERA_POSITIONS = [
  { position: { x: -8, y: 2, z: 20 }, lookAt: { x: 20, y: 2, z: -100 } }, // Section 0: Hero/Overview
  { position: { x: -4, y: 5, z: 20 }, lookAt: { x: 112, y: 12, z: 20 } }, // Section 1: Maps of West Point
  { position: { x: -3, y: 5, z: 20 }, lookAt: { x: -112, y: 12, z: 20 } }, // Section 2: Greenleaf plan
  { position: { x: -8, y: 2, z: 5 }, lookAt: { x: -8, y: 2, z: -100 } }, // Section 3: Redoubt 4 (left)
  { position: { x: 17, y: 2, z: 5 }, lookAt: { x: 17, y: 2, z: -100 } }, // Section 4: Fort Clinton (center)
  { position: { x: 42, y: 2, z: 5 }, lookAt: { x: 42, y: 2, z: -100 } }, // Section 5: Fort Putnam (right)
  { position: { x: 60.75, y: 2, z: 5 }, lookAt: { x: 60.75, y: 2, z: -100 } }, // Section 6: Redoubt 2 (-Z row)
  { position: { x: 60.75, y: 2, z: 5 }, lookAt: { x: 60.75, y: 2, z: 110 } }, // Section 7: Batteries (+Z row, across from Redoubt 2)
  { position: { x: 42, y: 2, z: 5 }, lookAt: { x: 42, y: 2, z: 110 } }, // Section 8: Fort Webb (+Z row, across from Fort Putnam)
  { position: { x: 21.75, y: 2, z: 5 }, lookAt: { x: 21.75, y: 2, z: 110 } }, // Section 9: Additional Sites (+Z row, 20% toward Fort Webb to avoid wall clip)
  { position: { x: 21.75, y: 2, z: 5 }, lookAt: { x: 21.75, y: 2, z: 110 } }, // Section 10: Cultural Heritage (same as 9)
]

function getAdjustedPosition(
  position: { x: number; y: number; z: number },
  lookAt: { x: number; y: number; z: number },
  distanceOffset: number,
) {
  if (distanceOffset === 0) return position
  const dir = new THREE.Vector3(position.x - lookAt.x, position.y - lookAt.y, position.z - lookAt.z)
  const len = dir.length()
  if (len === 0) return position
  dir.normalize().multiplyScalar(distanceOffset)
  return { x: position.x + dir.x, y: position.y + dir.y, z: position.z + dir.z }
}

function LobbyModel() {
  // Load lobby model from public/models/lobby.glb
  const { scene } = useGLTF("/models/lobby.glb")
  return <primitive object={scene} position={[17, 0, 0]} scale={4} />
}

/** Large 3D CTA in front of the Redoubt 4 frame (desktop + section 3 only). Darker royal blue with a slight indigo/violet shift vs. flat UI blues. */
function LiDARRTourButton3D({ visible, onClick }: { visible: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  const scaleRef = useRef(1)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    const target = hovered ? 1.06 : 1
    scaleRef.current += (target - scaleRef.current) * Math.min(1, delta * 12)
    if (groupRef.current) {
      const s = scaleRef.current
      groupRef.current.scale.setScalar(s)
    }
  })

  useEffect(() => {
    if (!visible) document.body.style.cursor = "auto"
  }, [visible])

  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto"
    }
  }, [])

  if (!visible) return null

  return (
    <Billboard position={[-6.9, 0.65, -2.28]} follow>
      <group ref={groupRef}>
        <RoundedBox
          args={[7.6, 1.22, 0.22]}
          radius={0.14}
          smoothness={4}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = "pointer"
          }}
          onPointerOut={() => {
            setHovered(false)
            document.body.style.cursor = "auto"
          }}
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
        >
          <meshStandardMaterial
            color={hovered ? "#2e46c6" : "#2237a3"}
            roughness={0.55}
            metalness={0}
            emissive="#000000"
            emissiveIntensity={0}
          />
        </RoundedBox>
        <Text
          position={[0, 0, 0.13]}
          fontSize={0.3}
          fontWeight={700}
          maxWidth={7.15}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#ffffff"
        >
          Take Interactive LiDAR Tour
        </Text>
      </group>
    </Billboard>
  )
}

const FRAME_TEXTURE_URL = "/images/frametexture.png"

/** Pill shape (rectangle with semicircular ends) for gold rim strips; length along x, width along y */
function createPillShape(length: number, width: number): THREE.Shape {
  const r = width / 2
  const leftX = -length / 2 + r
  const rightX = length / 2 - r
  const shape = new THREE.Shape()
  shape.moveTo(leftX, -r)
  shape.lineTo(leftX, r)
  shape.absarc(rightX, 0, r, Math.PI / 2, -Math.PI / 2, false)
  shape.lineTo(leftX, -r)
  shape.absarc(leftX, 0, r, -Math.PI / 2, Math.PI / 2, false)
  return shape
}

function PictureFrame({
  position,
  imageUrl,
  rotation,
  scale,
  onFrameClick,
}: {
  position: [number, number, number]
  imageUrl: string
  rotation?: [number, number, number]
  scale?: number
  onFrameClick?: (imageUrl: string) => void
}) {
  const texture = useHighQualityTexture(imageUrl)
  const frameTexture = useTexture(FRAME_TEXTURE_URL)
  const [hovered, setHovered] = useState(false)
  const glowRef = useRef(0)
  const frameMatRef = useRef<THREE.MeshStandardMaterial>(null!)
  const goldMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const emissiveColorRef = useRef(new THREE.Color("#000000"))
  const goldColorRef = useRef(new THREE.Color("#d4af37"))

  const imageW = 7.6
  const imageH = 5.6
  const goldBorderWidth = 0.06
  const goldZ = 0.159
  const goldZOffset = 0

  const goldRimExtrudeSettings: THREE.ExtrudeGeometryOptions = useMemo(
    () => ({
      depth: 0.02,
      bevelEnabled: true,
      bevelSize: 0.002,
      bevelThickness: 0.002,
      bevelSegments: 2,
    }),
    [],
  )
  const goldRimGeoHorizontal = useMemo(() => {
    const shape = createPillShape(imageW, goldBorderWidth)
    const geo = new THREE.ExtrudeGeometry(shape, goldRimExtrudeSettings)
    geo.center()
    return geo
  }, [imageW, goldBorderWidth, goldRimExtrudeSettings])
  const goldRimGeoVertical = useMemo(() => {
    const shape = createPillShape(imageH, goldBorderWidth)
    const geo = new THREE.ExtrudeGeometry(shape, goldRimExtrudeSettings)
    geo.center()
    return geo
  }, [imageH, goldBorderWidth, goldRimExtrudeSettings])

  useFrame((_, delta) => {
    const target = hovered ? 1 : 0
    glowRef.current += (target - glowRef.current) * Math.min(1, delta * 4)
    const g = glowRef.current
    const emissive = g > 0.01 ? goldColorRef.current : emissiveColorRef.current
    const intensity = g * 0.25
    if (frameMatRef.current) {
      frameMatRef.current.emissive.copy(emissive)
      frameMatRef.current.emissiveIntensity = intensity
    }
    goldMatRefs.current.forEach((mat) => {
      if (mat) {
        mat.emissive.copy(emissive)
        mat.emissiveIntensity = intensity
      }
    })
  })

  return (
    <group position={position} rotation={rotation} scale={scale ?? 1}>
      {/* Frame border (slightly rounded corners and edges); positioned back so front face aligns with original box at z=0.15 */}
      <RoundedBox
        position={[0, 0, -0.08]}
        args={[8.4, 6.4, 0.3 + 2 * 0.08]}
        radius={0.08}
        smoothness={4}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation()
          onFrameClick?.(imageUrl)
        }}
      >
        <meshStandardMaterial
          ref={frameMatRef}
          map={frameTexture}
          color="#ffffff"
          emissive="#000000"
          emissiveIntensity={0}
        />
      </RoundedBox>
      {/* Gold rim around image (pill-shaped strips with rounded ends) */}
      <mesh
        position={[0, imageH / 2 + goldBorderWidth / 2, goldZ]}
        geometry={goldRimGeoHorizontal}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onFrameClick?.(imageUrl) }}
      >
        <meshStandardMaterial
          ref={(el) => { goldMatRefs.current[0] = el }}
          color="#c9a227"
          metalness={0.6}
          roughness={0.3}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>
      <mesh
        position={[0, -(imageH / 2 + goldBorderWidth / 2), goldZ]}
        geometry={goldRimGeoHorizontal}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onFrameClick?.(imageUrl) }}
      >
        <meshStandardMaterial
          ref={(el) => { goldMatRefs.current[1] = el }}
          color="#c9a227"
          metalness={0.6}
          roughness={0.3}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>
      <mesh
        position={[-(imageW / 2 + goldBorderWidth / 2), 0, goldZ]}
        rotation={[0, 0, Math.PI / 2]}
        geometry={goldRimGeoVertical}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onFrameClick?.(imageUrl) }}
      >
        <meshStandardMaterial
          ref={(el) => { goldMatRefs.current[2] = el }}
          color="#c9a227"
          metalness={0.6}
          roughness={0.3}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>
      <mesh
        position={[imageW / 2 + goldBorderWidth / 2, 0, goldZ]}
        rotation={[0, 0, Math.PI / 2]}
        geometry={goldRimGeoVertical}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onFrameClick?.(imageUrl) }}
      >
        <meshStandardMaterial
          ref={(el) => { goldMatRefs.current[3] = el }}
          color="#c9a227"
          metalness={0.6}
          roughness={0.3}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>
      {/* Image - also clickable */}
      <mesh
        position={[0, 0, 0.16]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation()
          onFrameClick?.(imageUrl)
        }}
      >
        <planeGeometry args={[imageW, imageH]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function LobbyScene({ section, mousePosition, onFrameClick, onLidarTourClick }: LobbySceneProps) {
  const { camera } = useThree()
  const groupRef = useRef<any>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const apply = () => setIsDesktop(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])
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
    const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false
    const newPosition = isMobile
      ? getAdjustedPosition(cameraSetting.position, cameraSetting.lookAt, 2)
      : cameraSetting.position
    let newLookAt = cameraSetting.lookAt
    if (isMobile) {
      const forward = new THREE.Vector3(
        newLookAt.x - newPosition.x,
        newLookAt.y - newPosition.y,
        newLookAt.z - newPosition.z,
      )
      let right = new THREE.Vector3().copy(forward).cross(new THREE.Vector3(0, 1, 0))
      if (right.lengthSq() < 1e-6) {
        right.set(1, 0, 0)
      }
      right.normalize().multiplyScalar(1)
      newPosition.x += right.x
      newPosition.y += right.y
      newPosition.z += right.z
      newLookAt = {
        x: newLookAt.x + right.x,
        y: newLookAt.y + right.y,
        z: newLookAt.z + right.z,
      }
    }
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
      -mousePosition.y * maxAngleRadiansY,
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
        <PictureFrame position={[-6.5, 3.2, -5.5]} imageUrl="/images/redoubt4.png" onFrameClick={onFrameClick} />

        {/* -Z row: Fort Clinton (Section 4) */}
        <PictureFrame position={[18.5, 3.2, -5.5]} imageUrl="/images/ClintonCover.png" onFrameClick={onFrameClick} />

        {/* -Z row: Fort Putnam (Section 5) */}
        <PictureFrame position={[43.5, 3.2, -5.5]} imageUrl="/images/Fort Putnam/IMG_0065.jpeg" onFrameClick={onFrameClick} />

        {/* -Z row: Redoubt 2 (Section 6) */}
        <PictureFrame position={[62.25, 3.2, -5.5]} imageUrl="/images/redoubt2.jpg" onFrameClick={onFrameClick} />

        {/* +Z row: Batteries (Section 7) across from Redoubt 2 */}
        <PictureFrame
          position={[62.25, 3.2, 15.5]}
          imageUrl="/images/ccaa-logo-square.jpg"
          rotation={[0, Math.PI, 0]}
          onFrameClick={onFrameClick}
        />
        {/* +Z row: Fort Webb (Section 8) across from Fort Putnam */}
        <PictureFrame
          position={[43.5, 3.2, 15.5]}
          imageUrl="/images/ccaa-logo-square.jpg"
          rotation={[0, Math.PI, 0]}
          onFrameClick={onFrameClick}
        />
        {/* +Z row: Additional Sites (Section 9) 20% toward Fort Webb to avoid wall clip */}
        <PictureFrame
          position={[23.25, 3.2, 15.5]}
          imageUrl="/images/ccaa-logo-square.jpg"
          rotation={[0, Math.PI, 0]}
          onFrameClick={onFrameClick}
        />

        {/* Maps of West Point framed image at absolute position, facing -X */}
        <PictureFrame
          position={[4, 6, 22]}
          imageUrl="/images/west point redoubts map.png"
          rotation={[0, -Math.PI / 2, 0]}
          scale={1.5}
          onFrameClick={onFrameClick}
        />

        {/* Captain Moses Greenleaf plan, same size/distance, facing +X (opposite) */}
        <PictureFrame
          position={[-12, 6, 18]}
          imageUrl="/images/greenleaf.png"
          rotation={[0, Math.PI / 2, 0]}
          scale={1.5}
          onFrameClick={onFrameClick}
        />

        {/* Redoubt 4 (section 3): desktop 3D LiDAR CTA — in front of lower area of redoubt4 frame */}
        <LiDARRTourButton3D visible={section === 3 && isDesktop} onClick={onLidarTourClick} />

        {/* Lobby environment model */}
        <LobbyModel />
      </group>
    </>
  )
}

// Preload GLTF to avoid runtime fetch hitches
useGLTF.preload("/models/lobby.glb")
// Preload textures used in picture frames
useTexture.preload(FRAME_TEXTURE_URL)
useTexture.preload("/images/redoubt4.png")
useTexture.preload("/images/redoubt2.jpg")
useTexture.preload("/images/ClintonCover.png")
useTexture.preload("/images/Fort Putnam/IMG_0065.jpeg")
useTexture.preload("/images/ccaa-logo-square.jpg")
useTexture.preload("/images/west point redoubts map.png")
useTexture.preload("/images/greenleaf.png")
