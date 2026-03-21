# Campus Navigator - Covenant University

A full-stack campus navigation app built with Next.js for Covenant University. Features interactive Google Maps, real-time directions with voice navigation, building management, events, and saved locations.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: NextAuth.js (Google OAuth + Credentials)
- **Maps**: Google Maps JavaScript API
- **UI**: Tailwind CSS 4, Radix UI, shadcn/ui
- **Voice**: Web Speech API

## Features

- Interactive campus map with color-coded building markers
- Multi-mode directions (Walking, Driving, Transit)
- Voice-guided turn-by-turn navigation (GPS-triggered)
- Building search, filtering, and detail views
- Event management with category filtering
- Save/bookmark favorite locations
- Admin dashboard (buildings CRUD, events CRUD, user management)
- Dark mode support
- Image upload for buildings and events
- Accessibility-aware routing
- Responsive design (mobile + desktop)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Cloud project with these APIs enabled:
  - Maps JavaScript API
  - Directions API
  - Places API

### Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

### Install & Run

```bash
yarn install
yarn dev
```

### Seed the Database

Send a POST request to seed buildings, events, path nodes, and an admin user:

```bash
curl -X POST http://localhost:3000/api/seed
```

Default admin credentials:
- Email: `admin@cu.edu.ng`
- Password: `Admin@123`

## Project Structure

```
app/
  (auth)/login     - Authentication page
  admin/           - Admin dashboard (protected)
  api/             - API routes
  page.tsx         - Main navigator page

components/
  admin/           - Admin forms (building, event)
  auth/            - Auth provider, user menu
  navigation/      - Directions panel
  shared/          - Shared utilities
  ui/              - Radix/shadcn components

hooks/             - Custom React hooks
models/            - Mongoose schemas & interfaces
data/seed/         - Seed data for buildings & path nodes
lib/               - Auth config, DB connection, validators
```

## Admin Roles

| Role | Permissions |
|------|-------------|
| `user` | View buildings, events, save locations |
| `admin` | + Manage buildings and events |
| `super_admin` | + Manage users, change roles |
