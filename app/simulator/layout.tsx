"use client";

import React, { createContext, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar_sim";
import { LightingProvider } from "@/context/LightingProvider";

// Create a context to share sidebar visibility state
export const SidebarContext = createContext({
  sidebarVisible: true,
  setSidebarVisible: (visible: boolean) => {},
});

export default function SimLayout({ children }: { children: React.ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and set mobile state
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-hide sidebar on mobile
      if (mobile && sidebarVisible) {
        setSidebarVisible(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [sidebarVisible]);

  return (
    <LightingProvider>
      <SidebarContext.Provider value={{ sidebarVisible, setSidebarVisible }}>
        <div className="w-full h-screen flex overflow-hidden">
          {/* Sidebar - will be controlled by the sidebar component */}
          <Sidebar />

          {/* Main content area - adapts to sidebar state */}
          <div
            className={`flex-grow h-full transition-all duration-300 ease-in-out ${
              sidebarVisible ? "md:ml-80" : "ml-0"
            }`}
            style={{ height: "calc(100vh - 4rem)" }}
          >
            {children}
          </div>
        </div>
      </SidebarContext.Provider>
    </LightingProvider>
  );
}
