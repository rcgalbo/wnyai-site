import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AnimationBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const planeRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0)));

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 200, 200);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create grid of points
    const gridSize = 60;
    const spacing = 1000 / (gridSize - 1);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(gridSize * gridSize * 3);
    const colors = new Float32Array(gridSize * gridSize * 3);
    const originalPositions = new Float32Array(gridSize * gridSize * 3);

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = (i * gridSize + j) * 3;
        const x = (j - gridSize / 2) * spacing;
        const z = (i - gridSize / 2) * spacing;
        
        positions[index] = x;
        positions[index + 1] = 0;
        positions[index + 2] = z;
        
        originalPositions[index] = x;
        originalPositions[index + 1] = 0;
        originalPositions[index + 2] = z;

        colors[index] = 0.25;     // Slightly darker gray
        colors[index + 1] = 0.25;
        colors[index + 2] = 0.25;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('originalPosition', new THREE.BufferAttribute(originalPositions, 3));

    // Create points
    const pointsMaterial = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });

    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);
    pointsRef.current = points;

    // Create lines
    const lineIndices: number[] = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;
        if (j < gridSize - 1) lineIndices.push(index, index + 1);
        if (i < gridSize - 1) lineIndices.push(index, index + gridSize);
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', geometry.getAttribute('position'));
    lineGeometry.setAttribute('color', geometry.getAttribute('color'));
    lineGeometry.setIndex(lineIndices);

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
    linesRef.current = lines;

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const intersectionPoint = new THREE.Vector3();

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeRef.current, intersectionPoint);
      mouseRef.current.copy(intersectionPoint);
    };

    // Animation
    const animate = () => {
      if (!pointsRef.current || !linesRef.current) return;

      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const originalPositions = pointsRef.current.geometry.attributes.originalPosition.array as Float32Array;
      const time = Date.now() * 0.0003; // Slightly faster animation

      for (let i = 0; i < positions.length; i += 3) {
        const x = originalPositions[i];
        const z = originalPositions[i + 2];
        
        // Base wave pattern - more pronounced
        let y = Math.sin(time + x * 0.015) * 15 +
                Math.cos(time * 1.3 + z * 0.015) * 12 +
                Math.sin(time * 1.7 + (x + z) * 0.025) * 8;

        // Mouse interaction
        const dx = x - mouseRef.current.x;
        const dz = z - mouseRef.current.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        const maxDistance = 150;
        
        if (distance < maxDistance) {
          const influence = Math.pow(1 - distance / maxDistance, 2);
          const mouseWave = Math.sin(time * 8 - distance * 0.05) * 25;
          y += mouseWave * influence;
        }

        positions[i + 1] = y;
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      linesRef.current.geometry.attributes.position = pointsRef.current.geometry.attributes.position;

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameRef.current);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
      
      if (linesRef.current) {
        linesRef.current.geometry.dispose();
        (linesRef.current.material as THREE.Material).dispose();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="animation-wrapper fixed top-0 left-0 w-full h-full pointer-events-auto -z-10"
      style={{ touchAction: 'none' }}
    />
  );
};

export default AnimationBackground;