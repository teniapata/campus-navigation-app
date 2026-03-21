# CHAPTER THREE

## SYSTEM DESIGN AND METHODOLOGY

### 3.1 INTRODUCTION

This chapter presents the comprehensive system analysis, design, and methodological framework adopted for the development of the Campus Navigation and Location Guide System. The chapter covers the functional and non-functional requirements of the system, the system architecture, component interactions, data models, algorithm designs, user interface layouts, and security mechanisms. The methodological framework describes the systematic approach used for system development, including data collection techniques, technology selection criteria, and the development lifecycle. This chapter serves as the technical blueprint for the implementation phase, ensuring that all system components are properly defined and integrated to meet the project objectives stated in Chapter One.

### 3.2 System Analysis

#### 3.2.1 Overview of the Proposed System

The Campus Navigation and Location Guide System is a full-stack web application designed to address the wayfinding challenges experienced by students, staff, and visitors at Covenant University. The system provides an interactive digital map of the campus, real-time directions with voice-guided navigation, building and event management, and personalised saved locations.

The system architecture follows a modern full-stack web application paradigm comprising:

i. A server-rendered frontend built with Next.js 16 (App Router) and React 19, utilising server-side rendering (SSR) and client-side interactivity for optimal performance and SEO.

ii. A server-side API layer implemented using Next.js API routes, providing RESTful endpoints for all data operations with role-based access control.

iii. A cloud-hosted MongoDB Atlas database using Mongoose ODM for persistent data storage, supporting full-text search, geospatial indexing, and complex document relationships.

iv. Integration with external mapping services, including the Google Maps JavaScript API for map rendering, the Google Directions API for multi-modal route computation, and the Google Places API for location autocomplete.

v. Authentication and authorisation powered by NextAuth.js, supporting Google OAuth for regular users and credential-based login for administrative personnel.

This architecture leverages well-established mapping technology to deliver precise geospatial services while ensuring cross-platform accessibility, scalability, and maintainability. Unlike the originally proposed React.js and Firebase stack, the adoption of Next.js with MongoDB provides server-side rendering capabilities, a unified API layer, and a more flexible document-oriented database suitable for the evolving schema requirements of campus spatial data.

#### 3.2.1.1 System Block Diagram

The system block diagram illustrates the main functional blocks of the Campus Navigation and Location Guide System:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Google   │  │ Navigator    │  │ Directions  │  │ Admin       │ │
│  │ Map View │  │ Sidebar &    │  │ Panel &     │  │ Dashboard   │ │
│  │ Component│  │ Search       │  │ Voice Nav   │  │ (CRUD)      │ │
│  └────┬─────┘  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘ │
│       │               │                 │                 │        │
│  ┌────┴───────────────┴─────────────────┴─────────────────┴──────┐ │
│  │                    React State Management                      │ │
│  │              (Hooks: useBuildings, useEvents,                  │ │
│  │         useSavedLocations, useNavigation)                      │ │
│  └───────────────────────────┬────────────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTP/REST
┌──────────────────────────────┼──────────────────────────────────────┐
│                    NEXT.JS SERVER (API Routes)                      │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ /api/      │  │ /api/    │  │ /api/    │  │ /api/navigation  │ │
│  │ buildings  │  │ events   │  │ users    │  │ (Dijkstra        │ │
│  │ CRUD       │  │ CRUD     │  │ Mgmt     │  │  Pathfinding)    │ │
│  └─────┬──────┘  └────┬─────┘  └────┬─────┘  └───────┬──────────┘ │
│        │              │             │                 │            │
│  ┌─────┴──────────────┴─────────────┴─────────────────┴──────────┐ │
│  │           NextAuth.js (JWT Sessions, Role-Based Auth)          │ │
│  │           Zod Validators (Input Validation)                    │ │
│  │           Mongoose ODM (Database Abstraction)                  │ │
│  └───────────────────────────┬────────────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│              EXTERNAL SERVICES & DATABASE                           │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐  ┌───────┐ │
│  │ MongoDB      │  │ Google Maps    │  │ Google OAuth │  │ AWS   │ │
│  │ Atlas        │  │ JavaScript API │  │ Provider     │  │ S3    │ │
│  │ (Buildings,  │  │ Directions API │  │              │  │(Image │ │
│  │  Events,     │  │ Places API     │  │              │  │Upload)│ │
│  │  Users,      │  │                │  │              │  │       │ │
│  │  PathNodes,  │  │                │  │              │  │       │ │
│  │  SavedLocs)  │  │                │  │              │  │       │ │
│  └──────────────┘  └────────────────┘  └──────────────┘  └───────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 Mapping Objectives to System Requirements

