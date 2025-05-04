"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the wrapper component with no SSR
const DynamicRoomVisualizationWrapper = dynamic(
  () => import("@/components/RoomVisualizationWrapper"),
  { ssr: false }
);

const RoomVisualizationPage: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Main visualization area - fills all available space */}
      <div className="flex-grow relative w-full h-full">
        <DynamicRoomVisualizationWrapper />
      </div>

      {/* Informational overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
          <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
          Yellow dots represent light fixtures. The visualization shows the lamp
          positions as calculated by the lumen method.
        </p>
      </div>
    </div>
  );
};

export default RoomVisualizationPage;
