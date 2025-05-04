"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";

import {
  Select,
  SelectItem,
  Input,
  Button,
  Divider,
  Tooltip,
  Badge,
  Slider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Chip,
  addToast,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  CardHeader,
} from "@heroui/react";

// Import Lucide icons
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  List,
  Lightbulb,
  Ruler,
  Settings,
  Save,
  Factory,
  Calculator,
  ArrowRight,
  FileText,
  Zap,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { useLighting } from "../context/LightingProvider";
import { useAuth } from "@/context/AuthContext";
import { useAuthModals } from "@/context/useAuthModals";

// Type definitions
type ContaminationLevel = "very clean" | "clean" | "normal" | "dirty";
type MaintenanceInterval = 1 | 2 | 3 | 4 | 5 | 6;

interface CollapsibleSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}

// Improved collapsible section component
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { resolvedTheme } = useTheme();

  return (
    <div className="mb-4 overflow-visible rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/30">
      <div
        className={clsx(
          "p-4 cursor-pointer flex justify-between items-center rounded-t-lg transition-colors",
          isOpen ? "border-b border-gray-200 dark:border-gray-700/30" : "",
          resolvedTheme === "dark"
            ? "bg-gray-800/50 hover:bg-gray-800/80"
            : "bg-white hover:bg-gray-50"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "p-2 rounded-md",
              resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-100"
            )}
          >
            {icon}
          </div>
          <span className="font-medium text-base">{title}</span>
        </div>
        <div
          className={clsx(
            "transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        >
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {isOpen && (
        <div
          className={clsx(
            "p-4 overflow-visible",
            resolvedTheme === "dark" ? "bg-gray-900/30" : "bg-gray-50/50"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);
  const { user } = useAuth();
  const { openModal } = useAuthModals();
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // States for saving calculations
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [calculationName, setCalculationName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Get everything from the LightingProvider context
  const {
    roomDimensions,
    setRoomDimensions,
    lightingRequirements,
    setLightingRequirements,
    lightingResults,
    calculateResults,
    isCalculating,
  } = useLighting();

  // Local UI state for form inputs that will update the context
  const [roomLength, setRoomLength] = useState<number>(roomDimensions.length);
  const [roomWidth, setRoomWidth] = useState<number>(roomDimensions.width);
  const [roomHeight, setRoomHeight] = useState<number>(roomDimensions.height);
  const [workplaneHeight, setWorkplaneHeight] = useState<number>(
    roomDimensions.workplaneHeight
  );
  const [targetLux, setTargetLux] = useState<number>(
    lightingRequirements.targetIlluminance
  );
  const [selectedLampType, setSelectedLampType] = useState<string>("");
  const [fluxPerLamp, setFluxPerLamp] = useState<number>(
    lightingRequirements.fluxPerLamp
  );
  const [ceilingReflectance, setCeilingReflectance] = useState<number>(
    lightingRequirements.ceilingReflectance
  );
  const [wallReflectance, setWallReflectance] = useState<number>(
    lightingRequirements.wallReflectance
  );
  const [contaminationLevel, setContaminationLevel] =
    useState<ContaminationLevel>(lightingRequirements.contaminationLevel);
  const [maintenanceInterval, setMaintenanceInterval] =
    useState<MaintenanceInterval>(lightingRequirements.maintenanceInterval);

  // Calculate floor area
  const floorArea = roomLength * roomWidth;

  // Check if viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && sidebarVisible) {
        setSidebarVisible(false);
      } else if (!mobile && !sidebarVisible) {
        setSidebarVisible(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [sidebarVisible]);

  // Initialize UI state from context
  useEffect(() => {
    setRoomLength(roomDimensions.length);
    setRoomWidth(roomDimensions.width);
    setRoomHeight(roomDimensions.height);
    setWorkplaneHeight(roomDimensions.workplaneHeight);
    setTargetLux(lightingRequirements.targetIlluminance);
    setFluxPerLamp(lightingRequirements.fluxPerLamp);
    setCeilingReflectance(lightingRequirements.ceilingReflectance);
    setWallReflectance(lightingRequirements.wallReflectance);
    setContaminationLevel(lightingRequirements.contaminationLevel);
    setMaintenanceInterval(lightingRequirements.maintenanceInterval);
  }, [roomDimensions, lightingRequirements]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Updated helper function to get selection value that's compatible with the library
  const getSelectionValue = (selection: any): string => {
    // Handle different selection formats that might come from the library
    if (selection === null || selection === undefined) return "";

    // If selection is a Set
    if (selection instanceof Set && selection.size > 0) {
      return String([...selection][0]);
    }

    // If selection has a keys property (might be an array or iterable)
    if (selection.keys && typeof selection.keys === "function") {
      const keys = Array.from(selection.keys());
      return keys.length > 0 ? String(keys[0]) : "";
    }

    // If selection is array-like
    if (Array.isArray(selection) && selection.length > 0) {
      return String(selection[0]);
    }

    // If selection is a direct value (string or number)
    if (typeof selection === "string" || typeof selection === "number") {
      return String(selection);
    }

    // If selection has a toString method
    if (selection.toString && typeof selection.toString === "function") {
      return selection.toString();
    }

    return "";
  };

  // Function to handle lamp type selection
  const handleLampSelect = (selection: any): void => {
    const key = getSelectionValue(selection);
    if (!key) return;

    setSelectedLampType(key);
    // Find the corresponding lamp type and set the flux value
    const lampItem = siteConfig.sim_LumensItems?.find(
      (item) => item.key === key
    );
    if (lampItem?.fluxValue) {
      setFluxPerLamp(lampItem.fluxValue);

      // Update the context immediately
      setLightingRequirements({
        ...lightingRequirements,
        fluxPerLamp: lampItem.fluxValue,
      });
    }
  };

  // Function to handle room type selection
  const handleRoomTypeSelect = (selection: any): void => {
    const key = getSelectionValue(selection);
    if (!key) return;

    // Find the corresponding room type and set the recommended illuminance
    const roomType = siteConfig.roomTypes?.find((item) => item.key === key);
    if (roomType?.recommendedLux) {
      setTargetLux(roomType.recommendedLux);

      // Update the context immediately
      setLightingRequirements({
        ...lightingRequirements,
        targetIlluminance: roomType.recommendedLux,
      });
    }
  };

  // Handler for number input changes
  const handleNumberInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>,
    contextUpdater: (value: number) => void
  ): void => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setter(value);
      contextUpdater(value);
    }
  };

  // Handler for contamination level selection
  const handleContaminationLevelChange = (selection: any): void => {
    const key = getSelectionValue(selection);
    if (!key) return;

    if (
      key === "very clean" ||
      key === "clean" ||
      key === "normal" ||
      key === "dirty"
    ) {
      setContaminationLevel(key as ContaminationLevel);

      // Update the context
      setLightingRequirements({
        ...lightingRequirements,
        contaminationLevel: key as ContaminationLevel,
      });
    }
  };

  // Handler for maintenance interval selection
  const handleMaintenanceIntervalChange = (selection: any): void => {
    const key = getSelectionValue(selection);
    if (!key) return;

    const interval = Number(key);
    if ([1, 2, 3, 4, 5, 6].includes(interval)) {
      setMaintenanceInterval(interval as MaintenanceInterval);

      // Update the context
      setLightingRequirements({
        ...lightingRequirements,
        maintenanceInterval: interval as MaintenanceInterval,
      });
    }
  };

  // Update room dimensions in context
  const updateRoomDimensions = () => {
    setRoomDimensions({
      length: roomLength,
      width: roomWidth,
      height: roomHeight,
      workplaneHeight: workplaneHeight,
    });
  };

  // Update lighting requirements in context
  const updateLightingRequirements = () => {
    setLightingRequirements({
      targetIlluminance: targetLux,
      fluxPerLamp: fluxPerLamp,
      contaminationLevel: contaminationLevel,
      maintenanceInterval: maintenanceInterval,
      ceilingReflectance: ceilingReflectance,
      wallReflectance: wallReflectance,
    });
  };

  // Function to handle calculation
  const handleCalculate = () => {
    // First ensure all context values are up-to-date
    updateRoomDimensions();
    updateLightingRequirements();

    // Then trigger the calculation
    calculateResults();

    console.log("Calculation triggered. Room dimensions:", roomDimensions);
    console.log("Lighting requirements:", lightingRequirements);
  };

  // Function to handle saving a calculation
  const handleSave = async () => {
    // Check if user is logged in
    if (!user) {
      addToast({
        title: "Login Required",
        description: "Please log in to save your calculations",
        color: "warning",
      });
      openModal("login");
      return;
    }

    // Check if calculation results exist
    if (!lightingResults) {
      addToast({
        title: "No Results",
        description: "Please calculate lighting results first",
        color: "warning",
      });
      return;
    }

    // Open the save modal
    setIsSaveModalOpen(true);

    // Generate a default name based on room dimensions
    setCalculationName(
      `Room ${roomLength}m × ${roomWidth}m - ${targetLux} lux`
    );
  };

  // Function to handle saving the calculation to the server
  const saveCalculation = async () => {
    if (!calculationName.trim()) {
      addToast({
        title: "Name Required",
        description: "Please enter a name for your calculation",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Create a promise for the save operation
      const savePromise = fetch("/api/calculation/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: calculationName,
          roomDimensions,
          lightingRequirements,
          results: lightingResults,
        }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save calculation");
        }
        return response.json();
      });

      // Show a toast with the promise
      addToast({
        title: "Saving Calculation",
        description: "Please wait while we save your calculation",
        promise: savePromise,
      });

      // Wait for the promise to resolve
      const data = await savePromise;

      // Close the modal
      setIsSaveModalOpen(false);

      // Show success toast
      addToast({
        title: "Calculation Saved",
        description: `"${calculationName}" has been saved successfully`,
        icon: <Save className="w-5 h-5" />,
      });
    } catch (error) {
      console.error("Save calculation error:", error);

      addToast({
        title: "Error Saving Calculation",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        timeout: 5000,
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle sidebar visibility (for mobile)
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  if (!mounted) {
    return (
      <div className="w-64 h-full fixed left-0 top-16 bg-transparent"></div>
    );
  }

  // Mobile toggle button - always visible
  const sidebarToggle = (
    <button
      onClick={toggleSidebar}
      className={clsx(
        "md:hidden fixed z-50 bottom-6 left-6 p-3 rounded-full shadow-lg",
        "transition-all duration-300 ease-in-out",
        resolvedTheme === "dark"
          ? "bg-gray-800 text-white hover:bg-gray-700"
          : "bg-white text-gray-800 hover:bg-gray-100",
        sidebarVisible ? "left-[260px]" : "left-6"
      )}
    >
      {sidebarVisible ? (
        <X className="w-6 h-6" />
      ) : (
        <Menu className="w-6 h-6" />
      )}
    </button>
  );

  // Custom input label component for better styling
  const InputLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
      {children}
    </label>
  );

  // Custom formatted value display
  const FormattedValue = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-gray-100 dark:bg-gray-800 py-1 px-2 text-xs rounded-md truncate">
      {children}
    </div>
  );

  return (
    <>
      {sidebarToggle}
      <aside
        className={clsx(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300",
          "flex flex-col backdrop-blur-md",
          resolvedTheme === "dark"
            ? "bg-black/50 text-white border-r border-gray-800/50"
            : "bg-white/90 text-black border-r border-gray-200/50",
          "shadow-xl",
          sidebarVisible // Conditional width/translation based on visibility
            ? "w-80 translate-x-0"
            : "w-80 -translate-x-full md:translate-x-0 md:w-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-3 flex items-center justify-between bg-gradient-to-r from-primary/20 to-transparent">
            <h2 className="text-lg font-bold flex items-center gap-2 truncate">
              <Lightbulb className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="truncate">BEPVY Lighting</span>
            </h2>

            {/* Mobile close button */}
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Main scroll area */}
          <div className="p-3 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            <div className="space-y-3">
              {/* Room Type Selection */}
              <CollapsibleSection
                title="Room Type"
                icon={<List className="w-5 h-5 text-primary" />}
                defaultOpen
              >
                {siteConfig.roomTypes && (
                  <div className="py-2">
                    <InputLabel>Select the type of room</InputLabel>
                    <Select
                      placeholder="Select room type"
                      onSelectionChange={handleRoomTypeSelect}
                      size="md"
                      variant="bordered"
                      classNames={{
                        trigger:
                          "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700",
                        value:
                          "text-ellipsis overflow-hidden whitespace-nowrap",
                      }}
                    >
                      {siteConfig.roomTypes.map((roomType) => (
                        <SelectItem key={roomType.key}>
                          {`${roomType.label} (${roomType.recommendedLux} lux)`}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                )}
              </CollapsibleSection>

              {/* Room Dimensions */}
              <CollapsibleSection
                title="Room Dimensions"
                icon={<Ruler className="w-5 h-5 text-blue-500" />}
                defaultOpen
              >
                <div className="py-2 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <InputLabel>Length (m)</InputLabel>
                      <Input
                        type="number"
                        value={roomLength.toString()}
                        onChange={(e) =>
                          handleNumberInputChange(e, setRoomLength, (value) =>
                            setRoomDimensions({
                              ...roomDimensions,
                              length: value,
                            })
                          )
                        }
                        min={1}
                        step={0.1}
                        size="md"
                        classNames={{
                          input: "bg-white dark:bg-gray-800",
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <InputLabel>Width (m)</InputLabel>
                      <Input
                        type="number"
                        value={roomWidth.toString()}
                        onChange={(e) =>
                          handleNumberInputChange(e, setRoomWidth, (value) =>
                            setRoomDimensions({
                              ...roomDimensions,
                              width: value,
                            })
                          )
                        }
                        min={1}
                        step={0.1}
                        size="md"
                        classNames={{
                          input: "bg-white dark:bg-gray-800",
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <InputLabel>Height (m)</InputLabel>
                      <Input
                        type="number"
                        value={roomHeight.toString()}
                        onChange={(e) =>
                          handleNumberInputChange(e, setRoomHeight, (value) =>
                            setRoomDimensions({
                              ...roomDimensions,
                              height: value,
                            })
                          )
                        }
                        min={2}
                        step={0.1}
                        size="md"
                        classNames={{
                          input: "bg-white dark:bg-gray-800",
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <InputLabel>Workplane (m)</InputLabel>
                      <Input
                        type="number"
                        value={workplaneHeight.toString()}
                        onChange={(e) =>
                          handleNumberInputChange(
                            e,
                            setWorkplaneHeight,
                            (value) =>
                              setRoomDimensions({
                                ...roomDimensions,
                                workplaneHeight: value,
                              })
                          )
                        }
                        min={0}
                        max={roomHeight - 0.5}
                        step={0.1}
                        size="md"
                        classNames={{
                          input: "bg-white dark:bg-gray-800",
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <InputLabel>Floor Area (m²)</InputLabel>
                    <Tooltip content="Floor area is calculated automatically">
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center font-medium">
                        {floorArea.toFixed(2)} m²
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Lighting Requirements */}
              <CollapsibleSection
                title="Lighting Requirements"
                icon={<Lightbulb className="w-5 h-5 text-amber-500" />}
                defaultOpen
              >
                <div className="py-2 space-y-3">
                  <div className="space-y-1">
                    <InputLabel>Target Illuminance (lux)</InputLabel>
                    <Input
                      type="number"
                      value={targetLux.toString()}
                      onChange={(e) =>
                        handleNumberInputChange(e, setTargetLux, (value) =>
                          setLightingRequirements({
                            ...lightingRequirements,
                            targetIlluminance: value,
                          })
                        )
                      }
                      min={50}
                      max={2000}
                      size="md"
                      classNames={{
                        input: "bg-white dark:bg-gray-800",
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <InputLabel>Lamp Type</InputLabel>
                    <Select
                      placeholder="Select a lamp type"
                      variant="bordered"
                      onSelectionChange={handleLampSelect}
                      size="md"
                      classNames={{
                        trigger:
                          "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700",
                        value:
                          "text-ellipsis overflow-hidden whitespace-nowrap",
                      }}
                    >
                      {siteConfig.sim_LumensItems.map((item) => (
                        <SelectItem
                          key={item.key}
                          description={`${item.type} - ${item.fluxValue} lumens - ${item.wattage}W`}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <InputLabel>Flux per Lamp (lumens)</InputLabel>
                    <Input
                      type="number"
                      value={fluxPerLamp.toString()}
                      onChange={(e) =>
                        handleNumberInputChange(e, setFluxPerLamp, (value) =>
                          setLightingRequirements({
                            ...lightingRequirements,
                            fluxPerLamp: value,
                          })
                        )
                      }
                      min={100}
                      size="md"
                      classNames={{
                        input: "bg-white dark:bg-gray-800",
                      }}
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Environmental Factors */}
              <CollapsibleSection
                title="Environmental Factors"
                icon={<Settings className="w-5 h-5 text-gray-500" />}
              >
                <div className="py-2 space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <InputLabel>Ceiling Reflectance</InputLabel>
                      <span className="text-xs font-semibold bg-primary/10 px-2 py-0.5 rounded">
                        {(ceilingReflectance * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      defaultValue={ceilingReflectance}
                      onChange={(value: number | number[]) => {
                        const newVal = Array.isArray(value) ? value[0] : value;
                        setCeilingReflectance(newVal);
                        setLightingRequirements({
                          ...lightingRequirements,
                          ceilingReflectance: newVal,
                        });
                      }}
                      step={0.05}
                      minValue={0}
                      maxValue={1}
                      size="sm"
                      color="primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <InputLabel>Wall Reflectance</InputLabel>
                      <span className="text-xs font-semibold bg-primary/10 px-2 py-0.5 rounded">
                        {(wallReflectance * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      defaultValue={wallReflectance}
                      onChange={(value: number | number[]) => {
                        const newVal = Array.isArray(value) ? value[0] : value;
                        setWallReflectance(newVal);
                        setLightingRequirements({
                          ...lightingRequirements,
                          wallReflectance: newVal,
                        });
                      }}
                      step={0.05}
                      minValue={0}
                      maxValue={1}
                      size="sm"
                      color="primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <InputLabel>Contamination Level</InputLabel>
                    <Select
                      placeholder="Select contamination level"
                      defaultSelectedKeys={[contaminationLevel]}
                      onSelectionChange={handleContaminationLevelChange}
                      size="md"
                      variant="bordered"
                      classNames={{
                        trigger:
                          "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700",
                        value:
                          "text-ellipsis overflow-hidden whitespace-nowrap",
                      }}
                    >
                      <SelectItem key="very clean">Very Clean</SelectItem>
                      <SelectItem key="clean">Clean</SelectItem>
                      <SelectItem key="normal">Normal</SelectItem>
                      <SelectItem key="dirty">Dirty</SelectItem>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <InputLabel>Maintenance Interval</InputLabel>
                    <Select
                      placeholder="Select maintenance interval"
                      defaultSelectedKeys={[maintenanceInterval.toString()]}
                      onSelectionChange={handleMaintenanceIntervalChange}
                      size="md"
                      variant="bordered"
                      classNames={{
                        trigger:
                          "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700",
                        value:
                          "text-ellipsis overflow-hidden whitespace-nowrap",
                      }}
                    >
                      <SelectItem key="1">1 Year</SelectItem>
                      <SelectItem key="2">2 Years</SelectItem>
                      <SelectItem key="3">3 Years</SelectItem>
                      <SelectItem key="4">4 Years</SelectItem>
                      <SelectItem key="5">5 Years</SelectItem>
                      <SelectItem key="6">6 Years</SelectItem>
                    </Select>
                  </div>
                </div>
              </CollapsibleSection>

              <div className="flex justify-center mt-3 gap-2">
                <Button
                  color="primary"
                  onClick={handleCalculate}
                  isLoading={isCalculating}
                  startContent={<Calculator className="w-4 h-4" />}
                  size="md"
                  className="px-4 py-1 font-medium"
                >
                  Calculate
                </Button>

                {lightingResults && (
                  <Button
                    color="secondary"
                    onClick={handleSave}
                    variant="flat"
                    startContent={<Save className="w-4 h-4" />}
                    size="md"
                    className="px-4 font-medium"
                  >
                    Save
                  </Button>
                )}
              </div>

              {lightingResults && (
                <>
                  <Divider className="my-4" />

                  {/* Basic Calculation Results */}
                  <CollapsibleSection
                    title="Calculation Results"
                    icon={<Zap className="w-5 h-5 text-primary" />}
                    defaultOpen
                  >
                    <div className="p-3 rounded-lg bg-white dark:bg-gray-800/50 shadow-inner">
                      <div className="grid gap-2">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Number of Lamps:
                          </div>
                          <div className="text-right font-semibold text-xs">
                            {lightingResults.numberOfLamps}
                          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Room Cavity Ratio:
                          </div>
                          <div className="text-right font-semibold text-xs">
                            {lightingResults.roomCavityRatio}
                          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Coefficient of Util.:
                          </div>
                          <div className="text-right font-semibold text-xs">
                            {lightingResults.coefficientOfUtilization}
                          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Maintenance Factor:
                          </div>
                          <div className="text-right font-semibold text-xs">
                            {lightingResults.maintenanceFactor}
                          </div>
                        </div>

                        <Divider className="my-1" />

                        <div>
                          <div className="text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Recommended Layout:
                          </div>
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <div className="grid grid-cols-2 gap-1">
                              <div className="flex items-center gap-1">
                                <Badge color="primary" variant="flat" size="sm">
                                  Rows
                                </Badge>
                                <span className="font-semibold text-xs">
                                  {lightingResults.layout.rows}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge color="primary" variant="flat" size="sm">
                                  Columns
                                </Badge>
                                <span className="font-semibold text-xs">
                                  {lightingResults.layout.columns}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge
                                  color="secondary"
                                  variant="flat"
                                  size="sm"
                                >
                                  Length
                                </Badge>
                                <span className="font-semibold text-xs">
                                  {lightingResults.layout.lengthSpacing}m
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge
                                  color="secondary"
                                  variant="flat"
                                  size="sm"
                                >
                                  Width
                                </Badge>
                                <span className="font-semibold text-xs">
                                  {lightingResults.layout.widthSpacing}m
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Illuminance Distribution */}
                  {lightingResults.illuminanceDistribution && (
                    <CollapsibleSection
                      title="Illuminance Distribution"
                      icon={<Lightbulb className="w-5 h-5 text-amber-500" />}
                    >
                      <div className="p-3 rounded-lg bg-white dark:bg-gray-800/50 shadow-inner">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Average:
                          </div>
                          <div className="text-right font-semibold text-xs">
                            {lightingResults.illuminanceDistribution.average.toFixed(
                              0
                            )}{" "}
                            lux
                          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Minimum:
                          </div>
                          <div className="text-right font-semibold text-xs">
                            {lightingResults.illuminanceDistribution.minimum.toFixed(
                              0
                            )}{" "}
                            lux
                          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Maximum:
                          </div>
                          <div className="text-right font-semibold text-xs">
                            {lightingResults.illuminanceDistribution.maximum.toFixed(
                              0
                            )}{" "}
                            lux
                          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Uniformity:
                          </div>
                          <div className="text-right font-semibold text-xs">
                            {lightingResults.illuminanceDistribution.uniformity.toFixed(
                              2
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Energy Metrics */}
                  {lightingResults.energyMetrics && (
                    <CollapsibleSection
                      title="Energy Metrics"
                      icon={<Zap className="w-5 h-5 text-yellow-500" />}
                    >
                      <div className="p-3 rounded-lg bg-white dark:bg-gray-800/50 shadow-inner">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Total Power:
                          </div>
                          <div className="text-right font-semibold text-xs">
                            {lightingResults.energyMetrics.totalPower.toFixed(
                              2
                            )}{" "}
                            W
                          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Power Density:
                          </div>
                          <div className="text-right font-semibold text-xs">
                            {lightingResults.energyMetrics.powerDensity.toFixed(
                              2
                            )}{" "}
                            W/m²
                          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Efficiency Rating:
                          </div>
                          <div className="text-right">
                            <Badge
                              color={
                                lightingResults.energyMetrics
                                  .efficiencyRating === "Excellent"
                                  ? "success"
                                  : lightingResults.energyMetrics
                                        .efficiencyRating === "Very Good"
                                    ? "success"
                                    : lightingResults.energyMetrics
                                          .efficiencyRating === "Good"
                                      ? "warning"
                                      : lightingResults.energyMetrics
                                            .efficiencyRating === "Average"
                                        ? "warning"
                                        : "danger"
                              }
                              size="sm"
                            >
                              {lightingResults.energyMetrics.efficiencyRating}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Bill of Materials */}
                  {lightingResults.billOfMaterials && (
                    <CollapsibleSection
                      title="Bill of Materials"
                      icon={<FileText className="w-5 h-5 text-green-500" />}
                      defaultOpen
                    >
                      <div className="p-2 rounded-lg bg-white dark:bg-gray-800/50 shadow-inner">
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                          <Table
                            aria-label="Bill of Materials"
                            removeWrapper
                            className="text-xs"
                            layout="fixed"
                          >
                            <TableHeader>
                              <TableColumn className="bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300 py-1 px-2">
                                ITEM
                              </TableColumn>
                              <TableColumn
                                className="bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300 text-right py-1 px-2"
                                width={50}
                              >
                                QTY
                              </TableColumn>
                              <TableColumn
                                className="bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300 text-right py-1 px-2"
                                width={50}
                              >
                                UNIT
                              </TableColumn>
                            </TableHeader>
                            <TableBody>
                              {lightingResults.billOfMaterials.items.map(
                                (item, index) => (
                                  <TableRow
                                    key={index}
                                    className={
                                      index % 2 === 0
                                        ? "bg-gray-50 dark:bg-gray-900/30"
                                        : ""
                                    }
                                  >
                                    <TableCell className="py-1 px-2">
                                      <div className="font-medium truncate">
                                        {item.name}
                                      </div>
                                      {item.description && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                          {item.description}
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right py-1 px-2">
                                      {typeof item.quantity === "number"
                                        ? item.quantity.toFixed(1)
                                        : item.quantity}
                                    </TableCell>
                                    <TableCell className="text-right py-1 px-2">
                                      {item.unit}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CollapsibleSection>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1 mb-1">
                <Factory className="w-3 h-3 flex-shrink-0" />
                <span className="font-medium truncate">
                  BEPVY Lighting Calculator
                </span>
              </div>
              <p className="text-xs opacity-75 truncate">
                N = (E × A) / (Φ × C.U. × M.F.)
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Save Calculation Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onOpenChange={setIsSaveModalOpen}
        classNames={{
          base: "bg-white dark:bg-gray-900",
          header: "border-b pb-3",
          footer: "border-t pt-3",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <Save className="w-5 h-5 text-primary" />
                <span className="text-xl">Save Calculation</span>
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Calculation Name"
                  placeholder="Enter a name for this calculation"
                  value={calculationName}
                  onChange={(e) => setCalculationName(e.target.value)}
                  fullWidth
                  autoFocus
                  size="lg"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={saveCalculation}
                  isLoading={isSaving}
                  startContent={<Save className="w-4 h-4" />}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Sidebar;