The project proposal outlines seven specific objectives. Table 3.1 maps each objective to the corresponding system requirements and the implemented solution.

**Table 3.1: Mapping of Project Objectives to System Requirements**

| S/N | Objective | System Requirement | Implementation |
|-----|-----------|-------------------|----------------|
| 1 | Develop a web-based interface displaying an interactive digital map | Map Visualisation Module | Google Maps JavaScript API integrated via `@react-google-maps/api` with custom building markers, info windows, and multi-layer rendering |
| 2 | Integrate Google Maps JavaScript API for rendering campus map | Map Rendering & Marker System | `GoogleMapView` component with colour-coded markers (blue=academic, yellow=service, green=hostel, purple=event) |
| 3 | Create a backend for storing building coordinates and points of interest | Database & API Layer | MongoDB Atlas with Mongoose schemas for Buildings, Events, Users, PathNodes, and SavedLocations; RESTful API routes |
| 4 | Implement a search module for locating buildings and landmarks | Search & Filter Module | Client-side search with multi-field matching across building names, departments, and descriptions; type-based filtering |
| 5 | Provide routing functionality to guide users between locations | Navigation & Routing Module | Multi-modal routing (Walking, Driving, Transit) via Google Directions API; Dijkstra-based campus pathfinding with PathNodes; voice-guided turn-by-turn navigation |
| 6 | Develop an admin panel for authorised personnel to update data | Administrative Module | Role-based admin dashboard with CRUD operations for buildings, events, and user management; protected by NextAuth.js session validation |
| 7 | Test the system for accuracy, usability, and responsiveness | Quality Assurance | Responsive design with Tailwind CSS; ESLint and TypeScript strict checking; cross-device testing |

#### 3.2.3 Functional Requirements

##### 3.2.3.1 Map Visualisation Module

i. The system shall render an interactive digital map of the university campus using the Google Maps JavaScript API, loaded via the `@react-google-maps/api` React library.

ii. The map display shall be centred on the Covenant University campus at coordinates (6.6735°N, 3.158°E), covering all academic zones, residential areas, and peripheral facilities.

iii. Custom map markers shall be overlaid on the base map to represent all significant campus buildings, lecture halls, hostels, cafeterias, sports facilities, and landmarks. Each building type is represented by a distinct colour: blue for academic buildings, yellow for service buildings, green for hostels, and purple for event venues.

iv. Map markers shall be clickable, triggering an InfoWindow popup displaying the building's name, type, and description.

v. The map shall support standard navigation controls including pan, zoom, street view, map type switching, and full-screen mode.

vi. During navigation mode, the map shall render a DirectionsRenderer overlay showing the computed route as a green polyline with a stroke weight of 5 pixels.

vii. The map shall support dark mode rendering consistent with the application's theme setting.

##### 3.2.3.2 Location Search and Filtering Module

i. The system shall provide a search interface within the sidebar allowing users to locate campus facilities by entering building names or department names.

ii. The search functionality shall support real-time client-side filtering, updating results as the user types.

iii. Users shall be able to filter buildings by category using toggle buttons: Buildings (academic), Services, Events, and Hostels.

iv. When the Events tab is active, users shall be able to filter events by category: Academic, Social, Sports, Religious, Career, and Other.

v. Search results shall be displayed as an interactive list in the sidebar with building type icons, names, department summaries, and operating hours.

vi. Selecting a search result shall open the Building Detail Drawer showing comprehensive building information.

##### 3.2.3.3 Building Information Module

i. When users select a building from search results or click a map marker, the system shall display a sliding drawer panel showing comprehensive building information.

ii. Displayed information shall include: building name, type badge, image (with fallback), description, operating hours, departments list, amenities, floor count, and wheelchair accessibility status.

iii. The information drawer shall include action buttons for: Get Directions (initiates navigation mode with the building as destination), Save/Unsave Location (for authenticated users), and Share (copies building information).

##### 3.2.3.4 Routing and Navigation Module

i. The system shall enable users to obtain directions between any two points by specifying origin and destination locations.

ii. Origin may be specified through: typing a location name (with Google Places Autocomplete restricted to Nigeria), clicking a building marker on the map, or using the device's GPS location via the "Use My Location" button.

iii. The system shall support three travel modes selectable via a segmented control: Walking (pedestrian paths), Driving (vehicle roads), and Transit (public transportation).

