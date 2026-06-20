"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"

interface ParticleSphereProps {
  images: string[]
  particleCount?: number
  sphereRadius?: number
  imageSize?: number
}

export function ParticleSphere({ 
  images, 
  particleCount = 800, 
  sphereRadius = 7,
  imageSize = 1.8
}: ParticleSphereProps) {
  const PARTICLE_SIZE_MIN = 0.008
  const PARTICLE_SIZE_MAX = 0.015
  const POSITION_RANDOMNESS = 3
  const ROTATION_SPEED_Y = 0.0008
  const PARTICLE_OPACITY = 0.6
  
  // Parâmetros da moldura
  const FRAME_THICKNESS = 0.08
  const BORDER_SIZE = 0.12

  const groupRef = useRef<THREE.Group>(null)

  const textures = useTexture(images)

  useMemo(() => {
    const textureArray = Array.isArray(textures) ? textures : [textures]
    textureArray.forEach((texture) => {
      if (texture) {
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.flipY = false
      }
    })
  }, [textures])

  const textureArray = Array.isArray(textures) ? textures : [textures]

  // Calcula os aspect ratios originais das imagens
  const textureAspects = useMemo(() => {
    return textureArray.map((tex) => {
      const threeTex = tex as THREE.Texture
      if (threeTex && threeTex.image) {
        // A propriedade image de um THREE.Texture pode ser HTMLImageElement, HTMLCanvasElement ou ImageBitmap
        const img = threeTex.image as { width?: number; height?: number }
        const width = img.width || 1
        const height = img.height || 1
        return width / height
      }
      return 1
    })
  }, [textureArray])

  const particles = useMemo(() => {
    const result: { position: [number, number, number]; scale: number; color: THREE.Color }[] = []

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount)
      const theta = Math.sqrt(particleCount * Math.PI) * phi
      const radiusVariation = sphereRadius + (Math.random() - 0.5) * POSITION_RANDOMNESS

      const x = radiusVariation * Math.cos(theta) * Math.sin(phi)
      const y = radiusVariation * Math.cos(phi)
      const z = radiusVariation * Math.sin(theta) * Math.sin(phi)

      result.push({
        position: [x, y, z] as [number, number, number],
        scale: Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN,
        color: new THREE.Color().setHSL(
          0.12 + Math.random() * 0.05,
          0.6 + Math.random() * 0.3,
          0.4 + Math.random() * 0.3,
        ),
      })
    }

    return result
  }, [particleCount, sphereRadius])

  const imageCount = images.length

  const orbitingImages = useMemo(() => {
    const result: { 
      position: [number, number, number]; 
      rotation: [number, number, number]; 
      textureIndex: number;
      width: number;
      height: number;
    }[] = []

    for (let i = 0; i < imageCount; i++) {
      const angle = (i / imageCount) * Math.PI * 2
      const x = sphereRadius * Math.cos(angle)
      const y = (Math.random() - 0.5) * 1.5 // Variação vertical suave
      const z = sphereRadius * Math.sin(angle)

      const position = new THREE.Vector3(x, y, z)
      const outwardDirection = position.clone().normalize()

      const euler = new THREE.Euler()
      const matrix = new THREE.Matrix4()
      matrix.lookAt(position, position.clone().add(outwardDirection), new THREE.Vector3(0, 1, 0))
      euler.setFromRotationMatrix(matrix)
      euler.z += Math.PI

      // Calcula largura e altura respeitando o aspect ratio sem corte
      const textureIndex = i % textureArray.length
      const aspect = textureAspects[textureIndex] || 1
      
      let cardWidth = imageSize
      let cardHeight = imageSize

      if (aspect > 1) {
        // Imagem horizontal (landscape)
        cardHeight = imageSize / aspect
      } else {
        // Imagem vertical ou quadrada (portrait)
        cardWidth = imageSize * aspect
      }

      result.push({
        position: [x, y, z] as [number, number, number],
        rotation: [euler.x, euler.y, euler.z] as [number, number, number],
        textureIndex,
        width: cardWidth,
        height: cardHeight,
      })
    }

    return result
  }, [imageCount, sphereRadius, textureArray.length, textureAspects, imageSize])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATION_SPEED_Y
    }
  })

  return (
    <group ref={groupRef}>
      {/* Partículas douradas ao fundo */}
      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position} scale={particle.scale}>
          <sphereGeometry args={[1, 6, 4]} />
          <meshBasicMaterial color={particle.color} transparent opacity={PARTICLE_OPACITY} />
        </mesh>
      ))}

      {/* Fotos com molduras 3D */}
      {orbitingImages.map((image, index) => {
        const photoWidth = Math.max(0.1, image.width - BORDER_SIZE * 2)
        const photoHeight = Math.max(0.1, image.height - BORDER_SIZE * 2)
        
        return (
          <group key={`image-group-${index}`} position={image.position} rotation={image.rotation}>
            {/* 1. Moldura Branca Espessa (Caixa 3D) */}
            <mesh>
              <boxGeometry args={[image.width, image.height, FRAME_THICKNESS]} />
              <meshStandardMaterial 
                color="#ffffff" 
                roughness={0.5}
                metalness={0.1}
              />
            </mesh>

            {/* 2. A Foto no lado frontal da moldura */}
            <mesh position={[0, 0, FRAME_THICKNESS / 2 + 0.002]}>
              <planeGeometry args={[photoWidth, photoHeight]} />
              <meshStandardMaterial 
                map={textureArray[image.textureIndex]} 
                roughness={0.2}
                metalness={0.0}
                side={THREE.FrontSide}
              />
            </mesh>

            {/* 3. A Foto no lado traseiro para ficar visível de todos os ângulos */}
            <mesh position={[0, 0, -(FRAME_THICKNESS / 2 + 0.002)]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[photoWidth, photoHeight]} />
              <meshStandardMaterial 
                map={textureArray[image.textureIndex]} 
                roughness={0.2}
                metalness={0.0}
                side={THREE.FrontSide}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
