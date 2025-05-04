// app/saved-calculations/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  Tab,
  Divider,
  Spinner,
  Badge,
  addToast,
  ScrollShadow,
} from "@heroui/react";

// Import Lucide icons
import {
  Folder,
  Calculator,
  Trash2,
  Eye,
  Search,
  ArrowRight,
  BarChart2,
  LayoutGrid,
  Calendar,
  UserSquare as RulerSquare,
  Lightbulb,
  Zap,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

interface Calculation {
  results: any;
  id: string;
  name: string;
  roomDimensions: {
    length: number;
    width: number;
    height: number;
    workplaneHeight: number;
  };
  lightingRequirements: {
    wallReflectance: number;
    maintenanceInterval: number;
    ceilingReflectance: number;
    contaminationLevel: string;
    targetIlluminance: number;
    fluxPerLamp: number;
  };
  createdAt: string;
}

export default function SavedCalculations() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedCalculation, setSelectedCalculation] =
    useState<Calculation | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Fetch calculations on page load
  useEffect(() => {
    // Check if user is logged in
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      fetchCalculations();
    }
  }, [user, loading, router]);

  const fetchCalculations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/calculation");

      if (!response.ok) {
        throw new Error("Failed to fetch calculations");
      }

      const data = await response.json();
      setCalculations(data.calculations || []);
    } catch (error) {
      console.error("Error fetching calculations:", error);
      addToast({
        title: "Error",
        description: "Failed to load your saved calculations",
        color: "danger",
        icon: <AlertTriangle className="w-5 h-5" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCalculation) return;

    try {
      const response = await fetch(
        `/api/calculation/${selectedCalculation.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete calculation");
      }

      // Remove from state
      setCalculations(
        calculations.filter((calc) => calc.id !== selectedCalculation.id)
      );

      addToast({
        title: "Success",
        description: "Calculation deleted successfully",
        color: "success",
      });
    } catch (error) {
      console.error("Error deleting calculation:", error);
      addToast({
        title: "Error",
        description: "Failed to delete calculation",
        color: "danger",
        icon: <AlertTriangle className="w-5 h-5" />,
      });
    } finally {
      setDeleteModalOpen(false);
      setSelectedCalculation(null);
    }
  };

  const openDeleteModal = (calculation: Calculation) => {
    setSelectedCalculation(calculation);
    setDeleteModalOpen(true);
  };

  const openDetailModal = (calculation: Calculation) => {
    setSelectedCalculation(calculation);
    setDetailModalOpen(true);
  };

  const handleApply = () => {
    if (!selectedCalculation) return;

    // Add auto-calculate flag to trigger immediate calculation after loading
    const calculationWithFlag = {
      ...selectedCalculation,
      autoCalculate: true,
    };

    // Store the selected calculation in localStorage to load it in the calculator
    localStorage.setItem(
      "loadCalculation",
      JSON.stringify(calculationWithFlag)
    );

    // Redirect to the calculator page
    router.push("/simulator");

    addToast({
      title: "Calculation Loaded",
      description: "Loading calculation into the simulator...",
      color: "success",
      icon: <ArrowRight className="w-5 h-5" />,
    });
  };

  // Filter calculations based on search query
  const filteredCalculations = calculations.filter((calc) =>
    calc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading || (isLoading && !calculations.length)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" color="primary" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your saved calculations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-16 md:pt-20 max-w-7xl">
      <Card className="shadow-lg border-0 dark:bg-gray-900/60 backdrop-blur-sm">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Folder className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Saved Calculations</h1>
          </div>
          <Input
            placeholder="Search calculations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            className="w-full md:w-64"
            size="sm"
          />
        </CardHeader>
        <CardBody>
          {calculations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="p-4 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 w-20 h-20 flex items-center justify-center mb-4">
                <Calculator className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium mb-3">
                No Saved Calculations
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                You haven't saved any lighting calculations yet. Create your
                first calculation in the simulator.
              </p>
              <Button
                color="primary"
                onClick={() => router.push("/simulator")}
                startContent={<ArrowRight className="w-4 h-4" />}
                className="shadow-md hover:shadow-lg transition-all px-6"
              >
                Go to Simulator
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block">
                <Table
                  aria-label="Saved lighting calculations"
                  classNames={{
                    base: "shadow-sm rounded-lg overflow-hidden",
                    th: "bg-default-100 text-default-600 font-medium",
                    tr: "hover:bg-default-50 transition-colors",
                  }}
                >
                  <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>ROOM</TableColumn>
                    <TableColumn>LIGHTING</TableColumn>
                    <TableColumn>RESULTS</TableColumn>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No calculations found">
                    {filteredCalculations.map((calc) => (
                      <TableRow key={calc.id}>
                        <TableCell>
                          <div className="font-medium">{calc.name}</div>
                          <div className="text-xs text-gray-500">
                            ID: {calc.id.substring(0, 8)}...
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <RulerSquare className="w-3 h-3 mr-1 text-gray-500" />
                              <span className="text-sm">
                                {calc.roomDimensions.length}m ×{" "}
                                {calc.roomDimensions.width}m ×{" "}
                                {calc.roomDimensions.height}m
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Area:{" "}
                              {(
                                calc.roomDimensions.length *
                                calc.roomDimensions.width
                              ).toFixed(1)}
                              m²
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <Lightbulb className="w-3 h-3 mr-1 text-amber-500" />
                              <span className="text-sm font-medium">
                                {calc.lightingRequirements.targetIlluminance}{" "}
                                lux
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {calc.lightingRequirements.fluxPerLamp} lumens per
                              lamp
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <Chip size="sm" color="primary" variant="flat">
                                {calc.results.numberOfLamps} lamps
                              </Chip>
                            </div>
                            {calc.results.layout && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <LayoutGrid className="w-3 h-3 mr-1" />
                                {calc.results.layout.rows} ×{" "}
                                {calc.results.layout.columns}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                            {new Date(calc.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(calc.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              color="primary"
                              onClick={() => openDetailModal(calc)}
                              startContent={<Eye className="w-4 h-4" />}
                            >
                              View
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="light"
                              onClick={() => openDeleteModal(calc)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view - Card-based */}
              <div className="block md:hidden space-y-4">
                {filteredCalculations.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No calculations found</p>
                  </div>
                ) : (
                  filteredCalculations.map((calc) => (
                    <Card
                      key={calc.id}
                      className="overflow-hidden shadow-sm border-0"
                    >
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-primary">
                              {calc.name}
                            </h3>
                            <div className="text-xs text-gray-500">
                              ID: {calc.id.substring(0, 8)}...
                            </div>
                          </div>
                          <Chip size="sm" color="primary" variant="flat">
                            {calc.results.numberOfLamps} lamps
                          </Chip>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center">
                            <RulerSquare className="w-3.5 h-3.5 mr-2 text-gray-500" />
                            <div>
                              <span>
                                {calc.roomDimensions.length}m ×{" "}
                                {calc.roomDimensions.width}m ×{" "}
                                {calc.roomDimensions.height}m
                              </span>
                              <div className="text-xs text-gray-500">
                                Area:{" "}
                                {(
                                  calc.roomDimensions.length *
                                  calc.roomDimensions.width
                                ).toFixed(1)}
                                m²
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <Lightbulb className="w-3.5 h-3.5 mr-2 text-amber-500" />
                            <div>
                              <span>
                                {calc.lightingRequirements.targetIlluminance}{" "}
                                lux
                              </span>
                              <div className="text-xs text-gray-500">
                                {calc.lightingRequirements.fluxPerLamp} lumens
                                per lamp
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-2 text-gray-500" />
                            <div>
                              <span>
                                {new Date(calc.createdAt).toLocaleDateString()}
                              </span>
                              <div className="text-xs text-gray-500">
                                {new Date(calc.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onClick={() => openDetailModal(calc)}
                            className="flex-1"
                            startContent={<Eye className="w-4 h-4" />}
                          >
                            View
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="light"
                            onClick={() => openDeleteModal(calc)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        classNames={{
          base: "bg-white dark:bg-gray-900 p-0",
          closeButton: "hover:bg-gray-200 dark:hover:bg-gray-700",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-xl border-b px-6">
                <div className="flex items-center gap-2 text-danger">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Confirm Deletion</span>
                </div>
              </ModalHeader>
              <ModalBody className="px-6 py-4">
                <p>
                  Are you sure you want to delete the calculation "
                  <span className="font-semibold">
                    {selectedCalculation?.name}
                  </span>
                  "? This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter className="border-t px-6">
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDelete}
                  startContent={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Calculation Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        size={isMobile ? "full" : "3xl"}
        scrollBehavior="inside"
        classNames={{
          base: "bg-white dark:bg-gray-900 p-0",
          closeButton: "hover:bg-gray-200 dark:hover:bg-gray-700",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b px-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-xl font-bold">
                    {selectedCalculation?.name}
                  </h2>
                  <Chip color="primary" size="sm" className="sm:ml-2">
                    {formatDate(selectedCalculation?.createdAt || "")}
                  </Chip>
                </div>
                <p className="text-sm text-gray-500 font-normal">
                  Detailed lighting calculation results
                </p>
              </ModalHeader>
              <ModalBody className="p-0">
                {selectedCalculation && (
                  <Tabs
                    aria-label="Calculation details"
                    className="w-full"
                    classNames={{
                      tabList: "px-6 pt-2 border-b",
                      panel: "p-0",
                      cursor: "bg-primary",
                    }}
                  >
                    <Tab
                      key="summary"
                      title={
                        <div className="flex items-center gap-2">
                          <BarChart2 className="w-4 h-4" />
                          <span>Summary</span>
                        </div>
                      }
                    >
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="shadow-sm border-0 bg-gray-50 dark:bg-gray-800/50">
                            <CardBody>
                              <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <RulerSquare className="w-5 h-5 mr-2 text-primary" />
                                Room Overview
                              </h3>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Dimensions:
                                  </span>
                                  <span className="font-medium">
                                    {selectedCalculation.roomDimensions.length}{" "}
                                    × {selectedCalculation.roomDimensions.width}{" "}
                                    ×{" "}
                                    {selectedCalculation.roomDimensions.height}{" "}
                                    m
                                  </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Floor Area:
                                  </span>
                                  <span className="font-medium">
                                    {(
                                      selectedCalculation.roomDimensions
                                        .length *
                                      selectedCalculation.roomDimensions.width
                                    ).toFixed(2)}{" "}
                                    m²
                                  </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Workplane Height:
                                  </span>
                                  <span className="font-medium">
                                    {
                                      selectedCalculation.roomDimensions
                                        .workplaneHeight
                                    }{" "}
                                    m
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Room Cavity Ratio:
                                  </span>
                                  <span className="font-medium">
                                    {selectedCalculation.results
                                      .roomCavityRatio || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </CardBody>
                          </Card>

                          <Card className="shadow-sm border-0 bg-gray-50 dark:bg-gray-800/50">
                            <CardBody>
                              <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
                                Lighting Requirements
                              </h3>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Target Illuminance:
                                  </span>
                                  <span className="font-medium">
                                    {
                                      selectedCalculation.lightingRequirements
                                        .targetIlluminance
                                    }{" "}
                                    lux
                                  </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Luminaire Type:
                                  </span>
                                  <span className="font-medium">
                                    {
                                      selectedCalculation.lightingRequirements
                                        .fluxPerLamp
                                    }{" "}
                                    lumens/lamp
                                  </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Contamination Level:
                                  </span>
                                  <span className="font-medium capitalize">
                                    {selectedCalculation.lightingRequirements
                                      .contaminationLevel || "Normal"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Coefficient of Utilization:
                                  </span>
                                  <span className="font-medium">
                                    {selectedCalculation.results
                                      .coefficientOfUtilization || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </div>

                        <Card className="shadow-sm border-0 overflow-hidden bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                          <CardBody>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <Zap className="w-5 h-5 mr-2 text-blue-500" />
                              Calculation Results
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg text-center shadow-sm transform transition-transform hover:scale-105">
                                <div className="text-3xl font-bold mb-1 text-primary">
                                  {selectedCalculation.results.numberOfLamps}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Total Lamps Required
                                </div>
                              </div>

                              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg text-center shadow-sm transform transition-transform hover:scale-105">
                                <div className="text-3xl font-bold mb-1 text-primary">
                                  {selectedCalculation.results.layout?.rows} ×{" "}
                                  {selectedCalculation.results.layout?.columns}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Layout (Rows × Columns)
                                </div>
                              </div>

                              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg text-center shadow-sm transform transition-transform hover:scale-105">
                                <div className="text-3xl font-bold mb-1 text-primary">
                                  {selectedCalculation.results.illuminanceDistribution?.average.toFixed(
                                    0
                                  ) || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Average Illuminance (lux)
                                </div>
                              </div>
                            </div>

                            {selectedCalculation.results.energyMetrics && (
                              <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                <h4 className="text-md font-semibold mb-3 border-b pb-2">
                                  Energy Performance
                                </h4>
                                <div className="flex flex-wrap items-center gap-6">
                                  <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      Total Power:
                                    </div>
                                    <div className="font-medium">
                                      {selectedCalculation.results.energyMetrics.totalPower.toFixed(
                                        2
                                      )}{" "}
                                      W
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      Power Density:
                                    </div>
                                    <div className="font-medium">
                                      {selectedCalculation.results.energyMetrics.powerDensity.toFixed(
                                        2
                                      )}{" "}
                                      W/m²
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      Efficiency Rating:
                                    </div>
                                    <Badge
                                      color={
                                        selectedCalculation.results
                                          .energyMetrics.efficiencyRating ===
                                          "Excellent" ||
                                        selectedCalculation.results
                                          .energyMetrics.efficiencyRating ===
                                          "Very Good"
                                          ? "success"
                                          : selectedCalculation.results
                                                .energyMetrics
                                                .efficiencyRating === "Good" ||
                                              selectedCalculation.results
                                                .energyMetrics
                                                .efficiencyRating === "Average"
                                            ? "warning"
                                            : "danger"
                                      }
                                      className="px-3 py-1"
                                    >
                                      {
                                        selectedCalculation.results
                                          .energyMetrics.efficiencyRating
                                      }
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardBody>
                        </Card>
                      </div>
                    </Tab>

                    <Tab
                      key="room"
                      title={
                        <div className="flex items-center gap-2">
                          <RulerSquare className="w-4 h-4" />
                          <span>Room Parameters</span>
                        </div>
                      }
                    >
                      <ScrollShadow className="p-6 space-y-6">
                        {/* Room parameters tab content */}
                        <Card className="shadow-sm border-0 overflow-hidden">
                          <CardBody>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <RulerSquare className="w-5 h-5 mr-2 text-primary" />
                              Room Dimensions
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div className="flex justify-between p-3 border-b rounded bg-gray-50 dark:bg-gray-800/50">
                                <span className="font-medium">Length:</span>
                                <span>
                                  {selectedCalculation.roomDimensions.length} m
                                </span>
                              </div>

                              <div className="flex justify-between p-3 border-b rounded bg-gray-50 dark:bg-gray-800/50">
                                <span className="font-medium">Width:</span>
                                <span>
                                  {selectedCalculation.roomDimensions.width} m
                                </span>
                              </div>

                              <div className="flex justify-between p-3 border-b rounded bg-gray-50 dark:bg-gray-800/50">
                                <span className="font-medium">Height:</span>
                                <span>
                                  {selectedCalculation.roomDimensions.height} m
                                </span>
                              </div>

                              <div className="flex justify-between p-3 border-b rounded bg-gray-50 dark:bg-gray-800/50">
                                <span className="font-medium">
                                  Workplane Height:
                                </span>
                                <span>
                                  {
                                    selectedCalculation.roomDimensions
                                      .workplaneHeight
                                  }{" "}
                                  m
                                </span>
                              </div>

                              <div className="flex justify-between p-3 border-b rounded bg-gray-50 dark:bg-gray-800/50">
                                <span className="font-medium">Floor Area:</span>
                                <span>
                                  {(
                                    selectedCalculation.roomDimensions.length *
                                    selectedCalculation.roomDimensions.width
                                  ).toFixed(2)}{" "}
                                  m²
                                </span>
                              </div>

                              <div className="flex justify-between p-3 border-b rounded bg-gray-50 dark:bg-gray-800/50">
                                <span className="font-medium">Volume:</span>
                                <span>
                                  {(
                                    selectedCalculation.roomDimensions.length *
                                    selectedCalculation.roomDimensions.width *
                                    selectedCalculation.roomDimensions.height
                                  ).toFixed(2)}{" "}
                                  m³
                                </span>
                              </div>
                            </div>
                          </CardBody>
                        </Card>

                        <Card className="shadow-sm border-0 overflow-hidden">
                          <CardBody>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <span className="mr-2">✨</span>
                              Surface Reflectances
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-3">
                                  Ceiling Reflectance
                                </h4>
                                <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{
                                      width: `${(selectedCalculation.lightingRequirements.ceilingReflectance || 0.7) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="text-right mt-2 font-medium">
                                  {(
                                    (selectedCalculation.lightingRequirements
                                      .ceilingReflectance || 0.7) * 100
                                  ).toFixed(0)}
                                  %
                                </div>
                              </div>

                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-3">
                                  Wall Reflectance
                                </h4>
                                <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{
                                      width: `${(selectedCalculation.lightingRequirements.wallReflectance || 0.5) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="text-right mt-2 font-medium">
                                  {(
                                    (selectedCalculation.lightingRequirements
                                      .wallReflectance || 0.5) * 100
                                  ).toFixed(0)}
                                  %
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </ScrollShadow>
                    </Tab>

                    <Tab
                      key="lighting"
                      title={
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          <span>Lighting Details</span>
                        </div>
                      }
                    >
                      <ScrollShadow className="p-6 space-y-6">
                        {/* Lighting details tab content */}
                        <Card className="shadow-sm border-0">
                          <CardBody>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
                              Lighting Requirements
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div className="flex justify-between p-3 border-b rounded bg-gray-50 dark:bg-gray-800/50">
                                <span className="font-medium">
                                  Target Illuminance:
                                </span>
                                <span>
                                  {
                                    selectedCalculation.lightingRequirements
                                      .targetIlluminance
                                  }{" "}
                                  lux
                                </span>
                              </div>

                              <div className="flex justify-between p-3 border-b rounded bg-gray-50 dark:bg-gray-800/50">
                                <span className="font-medium">
                                  Flux per Lamp:
                                </span>
                                <span>
                                  {
                                    selectedCalculation.lightingRequirements
                                      .fluxPerLamp
                                  }{" "}
                                  lumens
                                </span>
                              </div>

                              <div className="flex justify-between p-3 border-b rounded bg-gray-50 dark:bg-gray-800/50">
                                <span className="font-medium">
                                  Contamination Level:
                                </span>
                                <span className="capitalize">
                                  {selectedCalculation.lightingRequirements
                                    .contaminationLevel || "Normal"}
                                </span>
                              </div>

                              <div className="flex justify-between p-3 border-b rounded bg-gray-50 dark:bg-gray-800/50">
                                <span className="font-medium">
                                  Maintenance Interval:
                                </span>
                                <span>
                                  {selectedCalculation.lightingRequirements
                                    .maintenanceInterval || 2}{" "}
                                  years
                                </span>
                              </div>
                            </div>
                          </CardBody>
                        </Card>

                        <Card className="shadow-sm border-0 overflow-hidden">
                          <CardBody>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <BarChart2 className="w-5 h-5 mr-2 text-blue-500" />
                              Calculation Factors
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-4 border rounded-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                                <h4 className="font-medium mb-2 text-center">
                                  Room Cavity Ratio (RCR)
                                </h4>
                                <div className="text-4xl font-bold text-center text-blue-500 my-3">
                                  {selectedCalculation.results
                                    .roomCavityRatio || "N/A"}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                                  The RCR is a measure of the proportions of the
                                  room, which affects how light is distributed.
                                </p>
                              </div>

                              <div className="p-4 border rounded-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                                <h4 className="font-medium mb-2 text-center">
                                  Coefficient of Utilization (CU)
                                </h4>
                                <div className="text-4xl font-bold text-center text-blue-500 my-3">
                                  {selectedCalculation.results
                                    .coefficientOfUtilization || "N/A"}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                                  The CU indicates how efficiently light from
                                  the luminaires reaches the working plane.
                                </p>
                              </div>

                              <div className="p-4 border rounded-lg bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20">
                                <h4 className="font-medium mb-2 text-center">
                                  Maintenance Factor (MF)
                                </h4>
                                <div className="text-4xl font-bold text-center text-amber-500 my-3">
                                  {selectedCalculation.results
                                    .maintenanceFactor || "N/A"}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                                  The MF accounts for the decrease in light
                                  output over time due to dirt and lamp
                                  depreciation.
                                </p>
                              </div>

                              <div className="p-4 border rounded-lg bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20">
                                <h4 className="font-medium mb-2 text-center">
                                  Total Number of Lamps
                                </h4>
                                <div className="text-4xl font-bold text-center text-green-500 my-3">
                                  {selectedCalculation.results.numberOfLamps}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                                  Based on the formula: N = (E × A) / (Φ × CU ×
                                  MF)
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>

                        {selectedCalculation.results
                          .illuminanceDistribution && (
                          <Card className="shadow-sm border-0 overflow-hidden">
                            <CardBody>
                              <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                                Illuminance Distribution
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4 rounded-lg text-center shadow-sm">
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Minimum
                                  </div>
                                  <div className="text-2xl font-bold text-red-500">
                                    {selectedCalculation.results.illuminanceDistribution.minimum.toFixed(
                                      0
                                    )}{" "}
                                    lux
                                  </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg text-center shadow-sm">
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Average
                                  </div>
                                  <div className="text-2xl font-bold text-green-500">
                                    {selectedCalculation.results.illuminanceDistribution.average.toFixed(
                                      0
                                    )}{" "}
                                    lux
                                  </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg text-center shadow-sm">
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Maximum
                                  </div>
                                  <div className="text-2xl font-bold text-blue-500">
                                    {selectedCalculation.results.illuminanceDistribution.maximum.toFixed(
                                      0
                                    )}{" "}
                                    lux
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 p-4 border rounded-lg">
                                <h4 className="font-medium mb-3">
                                  Uniformity Ratio:{" "}
                                  {selectedCalculation.results.illuminanceDistribution.uniformity.toFixed(
                                    2
                                  )}
                                </h4>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{
                                      width: `${selectedCalculation.results.illuminanceDistribution.uniformity * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  A uniformity ratio closer to 1.0 indicates
                                  more even lighting distribution across the
                                  space.
                                </p>
                              </div>
                            </CardBody>
                          </Card>
                        )}
                      </ScrollShadow>
                    </Tab>

                    <Tab
                      key="layout"
                      title={
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="w-4 h-4" />
                          <span>Layout</span>
                        </div>
                      }
                    >
                      {selectedCalculation.results.layout && (
                        <ScrollShadow className="p-6 space-y-6">
                          <Card className="shadow-sm border-0 overflow-hidden">
                            <CardBody>
                              <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <LayoutGrid className="w-5 h-5 mr-2 text-primary" />
                                Recommended Layout
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                                  <h4 className="font-medium mb-3">
                                    Arrangement
                                  </h4>
                                  <div className="text-4xl font-bold mb-2 text-primary">
                                    {selectedCalculation.results.layout.rows} ×{" "}
                                    {selectedCalculation.results.layout.columns}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Rows × Columns
                                  </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                                  <h4 className="font-medium mb-3">Spacing</h4>
                                  <div className="text-4xl font-bold mb-2 text-primary">
                                    {selectedCalculation.results.layout.lengthSpacing.toFixed(
                                      2
                                    )}{" "}
                                    ×{" "}
                                    {selectedCalculation.results.layout.widthSpacing.toFixed(
                                      2
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Length × Width (m)
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>

                          <Card className="shadow-sm border-0 overflow-hidden">
                            <CardBody className="p-5">
                              <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
                                Visual Layout
                              </h3>
                              <div
                                className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
                                style={{
                                  width: "100%",
                                  height: "300px",
                                }}
                              >
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                                  Room dimensions:{" "}
                                  {selectedCalculation.roomDimensions.length}m ×{" "}
                                  {selectedCalculation.roomDimensions.width}m
                                </div>

                                {/* Room outline */}
                                <div
                                  className="absolute border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                                  style={{
                                    left: "5%",
                                    top: "5%",
                                    width: "90%",
                                    height: "90%",
                                  }}
                                ></div>

                                {/* Render lamp positions */}
                                {Array.from({
                                  length:
                                    selectedCalculation.results.layout.rows,
                                }).map((_, rowIndex) =>
                                  Array.from({
                                    length:
                                      selectedCalculation.results.layout
                                        .columns,
                                  }).map((_, colIndex) => (
                                    <div
                                      key={`lamp-${rowIndex}-${colIndex}`}
                                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                      style={{
                                        left: `${5 + (colIndex + 0.5) * (selectedCalculation.results.layout.lengthSpacing / selectedCalculation.roomDimensions.length) * 90}%`,
                                        top: `${5 + (rowIndex + 0.5) * (selectedCalculation.results.layout.widthSpacing / selectedCalculation.roomDimensions.width) * 90}%`,
                                      }}
                                    >
                                      <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-md relative z-10">
                                        <div className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-75 duration-1000"></div>
                                      </div>
                                      <div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-md w-8 h-8 -m-2"></div>
                                    </div>
                                  ))
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                                Visual representation of lamp placement based on
                                calculated layout.
                              </p>
                            </CardBody>
                          </Card>

                          {selectedCalculation.results.energyMetrics && (
                            <Card className="shadow-sm border-0 overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                              <CardBody>
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                  <Zap className="w-5 h-5 mr-2 text-green-500" />
                                  Energy Performance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow-sm">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      Total Power
                                    </div>
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                      {selectedCalculation.results.energyMetrics.totalPower.toFixed(
                                        2
                                      )}{" "}
                                      W
                                    </div>
                                  </div>

                                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow-sm">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      Power Density
                                    </div>
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                      {selectedCalculation.results.energyMetrics.powerDensity.toFixed(
                                        2
                                      )}{" "}
                                      W/m²
                                    </div>
                                  </div>

                                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow-sm">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      Efficiency Rating
                                    </div>
                                    <div className="mt-2">
                                      <Badge
                                        size="lg"
                                        className="px-4 py-1"
                                        color={
                                          selectedCalculation.results
                                            .energyMetrics.efficiencyRating ===
                                            "Excellent" ||
                                          selectedCalculation.results
                                            .energyMetrics.efficiencyRating ===
                                            "Very Good"
                                            ? "success"
                                            : selectedCalculation.results
                                                  .energyMetrics
                                                  .efficiencyRating ===
                                                  "Good" ||
                                                selectedCalculation.results
                                                  .energyMetrics
                                                  .efficiencyRating ===
                                                  "Average"
                                              ? "warning"
                                              : "danger"
                                        }
                                      >
                                        {
                                          selectedCalculation.results
                                            .energyMetrics.efficiencyRating
                                        }
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          )}
                        </ScrollShadow>
                      )}
                    </Tab>
                  </Tabs>
                )}
              </ModalBody>
              <ModalFooter className="border-t px-6">
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={handleApply}
                  startContent={<ArrowRight className="w-4 h-4" />}
                  className="shadow-md"
                >
                  Apply to Simulator
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