iv. For each requested route, the system shall compute and display: the optimal path overlaid as a coloured polyline on the map, total distance, estimated travel time based on selected travel mode, and turn-by-turn directions with step-by-step instructions.

v. The system shall provide a wheelchair-accessible route toggle that, when enabled, computes routes using only accessible path segments through the campus PathNode graph using Dijkstra's algorithm.

vi. The system shall provide voice-guided turn-by-turn navigation using the Web Speech API. When activated, the system shall: announce the route summary (total distance and estimated time), track the user's real-time GPS position via `navigator.geolocation.watchPosition()`, announce each navigation step when the user is within 30 metres of the step's starting point, and announce arrival when the user is within 20 metres of the destination.

vii. The directions panel shall visually highlight the current navigation step during voice navigation, with a speaking indicator animation.

viii. Users shall be able to stop voice navigation at any time via the "Stop Navigation" button, which cancels speech synthesis and stops GPS tracking.

##### 3.2.3.5 Campus Pathfinding Module

i. The system shall maintain a graph of PathNode documents in the database representing building entrances, walkway intersections, and waypoints across the campus.

ii. Each PathNode shall store: a unique node identifier, geographic coordinates (latitude/longitude), map position (x/y percentage), node type (building_entrance, intersection, waypoint), optional building reference, and an array of connected nodes with edge weights (distance in metres, walk time in seconds, and accessibility flag).

iii. The navigation API shall implement Dijkstra's shortest path algorithm to compute optimal routes through the campus PathNode graph, considering edge distances and accessibility constraints.

iv. When accessible routing is enabled and no accessible path exists between two buildings, the system shall return an appropriate error message.

v. The system shall fall back to simple Haversine distance calculation if no PathNode data exists in the database.

##### 3.2.3.6 Event Management Module

i. The system shall display campus events in the Events tab of the sidebar, showing event title, category badge, venue name, and date/time.

ii. Events shall be filterable by category: Academic, Social, Sports, Religious, Career, and Other.

iii. Authenticated users shall be able to create events through the admin panel, specifying: title, description, venue (selected from existing buildings), start/end dates, category, organiser, optional image (via file upload or URL), attendee limit, and public/private visibility.

iv. Event creators and administrators shall be able to edit existing events through the admin panel at `/admin/events/[id]`.

v. Event creators and administrators shall be able to delete events with a confirmation dialog.

##### 3.2.3.7 Saved Locations Module

i. Authenticated users shall be able to bookmark buildings as saved locations by clicking the bookmark icon in the building detail drawer.

ii. Each saved location may include an optional nickname (up to 50 characters) and notes (up to 200 characters).

iii. The Saved tab in the sidebar shall display all of the user's saved locations with nickname, building name, and notes.

iv. Users shall be able to click a saved location to navigate to the building on the map.

v. Users shall be able to remove saved locations via a delete button that appears on hover.

vi. The system shall enforce a unique constraint preventing the same building from being saved twice by the same user.

##### 3.2.3.8 Administrative Management Module

i. The system shall provide a secure administrative dashboard accessible at `/admin`, protected by NextAuth.js session validation requiring `admin` or `super_admin` role.

ii. The admin dashboard shall display summary statistics: total buildings, total events, total users, and upcoming events count.

iii. **Buildings Management**: Administrators shall be able to create, view, edit, and delete buildings. The building form includes fields for name, type, description, departments, operating hours, coordinates, map position, amenities, floor count, accessibility, and image upload.

iv. **Events Management**: Administrators shall be able to create, view, edit, and delete events through a dedicated interface with category filtering.

v. **User Management**: Super administrators shall be able to view all users, change user roles (user/admin/super_admin) via dropdown select, and toggle user active/inactive status. Administrators shall not be able to modify their own role. Super administrators can also create new admin users directly from the admin panel.

vi. **Image Upload**: The admin panel shall support file upload for building and event images. Files are validated on the client side for type (JPEG, PNG, WebP, GIF) and size (maximum 5MB). Uploads are handled via AWS S3 using presigned URLs: the client requests a presigned URL from the server, then uploads the file directly to S3. The resulting file URL is stored in the database and accessible via direct URL.

vii. **GPS Coordinate Auto-Fill**: When adding or editing buildings, administrators can use the "Use Current Location" GPS button to automatically fill in the building's latitude and longitude coordinates from their device's current position.

##### 3.2.3.9 Authentication and Authorisation Module

i. The system shall support two authentication methods: Google OAuth 2.0 for regular users, and email/password credentials for administrative users.

