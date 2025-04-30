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
    <div className="container mx-auto p-4">
      <div className="mb-6 h-fit">
        <DynamicRoomVisualizationWrapper />
      </div>

      <p className="text-sm text-gray-600">
        Note: Yellow dots represent light fixtures. The visualization shows the
        lamp positions as calculated by the lumen method.
      </p>
    </div>
  );
};

export default RoomVisualizationPage;
