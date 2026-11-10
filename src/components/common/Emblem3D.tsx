import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Emblem3DProps {
  className?: string;
  size?: number;
}

export const Emblem3D: React.FC<Emblem3DProps> = ({ className = '', size = 320 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for whole emblem
    const emblemGroup = new THREE.Group();
    scene.add(emblemGroup);

    // 1. Central Core - 3D Rotating SUKA SRI 'S' Symbol Medallion
    const sSymbolGroup = new THREE.Group();
    emblemGroup.add(sSymbolGroup);

    // Texture Loader for Official S Logo
    const textureLoader = new THREE.TextureLoader();
    const sTexture = textureLoader.load('/images/suka-sri-logo.png');
    sTexture.generateMipmaps = true;

    // Golden Rim Framing the S Symbol
    const sRimGeo = new THREE.TorusGeometry(1.25, 0.06, 16, 80);
    const sRimMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0xB8860B,
      emissiveIntensity: 0.4,
    });
    const sRimMesh = new THREE.Mesh(sRimGeo, sRimMat);
    sSymbolGroup.add(sRimMesh);

    // Front Face of 'S' Symbol
    const sPlaneGeo = new THREE.PlaneGeometry(2.3, 2.3);
    const sFrontMat = new THREE.MeshStandardMaterial({
      map: sTexture,
      transparent: true,
      alphaTest: 0.05,
      metalness: 0.4,
      roughness: 0.2,
      emissive: 0xFFD700,
      emissiveIntensity: 0.25,
      side: THREE.FrontSide,
    });
    const sFrontMesh = new THREE.Mesh(sPlaneGeo, sFrontMat);
    sFrontMesh.position.z = 0.03;
    sSymbolGroup.add(sFrontMesh);

    // Back Face of 'S' Symbol (Mirrored so S reads correctly on both sides)
    const sBackMat = new THREE.MeshStandardMaterial({
      map: sTexture,
      transparent: true,
      alphaTest: 0.05,
      metalness: 0.4,
      roughness: 0.2,
      emissive: 0xFFD700,
      emissiveIntensity: 0.25,
      side: THREE.FrontSide,
    });
    const sBackMesh = new THREE.Mesh(sPlaneGeo, sBackMat);
    sBackMesh.rotation.y = Math.PI;
    sBackMesh.position.z = -0.03;
    sSymbolGroup.add(sBackMesh);

    // Subtle inner glowing ring
    const innerRingGeo = new THREE.RingGeometry(1.15, 1.25, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    sSymbolGroup.add(innerRing);

    // 3. Ring 1 - Celestial Golden Ring
    const ring1Geo = new THREE.TorusGeometry(1.8, 0.05, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xB8860B,
      emissiveIntensity: 0.3,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    emblemGroup.add(ring1);

    // 4. Ring 2 - Mystic Violet Gyroscope Ring
    const ring2Geo = new THREE.TorusGeometry(2.3, 0.04, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x8A2BE2,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x7C3AED,
      emissiveIntensity: 0.4,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    emblemGroup.add(ring2);

    // 5. Orbital Diamond Nodes
    const nodeGeo = new THREE.OctahedronGeometry(0.18);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      emissive: 0xFFD700,
      emissiveIntensity: 0.5,
      metalness: 0.9,
    });

    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      emblemGroup.add(node);
      nodes.push(node);
    }

    // 6. Particle Field
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cGold = new THREE.Color(0xFFD700);
    const cBlue = new THREE.Color(0x00E5FF);
    const cViolet = new THREE.Color(0x8A2BE2);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 2.4 + Math.random() * 1.5;

      positions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = rad * Math.cos(phi);

      const chosenColor = i % 3 === 0 ? cGold : i % 3 === 1 ? cBlue : cViolet;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    emblemGroup.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00E5FF, 2, 20);
    pointLight1.position.set(4, 3, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xFFD700, 2.5, 20);
    pointLight2.position.set(-4, -3, 5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x8A2BE2, 2, 20);
    pointLight3.position.set(0, 5, -2);
    scene.add(pointLight3);

    // Mouse Interaction
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.7;
      targetRotX = -y * 0.7;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      emblemGroup.rotation.y += (targetRotY - emblemGroup.rotation.y) * 0.05;
      emblemGroup.rotation.x += (targetRotX - emblemGroup.rotation.x) * 0.05;

      // Independent rotational axes
      sSymbolGroup.rotation.y = elapsedTime * 0.75;
      sSymbolGroup.rotation.x = Math.sin(elapsedTime * 0.8) * 0.08;

      ring1.rotation.x = Math.PI / 4 + Math.sin(elapsedTime * 0.5) * 0.2;
      ring1.rotation.y = elapsedTime * 0.6;

      ring2.rotation.x = -Math.PI / 4 + Math.cos(elapsedTime * 0.4) * 0.2;
      ring2.rotation.z = -elapsedTime * 0.5;

      // Orbiting diamond nodes
      nodes.forEach((node, idx) => {
        const angle = elapsedTime * 0.8 + (idx * Math.PI) / 2;
        node.position.x = Math.cos(angle) * 1.8;
        node.position.y = Math.sin(angle) * 1.8;
        node.position.z = Math.sin(angle * 2) * 0.4;
        node.rotation.x = elapsedTime * 2;
        node.rotation.y = elapsedTime * 2;
      });

      // Slowly rotate particle cloud
      particles.rotation.y = elapsedTime * 0.08;
      particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;

      // Slight floating wobble
      emblemGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none pointer-events-auto ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