ii. Sessions shall be managed using JSON Web Tokens (JWT) with NextAuth.js.

iii. The system shall enforce three user roles with hierarchical permissions:
   - **User**: Can view buildings, events, and save locations.
   - **Admin**: Can additionally manage buildings and events.
   - **Super Admin**: Can additionally manage user roles and account status.

iv. Protected API routes shall validate the user's session and role before processing requests.

v. The admin layout shall redirect unauthenticated users to the home page.

##### 3.2.3.10 Theme and Accessibility Module

i. The system shall support light and dark mode themes, togglable via a sun/moon button in the top navigation bar.

ii. Theme preference shall be managed by `next-themes` and respect the user's system preference by default.

iii. Dark mode shall apply to all major components: top navigation, sidebar, directions panel, building detail drawer, and admin pages.

iv. All dark mode styles shall be implemented using Tailwind CSS `dark:` variant classes with CSS custom properties defined in OKLCh colour space.

v. Building accessibility status shall be displayed in the building detail drawer with a wheelchair icon, showing whether each building is wheelchair accessible.

#### 3.2.4 Non-Functional Requirements

i. **Performance**: The system shall load the initial map view within 3 seconds on a standard broadband connection. Client-side search filtering shall produce results within 50 milliseconds for datasets of up to 500 building records.

ii. **Responsiveness**: The interface shall be fully responsive, adapting to desktop (>1024px), tablet (768-1024px), and mobile (<768px) viewports using Tailwind CSS responsive utilities.

iii. **Reliability**: The system shall handle API failures gracefully with toast notifications and fallback behaviours.

iv. **Security**: All API endpoints shall validate input using Zod schema validators. User passwords shall be hashed using bcrypt with 12 salt rounds. Admin operations shall require authenticated sessions with appropriate role checks.

v. **Maintainability**: The codebase shall follow TypeScript strict typing, component-based architecture, and consistent code formatting enforced by ESLint and Prettier.

vi. **Scalability**: The MongoDB database shall support indexing on frequently queried fields (building name, type, coordinates) and full-text search indexes on building names, descriptions, and departments.

### 3.3 SYSTEM DESIGN

#### 3.3.1 Database Schema Design

The system uses MongoDB with Mongoose ODM. Five collections are defined:

**3.3.1.1 Buildings Collection**

| Field | Type | Description |
|-------|------|-------------|
| name | String (required) | Official building name |
| type | Enum: academic, hostel, service, event | Building category |
| departments | [String] | List of departments housed |
| hours | String | Operating hours |
| coordinates | { lat: Number, lng: Number } | Geographic coordinates (WGS84) |
| mapPosition | { x: Number, y: Number } | Map position as percentage (0-100) |
| description | String | Building description |
| image | String | Image URL or upload path |
| amenities | [String] | Available amenities |
| floor_count | Number (default: 1) | Number of floors |
| accessibility | Boolean (default: false) | Wheelchair accessible |

Indexes: Text index on `name`, `description`, `departments` for full-text search.

**3.3.1.2 Users Collection**

| Field | Type | Description |
|-------|------|-------------|
| name | String (required) | User display name |
| email | String (required, unique) | User email |
| image | String | Profile image URL |
| password | String (select: false) | Bcrypt-hashed password |
| role | Enum: user, admin, super_admin | User role |
| googleId | String (unique, sparse) | Google OAuth ID |
| lastLogin | Date | Last login timestamp |
| isActive | Boolean (default: true) | Account status |

**3.3.1.3 Events Collection**

| Field | Type | Description |
|-------|------|-------------|
| title | String (required) | Event title |
| description | String | Event description |
| building | ObjectId (ref: Building) | Venue reference |
| startDate | Date (required) | Event start |
| endDate | Date (required) | Event end |
| isAllDay | Boolean | All-day event flag |
| category | Enum: academic, social, sports, religious, career, other | Event category |
| organizer | String | Organiser name |
| image | String | Event image |
| attendeeLimit | Number | Maximum attendees |
| isPublic | Boolean (default: true) | Public visibility |
| createdBy | ObjectId (ref: User) | Creator reference |

Indexes: Compound index on `startDate` and `endDate`; text index on `title` and `description`.

**3.3.1.4 PathNodes Collection**

