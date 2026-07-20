# 🎵 The Electric Dreams - Music Events Management

> A comprehensive web application for managing band events, schedules, and musician payments

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![React](https://img.shields.io/badge/react-18-blue)]()

## 🖼 Demo

![App preview](./docs/preview.gif)

🔗 **Live demo:** [your-project.vercel.app](https://your-project.vercel.app)

## 📋 Table of Contents

- [Description](#-description)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Tests](#-tests)
- [Technical Decisions](#-technical-decisions)
- [Roadmap](#-roadmap)
- [Contact](#-contact)

## 📖 Description

The Electric Dreams is a full-stack web application designed for music bands to manage their events, schedules, and musician payments. The app provides a centralized platform where band members, administrators, and event managers can collaborate on event planning, payment tracking, and band member management.

Key features include event creation and management, musician availability tracking, payment processing with advance/remaining/total payment types, and a comprehensive admin panel for user and role management with granular permissions.

Target users include band managers, musicians, and administrative staff who need to coordinate events and payments efficiently.

## ✨ Features

- ✅ Responsive design (mobile-first)
- ✅ Authentication (login/register) with role-based access
- ✅ State management with Context API + custom hooks
- ✅ Dark mode support
- ✅ Form validation with React Hook Form
- ✅ API integration with error handling and loading states
- ✅ Internationalization (i18n) - English and Spanish
- ✅ Role-Based Access Control (RBAC) for admin features
- ✅ PDF download for receipts and contracts
- ✅ Calendar view for events
- ✅ Musician availability management
- ✅ Payment tracking (Advance, Remaining, Total)
- ✅ Event musician assignment with salary tracking

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 with Vite |
| Language | TypeScript |
| Styling | Tailwind CSS 4.x |
| State management | Context API + Custom Hooks |
| Routing | React Router DOM v7 |
| HTTP client | Fetch API + Custom API client |
| Forms | React Hook Form |
| Testing | Vitest + React Testing Library |
| Deployment | Docker + Nginx |

## 🏗 Project Structure

```
src/
├── app/
│   ├── components/       # Reusable UI components
│   │   ├── admin/        # Admin panel components
│   │   ├── auth/         # Authentication components
│   │   ├── events/       # Event management components
│   │   ├── home/         # Home page components
│   │   ├── login/        # Login page components
│   │   ├── profile/      # Profile components
│   │   └── ui/           # Shared UI primitives
│   ├── contexts/         # Global state providers
│   └── lib/
│       ├── api/          # API service layer
│       ├── hooks/        # Custom React hooks
│       └── services/     # External integrations
├── i18n/                 # Internationalization
│   └── locales/          # Translation files (en.json, es.json)
├── styles/               # Global styles
└── assets/               # Images, icons, fonts
```

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/musical_band_ui.git
cd musical_band_ui

# Install dependencies
npm install

# Set up environment variables
cp build_containers/.env.example .env

# Start the dev server
npm run dev
```

The app will be running at `http://localhost:5173`

## 🔐 Environment Variables

Create a `.env` file in the root with the following variables:

```env
VITE_API_URL=http://localhost:8000/api
POSTGRES_USER=musician
POSTGRES_PASSWORD=MusicalBand123
POSTGRES_DB=musical_band_db
```

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the app in development mode |
| `npm run build` | Builds the app for production |
| `npm run test` | Runs the test suite in watch mode |
| `npm run test:ui` | Runs tests with Vitest UI |
| `npm run test:run` | Runs tests once (CI mode) |

## ✅ Tests

```bash
# Run all tests
npm test

# Run tests with UI (browser-based)
npm run test:ui

# Run tests once (CI mode)
npm run test:run
```

Current coverage: **700+ tests** passing

Test structure:
- `tests/components/` - Component tests
- `tests/lib/` - API and utility tests
- `tests/components/events/` - Event-related tests
- `tests/components/profile/` - Profile page tests

## 🧠 Technical Decisions

- **Why React + Vite?** Fast development experience with HMR, optimized builds, and a modern toolchain. Vite provides excellent performance for development and production builds.

- **Why Context API?** For this project size, Context API provides a lightweight solution without adding external dependencies like Redux. It's sufficient for authentication state, user role management, and theme preferences.

- **Why React Hook Form?** Optimized for performance with minimal re-renders, excellent TypeScript support, and built-in validation integration.

- **Why Tailwind CSS?** Utility-first CSS framework for rapid UI development with consistent design system and responsive utilities.

- **Why React Router DOM v7?** Modern routing with data loading, nested routes, and improved type safety for SPA navigation.

## 🗺 Roadmap

- [x] Event management (create, edit, delete, view)
- [x] Musician assignment to events with salary
- [x] Payment tracking (advance, remaining, total)
- [x] Role-based access control (admin, member, musician, client, manager)
- [x] Internationalization (English/Spanish)
- [x] PDF download functionality
- [ ] Event calendar view improvements
- [ ] Bulk musician assignment
- [ ] Payment reminders/notifications
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

## 📬 Contact

- LinkedIn: [your-profile](https://linkedin.com/in/your-profile)
- Portfolio: [your-site.com](https://your-site.com)
- Email: you@email.com

---

## 🐳 Docker

This project includes Docker configuration for containerized deployment:

```bash
# Build and run UI container
docker compose -f build_containers/docker-compose.yml up --build
```

The UI container serves the application on port 3000.

---

⭐ If this project helped you, consider leaving a star!