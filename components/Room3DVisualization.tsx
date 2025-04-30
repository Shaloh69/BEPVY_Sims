"use client";

import React, { useRef, useEffect, useState } from "react";
import { useLighting } from "../context/LightingProvider";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

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
  const [renderKey, setRenderKey] = useState(0); // Add a key to force re-renders

  useEffect(() => {
    setIsClient(true);

    // Cleanup function to properly dispose resources when component unmounts
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (labelRendererRef.current) {
        if (labelRendererRef.current.domElement.parentNode) {
          labelRendererRef.current.domElement.parentNode.removeChild(
            labelRendererRef.current.domElement
          );
        }
      }
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, []);

  // Monitor calculation state changes to force re-renders
  useEffect(() => {
    // When calculation completes (isCalculating changes from true to false)
    if (!isCalculating) {
      // Force a complete re-render by incrementing the key
      setRenderKey((prev) => prev + 1);

      // Force cleanup and recreation of the scene
      if (rendererRef.current && containerRef.current) {
        if (
          rendererRef.current.domElement.parentNode === containerRef.current
        ) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }

      if (labelRendererRef.current && containerRef.current) {
        if (
          labelRendererRef.current.domElement.parentNode ===
          containerRef.current
        ) {
          containerRef.current.removeChild(labelRendererRef.current.domElement);
        }
        labelRendererRef.current = null;
      }

      // Trigger re-render after a small delay to ensure state is updated
      setTimeout(() => {
        setIsClient(true);
      }, 50);
    }
  }, [isCalculating]);

  useEffect(() => {
    if (!isClient || !containerRef.current || !lightingResults) return;

    // Clear any previous scene elements
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    // Position camera in the center of the room
    camera.position.set(
      roomDimensions.length / 2,
      roomDimensions.height / 2,
      roomDimensions.width / 2
    );

    // Set up renderer with optimized settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.shadowMap.enabled = true;
    // Use more efficient shadow map type
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Set up label renderer
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    containerRef.current.appendChild(labelRenderer.domElement);

    // Add stronger ambient light to compensate for fewer shadow-casting lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light for shadows (main shadow source)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(
      roomDimensions.length,
      roomDimensions.height,
      roomDimensions.width
    );
    dirLight.castShadow = true;
    // Optimize shadow settings
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.far = 50;
    scene.add(dirLight);

    // Add hemisphere light for better ambient illumination
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.3);
    scene.add(hemiLight);

    // Create room
    createRoom(scene, roomDimensions);

    // Add lamps
    if (lampPositions.length > 0) {
      addLamps(scene, lampPositions, roomDimensions.height);
    }

    // Set up controls for free camera movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = true; // Allow free panning
    controls.rotateSpeed = 0.7; // Adjust rotation speed
    controls.enableZoom = true; // Allow zooming
    controls.minDistance = 0.5; // Allow close approach
    controls.maxDistance =
      Math.max(
        roomDimensions.length,
        roomDimensions.width,
        roomDimensions.height
      ) * 3;

    // Don't restrict rotation to keep horizon level - allow full 360° viewing
    controls.maxPolarAngle = Math.PI; // Allow looking all the way down
    controls.minPolarAngle = 0; // Allow looking all the way up

    // Add stats display to show performance metrics (optional)
    const statsContainer = document.createElement("div");
    statsContainer.style.position = "absolute";
    statsContainer.style.top = "70px";
    statsContainer.style.right = "10px";
    statsContainer.style.fontSize = "12px";
    statsContainer.style.color = "white";
    statsContainer.style.backgroundColor = "rgba(0,0,0,0.5)";
    statsContainer.style.padding = "5px";
    statsContainer.style.borderRadius = "3px";
    containerRef.current.appendChild(statsContainer);

    // Animation loop
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;

    const animate = () => {
      const time = performance.now();
      frameCount++;

      if (time > lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (time - lastTime));
        frameCount = 0;
        lastTime = time;
        statsContainer.textContent = `FPS: ${fps} | Lamps: ${lampPositions.length}`;
      }

      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      labelRenderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // Store renderer references for cleanup
    rendererRef.current = renderer;
    labelRendererRef.current = labelRenderer;
    sceneRef.current = scene;

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        if (renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
        if (labelRenderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(labelRenderer.domElement);
        }
        if (statsContainer.parentNode === containerRef.current) {
          containerRef.current.removeChild(statsContainer);
        }
      }

      // Dispose of Three.js resources
      renderer.dispose();
      controls.dispose();
    };
  }, [
    isClient,
    roomDimensions,
    lampPositions,
    lightingResults,
    lightingRequirements,
    renderKey,
  ]);

  if (!isClient || !lightingResults) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100">
        {isCalculating
          ? "Calculating lighting..."
          : "Loading 3D visualization..."}
      </div>
    );
  }

  // Display calculations completed message with lamp count
  const calculationInfo = lightingResults ? (
    <div className="absolute bottom-2 left-2 bg-white bg-opacity-70 p-2 rounded text-sm">
      Lamps: {lightingResults.numberOfLamps} | Room: {roomDimensions.length}m ×{" "}
      {roomDimensions.width}m × {roomDimensions.height}m
    </div>
  ) : null;

  // Add camera controls help
  const controlsInfo = (
    <div className="absolute top-2 left-2 bg-white bg-opacity-70 p-2 rounded text-sm max-w-xs">
      <strong>Controls:</strong>
      <br />
      Left-drag: Rotate | Right-drag: Pan | Scroll: Zoom
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-96 relative border border-gray-200 rounded"
      style={{ minHeight: "500px" }}
    >
      {calculationInfo}
      {controlsInfo}
    </div>
  );
};

