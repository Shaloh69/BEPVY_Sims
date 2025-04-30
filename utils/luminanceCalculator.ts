// utils/luminanceCalculator.ts
export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
  workplaneHeight: number;
}

export interface LightingRequirements {
  targetIlluminance: number; // in lux
  fluxPerLamp: number; // in lumens
  contaminationLevel: "very clean" | "clean" | "normal" | "dirty";
  maintenanceInterval: 1 | 2 | 3 | 4 | 5 | 6;
  ceilingReflectance: number; // 0-1
  wallReflectance: number; // 0-1
}

export interface LightingResults {
  numberOfLamps: number;
  coefficientOfUtilization: number;
  maintenanceFactor: number;
  roomCavityRatio: number;
  layout: {
    rows: number;
    columns: number;
    lengthSpacing: number;
    widthSpacing: number;
  };
  illuminanceDistribution: {
    average: number;
    minimum: number;
    maximum: number;
    uniformity: number;
  };
  energyMetrics: {
    totalPower: number;
    powerDensity: number;
    efficiencyRating: string;
  };
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

/**
 * Calculate Room Cavity Ratio (RCR)
 * RCR = 5 * cavityHeight * (roomLength + roomWidth) / (roomLength * roomWidth)
 */
export function calculateRoomCavityRatio(
  roomDimensions: RoomDimensions
): number {
  const { length, width, height, workplaneHeight } = roomDimensions;
  const cavityHeight = height - workplaneHeight;
  return (5 * cavityHeight * (length + width)) / (length * width);
}

/**
 * Calculate Coefficient of Utilization (CU)
 * This is a simplified approximation based on the thesis
 */
export function calculateCoefficientOfUtilization(
  rcr: number,
  ceilingReflectance: number,
  wallReflectance: number
): number {
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
}

/**
 * Get maintenance factor from the table as defined in the thesis
 */
export function getMaintenanceFactor(
  contaminationLevel: "very clean" | "clean" | "normal" | "dirty",
  maintenanceInterval: 1 | 2 | 3 | 4 | 5 | 6
): number {
  return maintenanceFactorTable[contaminationLevel][maintenanceInterval];
}

/**
 * Calculate number of lamps required using the formula:
 * N = (E × A) / (Φ × C.U. × M.F.)
 *
 * Where:
 * - N = number of lamps or luminaires required
 * - E = illumination level in lux
 * - A = floor area in square meters
 * - Φ = flux per lamp in lumens
 * - C.U. = coefficient of utilization
 * - M.F. = maintenance factor
 */
export function calculateNumberOfLamps(
  targetIlluminance: number,
  floorArea: number,
  fluxPerLamp: number,
  coefficientOfUtilization: number,
  maintenanceFactor: number
): number {
  const lampsRaw =
    (targetIlluminance * floorArea) /
    (fluxPerLamp * coefficientOfUtilization * maintenanceFactor);
  return Math.ceil(lampsRaw); // Round up to ensure adequate lighting
}

/**
 * Calculate recommended layout for lamps
 */
export function calculateLayout(
  numberOfLamps: number,
  roomLength: number,
  roomWidth: number
): {
  rows: number;
  columns: number;
  lengthSpacing: number;
  widthSpacing: number;
} {
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
    lengthSpacing,
    widthSpacing,
  };
}

/**
 * Calculate energy metrics for the lighting system
 */
export function calculateEnergyMetrics(
  numberOfLamps: number,
  fluxPerLamp: number,
  floorArea: number
): { totalPower: number; powerDensity: number; efficiencyRating: string } {
  // Assume efficiency of 100 lumens per watt (typical for modern LED)
  const wattsPerLamp = fluxPerLamp / 100;
  const totalPower = numberOfLamps * wattsPerLamp;
  const powerDensity = totalPower / floorArea;

  // Determine energy efficiency rating based on power density
  let rating = "Excellent";
  if (powerDensity > 15) {
    rating = "Poor";
  } else if (powerDensity > 10) {
    rating = "Average";
  } else if (powerDensity > 7) {
    rating = "Good";
  } else if (powerDensity > 5) {
    rating = "Very Good";
  }

  return {
    totalPower: parseFloat(totalPower.toFixed(2)),
    powerDensity: parseFloat(powerDensity.toFixed(2)),
    efficiencyRating: rating,
  };
}

/**
 * Calculate illuminance distribution metrics
 */
