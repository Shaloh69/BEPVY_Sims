"use client";

import React, { useRef, useEffect, useState } from "react";
import { useLighting } from "../context/LightingProvider";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

// Shared resources for better performance
// Type-safe shared resources
interface SharedGeometries {
  lamp: THREE.CylinderGeometry | null;
  bulb: THREE.SphereGeometry | null;
}

interface SharedMaterials {
  floor: THREE.MeshStandardMaterial | null;
  ceiling: THREE.MeshStandardMaterial | null;
  wall: THREE.MeshStandardMaterial | null;
  lamp: THREE.MeshStandardMaterial | null;
  bulb: THREE.MeshStandardMaterial | null;
  schematic: THREE.MeshBasicMaterial | null;
  gridLine: THREE.LineBasicMaterial | null;
}

const sharedGeometries: SharedGeometries = {
  lamp: null,
  bulb: null,
};

const sharedMaterials: SharedMaterials = {
  floor: null,
  ceiling: null,
  wall: null,
  lamp: null,
  bulb: null,
  schematic: null,
  gridLine: null,
};

// Type-safe lamp position interface
interface LampPosition {
  x: number;
  y: number;
  z: number;
}

// Room dimensions interface for type safety
interface RoomDimensions {
  length: number;
  width: number;
  height: number;
}

// Type-safe wall configuration interface
interface WallConfig {
  size: [number, number];
  rotation: [number, number, number];
  position: [number, number, number];
}

