// Path nodes for Covenant University campus navigation
// Nodes represent building entrances, intersections, and waypoints
// Connected via walking paths with distance (meters) and walk time (seconds)

interface SeedPathNode {
  nodeId: string;
  coordinates: { lat: number; lng: number };
  mapPosition: { x: number; y: number };
  type: "intersection" | "building_entrance" | "waypoint";
  buildingId?: string; // Will be resolved at seed time
  buildingName?: string; // Used to resolve buildingId
  name?: string;
  connectedNodes: {
    nodeId: string;
    distance: number;
    walkTime: number;
    isAccessible: boolean;
  }[];
}

// Helper to calculate distance/time between two map positions
// Approximate: 1% map distance ≈ 15 meters on campus
function conn(
  nodeId: string,
  distance: number,
  isAccessible = true
): { nodeId: string; distance: number; walkTime: number; isAccessible: boolean } {
  return {
    nodeId,
    distance,
    walkTime: Math.round(distance / 1.4), // 1.4 m/s walking speed
    isAccessible,
  };
}

export const campusPathNodes: SeedPathNode[] = [
  // === BUILDING ENTRANCES ===
  {
    nodeId: "ent_cst",
    coordinates: { lat: 6.6728, lng: 3.1572 },
    mapPosition: { x: 35, y: 40 },
    type: "building_entrance",
    buildingName: "College of Science and Technology (CST)",
    name: "CST Entrance",
    connectedNodes: [conn("int_central_west", 60), conn("int_caf1_area", 75)],
  },
  {
    nodeId: "ent_library",
    coordinates: { lat: 6.6745, lng: 3.1578 },
    mapPosition: { x: 50, y: 35 },
    type: "building_entrance",
    buildingName: "Centre for Learning Resources (Library)",
    name: "Library Entrance",
    connectedNodes: [conn("int_central_north", 50), conn("int_central_west", 80)],
  },
  {
    nodeId: "ent_coe",
    coordinates: { lat: 6.672, lng: 3.1565 },
    mapPosition: { x: 25, y: 55 },
    type: "building_entrance",
    buildingName: "College of Engineering (CoE)",
    name: "CoE Entrance",
    connectedNodes: [conn("int_west_mid", 70), conn("int_south_west", 100)],
  },
  {
    nodeId: "ent_cbss",
    coordinates: { lat: 6.6752, lng: 3.159 },
    mapPosition: { x: 65, y: 30 },
    type: "building_entrance",
    buildingName: "College of Business and Social Sciences (CBSS)",
    name: "CBSS Entrance",
    connectedNodes: [conn("int_central_north", 80), conn("int_east_north", 60)],
  },
  {
    nodeId: "ent_clds",
    coordinates: { lat: 6.6758, lng: 3.1585 },
    mapPosition: { x: 60, y: 25 },
    type: "building_entrance",
    buildingName: "College of Leadership Development Studies (CLDS)",
    name: "CLDS Entrance",
    connectedNodes: [conn("int_central_north", 70), conn("int_east_north", 50)],
  },
  {
    nodeId: "ent_chapel",
    coordinates: { lat: 6.674, lng: 3.16 },
    mapPosition: { x: 70, y: 40 },
    type: "building_entrance",
    buildingName: "Faith Tabernacle (University Chapel)",
    name: "Chapel Entrance",
    connectedNodes: [conn("int_east_mid", 60), conn("int_east_north", 80)],
  },
  {
    nodeId: "ent_daniel",
    coordinates: { lat: 6.6765, lng: 3.1555 },
    mapPosition: { x: 20, y: 20 },
    type: "building_entrance",
    buildingName: "Daniel Hall",
    name: "Daniel Hall Entrance",
    connectedNodes: [conn("int_hostel_male", 50, false)],
  },
  {
    nodeId: "ent_joseph",
    coordinates: { lat: 6.6768, lng: 3.156 },
    mapPosition: { x: 25, y: 18 },
    type: "building_entrance",
    buildingName: "Joseph Hall",
    name: "Joseph Hall Entrance",
    connectedNodes: [conn("int_hostel_male", 40, false)],
  },
  {
    nodeId: "ent_peter",
    coordinates: { lat: 6.677, lng: 3.1565 },
    mapPosition: { x: 30, y: 15 },
    type: "building_entrance",
    buildingName: "Peter Hall",
    name: "Peter Hall Entrance",
    connectedNodes: [conn("int_hostel_male", 45, false)],
  },
  {
    nodeId: "ent_john",
    coordinates: { lat: 6.6772, lng: 3.157 },
    mapPosition: { x: 35, y: 12 },
    type: "building_entrance",
    buildingName: "John Hall",
    name: "John Hall Entrance",
    connectedNodes: [conn("int_hostel_male", 55, false)],
  },
  {
    nodeId: "ent_esther",
    coordinates: { lat: 6.6715, lng: 3.1605 },
    mapPosition: { x: 75, y: 60 },
    type: "building_entrance",
    buildingName: "Esther Hall",
    name: "Esther Hall Entrance",
    connectedNodes: [conn("int_hostel_female", 50, false)],
  },
  {
    nodeId: "ent_deborah",
    coordinates: { lat: 6.6712, lng: 3.161 },
    mapPosition: { x: 78, y: 65 },
    type: "building_entrance",
    buildingName: "Deborah Hall",
    name: "Deborah Hall Entrance",
    connectedNodes: [conn("int_hostel_female", 45, false)],
  },
  {
    nodeId: "ent_mary",
    coordinates: { lat: 6.671, lng: 3.1615 },
    mapPosition: { x: 82, y: 70 },
    type: "building_entrance",
    buildingName: "Mary Hall",
    name: "Mary Hall Entrance",
    connectedNodes: [conn("int_hostel_female_south", 50, false)],
  },
  {
    nodeId: "ent_lydia",
    coordinates: { lat: 6.6708, lng: 3.162 },
    mapPosition: { x: 85, y: 75 },
    type: "building_entrance",
    buildingName: "Lydia Hall",
    name: "Lydia Hall Entrance",
    connectedNodes: [conn("int_hostel_female_south", 55, false)],
  },
  {
    nodeId: "ent_caf1",
    coordinates: { lat: 6.6735, lng: 3.1575 },
    mapPosition: { x: 40, y: 45 },
    type: "building_entrance",
    buildingName: "Cafeteria 1 (Caf 1)",
    name: "Caf 1 Entrance",
    connectedNodes: [conn("int_caf1_area", 30)],
  },
  {
    nodeId: "ent_caf2",
    coordinates: { lat: 6.6725, lng: 3.1595 },
    mapPosition: { x: 55, y: 55 },
    type: "building_entrance",
    buildingName: "Cafeteria 2 (Caf 2)",
    name: "Caf 2 Entrance",
    connectedNodes: [conn("int_central_south", 40), conn("int_east_mid", 80)],
  },
  {
    nodeId: "ent_health",
    coordinates: { lat: 6.673, lng: 3.1588 },
    mapPosition: { x: 48, y: 50 },
    type: "building_entrance",
    buildingName: "University Health Centre",
    name: "Health Centre Entrance",
    connectedNodes: [conn("int_caf1_area", 55), conn("int_central_south", 40)],
  },
  {
    nodeId: "ent_sports",
    coordinates: { lat: 6.6705, lng: 3.156 },
    mapPosition: { x: 30, y: 75 },
    type: "building_entrance",
    buildingName: "Sports Complex",
    name: "Sports Complex Entrance",
    connectedNodes: [conn("int_south_west", 60)],
  },
  {
    nodeId: "ent_supermarket",
    coordinates: { lat: 6.6738, lng: 3.1592 },
    mapPosition: { x: 52, y: 48 },
    type: "building_entrance",
    buildingName: "CU Supermarket",
    name: "Supermarket Entrance",
    connectedNodes: [conn("int_caf1_area", 50), conn("int_central_south", 30)],
  },
  {
    nodeId: "ent_senate",
    coordinates: { lat: 6.675, lng: 3.157 },
    mapPosition: { x: 45, y: 30 },
    type: "building_entrance",
    buildingName: "Senate Building",
    name: "Senate Building Entrance",
    connectedNodes: [conn("int_central_north", 40), conn("int_central_west", 60)],
  },

  // === INTERSECTIONS (major walkway junctions) ===
  {
    nodeId: "int_hostel_male",
    coordinates: { lat: 6.6767, lng: 3.156 },
    mapPosition: { x: 27, y: 17 },
    type: "intersection",
    name: "Male Hostel Junction",
    connectedNodes: [
      conn("ent_daniel", 50, false),
      conn("ent_joseph", 40, false),
      conn("ent_peter", 45, false),
      conn("ent_john", 55, false),
      conn("wp_north_path", 80),
    ],
  },
  {
    nodeId: "wp_north_path",
    coordinates: { lat: 6.676, lng: 3.1565 },
    mapPosition: { x: 35, y: 25 },
    type: "waypoint",
    name: "North Pathway",
    connectedNodes: [
      conn("int_hostel_male", 80),
      conn("int_central_north", 70),
      conn("int_central_west", 75),
    ],
  },
  {
    nodeId: "int_central_north",
    coordinates: { lat: 6.6748, lng: 3.158 },
    mapPosition: { x: 50, y: 30 },
    type: "intersection",
    name: "Central North Junction",
    connectedNodes: [
      conn("ent_library", 50),
      conn("ent_senate", 40),
      conn("ent_cbss", 80),
      conn("ent_clds", 70),
      conn("wp_north_path", 70),
      conn("int_central_west", 70),
      conn("int_east_north", 80),
      conn("int_caf1_area", 90),
    ],
  },
  {
    nodeId: "int_east_north",
    coordinates: { lat: 6.6755, lng: 3.1595 },
    mapPosition: { x: 65, y: 28 },
    type: "intersection",
    name: "East North Junction",
    connectedNodes: [
      conn("ent_cbss", 60),
      conn("ent_clds", 50),
      conn("int_central_north", 80),
      conn("int_east_mid", 80),
      conn("ent_chapel", 80),
    ],
  },
  {
    nodeId: "int_central_west",
    coordinates: { lat: 6.674, lng: 3.157 },
    mapPosition: { x: 38, y: 38 },
    type: "intersection",
    name: "Central West Junction",
    connectedNodes: [
      conn("ent_cst", 60),
      conn("ent_library", 80),
      conn("ent_senate", 60),
      conn("int_central_north", 70),
      conn("wp_north_path", 75),
      conn("int_caf1_area", 50),
      conn("int_west_mid", 90),
    ],
  },
  {
    nodeId: "int_caf1_area",
    coordinates: { lat: 6.6735, lng: 3.158 },
    mapPosition: { x: 42, y: 46 },
    type: "intersection",
    name: "Cafeteria 1 Area",
    connectedNodes: [
      conn("ent_cst", 75),
      conn("ent_caf1", 30),
      conn("ent_health", 55),
      conn("ent_supermarket", 50),
      conn("int_central_west", 50),
      conn("int_central_north", 90),
      conn("int_central_south", 55),
    ],
  },
  {
    nodeId: "int_east_mid",
    coordinates: { lat: 6.6735, lng: 3.16 },
    mapPosition: { x: 68, y: 45 },
    type: "intersection",
    name: "East Mid Junction",
    connectedNodes: [
      conn("ent_chapel", 60),
      conn("int_east_north", 80),
      conn("ent_caf2", 80),
      conn("int_central_south", 80),
      conn("int_hostel_female", 100),
    ],
  },
  {
    nodeId: "int_central_south",
    coordinates: { lat: 6.6725, lng: 3.159 },
    mapPosition: { x: 52, y: 55 },
    type: "intersection",
    name: "Central South Junction",
    connectedNodes: [
      conn("ent_caf2", 40),
      conn("ent_health", 40),
      conn("ent_supermarket", 30),
      conn("int_caf1_area", 55),
      conn("int_east_mid", 80),
      conn("int_west_mid", 100),
      conn("int_hostel_female", 120),
      conn("int_south_west", 120),
    ],
  },
  {
    nodeId: "int_west_mid",
    coordinates: { lat: 6.6722, lng: 3.1565 },
    mapPosition: { x: 28, y: 52 },
    type: "intersection",
    name: "West Mid Junction",
    connectedNodes: [
      conn("ent_coe", 70),
      conn("int_central_west", 90),
      conn("int_central_south", 100),
      conn("int_south_west", 90),
    ],
  },
  {
    nodeId: "int_south_west",
    coordinates: { lat: 6.671, lng: 3.156 },
    mapPosition: { x: 30, y: 68 },
    type: "intersection",
    name: "South West Junction",
    connectedNodes: [
      conn("ent_sports", 60),
      conn("ent_coe", 100),
      conn("int_west_mid", 90),
      conn("int_central_south", 120),
    ],
  },
  {
    nodeId: "int_hostel_female",
    coordinates: { lat: 6.6715, lng: 3.1608 },
    mapPosition: { x: 76, y: 58 },
    type: "intersection",
    name: "Female Hostel Junction",
    connectedNodes: [
      conn("ent_esther", 50, false),
      conn("ent_deborah", 45, false),
      conn("int_hostel_female_south", 70, false),
      conn("int_east_mid", 100),
      conn("int_central_south", 120),
    ],
  },
  {
    nodeId: "int_hostel_female_south",
    coordinates: { lat: 6.6709, lng: 3.1617 },
    mapPosition: { x: 83, y: 72 },
    type: "intersection",
    name: "Female Hostel South Junction",
    connectedNodes: [
      conn("ent_mary", 50, false),
      conn("ent_lydia", 55, false),
      conn("int_hostel_female", 70, false),
    ],
  },
];
