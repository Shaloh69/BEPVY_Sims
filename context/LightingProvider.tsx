// context/LightingProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { siteConfig } from "@/config/site";
import { addToast } from "@heroui/react";

// Types
type ContaminationLevel = "very clean" | "clean" | "normal" | "dirty";
type MaintenanceInterval = 1 | 2 | 3 | 4 | 5 | 6;

interface RoomDimensions {
  length: number;
  width: number;
  height: number;
  workplaneHeight: number;
}

interface LightingRequirements {
  targetIlluminance: number;
  fluxPerLamp: number;
  contaminationLevel: ContaminationLevel;
  maintenanceInterval: MaintenanceInterval;
  ceilingReflectance: number;
  wallReflectance: number;
}

interface Layout {
  rows: number;
  columns: number;
  lengthSpacing: number;
  widthSpacing: number;
}

interface IlluminanceDistribution {
  average: number;
  minimum: number;
  maximum: number;
  uniformity: number;
}

interface EnergyMetrics {
  totalPower: number;
  powerDensity: number;
  efficiencyRating: string;
}

// New interfaces for bill of materials
interface MaterialItem {
  name: string;
  quantity: number;
  unit: string;
  description?: string;
}

interface BillOfMaterials {
  items: MaterialItem[];
  totalEstimatedCost?: number;
}

interface LightingResults {
  numberOfLamps: number;
  roomCavityRatio: number;
  coefficientOfUtilization: number;
  maintenanceFactor: number;
  layout: Layout;
  illuminanceDistribution: IlluminanceDistribution;
  energyMetrics: EnergyMetrics;
  billOfMaterials: BillOfMaterials;
}

interface LightingContextType {
  roomDimensions: RoomDimensions;
  setRoomDimensions: (dimensions: RoomDimensions) => void;
  lightingRequirements: LightingRequirements;
  setLightingRequirements: (requirements: LightingRequirements) => void;
  lightingResults: LightingResults | null;
  setLightingResults: (results: LightingResults | null) => void;
  lampPositions: Array<{ x: number; y: number; z: number }>;
  illuminanceGrid: Array<{ x: number; y: number; illuminance: number }>;
  calculateResults: () => void;
  isCalculating: boolean;
  loadCalculation: (savedCalculation: any) => void;
  renderTrigger: number;
}

// Maintenance factor lookup table based on contamination level and maintenance interval
const maintenanceFactorTable = {
  "very clean": {
    1: 0.96,
    2: 0.94,
    3: 0.92,
    4: 0.9,
    5: 0.88,
    6: 0.87,
  },
  clean: {
    1: 0.93,
    2: 0.89,
    3: 0.85,
    4: 0.82,
    5: 0.79,
    6: 0.77,
  },
  normal: {
    1: 0.89,
    2: 0.84,
    3: 0.79,
    4: 0.75,
    5: 0.7,
    6: 0.67,
  },
  dirty: {
    1: 0.83,
    2: 0.78,
    3: 0.73,
    4: 0.69,
    5: 0.65,
    6: 0.62,
  },
};

const defaultRoomDimensions: RoomDimensions = {
  length: 10,
  width: 8,
  height: 3,
  workplaneHeight: 0.85,
};

const defaultLightingRequirements: LightingRequirements = {
  targetIlluminance: 500,
  fluxPerLamp: 3600,
  contaminationLevel: "normal",
  maintenanceInterval: 2,
  ceilingReflectance: 0.7,
  wallReflectance: 0.5,
};

const LightingContext = createContext<LightingContextType | undefined>(
  undefined
);

