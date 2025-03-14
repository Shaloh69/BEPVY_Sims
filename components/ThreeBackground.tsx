"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Sphere, Cloud, Sky, Clouds } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

// Optimized with memoization and reduced complexity
const Sun: React.FC<{ transitionProgress: number }> = ({
  transitionProgress,
}) => {
  const sunRef = useRef<THREE.Mesh>(null);
  const initialY = 5;
  const position = useMemo<[number, number, number]>(
    () => [-5, initialY, -10],
    [initialY]
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#fff7b0",
        emissive: "#ffdd99",
        transparent: true,
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!sunRef.current) return;

    // Minimal computation in animation frame
    const scale = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.01;
    sunRef.current.position.y = initialY * (1 - transitionProgress);
    sunRef.current.scale.set(scale, scale, scale);
    material.opacity = 1 - transitionProgress;
  });

  return (
    <Sphere args={[1.2, 16, 16]} position={position} ref={sunRef}>
      <primitive object={material} />
      <pointLight
        color="#fff7b0"
        intensity={2 * (1 - transitionProgress)}
        distance={300}
        decay={0.5}
      />
    </Sphere>
  );
};

const Moon: React.FC<{ transitionProgress: number }> = ({
  transitionProgress,
}) => {
  const moonRef = useRef<THREE.Mesh>(null);
  const initialY = 5;
  const position = useMemo<[number, number, number]>(
    () => [-2, initialY, -6],
    [initialY]
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f8f8ff",
        emissive: "#cccccc",
        transparent: true,
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!moonRef.current) return;

    moonRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    moonRef.current.position.y = initialY + (1 - transitionProgress) * 5;
    material.opacity = transitionProgress;
  });

  return (
    <Sphere args={[0.7, 16, 16]} position={position} ref={moonRef}>
      <primitive object={material} />
    </Sphere>
  );
};

// Optimized using instancing for clouds
const DayClouds: React.FC = () => {
  const cloudPositions = useMemo(() => {
    const cloudCount = 6; // Reduced count
    const viewportWidth = 31;
    const yOffset = 9;

    return Array.from({ length: cloudCount }, (_, i) => {
      const x = -viewportWidth / 2 + (i / (cloudCount - 1)) * viewportWidth;
      const arcHeight =
        -Math.pow((i - (cloudCount - 1) / 2) / ((cloudCount - 1) / 2), 2) * 3;
      return {
        x,
        z: -8,
        height: arcHeight + yOffset,
        segments: 24, // Reduced segments
        bounds: [8 - i * 0.5, 1.5, 2],
        volume: 6 + i,
      };
    });
  }, []);

  return (
    <Clouds material={THREE.MeshBasicMaterial}>
      {cloudPositions.map((props, index) => (
        <Cloud
          key={index}
          segments={props.segments}
          bounds={((props.bounds[0], props.bounds[1]), props.bounds[2])}
          volume={props.volume}
          color="#ffffff"
          position={[props.x, props.height, props.z]}
          speed={0.1}
          opacity={0.8}
          fade={100}
        />
      ))}
    </Clouds>
  );
};

const NightClouds: React.FC<{ opacity: number }> = ({ opacity }) => {
  const cloudPositions = useMemo(() => {
    const cloudCount = 2; // Reduced count
    const viewportWidth = 31;
    const yOffset = 9;

    return Array.from({ length: cloudCount }, (_, i) => {
      const x = -viewportWidth / 2 + (i / (cloudCount - 1)) * viewportWidth;
      const arcHeight =
        -Math.pow((i - (cloudCount - 1) / 2) / ((cloudCount - 1) / 2), 2) * 3;
      return { x, z: -8, height: arcHeight + yOffset };
    });
  }, []);

  return (
    <Clouds material={THREE.MeshBasicMaterial}>
      {cloudPositions.map(({ x, z, height }, index) => (
        <Cloud
          key={index}
          segments={24} // Reduced segments
          bounds={[10, 2, 2]}
          volume={7}
          color="#4a6e8a"
          position={[x, height, z]}
          speed={0.2}
          opacity={0.5 * opacity}
          fade={100}
        />
      ))}
    </Clouds>
  );
};

