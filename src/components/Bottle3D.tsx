import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface BottleSize {
  id: string;
  size: string;
  dimensions: { diameter: number; height: number };
}

interface Bottle3DProps {
  selectedSize: string;
  labelTexture: string | null;
  labelSettings: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
}

const bottleSizes: BottleSize[] = [
  { id: "250ml", size: "250ml", dimensions: { diameter: 0.056, height: 0.165 } },
  { id: "500ml", size: "500ml", dimensions: { diameter: 0.066, height: 0.210 } },
  { id: "1L", size: "1L", dimensions: { diameter: 0.084, height: 0.260 } },
  { id: "1.5L", size: "1.5L", dimensions: { diameter: 0.100, height: 0.300 } },
  { id: "2L", size: "2L", dimensions: { diameter: 0.110, height: 0.320 } },
  { id: "5L", size: "5L", dimensions: { diameter: 0.160, height: 0.380 } }
];

// Create bottle geometry with proper shape
const createBottleGeometry = (baseRadius = 0.033, height = 0.210) => {
  const geometry = new THREE.CylinderGeometry(baseRadius, baseRadius, height, 32);
  const positions = geometry.attributes.position.array as Float32Array;
  const vertices = [];
  
  // Extract vertices for shaping
  for (let i = 0; i < positions.length; i += 3) {
    vertices.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
  }
  
  // Shape the bottle
  vertices.forEach((vertex, index) => {
    const y = vertex.y;
    const normalizedY = (y + height / 2) / height; // 0 to 1 from bottom to top
    
    let scaleFactor = 1;
    
    // Bottle shaping
    if (normalizedY > 0.85) {
      // Neck area (top 15%)
      scaleFactor = 0.42;
    } else if (normalizedY > 0.75) {
      // Shoulder transition
      const t = (normalizedY - 0.75) / 0.1;
      scaleFactor = THREE.MathUtils.lerp(1, 0.42, t);
    } else if (normalizedY < 0.1) {
      // Base area (bottom 10%)
      scaleFactor = 0.95;
    }
    
    vertex.x *= scaleFactor;
    vertex.z *= scaleFactor;
    
    // Update positions
    positions[index * 3] = vertex.x;
    positions[index * 3 + 1] = vertex.y;
    positions[index * 3 + 2] = vertex.z;
  });
  
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
  
  return geometry;
};

// Create water geometry (slightly smaller than bottle)
const createWaterGeometry = (baseRadius = 0.030, height = 0.180) => {
  const geometry = new THREE.CylinderGeometry(baseRadius, baseRadius, height, 32);
  const positions = geometry.attributes.position.array as Float32Array;
  const vertices = [];
  
  for (let i = 0; i < positions.length; i += 3) {
    vertices.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
  }
  
  vertices.forEach((vertex, index) => {
    const y = vertex.y;
    const normalizedY = (y + height / 2) / height;
    
    let scaleFactor = 0.9; // Slightly smaller than bottle
    
    if (normalizedY > 0.85) {
      scaleFactor = 0.38;
    } else if (normalizedY > 0.75) {
      const t = (normalizedY - 0.75) / 0.1;
      scaleFactor = THREE.MathUtils.lerp(0.9, 0.38, t);
    } else if (normalizedY < 0.1) {
      scaleFactor = 0.85;
    }
    
    vertex.x *= scaleFactor;
    vertex.z *= scaleFactor;
    
    positions[index * 3] = vertex.x;
    positions[index * 3 + 1] = vertex.y;
    positions[index * 3 + 2] = vertex.z;
  });
  
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
  
  return geometry;
};

