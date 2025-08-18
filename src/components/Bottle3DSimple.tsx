import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // Base bottle size (500ml as reference)
  const baseSize = bottleSizes.find(s => s.id === "500ml")!.dimensions;
  const currentBottle = bottleSizes.find(s => s.id === selectedSize) || bottleSizes[1];

  // Handle responsive dimensions
  const updateDimensions = useCallback(() => {
    if (mountRef.current) {
      const container = mountRef.current.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        const size = Math.min(rect.width - 32, 400); // 16px padding on each side
        setDimensions({ width: size, height: size });
      }
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

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

    try {
      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0.1, 0.4);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(dimensions.width, dimensions.height);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Ensure canvas fits container
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';

      mountRef.current.appendChild(renderer.domElement);

      // Professional studio lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      // Main key light
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
      keyLight.position.set(3, 4, 5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 0.1;
      keyLight.shadow.camera.far = 10;
      scene.add(keyLight);

      // Fill light
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
      fillLight.position.set(-3, 2, 3);
      scene.add(fillLight);

      // Rim light for edge definition
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
      rimLight.position.set(-1, 2, -3);
      scene.add(rimLight);

      // Bounce light from below
      const bounceLight = new THREE.DirectionalLight(0xffffff, 0.2);
      bounceLight.position.set(0, -2, 2);
      scene.add(bounceLight);

      // Create bottle - Professional PET material
      const bottleGeometry = createBottleGeometry();
      const bottleMaterial = new THREE.MeshPhongMaterial({
        color: 0xf8fafc,
        transparent: true,
        opacity: 0.15,
        shininess: 200,
        specular: 0xffffff,
        reflectivity: 0.3,
      });
      const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
      bottle.castShadow = true;
      bottle.receiveShadow = true;
      scene.add(bottle);
      bottleRef.current = bottle;

      // Create water - More realistic water
      const waterGeometry = createWaterGeometry();
      const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.6,
        shininess: 300,
        specular: 0xffffff,
      });
      const water = new THREE.Mesh(waterGeometry, waterMaterial);
      water.position.y = -0.01;
      scene.add(water);
      waterRef.current = water;

      // Create cap - Professional plastic cap
      const capGeometry = new THREE.CylinderGeometry(0.014, 0.014, 0.02, 16);
      const capMaterial = new THREE.MeshPhongMaterial({
        color: 0x475569,
        shininess: 80,
        specular: 0x94a3b8,
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
        
        if (bottle && water && cap && camera) {
          const time = Date.now() * 0.001;
          bottle.rotation.y = Math.sin(time * 0.3) * 0.05;
          water.rotation.y = Math.sin(time * 0.3) * 0.05;
          cap.rotation.y = Math.sin(time * 0.3) * 0.05;
          
          camera.position.x = Math.sin(time * 0.2) * 0.02;
          camera.lookAt(0, 0, 0);
        }
        
        renderer.render(scene, camera);
      };
      animate();

    } catch (error) {
      console.error('Error initializing 3D scene:', error);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && rendererRef.current?.domElement) {
        try {
          mountRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          console.warn('Error removing canvas:', e);
        }
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [isInitialized, dimensions]);

  // Update renderer size when dimensions change
  useEffect(() => {
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.setSize(dimensions.width, dimensions.height);
      cameraRef.current.aspect = 1;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [dimensions]);

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
      
      if (bottleRef.current && waterRef.current && capRef.current) {
        bottleRef.current.scale.copy(currentScale);
        waterRef.current.scale.copy(currentScale);
        capRef.current.scale.copy(currentScale);
      }
      
      if (t < 1) {
        requestAnimationFrame(animateScale);
      }
    };
    
    animateScale();
  }, [selectedSize, currentBottle, baseSize]);

  // Update label
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove existing label
    if (labelRef.current) {
      sceneRef.current.remove(labelRef.current);
      labelRef.current = undefined;
    }

    if (!labelTexture) return;

    // Create new label
    const loader = new THREE.TextureLoader();
    loader.load(
      labelTexture,
      (texture) => {
        if (!sceneRef.current) return;
        
        const labelGeometry = new THREE.PlaneGeometry(0.06, 0.04);
        const labelMaterial = new THREE.MeshPhongMaterial({
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
        
        sceneRef.current.add(label);
        labelRef.current = label;
      },
      undefined,
      (error) => {
        console.error('Error loading label texture:', error);
      }
    );
  }, [labelTexture, labelSettings]);

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div 
        ref={mountRef} 
        className="w-full max-w-sm aspect-square flex items-center justify-center"
        style={{ minHeight: '280px' }}
      />
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p>Loading 3D Preview...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bottle3DSimple;
