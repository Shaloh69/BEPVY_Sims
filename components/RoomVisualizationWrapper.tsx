"use client";

import React, { useState, useEffect } from "react";
import { useLighting } from "../context/LightingProvider";
import Room3DVisualization from "./Room3DVisualization";

/**
 * This wrapper component ensures the 3D visualization re-mounts
 * completely when lighting calculations change.
 */
const RoomVisualizationWrapper: React.FC = () => {
  const { renderTrigger, lightingResults, isCalculating, calculateResults } =
    useLighting();

  // Track mount status for debugging
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("RoomVisualizationWrapper mounted");

    return () => {
      console.log("RoomVisualizationWrapper unmounted");
    };
  }, []);

  // Force recalculation function
  const handleForceRecalculate = () => {
    console.log("Force recalculation requested");
    calculateResults();
  };

  // Show loading state while calculating
  if (isCalculating) {
    return (
      <div
        className="w-full h-96 flex flex-col items-center justify-center bg-gray-100"
        style={{ minHeight: "500px" }}
      >
        <div className="text-lg">Calculating lighting...</div>
        <div className="mt-2 text-sm text-gray-500">
          Please wait while we update the visualization
        </div>
      </div>
    );
  }

  // Show placeholder if no results yet
  if (!lightingResults) {
    return (
      <div
        className="w-full h-96 flex flex-col items-center justify-center bg-gray-100"
        style={{ minHeight: "500px" }}
      >
        <div className="text-lg">No lighting data available</div>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleForceRecalculate}
        >
          Calculate Lighting
        </button>
      </div>
    );
  }

  console.log(`Rendering visualization with render trigger: ${renderTrigger}`);

  // Render the visualization with key based on renderTrigger
  // This forces a complete remount when renderTrigger changes
  return (
    <div className="relative">
      <Room3DVisualization key={`room-vis-${renderTrigger}`} />
    </div>
  );
};

export default RoomVisualizationWrapper;