export function calculateIlluminanceDistribution(
  numberOfLamps: number,
  fluxPerLamp: number,
  coefficientOfUtilization: number,
  maintenanceFactor: number,
  floorArea: number
): { average: number; minimum: number; maximum: number; uniformity: number } {
  const totalLumens = numberOfLamps * fluxPerLamp;
  const averageIlluminance =
    (totalLumens * coefficientOfUtilization * maintenanceFactor) / floorArea;

  // Estimate min and max illuminance based on typical distribution patterns
  // These are approximations - actual values would require detailed simulation
  const maxIlluminance = averageIlluminance * 1.3;
  const minIlluminance = averageIlluminance * 0.7;
  const uniformity = minIlluminance / averageIlluminance;

  return {
    average: parseFloat(averageIlluminance.toFixed(2)),
    minimum: parseFloat(minIlluminance.toFixed(2)),
    maximum: parseFloat(maxIlluminance.toFixed(2)),
    uniformity: parseFloat(uniformity.toFixed(2)),
  };
}

/**
 * Main calculation function that combines all the steps
 */
export function calculateLighting(
  roomDimensions: RoomDimensions,
  lightingRequirements: LightingRequirements
): LightingResults {
  const { length, width } = roomDimensions;
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
  const rcr = calculateRoomCavityRatio(roomDimensions);

  // Get Coefficient of Utilization
  const cu = calculateCoefficientOfUtilization(
    rcr,
    ceilingReflectance,
    wallReflectance
  );

  // Get Maintenance Factor
  const mf = getMaintenanceFactor(contaminationLevel, maintenanceInterval);

  // Calculate number of lamps
  const numberOfLamps = calculateNumberOfLamps(
    targetIlluminance,
    floorArea,
    fluxPerLamp,
    cu,
    mf
  );

  // Calculate lamp layout
  const layout = calculateLayout(numberOfLamps, length, width);

  // Calculate energy metrics
  const energyMetrics = calculateEnergyMetrics(
    numberOfLamps,
    fluxPerLamp,
    floorArea
  );

  // Calculate illuminance distribution
  const illuminanceDistribution = calculateIlluminanceDistribution(
    numberOfLamps,
    fluxPerLamp,
    cu,
    mf,
    floorArea
  );

  // Return comprehensive result
  return {
    numberOfLamps,
    coefficientOfUtilization: parseFloat(cu.toFixed(3)),
    maintenanceFactor: mf,
    roomCavityRatio: parseFloat(rcr.toFixed(2)),
    layout,
    illuminanceDistribution,
    energyMetrics,
  };
}

// Calculate illuminance at a specific point in the room
export function calculateIlluminanceAtPoint(
  x: number, // x-coordinate in meters from room corner
  y: number, // y-coordinate in meters from room corner
  lampPositions: Array<{ x: number; y: number; z: number }>, // Array of lamp positions
  fluxPerLamp: number, // Luminous flux per lamp
  roomHeight: number, // Height of room
  workplaneHeight: number, // Height of work plane
  coefficientOfUtilization: number, // CU
  maintenanceFactor: number // MF
): number {
  // This is a simplified calculation based on inverse square law
  // For more accurate calculations, a full radiosity model would be needed

  const totalIlluminance = lampPositions.reduce((sum, lamp) => {
    // Distance from lamp to point (3D)
    const dx = lamp.x - x;
    const dy = lamp.y - y;
    const dz = lamp.z - workplaneHeight;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Apply inverse square law with adjustments for CU and MF
    // Note: This is a simplification - real light distribution would depend on luminaire type
    const pointIlluminance =
      (fluxPerLamp * coefficientOfUtilization * maintenanceFactor) /
      (4 * Math.PI * distance * distance);

    return sum + pointIlluminance;
  }, 0);

  return totalIlluminance;
}

// Generate lamp positions based on layout
export function generateLampPositions(
  layout: {
    rows: number;
    columns: number;
    lengthSpacing: number;
    widthSpacing: number;
  },
  roomLength: number,
  roomWidth: number,
  roomHeight: number,
  numberOfLamps: number
): Array<{ x: number; y: number; z: number }> {
  const positions: Array<{ x: number; y: number; z: number }> = [];

  // Calculate offsets to center the grid in the room
  const lengthOffset =
    (roomLength - (layout.columns - 1) * layout.lengthSpacing) / 2;
  const widthOffset = (roomWidth - (layout.rows - 1) * layout.widthSpacing) / 2;

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
}

// Generate a grid of illuminance values for visualization
export function generateIlluminanceGrid(
  roomLength: number,
  roomWidth: number,
  roomHeight: number,
  workplaneHeight: number,
  lampPositions: Array<{ x: number; y: number; z: number }>,
  fluxPerLamp: number,
  coefficientOfUtilization: number,
  maintenanceFactor: number,
  gridSize: number = 20 // Number of grid points in each dimension
): Array<{ x: number; y: number; illuminance: number }> {
  const grid: Array<{ x: number; y: number; illuminance: number }> = [];

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
        roomHeight,
        workplaneHeight,
        coefficientOfUtilization,
        maintenanceFactor
      );

      grid.push({ x, y, illuminance });
    }
  }

  return grid;
}
