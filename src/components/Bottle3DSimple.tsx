import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface BottleSize {
  id: string;
  size: string;
  dimensions: { diameter: number; height: number };
}

interface Bottle3DSimpleProps {
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

const Bottle3DSimple = ({ selectedSize, labelTexture, labelSettings }: Bottle3DSimpleProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const bottleRef = useRef<THREE.Mesh>();
  const waterRef = useRef<THREE.Mesh>();
  const capRef = useRef<THREE.Mesh>();
  const labelRef = useRef<THREE.Mesh>();
  const animationRef = useRef<number>();
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Base bottle size (500ml as reference)
  const baseSize = bottleSizes.find(s => s.id === "500ml")!.dimensions;
  const currentBottle = bottleSizes.find(s => s.id === selectedSize) || bottleSizes[1];

  const createBottleGeometry = (baseRadius = 0.033, height = 0.210) => {
    const geometry = new THREE.CylinderGeometry(baseRadius, baseRadius, height, 32);
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Shape the bottle
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
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
      
      positions[i] = x * scaleFactor;
      positions[i + 2] = z * scaleFactor;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  const createWaterGeometry = (baseRadius = 0.030, height = 0.180) => {
    const geometry = new THREE.CylinderGeometry(baseRadius, baseRadius, height, 32);
    const positions = geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
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
      
      positions[i] = x * scaleFactor;
      positions[i + 2] = z * scaleFactor;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  useEffect(() => {
    if (!mountRef.current || isInitialized) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.1, 0.4);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);

    // Create bottle
    const bottleGeometry = createBottleGeometry();
    const bottleMaterial = new THREE.MeshLambertMaterial({
      color: 0xf0f8ff,
      transparent: true,
      opacity: 0.3,
    });
    const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
    bottle.castShadow = true;
    bottle.receiveShadow = true;
    scene.add(bottle);
    bottleRef.current = bottle;

    // Create water
    const waterGeometry = createWaterGeometry();
    const waterMaterial = new THREE.MeshLambertMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.6,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = -0.01;
    scene.add(water);
    waterRef.current = water;

    // Create cap
    const capGeometry = new THREE.CylinderGeometry(0.014, 0.014, 0.02, 16);
    const capMaterial = new THREE.MeshLambertMaterial({
      color: 0x4169e1,
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 0.12;
    cap.castShadow = true;
    scene.add(cap);
    capRef.current = cap;

    setIsInitialized(true);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (bottle && water && cap) {
        const time = Date.now() * 0.001;
        bottle.rotation.y = Math.sin(time * 0.5) * 0.1;
        water.rotation.y = Math.sin(time * 0.5) * 0.1;
        cap.rotation.y = Math.sin(time * 0.5) * 0.1;
        
        camera.position.x = Math.sin(time * 0.2) * 0.05;
        camera.lookAt(0, 0, 0);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isInitialized]);

  // Update bottle size
  useEffect(() => {
    if (!bottleRef.current || !waterRef.current || !capRef.current) return;

    const scaleY = currentBottle.dimensions.height / baseSize.height;
    const scaleXZ = currentBottle.dimensions.diameter / baseSize.diameter;

    const targetScale = new THREE.Vector3(scaleXZ, scaleY, scaleXZ);
    
    // Animate scale change
    const startScale = bottleRef.current.scale.clone();
    const startTime = Date.now();
    const duration = 700;

    const animateScale = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      
      // Ease in-out
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      const currentScale = startScale.clone().lerp(targetScale, easeT);
      
      bottleRef.current!.scale.copy(currentScale);
      waterRef.current!.scale.copy(currentScale);
      capRef.current!.scale.copy(currentScale);
      
      if (t < 1) {
        requestAnimationFrame(animateScale);
      }
    };
    
    animateScale();
  }, [selectedSize]);

  // Update label
  useEffect(() => {
    if (!sceneRef.current || !labelTexture) return;

    // Remove existing label
    if (labelRef.current) {
      sceneRef.current.remove(labelRef.current);
    }

    // Create new label
    const loader = new THREE.TextureLoader();
    loader.load(labelTexture, (texture) => {
      const labelGeometry = new THREE.PlaneGeometry(0.06, 0.04);
      const labelMaterial = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
      });
      
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(
        (labelSettings.x - 50) * 0.001,
        (labelSettings.y - 50) * 0.002,
        0.034
      );
      label.scale.setScalar(labelSettings.scale * 0.001);
      label.rotation.z = (labelSettings.rotation * Math.PI) / 180;
      
      sceneRef.current!.add(label);
      labelRef.current = label;
    });
  }, [labelTexture, labelSettings]);

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div ref={mountRef} className="w-[400px] h-[400px]" />
    </div>
  );
};

export default Bottle3DSimple;