| Field | Type | Description |
|-------|------|-------------|
| nodeId | String (required, unique) | Unique node identifier |
| coordinates | { lat: Number, lng: Number } | Geographic position |
| mapPosition | { x: Number, y: Number } | Map position percentage |
| type | Enum: intersection, building_entrance, waypoint | Node type |
| buildingId | String (optional) | Associated building ID |
| name | String (optional) | Display name |
| connectedNodes | Array of { nodeId, distance, walkTime, isAccessible } | Graph edges |

**3.3.1.5 SavedLocations Collection**

| Field | Type | Description |
|-------|------|-------------|
| user | ObjectId (ref: User, required) | User reference |
| building | ObjectId (ref: Building, required) | Building reference |
| nickname | String (max: 50) | Custom name |
| notes | String (max: 200) | User notes |

Indexes: Unique compound index on `user` + `building`.

#### 3.3.2 API Design

The system exposes RESTful API endpoints through Next.js API routes:

**Buildings API**
- `GET /api/buildings` — List all buildings with optional type and search filters
- `POST /api/buildings` — Create a building (admin/super_admin)
- `GET /api/buildings/[id]` — Get a specific building
- `PUT /api/buildings/[id]` — Update a building (admin/super_admin)
- `DELETE /api/buildings/[id]` — Delete a building (admin/super_admin)

**Events API**
- `GET /api/events` — List events with optional category, building, and upcoming filters
- `POST /api/events` — Create an event (authenticated)
- `GET /api/events/[id]` — Get a specific event
- `PUT /api/events/[id]` — Update an event (owner or admin)
- `DELETE /api/events/[id]` — Delete an event (owner or admin)

**Navigation API**
- `POST /api/navigation` — Calculate route between two buildings using Dijkstra pathfinding with fallback to Haversine

**Saved Locations API**
- `GET /api/saved-locations` — Get user's saved locations (authenticated)
- `POST /api/saved-locations` — Save a building (authenticated)
- `PUT /api/saved-locations/[id]` — Update nickname/notes (authenticated)
- `DELETE /api/saved-locations/[id]` — Remove saved location (authenticated)

**Users API**
- `GET /api/users` — List all users (admin/super_admin)
- `POST /api/users` — Create a new admin user (super_admin)
- `PATCH /api/users/[id]` — Update user role or status (super_admin)

**Upload API**
- `POST /api/upload` — Generate a presigned S3 URL for direct upload (authenticated). Returns `presignedUrl` and `fileUrl`.

**Seed API**
- `POST /api/seed` — Seed database with buildings, events, path nodes, and admin user

#### 3.3.3 Algorithm Design

##### 3.3.3.1 Dijkstra's Shortest Path Algorithm

The campus pathfinding system implements Dijkstra's algorithm to compute optimal walking routes between buildings through the PathNode graph. The algorithm operates as follows:

**Input**: A graph of PathNodes, a start node ID (building entrance), an end node ID (building entrance), and an accessibility constraint flag.

**Process**:
1. Initialise a distance map with infinity for all nodes except the start node (distance 0).
2. Initialise a previous-node map for path reconstruction.
3. Create an unvisited set containing all node IDs.
4. While the unvisited set is not empty:
   a. Select the unvisited node with the smallest distance.
   b. If this node is the destination, terminate.
   c. For each connected node of the current node:
      - If accessibility mode is enabled and the edge is not accessible, skip.
      - If the connected node has been visited, skip.
      - Calculate the alternative distance (current distance + edge distance).
      - If this is less than the known distance, update the distance and previous maps.
5. Reconstruct the path by following the previous-node map from destination to start.

**Output**: An ordered array of node IDs representing the shortest path, the total distance in metres, and total walk time in seconds.

**Complexity**: O(V²) where V is the number of PathNodes. For the campus graph (~35 nodes), execution time is negligible.

##### 3.3.3.2 Haversine Distance Formula

For direct distance calculation between two geographic points (used as fallback when PathNodes are unavailable), the system implements the Haversine formula:

```
a = sin²(Δlat/2) + cos(lat₁) × cos(lat₂) × sin²(Δlng/2)
c = 2 × atan2(√a, √(1-a))
d = R × c
```