// Optimized shooting stars with object pooling
const ShootingStars: React.FC<{ opacity: number }> = ({ opacity }) => {
  const groupRef = useRef<THREE.Group>(null);
  const shootingStarCount = 2; // Reduced count

  const shootingStars = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
    });

    return Array(shootingStarCount)
      .fill(null)
      .map(() => ({
        position: [
          Math.random() * -20 - 5,
          Math.random() * 20 + 5,
          Math.random() * -30 - 5,
        ] as [number, number, number],
        material,
      }));
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((star, i) => {
      if (star.position.x > 15 || star.position.y < -15) {
        star.position.set(
          Math.random() * -20 - 5,
          Math.random() * 20 + 5,
          Math.random() * -30 - 5
        );
      }

      star.position.x += 0.1;
      star.position.y -= 0.1;
    });

    // Update opacity once for all stars
    const material = shootingStars[0].material;
    material.opacity = opacity;
  });

  return (
    <group ref={groupRef}>
      {shootingStars.map((star, i) => (
        <mesh key={i} position={star.position}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <primitive object={star.material} />
        </mesh>
      ))}
    </group>
  );
};

const MouseParallaxEffect: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ mouse }) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      (mouse.x * Math.PI) / 40,
      0.02
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      (mouse.y * Math.PI) / 40,
      0.02
    );
  });

  return <group ref={groupRef}>{children}</group>;
};

// Optimized scene container with memoization
const SceneContainer: React.FC = () => {
  const { theme } = useTheme();
  const isNightMode = theme === "dark";
  const [prevTheme, setPrevTheme] = useState<string | undefined>(theme);
  const [transitionProgress, setTransitionProgress] = useState(
    isNightMode ? 1 : 0
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (theme !== prevTheme) {
      setIsTransitioning(true);
      setPrevTheme(theme);
    }
  }, [theme, prevTheme]);

  useFrame(() => {
    if (!isTransitioning) return;

    if (isNightMode) {
      setTransitionProgress((prev) => {
        const newProgress = Math.min(prev + 0.05, 1);
        if (newProgress >= 1) setIsTransitioning(false);
        return newProgress;
      });
    } else {
      setTransitionProgress((prev) => {
        const newProgress = Math.max(prev - 0.05, 0);
        if (newProgress <= 0) setIsTransitioning(false);
        return newProgress;
      });
    }
  });

  // Memoized sun position
  const sunPosition = useMemo<[number, number, number]>(
    () => [0, -0.3 - Math.pow(transitionProgress, 1.5) * 8, -6],
    [transitionProgress]
  );

  return (
    <MouseParallaxEffect>
      <ambientLight intensity={isNightMode ? 0.2 : 0.7} />

      <Sky
        distance={450000}
        sunPosition={[
          sunPosition[0],
          sunPosition[1] * (1 - transitionProgress), // Sun lowers over time
          sunPosition[2],
        ]}
        inclination={0.3 - transitionProgress * 0.2} // Moves from day to evening
        azimuth={0.25}
        rayleigh={Math.max(0, (1 - transitionProgress) * 1)} // Sky color fades out
        turbidity={Math.max(2, 2 + transitionProgress * 6)} // Becomes hazier at sunset
        mieCoefficient={Math.max(0, 0.005 - transitionProgress * 0.005)} // Reduces scattering
        mieDirectionalG={Math.max(0, 0.8 - transitionProgress * 0.8)} // Glow disappears
      />

      {/* Night Elements - Only render when visible */}
      {transitionProgress > 0 && (
        <>
          <Stars
            radius={50}
            depth={50}
            count={Math.floor((transitionProgress / 5) * 1500)} // Reduced count
            factor={4}
            saturation={1}
            fade
          />
          <Stars
            radius={50}
            depth={50}
            count={Math.floor((transitionProgress / 5) * 1000)} // Reduced count
            factor={4}
            saturation={1}
            fade
          />
          <ShootingStars opacity={transitionProgress} />
          <Moon transitionProgress={transitionProgress} />
          <NightClouds opacity={transitionProgress} />
        </>
      )}

      {/* Day Elements - Only render when visible */}
      {transitionProgress < 1 && (
        <>
          <Sun transitionProgress={transitionProgress} />
          <pointLight
            position={[-5, 5, -10]}
            intensity={Math.max(0, 1 - Math.pow(transitionProgress, 1.5) * 2)}
            color="#ffe6cc"
          />
          <DayClouds />
        </>
      )}
    </MouseParallaxEffect>
  );
};

// Optimized main component with proper memo usage
const ThreeBackground: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <SceneContainer />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
