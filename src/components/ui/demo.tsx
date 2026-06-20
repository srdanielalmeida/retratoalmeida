"use client"

import { Suspense, lazy, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

const ParticleSphereComponent = lazy(() =>
  import("@/components/ui/3d-orbit-gallery").then((mod) => ({
    default: mod.ParticleSphere,
  }))
)

const GALLERY_IMAGES_THUMBS = [
  "images/galeria/thumbs/_MG_1329.jpg",
  "images/galeria/thumbs/_MG_1493.jpg",
  "images/galeria/thumbs/_MG_3967-Edit.jpg",
  "images/galeria/thumbs/_MG_6579.jpg",
  "images/galeria/thumbs/Sem-Título-4.jpg",
  "images/galeria/thumbs/_MG_8815.jpg",
  "images/galeria/thumbs/_MG_9784.jpg",
  "images/galeria/thumbs/IMG_20230319_232434_655.jpg",
]

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.3} />
    </mesh>
  )
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

export default function OrbitGallerySection() {
  const isMobile = useIsMobile()

  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [-8, 2, 8], fov: isMobile ? 65 : 55 }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow={false} />
        <directionalLight position={[-10, -5, -10]} intensity={0.4} />
        <Suspense fallback={<LoadingFallback />}>
          <ParticleSphereComponent 
            images={GALLERY_IMAGES_THUMBS} 
            particleCount={isMobile ? 300 : 600}
            sphereRadius={isMobile ? 6 : 7}
            imageSize={isMobile ? 1.6 : 2}
          />
        </Suspense>
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.5}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}
