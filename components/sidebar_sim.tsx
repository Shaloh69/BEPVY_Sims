"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";

import { Select, SelectItem } from "@heroui/select";

import { siteConfig } from "@/config/site";

const Sidebar: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-64 h-full fixed left-0 top-16 bg-transparent"></div>
    );
  }

  return (
    <aside
      className={clsx(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 p-4 transition-colors",
        "flex flex-col space-y-4 backdrop-blur-md",
        resolvedTheme === "dark"
          ? "bg-black/40 text-white"
          : "bg-white/40 text-black border-r border-gray-300/50"
      )}
    >
      <h2 className="text-xl font-bold text-center">Lumen Simulator</h2>
      <nav>
        <ul className="space-y-4">
          <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
            <Select
              className="max-w-xs"
              label="Select Lamp Type"
              placeholder="Select Lamp Type"
              variant="bordered"
            >
              {siteConfig.sim_LumensItems.map((items) => (
                <SelectItem key={items.key}>{items.label}</SelectItem>
              ))}
            </Select>
          </div>
          <li className="p-2 rounded bg-opacity-80 hover:bg-opacity-100 transition-all cursor-pointer bg-blue-700 text-white">
            Placeholder Item 2
          </li>
          <li className="p-2 rounded bg-opacity-80 hover:bg-opacity-100 transition-all cursor-pointer bg-blue-700 text-white">
            Placeholder Item 3
          </li>
          <li className="p-2 rounded bg-opacity-80 hover:bg-opacity-100 transition-all cursor-pointer bg-blue-700 text-white">
            Placeholder Item 4
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
