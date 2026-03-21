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
    { name: "Users", description: "User management (Super Admin)" },
    { name: "Upload", description: "File uploads" },
  ],
  paths: {
    "/api/seed": {
      get: {
        tags: ["Seed"],
        summary: "Check database status",
        responses: {
          200: { description: "Database status with counts" },
        },
      },
      post: {
        tags: ["Seed"],
        summary: "Seed the database",
        description: "Seeds buildings, events, path nodes, and creates an admin user. Use ?force=true to overwrite.",
        parameters: [
          {
            name: "force",
            in: "query",
            description: "Force overwrite existing data",
            schema: { type: "string", enum: ["true", "false"], default: "false" },
          },
        ],
        responses: {
          200: { description: "Database seeded successfully. Admin credentials returned in response." },
          400: { description: "Database already seeded" },
        },
      },
    },
    "/api/seed/admin": {
      get: {
        tags: ["Seed"],
        summary: "Check admin status",
        responses: { 200: { description: "Admin user status" } },
      },
      post: {
        tags: ["Seed"],
        summary: "Create or reset admin user",
        responses: { 200: { description: "Admin created/updated. Credentials returned in response." } },
      },
    },
    "/api/buildings": {
      get: {
        tags: ["Buildings"],
        summary: "Get all buildings",
        parameters: [
          { name: "type", in: "query", schema: { type: "string", enum: ["academic", "hostel", "service", "event"] } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "List of buildings",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Building" } } } },
          },
        },
      },
      post: {
        tags: ["Buildings"],
        summary: "Create a building (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/BuildingInput" } } } },
        responses: { 201: { description: "Building created" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/buildings/{id}": {
      get: {
        tags: ["Buildings"],
        summary: "Get a building by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Building details" }, 404: { description: "Not found" } },
      },
      put: {
        tags: ["Buildings"],
        summary: "Update a building (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/BuildingInput" } } } },
        responses: { 200: { description: "Building updated" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } },
      },
      delete: {
        tags: ["Buildings"],
        summary: "Delete a building (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Building deleted" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } },
      },
    },
    "/api/events": {
      get: {
        tags: ["Events"],
        summary: "Get all events",
        parameters: [
          { name: "category", in: "query", schema: { type: "string", enum: ["academic", "social", "sports", "religious", "career", "other"] } },
          { name: "upcoming", in: "query", schema: { type: "string", enum: ["true", "false"] } },
          { name: "buildingId", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "List of events" } },
      },
      post: {
        tags: ["Events"],
        summary: "Create an event (Authenticated)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventInput" } } } },
        responses: { 201: { description: "Event created" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/events/{id}": {
      get: {
        tags: ["Events"],
        summary: "Get an event by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Event details" }, 404: { description: "Not found" } },
      },
      put: {
        tags: ["Events"],
        summary: "Update an event (Owner/Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventInput" } } } },
        responses: { 200: { description: "Event updated" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } },
      },
      delete: {
        tags: ["Events"],
        summary: "Delete an event (Owner/Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Event deleted" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } },
      },
    },
    "/api/navigation": {
      post: {
        tags: ["Navigation"],
        summary: "Calculate route between buildings",
        description: "Uses Dijkstra pathfinding with PathNodes, falls back to Haversine. Supports accessible routing.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fromBuildingId", "toBuildingId"],
                properties: {
                  fromBuildingId: { type: "string" },
                  toBuildingId: { type: "string" },
                  accessible: { type: "boolean", default: false },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Route calculated with path, distance, time, and steps" },
          404: { description: "Building or accessible route not found" },
        },
      },
    },
    "/api/saved-locations": {
      get: {
        tags: ["Saved Locations"],
        summary: "Get user's saved locations",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of saved locations" }, 401: { description: "Unauthorized" } },
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
                  nickname: { type: "string", maxLength: 50 },
                  notes: { type: "string", maxLength: 200 },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Location saved" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/saved-locations/{id}": {
      put: {
        tags: ["Saved Locations"],
        summary: "Update saved location nickname/notes",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
      },
      delete: {
        tags: ["Saved Locations"],
        summary: "Remove a saved location",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Removed" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List all users (Admin)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of users" }, 401: { description: "Unauthorized" } },
      },
      post: {
        tags: ["Users"],
        summary: "Create an admin user (Super Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  role: { type: "string", enum: ["admin", "super_admin"], default: "admin" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "User created" }, 401: { description: "Unauthorized" }, 409: { description: "Email already exists" } },
      },
    },
    "/api/users/{id}": {
      patch: {
        tags: ["Users"],
        summary: "Update user role or status (Super Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  role: { type: "string", enum: ["user", "admin", "super_admin"] },
                  isActive: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "User updated" }, 400: { description: "Cannot change own role" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/upload": {
      post: {
        tags: ["Upload"],
        summary: "Upload an image (Authenticated)",
        description: "Uploads an image to AWS S3. Accepts JPEG, PNG, WebP, GIF (max 5MB). Returns the S3 URL.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Upload successful, returns { url: string }" },
          400: { description: "Invalid file type or size" },
          401: { description: "Unauthorized" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Building: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string", example: "College of Science and Technology (CST)" },
          type: { type: "string", enum: ["academic", "hostel", "service", "event"] },
          departments: { type: "array", items: { type: "string" } },
          hours: { type: "string" },
          coordinates: { type: "object", properties: { lat: { type: "number" }, lng: { type: "number" } } },
          mapPosition: { type: "object", properties: { x: { type: "number" }, y: { type: "number" } } },
          description: { type: "string" },
          image: { type: "string" },
          amenities: { type: "array", items: { type: "string" } },
          floor_count: { type: "number" },
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
          coordinates: { type: "object", properties: { lat: { type: "number" }, lng: { type: "number" } } },
          mapPosition: { type: "object", properties: { x: { type: "number" }, y: { type: "number" } } },
          description: { type: "string" },
          image: { type: "string" },
          amenities: { type: "array", items: { type: "string" } },
          floor_count: { type: "number" },
          accessibility: { type: "boolean" },
        },
      },
      EventInput: {
        type: "object",
        required: ["title", "description", "building", "startDate", "endDate", "category", "organizer"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          building: { type: "string", description: "Building ID" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          isAllDay: { type: "boolean", default: false },
          category: { type: "string", enum: ["academic", "social", "sports", "religious", "career", "other"] },
          organizer: { type: "string" },
          image: { type: "string" },
          attendeeLimit: { type: "number" },
          isPublic: { type: "boolean", default: true },
        },
      },
    },
  },
};
