"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";

import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Tooltip } from "@heroui/tooltip";
import { Badge } from "@heroui/badge";
import { Slider } from "@heroui/slider";

import { siteConfig } from "@/config/site";
import { useLighting } from "../context/LightingProvider";

// Type definitions
type ContaminationLevel = "very clean" | "clean" | "normal" | "dirty";
type MaintenanceInterval = 1 | 2 | 3 | 4 | 5 | 6;

const Sidebar: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

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

  if (!mounted) {
    return (
      <div className="w-64 h-full fixed left-0 top-16 bg-transparent"></div>
    );
  }

  return (
    <aside
      className={clsx(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 p-4 transition-colors",
        "flex flex-col space-y-4 backdrop-blur-md overflow-y-auto",
        resolvedTheme === "dark"
          ? "bg-black/40 text-white"
          : "bg-white/40 text-black border-r border-gray-300/50"
      )}
    >
      <h2 className="text-xl font-bold text-center">
        BEPVY Lighting Calculator
      </h2>

      <Divider className="my-2" />

      {/* Room Type Selection */}
      {siteConfig.roomTypes && (
        <section className="space-y-3">
          <h3 className="text-md font-semibold">Room Type</h3>
          <Select
            placeholder="Select room type"
            onSelectionChange={handleRoomTypeSelect}
          >
            {siteConfig.roomTypes.map((roomType) => (
              <SelectItem key={roomType.key}>
                {roomType.label} ({roomType.recommendedLux} lux)
              </SelectItem>
            ))}
          </Select>
        </section>
      )}

      <Divider className="my-2" />

      <section className="space-y-3">
        <h3 className="text-md font-semibold">Room Dimensions</h3>

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            label="Length (m)"
            value={roomLength.toString()}
            onChange={(e) =>
              handleNumberInputChange(e, setRoomLength, (value) =>
                setRoomDimensions({ ...roomDimensions, length: value })
              )
            }
            min={1}
            step={0.1}
          />
          <Input
            type="number"
            label="Width (m)"
            value={roomWidth.toString()}
            onChange={(e) =>
              handleNumberInputChange(e, setRoomWidth, (value) =>
                setRoomDimensions({ ...roomDimensions, width: value })
              )
            }
            min={1}
            step={0.1}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            label="Height (m)"
            value={roomHeight.toString()}
            onChange={(e) =>
              handleNumberInputChange(e, setRoomHeight, (value) =>
                setRoomDimensions({ ...roomDimensions, height: value })
              )
            }
            min={2}
            step={0.1}
          />
          <Input
            type="number"
            label="Workplane (m)"
            value={workplaneHeight.toString()}
            onChange={(e) =>
              handleNumberInputChange(e, setWorkplaneHeight, (value) =>
                setRoomDimensions({ ...roomDimensions, workplaneHeight: value })
              )
            }
            min={0}
            max={roomHeight - 0.5}
            step={0.1}
          />
        </div>

        <Tooltip content="Floor area is calculated automatically">
          <Input
            type="text"
            label="Floor Area (m²)"
            value={floorArea.toFixed(2)}
            readOnly
            className="bg-gray-100 dark:bg-gray-800"
          />
        </Tooltip>
      </section>

      <Divider className="my-2" />

      <section className="space-y-3">
        <h3 className="text-md font-semibold">Lighting Requirements</h3>

        <Input
          type="number"
          label="Target Illuminance (lux)"
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
        />

        <Select
          label="Select Lamp Type"
          placeholder="Select a lamp type"
          variant="bordered"
          onSelectionChange={handleLampSelect}
        >
          {siteConfig.sim_LumensItems.map((item) => (
            <SelectItem key={item.key}>{item.label}</SelectItem>
          ))}
        </Select>

        <Input
          type="number"
          label="Flux per Lamp (lumens)"
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
        />
      </section>

      <Divider className="my-2" />

      {/* Environmental Factors */}
      <section className="space-y-3">
        <h3 className="text-md font-semibold">Environmental Factors</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ceiling Reflectance</label>
          <div className="flex items-center gap-2">
            <Slider
              defaultValue={ceilingReflectance}
              onChange={(value: number | number[]) => {
                // for single-thumb sliders, Hero UI always passes a number,
                // but this keeps TS happy if it ever passed an array.
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
              className="flex-grow"
            />
            <span className="min-w-[40px] text-right">
              {(ceilingReflectance * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Wall Reflectance</label>
          <div className="flex items-center gap-2">
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
              className="flex-grow"
            />

            <span className="min-w-[40px] text-right">
              {(wallReflectance * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <Select
          label="Contamination Level"
          placeholder="Select contamination level"
          defaultSelectedKeys={[contaminationLevel]}
          onSelectionChange={handleContaminationLevelChange}
        >
          <SelectItem key="very clean">Very Clean</SelectItem>
          <SelectItem key="clean">Clean</SelectItem>
          <SelectItem key="normal">Normal</SelectItem>
          <SelectItem key="dirty">Dirty</SelectItem>
        </Select>

        <Select
          label="Maintenance Interval"
          placeholder="Select maintenance interval"
          defaultSelectedKeys={[maintenanceInterval.toString()]}
          onSelectionChange={handleMaintenanceIntervalChange}
        >
          <SelectItem key="1">1 Year</SelectItem>
          <SelectItem key="2">2 Years</SelectItem>
          <SelectItem key="3">3 Years</SelectItem>
          <SelectItem key="4">4 Years</SelectItem>
          <SelectItem key="5">5 Years</SelectItem>
          <SelectItem key="6">6 Years</SelectItem>
        </Select>
      </section>

      <div className="flex justify-center mt-2">
        <Button
          color="primary"
          onClick={handleCalculate}
          isLoading={isCalculating}
        >
          Calculate Lighting
        </Button>
      </div>

      {lightingResults && (
        <>
          <Divider className="my-2" />

          <section className="space-y-3 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <h3 className="text-md font-semibold">Calculation Results</h3>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Number of Lamps:</div>
              <div>{lightingResults.numberOfLamps}</div>

              <div className="font-medium">Room Cavity Ratio:</div>
              <div>{lightingResults.roomCavityRatio}</div>

              <div className="font-medium">Coefficient of Utilization:</div>
              <div>{lightingResults.coefficientOfUtilization}</div>

              <div className="font-medium">Maintenance Factor:</div>
              <div>{lightingResults.maintenanceFactor}</div>
            </div>

            <div className="text-sm mt-2">
              <div className="font-medium mb-1">Recommended Layout:</div>
              <div className="pl-2">
                <div>
                  {lightingResults.layout.rows} rows ×{" "}
                  {lightingResults.layout.columns} columns
                </div>
                <div>
                  Spacing: {lightingResults.layout.lengthSpacing}m (length) ×{" "}
                  {lightingResults.layout.widthSpacing}m (width)
                </div>
              </div>
            </div>

            {lightingResults.illuminanceDistribution && (
              <div className="text-sm mt-2">
                <div className="font-medium mb-1">
                  Illuminance Distribution:
                </div>
                <div className="pl-2">
                  <div>
                    Average:{" "}
                    {lightingResults.illuminanceDistribution.average.toFixed(0)}{" "}
                    lux
                  </div>
                  <div>
                    Min:{" "}
                    {lightingResults.illuminanceDistribution.minimum.toFixed(0)}{" "}
                    lux
                  </div>
                  <div>
                    Max:{" "}
                    {lightingResults.illuminanceDistribution.maximum.toFixed(0)}{" "}
                    lux
                  </div>
                  <div>
                    Uniformity:{" "}
                    {lightingResults.illuminanceDistribution.uniformity.toFixed(
                      2
                    )}
                  </div>
                </div>
              </div>
            )}

            {lightingResults.energyMetrics && (
              <div className="text-sm mt-2">
                <div className="font-medium mb-1">Energy Metrics:</div>
                <div className="pl-2">
                  <div>
                    Total Power:{" "}
                    {lightingResults.energyMetrics.totalPower.toFixed(2)} W
                  </div>
                  <div>
                    Power Density:{" "}
                    {lightingResults.energyMetrics.powerDensity.toFixed(2)} W/m²
                  </div>
                  <div className="flex items-center">
                    Efficiency Rating:
                    <Badge
                      className="ml-2"
                      color={
                        lightingResults.energyMetrics.efficiencyRating ===
                        "Excellent"
                          ? "success"
                          : lightingResults.energyMetrics.efficiencyRating ===
                              "Very Good"
                            ? "success"
                            : lightingResults.energyMetrics.efficiencyRating ===
                                "Good"
                              ? "warning"
                              : lightingResults.energyMetrics
                                    .efficiencyRating === "Average"
                                ? "warning"
                                : "danger"
                      }
                    >
                      {lightingResults.energyMetrics.efficiencyRating}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            BEPVY: Web-Based Platform for Luminance and Lamp Quantity Simulation
          </p>
          <p className="mt-1">
            Based on the formula: N = (E × A) / (Φ × C.U. × M.F.)
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
