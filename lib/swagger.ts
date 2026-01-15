export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Campus Navigator API",
    version: "1.0.0",
    description: "API documentation for Campus Navigator - Covenant University",
  },
  servers: [
    {
      url: process.env.NEXTAUTH_URL || "http://localhost:3000",
      description: "Development server",
    },
  ],
  tags: [
    { name: "Seed", description: "Database seeding operations" },
    { name: "Buildings", description: "Building management" },
    { name: "Events", description: "Event management" },
    { name: "Navigation", description: "Pathfinding and directions" },
    { name: "Saved Locations", description: "User bookmarks" },
  ],
  paths: {
    "/api/seed/admin": {
      get: {
        tags: ["Seed"],
        summary: "Check admin status",
        description: "Check if the admin user exists and has a password set",
        responses: {
          200: {
            description: "Admin status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    exists: { type: "boolean" },
                    email: { type: "string" },
                    hasPassword: { type: "boolean" },
                    role: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Seed"],
        summary: "Create or reset admin user",
        description:
          "Creates an admin user or resets the password if the admin already exists. Use this if admin login is not working.",
        responses: {
          200: {
            description: "Admin created/updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    admin: {
                      type: "object",
                      properties: {
                        email: { type: "string", example: "admin@cu.edu.ng" },
                        password: { type: "string", example: "Admin@123" },
                        note: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/seed": {
      get: {
        tags: ["Seed"],
        summary: "Check database status",
        description: "Returns the current count of buildings, events, and users",
        responses: {
          200: {
            description: "Database status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    counts: {
                      type: "object",
                      properties: {
                        buildings: { type: "number", example: 20 },
                        events: { type: "number", example: 4 },
                        users: { type: "number", example: 2 },
                      },
                    },
                    seeded: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Seed"],
        summary: "Seed the database",
        description:
          "Seeds the database with Covenant University buildings, sample events, and creates an admin user. Returns admin credentials on success.",
        parameters: [
          {
            name: "force",
            in: "query",
            description: "Force overwrite existing data",
            required: false,
            schema: {
              type: "string",
              enum: ["true", "false"],
              default: "false",
            },
          },
        ],
        responses: {
          200: {
            description: "Database seeded successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Database seeded successfully" },
                    data: {
                      type: "object",
                      properties: {
                        buildings: { type: "number", example: 20 },
                        events: { type: "number", example: 4 },
                      },
                    },
                    admin: {
                      type: "object",
                      properties: {
                        email: { type: "string", example: "admin@cu.edu.ng" },
                        password: { type: "string", example: "Admin@123" },
                        note: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Database already seeded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                    message: { type: "string" },
                    existingCount: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/buildings": {
      get: {
        tags: ["Buildings"],
        summary: "Get all buildings",
        description: "Returns a list of all buildings with optional filtering",
        parameters: [
          {
            name: "type",
            in: "query",
            description: "Filter by building type",
            schema: {
              type: "string",
              enum: ["academic", "hostel", "service", "event"],
            },
          },
          {
            name: "search",
            in: "query",
            description: "Search buildings by name",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "List of buildings",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Building" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Buildings"],
        summary: "Create a building",
        description: "Creates a new building (Admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BuildingInput" },
            },
          },
        },
        responses: {
          201: { description: "Building created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - Admin only" },
        },
      },
    },
    "/api/buildings/{id}": {
      get: {
        tags: ["Buildings"],
        summary: "Get a building by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Building details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Building" },
              },
            },
          },
          404: { description: "Building not found" },
        },
      },
      put: {
        tags: ["Buildings"],
        summary: "Update a building",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BuildingInput" },
            },
          },
        },
        responses: {
          200: { description: "Building updated" },
          401: { description: "Unauthorized" },
          404: { description: "Building not found" },
        },
      },
      delete: {
        tags: ["Buildings"],
        summary: "Delete a building",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Building deleted" },
          401: { description: "Unauthorized" },
          404: { description: "Building not found" },
        },
      },
    },
    "/api/events": {
      get: {
        tags: ["Events"],
        summary: "Get all events",
        parameters: [
          {
            name: "category",
            in: "query",
            schema: {
              type: "string",
              enum: ["academic", "sports", "cultural", "religious", "career", "other"],
            },
          },
          {
            name: "upcoming",
            in: "query",
            description: "Only show upcoming events",
            schema: { type: "string", enum: ["true", "false"] },
          },
        ],
        responses: {
          200: {
            description: "List of events",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Event" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Events"],
        summary: "Create an event",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EventInput" },
            },
          },
        },
        responses: {
          201: { description: "Event created" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/navigation": {
      post: {
        tags: ["Navigation"],
        summary: "Calculate route between buildings",
        description: "Calculate walking directions between two buildings. Returns path points, distance in meters, estimated walking time, and turn-by-turn directions.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fromBuildingId", "toBuildingId"],
                properties: {
                  fromBuildingId: { type: "string", description: "Starting building MongoDB _id" },
                  toBuildingId: { type: "string", description: "Destination building MongoDB _id" },
                  accessible: {
                    type: "boolean",
                    description: "Only use accessible routes",
                    default: false,
                  },
                },
              },
              example: {
                fromBuildingId: "building_id_here",
                toBuildingId: "another_building_id_here",
                accessible: false,
              },
            },
          },
        },
        responses: {
          200: {
            description: "Navigation route calculated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    path: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          nodeId: { type: "string" },
                          coordinates: {
                            type: "object",
                            properties: {
                              lat: { type: "number" },
                              lng: { type: "number" },
                            },
                          },
                          mapPosition: {
                            type: "object",
                            properties: {
                              x: { type: "number" },
                              y: { type: "number" },
                            },
                          },
                        },
                      },
                    },
                    totalDistance: { type: "number", description: "Distance in meters" },
                    estimatedTime: { type: "number", description: "Walking time in minutes" },
                    steps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          instruction: { type: "string" },
                          distance: { type: "number" },
                        },
                      },
                    },
                    fromBuilding: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                      },
                    },
                    toBuilding: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: "Building not found" },
        },
      },
    },
    "/api/saved-locations": {
      get: {
        tags: ["Saved Locations"],
        summary: "Get user's saved locations",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of saved locations",
          },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Saved Locations"],
        summary: "Save a location",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["buildingId"],
                properties: {
                  buildingId: { type: "string" },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Location saved" },
          401: { description: "Unauthorized" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Building: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string", example: "College of Science and Technology (CST)" },
          type: {
            type: "string",
            enum: ["academic", "hostel", "service", "event"],
          },
          departments: {
            type: "array",
            items: { type: "string" },
          },
          hours: { type: "string", example: "Mon-Fri: 8:00 AM - 6:00 PM" },
          coordinates: {
            type: "object",
            properties: {
              lat: { type: "number", example: 6.6735 },
              lng: { type: "number", example: 3.158 },
            },
          },
          mapPosition: {
            type: "object",
            properties: {
              x: { type: "number", example: 50 },
              y: { type: "number", example: 50 },
            },
          },
          description: { type: "string" },
          image: { type: "string" },
          amenities: { type: "array", items: { type: "string" } },
          floor_count: { type: "number", example: 3 },
          accessibility: { type: "boolean" },
        },
      },
      BuildingInput: {
        type: "object",
        required: ["name", "type", "coordinates", "mapPosition"],
        properties: {
          name: { type: "string" },
          type: { type: "string", enum: ["academic", "hostel", "service", "event"] },
          departments: { type: "array", items: { type: "string" } },
          hours: { type: "string" },
          coordinates: {
            type: "object",
            properties: {
              lat: { type: "number" },
              lng: { type: "number" },
            },
          },
          mapPosition: {
            type: "object",
            properties: {
              x: { type: "number" },
              y: { type: "number" },
            },
          },
          description: { type: "string" },
          amenities: { type: "array", items: { type: "string" } },
          floor_count: { type: "number" },
          accessibility: { type: "boolean" },
        },
      },
      Event: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          building: { $ref: "#/components/schemas/Building" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          category: {
            type: "string",
            enum: ["academic", "sports", "cultural", "religious", "career", "other"],
          },
          organizer: { type: "string" },
          isPublic: { type: "boolean" },
        },
      },
      EventInput: {
        type: "object",
        required: ["title", "buildingId", "startDate", "endDate"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          buildingId: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          category: { type: "string" },
          organizer: { type: "string" },
          isPublic: { type: "boolean", default: true },
        },
      },
      NavigationRoute: {
        type: "object",
        properties: {
          path: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lat: { type: "number" },
                lng: { type: "number" },
              },
            },
          },
          distance: { type: "number", description: "Distance in meters" },
          duration: { type: "number", description: "Walking time in minutes" },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                instruction: { type: "string" },
                distance: { type: "number" },
              },
            },
          },
        },
      },
    },
  },
};