export const LightingProvider = ({ children }: { children: ReactNode }) => {
  const [roomDimensions, setRoomDimensions] = useState<RoomDimensions>(
    defaultRoomDimensions
  );
  const [lightingRequirements, setLightingRequirements] =
    useState<LightingRequirements>(defaultLightingRequirements);
  const [lightingResults, setLightingResults] =
    useState<LightingResults | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [lampPositions, setLampPositions] = useState<
    Array<{ x: number; y: number; z: number }>
  >([]);

  const [illuminanceGrid, setIlluminanceGrid] = useState<
    Array<{ x: number; y: number; illuminance: number }>
  >([]);
  const [renderTrigger, setRenderTrigger] = useState<number>(0);

  // Check for saved calculation in localStorage on initial load
  useEffect(() => {
    const checkForSavedCalculation = () => {
      const savedCalcJson = localStorage.getItem("loadCalculation");
      if (savedCalcJson) {
        try {
          const savedCalc = JSON.parse(savedCalcJson);
          loadCalculation(savedCalc);
          // Clear from localStorage after loading
          localStorage.removeItem("loadCalculation");
        } catch (error) {
          console.error("Error loading saved calculation:", error);
        }
      }
    };

    checkForSavedCalculation();
  }, []);

  // Helper function to load a saved calculation
  const loadCalculation = (savedCalculation: any) => {
    // Check if we need to auto-calculate after loading
    const shouldAutoCalculate = savedCalculation.autoCalculate === true;

    // Remove the autoCalculate flag if it exists to avoid saving it in the actual data
    if (savedCalculation.autoCalculate) {
      const { autoCalculate, ...cleanedCalculation } = savedCalculation;
      savedCalculation = cleanedCalculation;
    }

    if (savedCalculation.roomDimensions) {
      setRoomDimensions(savedCalculation.roomDimensions);
    }

    if (savedCalculation.lightingRequirements) {
      // Handle cases where lightingRequirements might be missing some properties
      // that are in the default state (like the new wattage field)
      setLightingRequirements({
        ...lightingRequirements, // Keep default values for any missing properties
        ...savedCalculation.lightingRequirements, // Override with saved values
      });
    }

    if (savedCalculation.results) {
      setLightingResults(savedCalculation.results);
    }

    setTimeout(() => {
      calculateResults();
    }, 7000);
    // Auto-calculate if the flag was set
    if (shouldAutoCalculate) {
      // Use setTimeout to allow the UI to update first with the loaded values
      setTimeout(() => {
        calculateResults();
      }, 1000);
    }

    // Let the user know the calculation was loaded
    if (typeof window !== "undefined") {
      addToast({
        title: shouldAutoCalculate
          ? "Calculation in progress..."
          : "Saved calculation loaded",
        description: shouldAutoCalculate
          ? "Recalculating based on saved parameters"
          : "Parameters loaded successfully",
        timeout: 4000,
      });
    }
  };

  // Calculate Room Cavity Ratio (RCR)
  const calculateRCR = (dimensions: RoomDimensions): number => {
    const { length, width, height, workplaneHeight } = dimensions;
    const cavityHeight = height - workplaneHeight;
    return (5 * cavityHeight * (length + width)) / (length * width);
  };

  // Calculate Coefficient of Utilization based on room cavity ratio and reflectances
  const calculateCU = (
    rcr: number,
    ceilingReflectance: number,
    wallReflectance: number
  ): number => {
    // Base CU for ideal room (RCR=1, high reflectances)
    const baseCU = 0.85;

    // Adjust for actual RCR (higher RCR = lower CU)
    const rcrFactor = 1 - (rcr - 1) * 0.05;

    // Adjust for reflectances (lower reflectances = lower CU)
    const reflectanceFactor =
      0.7 + (0.3 * (ceilingReflectance + wallReflectance)) / 2;

    // Calculate final CU (capped between 0.3 and 0.85)
    const calculatedCU = baseCU * rcrFactor * reflectanceFactor;
    return Math.max(0.3, Math.min(0.85, calculatedCU));
  };

  // Calculate number of lamps required - MODIFIED TO ENSURE EVEN NUMBERS
  const calculateNumberOfLamps = (
    targetIlluminance: number,
    floorArea: number,
    fluxPerLamp: number,
    coefficientOfUtilization: number,
    maintenanceFactor: number
  ): number => {
    const lampsRaw =
      (targetIlluminance * floorArea) /
      (fluxPerLamp * coefficientOfUtilization * maintenanceFactor);

    // Round up to nearest even number
    const roundedUp = Math.ceil(lampsRaw);
    return roundedUp % 2 === 0 ? roundedUp : roundedUp + 1;
  };

  // Calculate optimal layout for lamps
  const calculateLayout = (
    numberOfLamps: number,
    roomLength: number,
    roomWidth: number
  ): Layout => {
    // Calculate aspect ratio of the room
    const aspectRatio = roomLength / roomWidth;

    // Calculate rows and columns based on aspect ratio and total lamps
    let columns = Math.round(Math.sqrt(numberOfLamps * aspectRatio));
    let rows = Math.round(numberOfLamps / columns);

    // Ensure we don't have zero rows or columns
    columns = Math.max(1, columns);
    rows = Math.max(1, rows);

    // Adjust if the product doesn't match the required number of lamps
    while (rows * columns < numberOfLamps) {
      if (columns / rows < aspectRatio) {
        columns++;
      } else {
        rows++;
      }
    }

    // Calculate spacing between lamps
    const lengthSpacing = roomLength / columns;
    const widthSpacing = roomWidth / rows;

    return {
      rows,
      columns,
      lengthSpacing: parseFloat(lengthSpacing.toFixed(2)),
      widthSpacing: parseFloat(widthSpacing.toFixed(2)),
    };
  };

  // Calculate illuminance distribution
  const calculateIlluminanceDistribution = (
    numberOfLamps: number,
    fluxPerLamp: number,
    coefficientOfUtilization: number,
    maintenanceFactor: number,
    floorArea: number
  ): IlluminanceDistribution => {
    const totalLumens = numberOfLamps * fluxPerLamp;
    const averageIlluminance =
      (totalLumens * coefficientOfUtilization * maintenanceFactor) / floorArea;

    // Estimate min and max illuminance based on typical distribution patterns
    const maxIlluminance = averageIlluminance * 1.3;
    const minIlluminance = averageIlluminance * 0.7;
    const uniformity = minIlluminance / averageIlluminance;

    return {
      average: parseFloat(averageIlluminance.toFixed(2)),
      minimum: parseFloat(minIlluminance.toFixed(2)),
      maximum: parseFloat(maxIlluminance.toFixed(2)),
      uniformity: parseFloat(uniformity.toFixed(2)),
    };
  };

  // Calculate energy metrics
  const calculateEnergyMetrics = (
    numberOfLamps: number,
    floorArea: number
  ): EnergyMetrics => {
    const { fluxPerLamp } = lightingRequirements;

    // Find the selected lamp from siteConfig to get actual wattage
    const selectedLamp = siteConfig.sim_LumensItems.find(
      (lamp) => lamp.fluxValue === fluxPerLamp
    );

    // Use actual wattage if available, otherwise estimate based on lumens per watt efficiency
    const wattsPerLamp = selectedLamp?.wattage || fluxPerLamp / 100;

    const totalPower = numberOfLamps * wattsPerLamp;
    const powerDensity = totalPower / floorArea;

    // Determine efficiency rating
    let efficiencyRating: string;
    if (powerDensity < 5) {
      efficiencyRating = "Excellent";
    } else if (powerDensity < 8) {
      efficiencyRating = "Very Good";
    } else if (powerDensity < 12) {
      efficiencyRating = "Good";
    } else if (powerDensity < 15) {
      efficiencyRating = "Average";
    } else {
      efficiencyRating = "Poor";
    }

    return {
      totalPower: parseFloat(totalPower.toFixed(2)),
      powerDensity: parseFloat(powerDensity.toFixed(2)),
      efficiencyRating,
    };
  };

  // Generate bill of materials
  const generateBillOfMaterials = (
    numberOfLamps: number,
    roomDimensions: RoomDimensions,
    layout: Layout,
    selectedLamp: any
  ): BillOfMaterials => {
    // Find selected lamp details
    const lampType =
      selectedLamp?.label || `${lightingRequirements.fluxPerLamp} lumen lamp`;

    // Calculate room perimeter for wiring estimation
    const roomPerimeter = 2 * (roomDimensions.length + roomDimensions.width);

    // Calculate approximate wire length needed (perimeter + connections to each lamp)
    // This is a simplified estimation - real calculations would be more complex
    const estimatedWiringLength = roomPerimeter + numberOfLamps * 1.5;

    // Calculate mounting hardware needed (typically 2-4 mounting points per lamp)
    const mountingPoints = numberOfLamps * 2;

    // Calculate switches and controllers (1 main switch, optional dimmer)
    const switches = 1;

    // Create material items list
    const items: MaterialItem[] = [
      {
        name: lampType,
        quantity: numberOfLamps,
        unit: "pcs",
        description: `${lightingRequirements.fluxPerLamp} lumens per lamp`,
      },
      {
        name: "Mounting Kit",
        quantity: numberOfLamps,
        unit: "sets",
        description: "Ceiling mounting hardware kit",
      },
      {
        name: "Mounting Brackets",
        quantity: mountingPoints,
        unit: "pcs",
        description: "Brackets for secure mounting",
      },
      {
        name: "Electrical Wire",
        quantity: parseFloat(estimatedWiringLength.toFixed(1)),
        unit: "meters",
        description: "2.5mm² electrical cable",
      },
      {
        name: "Light Switch",
        quantity: switches,
        unit: "pcs",
        description: "Wall mounted light switch",
      },
      {
        name: "Junction Box",
        quantity: Math.ceil(numberOfLamps / 4),
        unit: "pcs",
        description: "Electrical junction box",
      },
    ];

    return {
      items: items,
    };
  };

  // Generate lamp positions
  const generateLampPositions = (
    layout: Layout,
    roomLength: number,
    roomWidth: number,
    roomHeight: number,
    numberOfLamps: number
  ): Array<{ x: number; y: number; z: number }> => {
    const positions: Array<{ x: number; y: number; z: number }> = [];

    // Calculate offsets to center the grid in the room
    const lengthOffset =
      (roomLength - (layout.columns - 1) * layout.lengthSpacing) / 2;
    const widthOffset =
      (roomWidth - (layout.rows - 1) * layout.widthSpacing) / 2;

    // Mount height (typically at ceiling or slightly below)
    const mountHeight = roomHeight - 0.1; // 10cm below ceiling

    // Generate positions in a grid
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.columns; col++) {
        // Skip if we've reached the required number of lamps
        if (positions.length >= numberOfLamps) break;

        positions.push({
          x: lengthOffset + col * layout.lengthSpacing,
          y: widthOffset + row * layout.widthSpacing,
          z: mountHeight,
        });
      }
    }

    return positions;
  };

  // Calculate illuminance at a point
  const calculateIlluminanceAtPoint = (
    x: number,
    y: number,
    lampPositions: Array<{ x: number; y: number; z: number }>,
    fluxPerLamp: number,
    workplaneHeight: number,
    coefficientOfUtilization: number,
    maintenanceFactor: number
  ): number => {
    // Simplified inverse square law calculation
    const totalIlluminance = lampPositions.reduce((sum, lamp) => {
      const dx = lamp.x - x;
      const dy = lamp.y - y;
      const dz = lamp.z - workplaneHeight;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const pointIlluminance =
        (fluxPerLamp * coefficientOfUtilization * maintenanceFactor) /
        (4 * Math.PI * distance * distance);

      return sum + pointIlluminance;
    }, 0);

    return totalIlluminance;
  };

  // Generate illuminance grid
  const generateIlluminanceGrid = (
    roomLength: number,
    roomWidth: number,
    roomHeight: number,
    workplaneHeight: number,
    lampPositions: Array<{ x: number; y: number; z: number }>,
    fluxPerLamp: number,
    coefficientOfUtilization: number,
    maintenanceFactor: number
  ): Array<{ x: number; y: number; illuminance: number }> => {
    const grid: Array<{ x: number; y: number; illuminance: number }> = [];
    const gridSize = 20; // 20x20 grid

    // Generate grid points
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i / (gridSize - 1)) * roomLength;
        const y = (j / (gridSize - 1)) * roomWidth;

        const illuminance = calculateIlluminanceAtPoint(
          x,
          y,
          lampPositions,
          fluxPerLamp,
          workplaneHeight,
          coefficientOfUtilization,
          maintenanceFactor
        );

        grid.push({ x, y, illuminance });
      }
    }

    return grid;
  };

  // Main calculation function
  const calculateResults = () => {
    setIsCalculating(true);

    // Use setTimeout to allow UI to update with loading state
    setTimeout(() => {
      try {
        // Get current dimensions and requirements
        const { length, width, height, workplaneHeight } = roomDimensions;
        const {
          targetIlluminance,
          fluxPerLamp,
          contaminationLevel,
          maintenanceInterval,
          ceilingReflectance,
          wallReflectance,
        } = lightingRequirements;

        // Calculate floor area
        const floorArea = length * width;

        // Calculate Room Cavity Ratio
        const rcr = calculateRCR(roomDimensions);

        // Calculate Coefficient of Utilization
        const cu = calculateCU(rcr, ceilingReflectance, wallReflectance);

        // Get Maintenance Factor from lookup table
        const mf =
          maintenanceFactorTable[contaminationLevel][maintenanceInterval];

        // Calculate number of lamps
        const numberOfLamps = calculateNumberOfLamps(
          targetIlluminance,
          floorArea,
          fluxPerLamp,
          cu,
          mf
        );

        // Calculate layout
        const layout = calculateLayout(numberOfLamps, length, width);

        // Calculate illuminance distribution
        const illuminanceDistribution = calculateIlluminanceDistribution(
          numberOfLamps,
          fluxPerLamp,
          cu,
          mf,
          floorArea
        );

        // Calculate energy metrics
        const energyMetrics = calculateEnergyMetrics(numberOfLamps, floorArea);

        // Find the selected lamp from siteConfig
        const selectedLamp = siteConfig.sim_LumensItems.find(
          (lamp) => lamp.fluxValue === fluxPerLamp
        );

        // Generate bill of materials
        const billOfMaterials = generateBillOfMaterials(
          numberOfLamps,
          roomDimensions,
          layout,
          selectedLamp
        );

        // Create final results object
        const results: LightingResults = {
          numberOfLamps,
          roomCavityRatio: parseFloat(rcr.toFixed(2)),
          coefficientOfUtilization: parseFloat(cu.toFixed(3)),
          maintenanceFactor: mf,
          layout,
          illuminanceDistribution,
          energyMetrics,
          billOfMaterials,
        };

        // Update results state
        setLightingResults(results);

        // Generate lamp positions
        const positions = generateLampPositions(
          layout,
          length,
          width,
          height,
          numberOfLamps
        );
        setLampPositions(positions);

        // Generate illuminance grid
        const grid = generateIlluminanceGrid(
          length,
          width,
          height,
          workplaneHeight,
          positions,
          fluxPerLamp,
          cu,
          mf
        );
        setIlluminanceGrid(grid);

        // Trigger re-render for any components depending on the results
        setRenderTrigger((prev) => prev + 1);

        console.log("Lighting calculations complete. Results:", results);
        console.log("Render trigger incremented to:", renderTrigger + 1);
      } catch (error) {
        console.error("Calculation error:", error);
        addToast({
          title: "Calculation Error",
          description:
            "There was a problem performing the lighting calculations.",
          timeout: 5000,
        });
      } finally {
        setIsCalculating(false);
      }
    }, 500);
  };

  // Initial calculation on mount
  useEffect(() => {
    calculateResults();
  }, []);

  const value = {
    roomDimensions,
    setRoomDimensions,
    lightingRequirements,
    setLightingRequirements,
    lightingResults,
    setLightingResults,
    lampPositions,
    illuminanceGrid,
    calculateResults,
    isCalculating,
    loadCalculation,
    renderTrigger,
  };

  return (
    <LightingContext.Provider value={value}>
      {children}
    </LightingContext.Provider>
  );
};

export const useLighting = () => {
  const context = useContext(LightingContext);
  if (context === undefined) {
    throw new Error("useLighting must be used within a LightingProvider");
  }
  return context;
};