Where R = 6,371,000 metres (Earth's radius), and lat/lng values are in radians.

Walking time is estimated at 1.4 m/s average walking speed.

##### 3.3.3.3 Voice Navigation Proximity Detection

The voice navigation system uses the Haversine formula to continuously compute the distance between the user's current GPS position and each upcoming step's start coordinates. A step announcement is triggered when:

- The user is within 30 metres of a step's start point (trigger distance).
- The step has not already been spoken (tracked via a Set data structure).

Arrival is detected when the user is within 20 metres of the final step's end point.

##### 3.3.3.4 Client-Side Search Algorithm

The search functionality implements client-side filtering on the in-memory building dataset:

1. The user's query string is converted to lowercase.
2. Each building is evaluated against the query, checking for substring matches in: building name and department names.
3. Buildings are additionally filtered by active type filters (Buildings, Services, Events, Hostels).
4. The filtered array is rendered in the sidebar with type icons, names, and summary information.

### 3.3.4 Component Architecture

The frontend follows a component-based architecture with the following hierarchy:

```
RootLayout (app/layout.tsx)
├── ThemeProvider (next-themes)
├── AuthProvider (next-auth/react)
│
├── Navigator (Main Page)
│   ├── TopNav (tabs: Map, Buildings, Events, Saved + ThemeToggle + UserMenu)
│   ├── Sidebar
│   │   ├── Search Input
│   │   ├── Filter Buttons
│   │   ├── Building List (map/buildings tabs)
│   │   ├── Event List with Category Filters (events tab)
│   │   └── Saved Locations List (saved tab)
│   ├── GoogleMapView
│   │   ├── Building Markers
│   │   ├── InfoWindow
│   │   └── DirectionsRenderer
│   ├── GoogleDirectionsPanel
│   │   ├── Travel Mode Selector (Walk/Drive/Transit)
│   │   ├── From/To Inputs
│   │   ├── Accessibility Toggle
│   │   ├── Voice Navigation Controls
│   │   └── Step-by-Step Directions
│   └── BuildingDetailDrawer
│
├── Admin Layout (/admin)
│   ├── AdminSidebar
│   ├── Dashboard (stats)
│   ├── Buildings Management (CRUD + ImageUpload)
│   ├── Events Management (CRUD + ImageUpload)
│   └── Users Management (roles, status)
│
└── Login Page (Google OAuth + Credentials)
```

### 3.4 METHODOLOGICAL FRAMEWORK

#### 3.4.1 System Development Lifecycle

The system was developed using an iterative, incremental methodology based on Agile software development principles. This approach was selected because it accommodates evolving requirements, enables continuous testing, and delivers functional software at regular intervals. The development lifecycle comprises five phases:

**Phase 1: Requirements Engineering and Planning (Weeks 1–3)**

i. Conducted analysis of navigation challenges faced by first-year students and visitors at Covenant University.

ii. Reviewed existing campus maps, signage systems, and previous navigation projects, including general-purpose tools such as Google Maps that lack building-level campus detail.

iii. Documented functional and non-functional requirements as specified in Section 3.2.

iv. Identified the technology stack based on requirements for server-side rendering, real-time data, and cross-platform accessibility.

v. Deliverable: Requirements Specification Document.

**Phase 2: Architecture Design and Prototyping (Weeks 4–6)**

i. Designed the system architecture showing three-tier component relationships and data flows.

ii. Designed the MongoDB database schema with five collections and their relationships.

iii. Defined API contracts for all RESTful endpoints.

iv. Created the campus PathNode graph representing building entrances, walkway intersections, and waypoints with edge weights.

v. Deliverable: System Design Document, Database Schema, API Specification, and PathNode Graph.

**Phase 3: Core Implementation (Weeks 7–12)**

i. Initialised the Next.js 16 project with TypeScript, Tailwind CSS 4, and ESLint configuration.

ii. Implemented Mongoose schemas for Buildings, Users, Events, PathNodes, and SavedLocations.

iii. Built API routes for all CRUD operations with Zod input validation and NextAuth.js session protection.

iv. Developed the main navigator interface with Google Maps integration, building markers, and search/filter functionality.

v. Implemented the directions system with multi-modal routing (walking, driving, transit).

vi. Developed Dijkstra's pathfinding algorithm for campus-specific navigation with accessibility support.

vii. Implemented voice-guided navigation using the Web Speech API with GPS-triggered step announcements.

viii. Built the admin dashboard with building, event, and user management.

ix. Implemented image upload with drag-and-drop, client-side file validation, and AWS S3 storage via presigned URLs.

x. Added dark mode support with next-themes and Tailwind CSS dark variants.

xi. Deliverable: Working application with core functionality.

**Phase 4: Integration and Testing (Weeks 13–15)**

i. Integrated all components into a cohesive application.

ii. Resolved ESLint errors and TypeScript type issues across all modules.

iii. Tested all user workflows: building search, directions, voice navigation, event management, saved locations, and admin operations.

iv. Conducted responsive design testing across desktop, tablet, and mobile viewports.

v. Validated building coordinate data against physical campus verification.

vi. Deliverable: Fully tested system.

**Phase 5: Deployment and Documentation (Week 16)**

i. Configured production build optimisation with Next.js.

ii. Prepared database seeding script for initial deployment.

iii. Wrote comprehensive project README with setup instructions, environment variables, and project structure documentation.

iv. Deliverable: Production-ready system and documentation.

#### 3.4.2 Data Collection Methodology

##### 3.4.2.1 GPS Coordinate Collection

The geographic coordinates of all 21 campus buildings were collected using a systematic approach:

i. Building coordinates (latitude and longitude in WGS84 format) were recorded at each building's main entrance or centroid.

ii. Coordinates were verified against Google Maps satellite imagery for accuracy.

iii. Each building was assigned a map position (x, y) as a percentage of the campus extent for the custom navigation overlay.

iv. The campus centre was established at coordinates (6.6735°N, 3.158°E).

##### 3.4.2.2 PathNode Graph Construction

The campus walking path network was modelled as a weighted graph:

i. Building entrance nodes were created for all 21 buildings, positioned at their geographic coordinates.

ii. Intersection nodes were placed at major walkway junctions across campus (12 intersections).

iii. Waypoint nodes were added along extended walkways for route accuracy (2 waypoints).

iv. Edges between nodes were assigned distance weights (in metres), walk time weights (at 1.4 m/s), and accessibility flags indicating wheelchair traversability.

v. Non-accessible edges were identified for hostel areas where buildings lack wheelchair access infrastructure.

##### 3.4.2.3 Building Attribute Data

For each building, the following attributes were collected and stored:

- Official name and common abbreviations
- Building type classification (academic, hostel, service, event)
- Department listings
- Operating hours
- Description of facilities
- Available amenities
- Floor count
- Wheelchair accessibility status

#### 3.4.3 Technology Selection Justification

##### 3.4.3.1 Frontend Framework: Next.js 16 with React 19

Next.js was selected over plain React.js for the following reasons:

i. **Server-Side Rendering**: Next.js App Router provides SSR and static generation, improving initial load performance and SEO compared to client-side-only React applications.

ii. **Unified API Layer**: Next.js API routes eliminate the need for a separate backend server, simplifying deployment and reducing operational complexity.

iii. **File-Based Routing**: The App Router's file-based routing convention reduces boilerplate and provides intuitive URL-to-component mapping.

iv. **Built-In Optimisations**: Automatic code splitting, image optimisation via `next/image`, and font optimisation via `next/font` improve performance without manual configuration.

v. **TypeScript Integration**: First-class TypeScript support ensures type safety across both frontend components and API routes.

##### 3.4.3.2 Database: MongoDB Atlas with Mongoose ODM

MongoDB was selected over Firebase Realtime Database for the following reasons:

i. **Document Flexibility**: MongoDB's document model naturally represents building records with varying attributes (different building types have different amenities and departments).

ii. **Full-Text Search**: MongoDB's built-in text indexes support efficient search across building names, descriptions, and departments without requiring external search services.

iii. **Relational References**: Mongoose's `populate()` method supports document relationships (events referencing buildings, saved locations referencing users and buildings) while maintaining the flexibility of a document database.

iv. **Aggregation Pipeline**: MongoDB's aggregation framework supports complex queries for dashboard statistics and filtered event listings.

v. **Mongoose ODM**: Provides schema validation, middleware (pre-save hooks for password hashing), and TypeScript interface integration.

##### 3.4.3.3 Authentication: NextAuth.js

NextAuth.js was selected for authentication because:

i. **Multiple Providers**: Supports Google OAuth for regular users and credential-based authentication for administrators within a single unified configuration.

ii. **JWT Sessions**: Stateless JWT-based sessions eliminate the need for server-side session storage.

iii. **Role-Based Access**: Custom session callbacks enable embedding user roles in JWT tokens for authorisation checks in API routes.

iv. **Next.js Integration**: Designed specifically for Next.js, providing seamless integration with both server and client components.

##### 3.4.3.4 Mapping: Google Maps JavaScript API

Google Maps JavaScript API was selected for the following reasons:

i. **Comprehensive Directions API**: Supports walking, driving, and transit routing with turn-by-turn instructions, eliminating the need for custom routing infrastructure.

ii. **Places Autocomplete**: Enables users to search for starting locations beyond the campus, particularly useful for visitors navigating to campus from external locations.

iii. **High-Quality Satellite Imagery**: Provides detailed and current satellite imagery of the Covenant University campus area.

iv. **React Integration**: The `@react-google-maps/api` library provides React components (GoogleMap, Marker, DirectionsRenderer, Autocomplete) that integrate naturally with the component architecture.

##### 3.4.3.5 UI Framework: Tailwind CSS 4 with Radix UI

i. **Tailwind CSS 4**: Utility-first CSS framework enabling rapid UI development with built-in dark mode support via the `dark:` variant and responsive design via breakpoint prefixes.

ii. **Radix UI**: Provides accessible, unstyled UI primitives (Dialog, Select, DropdownMenu, AlertDialog, Switch) that ensure WCAG compliance while allowing custom styling.

iii. **shadcn/ui**: Pre-built component library combining Radix UI primitives with Tailwind CSS styling, providing consistent and accessible form elements, tables, cards, and navigation components.

##### 3.4.3.6 Voice Navigation: Web Speech API

The browser-native Web Speech API was selected for voice navigation because:

i. **Zero Dependencies**: No external libraries or services required; works entirely in the browser.

ii. **Offline Capable**: Speech synthesis functions without network connectivity after the initial page load.

iii. **Cross-Browser Support**: Supported in all modern browsers (Chrome, Firefox, Safari, Edge).

iv. **Configurable**: Allows control over speech rate, pitch, volume, and language.

##### 3.4.3.7 Image Storage: AWS S3

AWS S3 was selected for image storage for the following reasons:

i. **Scalable Cloud Storage**: S3 provides virtually unlimited, highly durable object storage that scales automatically with usage, eliminating the need to manage local disk space on the application server.

ii. **CDN Compatibility**: S3 integrates seamlessly with content delivery networks, enabling fast global access to uploaded images with low latency.

iii. **Presigned URLs for Secure Direct Uploads**: Presigned URLs enable clients to upload files directly to S3 without routing file data through the application server, reducing server load and improving upload performance.

iv. **Cost-Effective for Static Assets**: S3's pay-per-use pricing model is cost-effective for storing static assets such as building and event images, with no upfront infrastructure costs.

The upload flow operates as follows: the client requests a presigned URL from the server (`POST /api/upload`), the server generates a time-limited presigned URL using the AWS SDK, and the client uploads the file directly to S3 using that URL. The server returns both the presigned URL (for upload) and the final file URL (for storage in the database). Files are validated on the client side for type (JPEG, PNG, WebP, GIF) and size (maximum 5MB) before upload.

The following environment variables are required for S3 integration:
- `AWS_ACCESS_KEY_ID` — AWS IAM access key
- `AWS_SECRET_ACCESS_KEY` — AWS IAM secret key
- `AWS_S3_BUCKET` — S3 bucket name for storing uploaded files
- `AWS_S3_REGION` — AWS region where the S3 bucket is hosted

##### 3.4.3.8 Development Tools

i. **TypeScript**: Provides static type checking across the entire codebase, catching errors at compile time rather than runtime.

ii. **ESLint**: Enforces code quality rules including React hooks rules, import ordering, and unused variable detection.

iii. **Prettier**: Ensures consistent code formatting across all files with a shared configuration.

iv. **Zod**: Schema-based validation library used for validating all API request bodies, providing type-safe validation with descriptive error messages.

v. **Git**: Version control for tracking changes and enabling collaborative development.

vi. **Yarn**: Package manager selected for faster dependency resolution and deterministic installations via lockfile.

### 3.5 SUMMARY

This chapter has presented the comprehensive system analysis and design for the Campus Navigation and Location Guide System. The system employs a modern full-stack architecture built on Next.js 16, MongoDB, and the Google Maps JavaScript API, providing a robust, scalable, and maintainable platform for campus navigation.

Key design decisions include the implementation of Dijkstra's shortest path algorithm for campus-specific pathfinding with accessibility awareness, multi-modal routing through the Google Directions API, GPS-triggered voice-guided navigation using the Web Speech API, and a role-based administrative system for managing campus data.

The database schema supports five interconnected collections that model the campus's spatial, event, and user data. The API layer provides 18 RESTful endpoints secured by JWT-based authentication and Zod input validation. The frontend employs a component-based architecture with 30+ reusable UI components, responsive design, and dark mode support.

The methodological framework follows an Agile iterative approach with five development phases, ensuring continuous integration and testing throughout the development lifecycle. The technology selections were justified based on project requirements for performance, flexibility, and cross-platform accessibility.

This design provides the foundation for the implementation and testing discussed in Chapter Four.