// Helper function to create the room
const createRoom = (
  scene: THREE.Scene,
  dimensions: { length: number; width: number; height: number }
): void => {
  // Create room materials
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide,
    roughness: 0.8,
  });

  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    side: THREE.DoubleSide,
    roughness: 0.8,
  });

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    side: THREE.DoubleSide,
    roughness: 0.6,
  });

  // Floor
  const floorGeometry = new THREE.PlaneGeometry(
    dimensions.length,
    dimensions.width
  );
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(dimensions.length / 2, 0, dimensions.width / 2);
  floor.receiveShadow = true;
  scene.add(floor);

  // Ceiling
  const ceilingGeometry = new THREE.PlaneGeometry(
    dimensions.length,
    dimensions.width
  );
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(
    dimensions.length / 2,
    dimensions.height,
    dimensions.width / 2
  );
  scene.add(ceiling);

  // Wall 1 (x = 0)
  const wall1Geometry = new THREE.PlaneGeometry(
    dimensions.width,
    dimensions.height
  );
  const wall1 = new THREE.Mesh(wall1Geometry, wallMaterial);
  wall1.rotation.y = Math.PI / 2;
  wall1.position.set(0, dimensions.height / 2, dimensions.width / 2);
  wall1.receiveShadow = true;
  scene.add(wall1);

  // Wall 2 (x = length)
  const wall2Geometry = new THREE.PlaneGeometry(
    dimensions.width,
    dimensions.height
  );
  const wall2 = new THREE.Mesh(wall2Geometry, wallMaterial);
  wall2.rotation.y = -Math.PI / 2;
  wall2.position.set(
    dimensions.length,
    dimensions.height / 2,
    dimensions.width / 2
  );
  wall2.receiveShadow = true;
  scene.add(wall2);

  // Wall 3 (z = 0)
  const wall3Geometry = new THREE.PlaneGeometry(
    dimensions.length,
    dimensions.height
  );
  const wall3 = new THREE.Mesh(wall3Geometry, wallMaterial);
  wall3.position.set(dimensions.length / 2, dimensions.height / 2, 0);
  wall3.receiveShadow = true;
  scene.add(wall3);

  // Wall 4 (z = width)
  const wall4Geometry = new THREE.PlaneGeometry(
    dimensions.length,
    dimensions.height
  );
  const wall4 = new THREE.Mesh(wall4Geometry, wallMaterial);
  wall4.rotation.y = Math.PI;
  wall4.position.set(
    dimensions.length / 2,
    dimensions.height / 2,
    dimensions.width
  );
  wall4.receiveShadow = true;
  scene.add(wall4);

  // Add room outline for better visibility
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(
      new THREE.BoxGeometry(
        dimensions.length,
        dimensions.height,
        dimensions.width
      )
    ),
    new THREE.LineBasicMaterial({ color: 0x000000 })
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

// Helper function to add lamps
const addLamps = (
  scene: THREE.Scene,
  positions: Array<{ x: number; y: number; z: number }>,
  ceilingHeight: number
): void => {
  positions.forEach((pos, index) => {
    // Create lamp fixture
    const lampGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16);
    const lampMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.6,
      roughness: 0.2,
    });
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
    lamp.position.set(pos.x, pos.z, pos.y); // Three.js uses y-up, while our data uses z-up
    lamp.rotation.x = Math.PI / 2;
    lamp.castShadow = true;
    scene.add(lamp);

    // Add simplified bulb geometry with emissive material instead of additional lights
    const bulbGeometry = new THREE.SphereGeometry(0.08, 8, 6); // Reduced segments
    const bulbMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffee,
      emissive: 0xffffcc,
      emissiveIntensity: 1,
    });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulb.position.set(pos.x, pos.z - 0.05, pos.y);
    scene.add(bulb);

    // Add light source - limit shadows to avoid WebGL texture limits
    const light = new THREE.PointLight(0xffffcc, 0.6, ceilingHeight * 2);
    light.position.copy(lamp.position);
    light.position.y -= 0.1; // Position light slightly below lamp

    // Only enable shadows on a few lights to avoid WebGL texture limits
    // Max ~4 shadow-casting lights to stay under the 16 texture unit limit
    if (index < 4) {
      light.castShadow = true;
      light.shadow.mapSize.width = 512;
      light.shadow.mapSize.height = 512;
    }
    scene.add(light);

    // Add label
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
    label.position.set(pos.x, pos.z - 0.25, pos.y);
    scene.add(label);
  });
};

// Helper function to add room dimension labels
const addRoomDimensionLabels = (
  scene: THREE.Scene,
  dimensions: { length: number; width: number; height: number }
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
