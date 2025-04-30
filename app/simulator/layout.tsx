"use client";

import Sidebar from "@/components/sidebar_sim";
import { LightingProvider } from "@/context/LightingProvider";

export default function SimLayout({ children }: { children: React.ReactNode }) {
  return (
    <LightingProvider>
      <div className="pt-16">
        {/* Sidebar */}
        <Sidebar />

        {/* 3D Canvas Content */}
        <div
          className="fixed top-16 left-80 right-0 bottom-0"
          style={{ height: "calc(100vh - 4rem)" }}
        >
          {children}
        </div>
      </div>
    </LightingProvider>
  );
}