const Room3DVisualization: React.FC = () => {
  const {
    roomDimensions,
    lampPositions,
    lightingResults,
    lightingRequirements,
    isCalculating,
    calculateResults,
  } = useLighting();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  // Stats for performance monitoring
  const [fps, setFps] = useState(0);
  const [showStats, setShowStats] = useState(false);

  // Add state for 2D/3D toggle
  const [isSchematicView, setIsSchematicView] = useState(false);

  // Initialize shared materials and geometries
  const initSharedResources = () => {
    if (!sharedGeometries.lamp) {
      sharedGeometries.lamp = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16);
      sharedGeometries.bulb = new THREE.SphereGeometry(0.08, 8, 6);
    }

    if (!sharedMaterials.floor) {
      sharedMaterials.floor = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide,
        roughness: 0.8,
      });

      sharedMaterials.ceiling = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        side: THREE.DoubleSide,
        roughness: 0.8,
      });

      sharedMaterials.wall = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        side: THREE.DoubleSide,
        roughness: 0.6,
      });

      sharedMaterials.lamp = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.6,
        roughness: 0.2,
      });

      sharedMaterials.bulb = new THREE.MeshStandardMaterial({
        color: 0xffffee,
        emissive: 0xffffcc,
        emissiveIntensity: 1,
      });

      // Add materials for schematic view
      sharedMaterials.schematic = new THREE.MeshBasicMaterial({
        color: 0xeeeeee,
        side: THREE.DoubleSide,
      });

      sharedMaterials.gridLine = new THREE.LineBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.5,
      });
    }
  };

  // Cleanup function for proper resource disposal
  const cleanupScene = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }

    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        // TypeScript-safe way to check for Mesh objects with geometry
        if (
          (object as any).geometry &&
          !Object.values(sharedGeometries).includes((object as any).geometry)
        ) {
          (object as THREE.Mesh).geometry.dispose();
        }

        // TypeScript-safe way to check for materials
        if ((object as any).material) {
          const material = (object as THREE.Mesh).material;
          if (!Object.values(sharedMaterials).includes(material as any)) {
            if (Array.isArray(material)) {
              material.forEach((mat) => mat.dispose());
            } else {
              (material as THREE.Material).dispose();
            }
          }
        }
      });
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }

    if (labelRendererRef.current) {
      if (labelRendererRef.current.domElement.parentNode) {
        labelRendererRef.current.domElement.parentNode.removeChild(
          labelRendererRef.current.domElement
        );
      }
      labelRendererRef.current = null;
    }

    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }
    resetCameraView();
  };

  useEffect(() => {
    setIsClient(true);
    initSharedResources();

    return cleanupScene;
  }, []);

  // Monitor calculation state changes to force re-renders
  useEffect(() => {
    if (!isCalculating) {
      setRenderKey((prev) => prev + 1);
      cleanupScene();

      setTimeout(() => {
        setIsClient(true);
      }, 50);
    }
  }, [isCalculating]);

  // Effect for view mode change
  useEffect(() => {
    if (isClient && containerRef.current && lightingResults) {
      cleanupScene();
      initScene();
    }
  }, [isSchematicView]);

  // Main scene initialization
  const initScene = () => {
    if (!isClient || !containerRef.current || !lightingResults) return;

    // Clear any previous scene elements
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Initialize scene with optimized settings
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Set up camera based on view mode
    let camera: THREE.Camera;

    if (isSchematicView) {
      // Orthographic camera for 2D view
      const aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      const viewSize =
        Math.max(roomDimensions.length, roomDimensions.width) * 1.2;
      camera = new THREE.OrthographicCamera(
        (-viewSize * aspect) / 2,
        (viewSize * aspect) / 2,
        viewSize / 2,
        -viewSize / 2,
        0.1,
        1000
      );

      // Position camera for top-down view
      camera.position.set(
        roomDimensions.length / 2,
        roomDimensions.height * 2,
        roomDimensions.width / 2
      );

      camera.lookAt(roomDimensions.length / 2, 0, roomDimensions.width / 2);

      camera.up.set(0, 0, 1); // Set Z as up for top-down view
    } else {
      // Perspective camera for 3D view
      camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );

      // Optimize camera position for better initial view
      const maxDimension = Math.max(
        roomDimensions.length,
        roomDimensions.width,
        roomDimensions.height
      );

      camera.position.set(
        roomDimensions.length * 0.75,
        roomDimensions.height * 1.2,
        roomDimensions.width * 1.2
      );

      camera.lookAt(
        roomDimensions.length / 2,
        roomDimensions.height / 2,
        roomDimensions.width / 2
      );
    }

    cameraRef.current = camera;

    // Set up optimized renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      precision: "mediump",
    });

    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSchematicView; // No shadows needed in schematic view
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add tone mapping for better visual quality (only in 3D mode)
    if (!isSchematicView) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
    }

    containerRef.current.appendChild(renderer.domElement);

    // Set up optimized label renderer
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    containerRef.current.appendChild(labelRenderer.domElement);

    // Lighting setup - simplified for schematic view
    if (isSchematicView) {
      // Simple ambient light for 2D view
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
      scene.add(ambientLight);
    } else {
      // Full lighting setup for 3D view
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      // Add main directional light with optimized shadow settings
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
      dirLight.position.set(
        roomDimensions.length,
        roomDimensions.height,
        roomDimensions.width
      );
      dirLight.castShadow = true;

      // Optimize shadow camera settings
      const shadowSize =
        Math.max(roomDimensions.length, roomDimensions.width) * 1.2;
      dirLight.shadow.camera.left = -shadowSize / 2;
      dirLight.shadow.camera.right = shadowSize / 2;
      dirLight.shadow.camera.top = shadowSize / 2;
      dirLight.shadow.camera.bottom = -shadowSize / 2;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far =
        Math.max(
          roomDimensions.length,
          roomDimensions.width,
          roomDimensions.height
        ) * 3;
      dirLight.shadow.bias = -0.001;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      scene.add(dirLight);

      // Add hemisphere light for better ambient illumination
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.3);
      scene.add(hemiLight);
    }

    // Create room
    if (isSchematicView) {
      createSchematicView(scene, roomDimensions);
    } else {
      createRoom(scene, roomDimensions);
    }

    // Add lamps
    if (lampPositions.length > 0) {
      if (isSchematicView) {
        addSchematicLamps(scene, lampPositions);
      } else {
        addLamps(scene, lampPositions, roomDimensions.height);
      }
    }

    // Set up controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = true;

    if (isSchematicView) {
      // Restrict rotation in schematic view
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI / 4; // Limit rotation to maintain top-down view
      controls.enableRotate = false; // Disable rotation for schematic view
    } else {
      controls.rotateSpeed = 0.7;
      controls.maxPolarAngle = Math.PI;
      controls.minPolarAngle = 0;
    }

    controls.enableZoom = true;
    controls.minDistance = 0.5;
    controls.maxDistance =
      Math.max(
        roomDimensions.length,
        roomDimensions.width,
        roomDimensions.height
      ) * 3;

    controlsRef.current = controls;

    // Animation loop with frame tracking
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;
    let throttledResize = false;

    const animate = () => {
      const time = performance.now();
      frameCount++;

      if (time > lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (time - lastTime));
        frameCount = 0;
        lastTime = time;
        setFps(fps);
      }

      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Throttled resize handler for better performance
    const handleResize = () => {
      if (throttledResize) return;
      throttledResize = true;

      setTimeout(() => {
        if (!containerRef.current) return;

        if (isSchematicView && camera instanceof THREE.OrthographicCamera) {
          const aspect =
            containerRef.current.clientWidth /
            containerRef.current.clientHeight;
          const viewSize =
            Math.max(roomDimensions.length, roomDimensions.width) * 1.2;

          camera.left = (-viewSize * aspect) / 2;
          camera.right = (viewSize * aspect) / 2;
          camera.top = viewSize / 2;
          camera.bottom = -viewSize / 2;
          camera.updateProjectionMatrix();
        } else if (camera instanceof THREE.PerspectiveCamera) {
          camera.aspect =
            containerRef.current.clientWidth /
            containerRef.current.clientHeight;
          camera.updateProjectionMatrix();
        }

        renderer.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
        labelRenderer.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );

        throttledResize = false;
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    // Store renderer references for cleanup
    rendererRef.current = renderer;
    labelRendererRef.current = labelRenderer;

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (containerRef.current) {
        if (renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
        if (labelRenderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(labelRenderer.domElement);
        }
      }

      renderer.dispose();
      controls.dispose();
      resetCameraView();
    };
  };

  // Effect to initialize scene
  useEffect(() => {
    if (isClient && containerRef.current && lightingResults) {
      initScene();
      resetCameraView();
    }

    // Cleanup on unmount
    return () => {
      cleanupScene();
      resetCameraView();
    };
  }, [
    isClient,
    roomDimensions,
    lampPositions,
    lightingResults,
    lightingRequirements,
    renderKey,
  ]);

  // Toggle view mode handler
  const toggleViewMode = () => {
    setIsSchematicView(!isSchematicView);
    resetCameraView();
  };

  // Toggle stats display
  const toggleStats = () => {
    setShowStats(!showStats);
  };

  // Reset camera view
  const resetCameraView = () => {
    if (cameraRef.current && controlsRef.current) {
      // Reset camera position based on view mode
      if (
        isSchematicView &&
        cameraRef.current instanceof THREE.OrthographicCamera
      ) {
        cameraRef.current.position.set(
          roomDimensions.length / 2,
          roomDimensions.height * 2,
          roomDimensions.width / 2
        );
        cameraRef.current.lookAt(
          roomDimensions.length / 2,
          0,
          roomDimensions.width / 2
        );
      } else if (cameraRef.current instanceof THREE.PerspectiveCamera) {
        cameraRef.current.position.set(
          roomDimensions.length * 0.75,
          roomDimensions.height * 1.2,
          roomDimensions.width * 1.2
        );
        cameraRef.current.lookAt(
          roomDimensions.length / 2,
          roomDimensions.height / 2,
          roomDimensions.width / 2
        );
      }

      // Reset controls target
      controlsRef.current.target.set(
        roomDimensions.length / 2,
        isSchematicView ? 0 : roomDimensions.height / 2,
        roomDimensions.width / 2
      );

      controlsRef.current.update();
    }
  };

  // Loading and calculation states
  if (!isClient || !lightingResults) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-100 rounded-lg shadow-inner">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-lg font-medium text-gray-700">
            {isCalculating
              ? "Calculating optimal lighting layout..."
              : "Loading 3D visualization..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Three.js container with full dimensions */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* UI Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-right control panel */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 pointer-events-auto z-10">
          <button
            onClick={toggleViewMode}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <span className="mr-2">{isSchematicView ? "3D" : "2D"}</span>
            {isSchematicView ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <button
            onClick={resetCameraView}
            className="flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Reset View
          </button>

          <button
            onClick={toggleStats}
            className="flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>
        </div>

        {/* Bottom information panel */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent p-4 pointer-events-none">
          <div className="flex items-center justify-between">
            <div className="bg-white/90 p-3 rounded-lg shadow-lg max-w-md pointer-events-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-yellow-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                Lighting Configuration
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="bg-blue-50 px-3 py-2 rounded border border-blue-200">
                  <span className="text-xs uppercase text-blue-600 font-semibold">
                    Lamps
                  </span>
                  <p className="text-xl font-bold text-blue-800">
                    {lightingResults.numberOfLamps}
                  </p>
                </div>
                <div className="bg-green-50 px-3 py-2 rounded border border-green-200">
                  <span className="text-xs uppercase text-green-600 font-semibold">
                    Room Size
                  </span>
                  <p className="text-md font-bold text-green-800">
                    {roomDimensions.length}m × {roomDimensions.width}m ×{" "}
                    {roomDimensions.height}m
                  </p>
                </div>
              </div>
            </div>

            {showStats && (
              <div className="bg-white/80 p-2 rounded shadow pointer-events-auto">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Performance
                </div>
                <div className="flex gap-2">
                  <div className="bg-indigo-50 px-2 py-1 rounded">
                    <span className="text-xs text-indigo-700">FPS: {fps}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls help panel */}
        <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg pointer-events-auto max-w-xs transform transition-transform duration-300 hover:scale-105">
          <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-blue-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Controls
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            {isSchematicView ? (
              <>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Pan:</span> Drag with mouse
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Zoom:</span> Mouse wheel
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Rotate:</span> Left-click +
                  drag
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Pan:</span> Right-click +
                  drag
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Zoom:</span> Mouse wheel
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to create the room with optimized geometry
const createRoom = (scene: THREE.Scene, dimensions: RoomDimensions): void => {
  // Create floor with shared material
  const floorGeometry = new THREE.PlaneGeometry(
    dimensions.length,
    dimensions.width
  );
  const floor = new THREE.Mesh(floorGeometry, sharedMaterials.floor!);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(dimensions.length / 2, 0, dimensions.width / 2);
  floor.receiveShadow = true;
  scene.add(floor);

  // Create ceiling with shared material
  const ceilingGeometry = new THREE.PlaneGeometry(
    dimensions.length,
    dimensions.width
  );
  const ceiling = new THREE.Mesh(ceilingGeometry, sharedMaterials.ceiling!);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(
    dimensions.length / 2,
    dimensions.height,
    dimensions.width / 2
  );
  scene.add(ceiling);

  // Create walls with optimized configuration
  const wallConfigs: WallConfig[] = [
    // Wall 1 (x = 0)
    {
      size: [dimensions.width, dimensions.height],
      rotation: [0, Math.PI / 2, 0],
      position: [0, dimensions.height / 2, dimensions.width / 2],
    },
    // Wall 2 (x = length)
    {
      size: [dimensions.width, dimensions.height],
      rotation: [0, -Math.PI / 2, 0],
      position: [
        dimensions.length,
        dimensions.height / 2,
        dimensions.width / 2,
      ],
    },
    // Wall 3 (z = 0)
    {
      size: [dimensions.length, dimensions.height],
      rotation: [0, 0, 0],
      position: [dimensions.length / 2, dimensions.height / 2, 0],
    },
    // Wall 4 (z = width)
    {
      size: [dimensions.length, dimensions.height],
      rotation: [0, Math.PI, 0],
      position: [
        dimensions.length / 2,
        dimensions.height / 2,
        dimensions.width,
      ],
    },
  ];

  // Create walls using the configurations
  wallConfigs.forEach((config) => {
    const wallGeometry = new THREE.PlaneGeometry(
      config.size[0],
      config.size[1]
    );
    const wall = new THREE.Mesh(wallGeometry, sharedMaterials.wall!);
    wall.rotation.set(
      config.rotation[0],
      config.rotation[1],
      config.rotation[2]
    );
    wall.position.set(
      config.position[0],
      config.position[1],
      config.position[2]
    );
    wall.receiveShadow = true;
    scene.add(wall);
  });

  // Add room outline for better visibility
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(
      new THREE.BoxGeometry(
        dimensions.length,
        dimensions.height,
        dimensions.width
      )
    ),
    new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.7,
    })
  );

  edges.position.set(
    dimensions.length / 2,
    dimensions.height / 2,
    dimensions.width / 2
  );

  scene.add(edges);

  // Add room dimensions labels
  addRoomDimensionLabels(scene, dimensions);
};

// Create a 2D schematic view
const createSchematicView = (
  scene: THREE.Scene,
  dimensions: RoomDimensions
): void => {
  // Create floor plane (main schematic surface)
  const floorGeometry = new THREE.PlaneGeometry(
    dimensions.length,
    dimensions.width
  );
  const floor = new THREE.Mesh(floorGeometry, sharedMaterials.schematic!);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(dimensions.length / 2, 0, dimensions.width / 2);
  scene.add(floor);

  // Add room outline
  const outlineGeometry = new THREE.EdgesGeometry(
    new THREE.PlaneGeometry(dimensions.length, dimensions.width)
  );
  const outline = new THREE.LineSegments(
    outlineGeometry,
    new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
  );
  outline.rotation.x = -Math.PI / 2;
  outline.position.set(dimensions.length / 2, 0.01, dimensions.width / 2); // Slightly above floor
  scene.add(outline);

  // Add grid lines for measurements
  createMeasurementGrid(scene, dimensions);

  // Add detailed dimension labels
  addSchematicDimensionLabels(scene, dimensions);
};

// Create measurement grid for schematic view
const createMeasurementGrid = (
  scene: THREE.Scene,
  dimensions: RoomDimensions
): void => {
  const gridLineColor = 0xaaaaaa;
  const gridSize = 1.0; // 1 meter grid

  // Calculate grid dimensions
  const gridLengthCount = Math.ceil(dimensions.length / gridSize);
  const gridWidthCount = Math.ceil(dimensions.width / gridSize);

  // Create grid lines along length (x-axis)
  for (let i = 0; i <= gridWidthCount; i++) {
    const z = i * gridSize;
    if (z > dimensions.width) continue;

    const points = [
      new THREE.Vector3(0, 0.02, z),
      new THREE.Vector3(dimensions.length, 0.02, z),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create a material for the line (with null check)
    const lineMaterial =
      sharedMaterials.gridLine ||
      new THREE.LineBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.5,
      });

    const line = new THREE.Line(geometry, lineMaterial);
    scene.add(line);

    // Add grid measurement label
    const meterLabel = document.createElement("div");
    meterLabel.textContent = `${z.toFixed(1)}m`;
    meterLabel.style.color = "#555";
    meterLabel.style.fontSize = "10px";
    meterLabel.style.background = "rgba(255, 255, 255, 0.5)";
    meterLabel.style.padding = "1px 3px";
    meterLabel.style.borderRadius = "2px";

    const label = new CSS2DObject(meterLabel);
    label.position.set(-0.3, 0.05, z);
    scene.add(label);
  }

  // Create grid lines along width (z-axis)
  for (let i = 0; i <= gridLengthCount; i++) {
    const x = i * gridSize;
    if (x > dimensions.length) continue;

    const points = [
      new THREE.Vector3(x, 0.02, 0),
      new THREE.Vector3(x, 0.02, dimensions.width),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create a material for the line (with null check)
    const lineMaterial =
      sharedMaterials.gridLine ||
      new THREE.LineBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.5,
      });

    const line = new THREE.Line(geometry, lineMaterial);
    scene.add(line);

    // Add grid measurement label
    const meterLabel = document.createElement("div");
    meterLabel.textContent = `${x.toFixed(1)}m`;
    meterLabel.style.color = "#555";
    meterLabel.style.fontSize = "10px";
    meterLabel.style.background = "rgba(255, 255, 255, 0.5)";
    meterLabel.style.padding = "1px 3px";
    meterLabel.style.borderRadius = "2px";

    const label = new CSS2DObject(meterLabel);
    label.position.set(x, 0.05, -0.3);
    scene.add(label);
  }
};

// Add more detailed dimension labels for schematic view
const addSchematicDimensionLabels = (
  scene: THREE.Scene,
  dimensions: RoomDimensions
): void => {
  // Create label style options
  const labelStyle = {
    color: "#000",
    padding: "3px 6px",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "3px",
    fontSize: "12px",
    fontWeight: "bold",
    border: "1px solid #aaa",
  };

  // Length dimension label with arrow
  const lengthDiv = document.createElement("div");
  lengthDiv.textContent = `Length: ${dimensions.length}m`;
  Object.assign(lengthDiv.style, labelStyle);

  const lengthLabel = new CSS2DObject(lengthDiv);
  lengthLabel.position.set(dimensions.length / 2, 0.1, dimensions.width + 0.5);
  scene.add(lengthLabel);

  // Width dimension label with arrow
  const widthDiv = document.createElement("div");
  widthDiv.textContent = `Width: ${dimensions.width}m`;
  Object.assign(widthDiv.style, labelStyle);

  const widthLabel = new CSS2DObject(widthDiv);
  widthLabel.position.set(dimensions.length + 0.5, 0.1, dimensions.width / 2);
  scene.add(widthLabel);

  // Room label at center
  const roomLabelDiv = document.createElement("div");
  roomLabelDiv.textContent = `Room (${dimensions.length}m × ${dimensions.width}m × ${dimensions.height}m)`;
  Object.assign(roomLabelDiv.style, labelStyle);
  roomLabelDiv.style.fontSize = "14px";

  const roomLabel = new CSS2DObject(roomLabelDiv);
  roomLabel.position.set(dimensions.length / 2, 0.1, dimensions.width / 2);
  scene.add(roomLabel);
};

// Helper function to add lamps with optimized rendering
const addLamps = (
  scene: THREE.Scene,
  positions: LampPosition[],
  ceilingHeight: number
): void => {
  // Use instanced mesh for lamp fixtures if we have many lamps
  const useInstancing = positions.length > 20;

  if (
    useInstancing &&
    sharedGeometries.lamp &&
    sharedGeometries.bulb &&
    sharedMaterials.lamp &&
    sharedMaterials.bulb
  ) {
    // Create instanced meshes for lamps - with null checks to satisfy TypeScript
    const instancedLamp = new THREE.InstancedMesh(
      sharedGeometries.lamp,
      sharedMaterials.lamp,
      positions.length
    );

    const instancedBulb = new THREE.InstancedMesh(
      sharedGeometries.bulb,
      sharedMaterials.bulb,
      positions.length
    );

    const matrix = new THREE.Matrix4();

    // Add all lamp instances
    positions.forEach((pos, index) => {
      // Set lamp transform
      matrix.makeRotationX(Math.PI / 2);
      matrix.setPosition(pos.x, pos.z, pos.y);
      instancedLamp.setMatrixAt(index, matrix);

      // Set bulb transform
      matrix.makeRotationX(0);
      matrix.setPosition(pos.x, pos.z - 0.05, pos.y);
      instancedBulb.setMatrixAt(index, matrix);

      // Add light
      addLightForLamp(scene, pos, ceilingHeight, index);

      // Add label
      addLampLabel(scene, pos, index);
    });

    scene.add(instancedLamp);
    scene.add(instancedBulb);
  } else {
    // Use individual meshes for fewer lamps
    positions.forEach((pos, index) => {
      // TypeScript-safe checks for shared resources
      if (
        sharedGeometries.lamp &&
        sharedMaterials.lamp &&
        sharedGeometries.bulb &&
        sharedMaterials.bulb
      ) {
        // Create lamp fixture
        const lamp = new THREE.Mesh(
          sharedGeometries.lamp,
          sharedMaterials.lamp
        );
        lamp.position.set(pos.x, pos.z, pos.y);
        lamp.rotation.x = Math.PI / 2;
        lamp.castShadow = true;
        scene.add(lamp);

        // Add bulb
        const bulb = new THREE.Mesh(
          sharedGeometries.bulb,
          sharedMaterials.bulb
        );
        bulb.position.set(pos.x, pos.z - 0.05, pos.y);
        scene.add(bulb);

        // Add light
        addLightForLamp(scene, pos, ceilingHeight, index);

        // Add label
        addLampLabel(scene, pos, index);
      }
    });
  }
};

// Add 2D schematic lamp representations with measurements and labels
const addSchematicLamps = (
  scene: THREE.Scene,
  positions: LampPosition[]
): void => {
  positions.forEach((pos, index) => {
    // Create lamp marker (circle)
    const lampGeometry = new THREE.CircleGeometry(0.15, 16);
    const lampMaterial = new THREE.MeshBasicMaterial({ color: 0xff9900 });
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
    lamp.rotation.x = -Math.PI / 2; // Face up
    lamp.position.set(pos.x, 0.03, pos.y); // Slightly above floor
    scene.add(lamp);

    // Add X mark in center of lamp
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

    // First line of X
    const points1 = [
      new THREE.Vector3(pos.x - 0.1, 0.04, pos.y - 0.1),
      new THREE.Vector3(pos.x + 0.1, 0.04, pos.y + 0.1),
    ];
    const line1 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points1),
      lineMaterial
    );
    scene.add(line1);

    // Second line of X
    const points2 = [
      new THREE.Vector3(pos.x - 0.1, 0.04, pos.y + 0.1),
      new THREE.Vector3(pos.x + 0.1, 0.04, pos.y - 0.1),
    ];
    const line2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points2),
      lineMaterial
    );
    scene.add(line2);

    // Add detailed label
    const lampDiv = document.createElement("div");
    lampDiv.className = "schematic-lamp-label";
    lampDiv.innerHTML = `<strong>Lamp ${index + 1}</strong><br>X: ${pos.x.toFixed(2)}m<br>Y: ${pos.y.toFixed(2)}m<br>Z: ${pos.z.toFixed(2)}m`;
    lampDiv.style.color = "#000";
    lampDiv.style.padding = "3px 6px";
    lampDiv.style.background = "rgba(255, 255, 255, 0.8)";
    lampDiv.style.borderRadius = "3px";
    lampDiv.style.fontSize = "10px";
    lampDiv.style.fontFamily = "Arial, sans-serif";
    lampDiv.style.border = "1px solid #ff9900";
    lampDiv.style.pointerEvents = "none";
    lampDiv.style.textAlign = "center";
    lampDiv.style.whiteSpace = "nowrap";

    const label = new CSS2DObject(lampDiv);
    label.position.set(pos.x, 0.05, pos.y);
    scene.add(label);

    // Add connecting line from lamp to coordinates
    if (index % 2 === 0) {
      // Alternate offset to reduce overlap
      // Draw a thin line to the coordinate display
      const coordLinePoints = [
        new THREE.Vector3(pos.x, 0.03, pos.y),
        new THREE.Vector3(pos.x + 0.4, 0.2, pos.y - 0.4),
      ];

      const coordLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(coordLinePoints),
        new THREE.LineBasicMaterial({
          color: 0x888888,
          transparent: true,
          opacity: 0.7,
        })
      );
      scene.add(coordLine);

      // Add a floating coordinate label
      const coordDiv = document.createElement("div");
      coordDiv.textContent = `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`;
      coordDiv.style.color = "#000";
      coordDiv.style.padding = "2px 4px";
      coordDiv.style.background = "rgba(255, 255, 255, 0.9)";
      coordDiv.style.borderRadius = "3px";
      coordDiv.style.fontSize = "9px";
      coordDiv.style.fontFamily = "monospace";
      coordDiv.style.border = "1px solid #ccc";

      const coordLabel = new CSS2DObject(coordDiv);
      coordLabel.position.set(pos.x + 0.4, 0.2, pos.y - 0.4);
      scene.add(coordLabel);
    }
  });

  // Add distribution lines between lamps if more than one
  if (positions.length > 1) {
    const lineMaterial = new THREE.LineDashedMaterial({
      color: 0x0088ff,
      dashSize: 0.1,
      gapSize: 0.05,
      transparent: true,
      opacity: 0.6,
    });

    // Connect lamps in order of installation
    for (let i = 0; i < positions.length - 1; i++) {
      const points = [
        new THREE.Vector3(positions[i].x, 0.02, positions[i].y),
        new THREE.Vector3(positions[i + 1].x, 0.02, positions[i + 1].y),
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      // Need to compute line distances for the dashed material to work properly
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.computeLineDistances(); // Required for dashed lines
      scene.add(line);

      // Add distance label
      const dx = positions[i + 1].x - positions[i].x;
      const dy = positions[i + 1].y - positions[i].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const distanceDiv = document.createElement("div");
      distanceDiv.textContent = `${distance.toFixed(2)}m`;
      distanceDiv.style.color = "#0066cc";
      distanceDiv.style.background = "rgba(255, 255, 255, 0.7)";
      distanceDiv.style.padding = "1px 3px";
      distanceDiv.style.borderRadius = "2px";
      distanceDiv.style.fontSize = "9px";

      const distanceLabel = new CSS2DObject(distanceDiv);
      distanceLabel.position.set(
        positions[i].x + dx / 2,
        0.03,
        positions[i].y + dy / 2
      );
      scene.add(distanceLabel);
    }
  }
};