const BottleMesh = ({ selectedSize, labelTexture, labelSettings }: Bottle3DProps) => {
  const bottleRef = useRef<THREE.Mesh>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  const capRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Mesh>(null);
  
  const [targetScale, setTargetScale] = useState(new THREE.Vector3(1, 1, 1));
  const [currentScale, setCurrentScale] = useState(new THREE.Vector3(1, 1, 1));
  
  // Base bottle size (500ml as reference)
  const baseSize = bottleSizes.find(s => s.id === "500ml")!.dimensions;
  const currentBottle = bottleSizes.find(s => s.id === selectedSize) || bottleSizes[1];
  
  // Calculate scale factors
  const scaleY = currentBottle.dimensions.height / baseSize.height;
  const scaleXZ = currentBottle.dimensions.diameter / baseSize.diameter;
  
  useEffect(() => {
    setTargetScale(new THREE.Vector3(scaleXZ, scaleY, scaleXZ));
  }, [scaleXZ, scaleY]);
  
  // Create geometries
  const bottleGeometry = useMemo(() => createBottleGeometry(), []);
  const waterGeometry = useMemo(() => createWaterGeometry(), []);
  const capGeometry = useMemo(() => new THREE.CylinderGeometry(0.014, 0.014, 0.02, 16), []);
  
  // Materials
  const bottleMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    transmission: 1,
    roughness: 0.1,
    thickness: 0.002,
    ior: 1.57,
    color: new THREE.Color(0.95, 0.98, 1),
    transparent: true,
    opacity: 0.95,
  }), []);
  
  const waterMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    transmission: 1,
    roughness: 0.05,
    ior: 1.333,
    color: new THREE.Color(0.7, 0.9, 1),
    transparent: true,
    opacity: 0.8,
  }), []);
  
  const capMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.2, 0.4, 0.8),
    roughness: 0.4,
    metalness: 0.1,
  }), []);
  
  const labelMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      transparent: true,
    });
    
    if (labelTexture) {
      const loader = new THREE.TextureLoader();
      loader.load(labelTexture, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        material.map = texture;
        material.needsUpdate = true;
      });
    }
    
    return material;
  }, [labelTexture]);
  
  // Animation loop for smooth scaling
  useFrame((state, delta) => {
    if (bottleRef.current && waterRef.current && capRef.current) {
      // Smooth scaling animation
      currentScale.lerp(targetScale, delta * 8);
      bottleRef.current.scale.copy(currentScale);
      waterRef.current.scale.copy(currentScale);
      capRef.current.scale.copy(currentScale);
      
      // Subtle rotation animation
      const time = state.clock.elapsedTime;
      bottleRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      waterRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      capRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
    
    if (labelRef.current && labelTexture) {
      // Update label transform based on settings
      labelRef.current.position.set(
        (labelSettings.x - 50) * 0.001,
        (labelSettings.y - 50) * 0.002,
        0.034
      );
      labelRef.current.scale.setScalar(labelSettings.scale * 0.001);
      labelRef.current.rotation.z = (labelSettings.rotation * Math.PI) / 180;
    }
  });
  
  return (
    <group>
      {/* Bottle */}
      <mesh ref={bottleRef} geometry={bottleGeometry} material={bottleMaterial} />
      
      {/* Water inside */}
      <mesh ref={waterRef} geometry={waterGeometry} material={waterMaterial} position={[0, -0.01, 0]} />
      
      {/* Cap */}
      <mesh ref={capRef} geometry={capGeometry} material={capMaterial} position={[0, 0.12, 0]} />
      
      {/* Label */}
      {labelTexture && (
        <mesh ref={labelRef} position={[0, 0, 0.034]}>
          <planeGeometry args={[0.06, 0.04]} />
          <primitive object={labelMaterial} />
        </mesh>
      )}
    </group>
  );
};

const CameraController = () => {
  const { camera } = useThree();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Gentle camera movement
    camera.position.x = Math.sin(time * 0.2) * 0.1;
    camera.position.y = 0.1 + Math.sin(time * 0.3) * 0.02;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
};

const Bottle3D = ({ selectedSize, labelTexture, labelSettings }: Bottle3DProps) => {
  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0.1, 0.4]} fov={35} />
        <CameraController />
        
        {/* Studio lighting setup */}
        <Environment 
          preset="studio"
          background={false}
          environmentIntensity={0.8}
        />
        
        {/* Additional lights for better bottle visualization */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.5} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />
        <ambientLight intensity={0.2} />
        
        {/* Rim light for edge definition */}
        <spotLight
          position={[2, 2, 2]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#ffffff"
        />
        
        <BottleMesh 
          selectedSize={selectedSize}
          labelTexture={labelTexture}
          labelSettings={labelSettings}
        />
        
        {/* Ground shadows */}
        <ContactShadows 
          position={[0, -0.12, 0]}
          opacity={0.4}
          scale={0.3}
          blur={2}
          far={0.4}
        />
      </Canvas>
    </div>
  );
};

export default Bottle3D;