// Helper function to add a light for a lamp
const addLightForLamp = (
  scene: THREE.Scene,
  position: LampPosition,
  ceilingHeight: number,
  index: number
): void => {
  const light = new THREE.PointLight(0xffffcc, 0.6, ceilingHeight * 2);
  light.position.set(position.x, position.z - 0.1, position.y);

  // Only enable shadows on a few lights to avoid WebGL texture limits
  if (index < 4) {
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.bias = -0.001;
  }

  scene.add(light);
};

// Helper function to add a label for a lamp
const addLampLabel = (
  scene: THREE.Scene,
  position: LampPosition,
  index: number
): void => {
  const div = document.createElement("div");
  div.className = "lamp-label";
  div.textContent = `Lamp ${index + 1}`;
  div.style.color = "#000";
  div.style.padding = "2px 5px";
  div.style.background = "rgba(255, 255, 255, 0.7)";
  div.style.borderRadius = "3px";
  div.style.fontSize = "10px";
  div.style.fontFamily = "Arial, sans-serif";
  div.style.pointerEvents = "none";
  div.style.textAlign = "center";

  const label = new CSS2DObject(div);
  label.position.set(position.x, position.z - 0.25, position.y);
  scene.add(label);
};

// Helper function to add room dimension labels
const addRoomDimensionLabels = (
  scene: THREE.Scene,
  dimensions: RoomDimensions
): void => {
  // Length label
  const lengthDiv = document.createElement("div");
  lengthDiv.textContent = `Length: ${dimensions.length}m`;
  lengthDiv.style.color = "#000";
  lengthDiv.style.padding = "2px 5px";
  lengthDiv.style.background = "rgba(255, 255, 255, 0.7)";
  lengthDiv.style.borderRadius = "3px";
  lengthDiv.style.fontSize = "12px";

  const lengthLabel = new CSS2DObject(lengthDiv);
  lengthLabel.position.set(dimensions.length / 2, 0.1, 0);
  scene.add(lengthLabel);

  // Width label
  const widthDiv = document.createElement("div");
  widthDiv.textContent = `Width: ${dimensions.width}m`;
  widthDiv.style.color = "#000";
  widthDiv.style.padding = "2px 5px";
  widthDiv.style.background = "rgba(255, 255, 255, 0.7)";
  widthDiv.style.borderRadius = "3px";
  widthDiv.style.fontSize = "12px";

  const widthLabel = new CSS2DObject(widthDiv);
  widthLabel.position.set(0, 0.1, dimensions.width / 2);
  scene.add(widthLabel);

  // Height label
  const heightDiv = document.createElement("div");
  heightDiv.textContent = `Height: ${dimensions.height}m`;
  heightDiv.style.color = "#000";
  heightDiv.style.padding = "2px 5px";
  heightDiv.style.background = "rgba(255, 255, 255, 0.7)";
  heightDiv.style.borderRadius = "3px";
  heightDiv.style.fontSize = "12px";

  const heightLabel = new CSS2DObject(heightDiv);
  heightLabel.position.set(0, dimensions.height / 2, 0);
  scene.add(heightLabel);
};

export default Room3DVisualization;
