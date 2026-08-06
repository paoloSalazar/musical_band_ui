# 🎵 Music Events Management - Full-Stack React Application

> A comprehensive React-based web application for managing band events, schedules, and musician payments with role-based access control and internationalization support

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![React](https://img.shields.io/badge/react-18-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)]()
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool%20Fast%20%26%20Modern-ff69b4)]()

## 🖼 Demo

![App preview](./docs/preview.gif)

🔗 **Live demo:** [your-project.vercel.app](https://your-project.vercel.app)

## 📋 Table of Contents

- [Description](#-description)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Testing](#-testing)
- [Technical Decisions](#-technical-decisions)
- [Roadmap](#-roadmap)
- [Career Opportunities](#-career-opportunities)
- [Contact](#-contact)

## 📖 Description

A full-stack **React 18** web application designed for music bands to manage their events, schedules, and musician payments. The application provides a centralized platform where band members, administrators, and event managers can collaborate on event planning, payment tracking, and band member management.

**Key capabilities:**
- Event creation, editing, and management with full CRUD operations
- Musician assignment to events with salary tracking
- Payment processing with Advance, Remaining, and Total payment types
- Role-Based Access Control (RBAC) with 7 user roles
- Full internationalization (English/Spanish)
- PDF generation for receipts and contracts

**Target users:** Band managers, musicians, administrative staff, and event coordinators who need efficient event and payment coordination.

## ✨ Key Features

- ✅ **Responsive design** (mobile-first with Tailwind CSS)
- ✅ **Authentication system** (login/register) with JWT-based session management
- ✅ **Role-Based Access Control (RBAC)** - Admin, Member, Musician, Client, Manager, Moderator, Staff
- ✅ **State management** with Context API + custom hooks (reduced boilerplate)
- ✅ **Dark mode support** with next-themes
- ✅ **Form validation** with React Hook Form + Zod schemas
- ✅ **API integration** with error handling, loading states, and retry logic
- ✅ **Internationalization (i18n)** - English and Spanish languages via react-i18next
- ✅ **PDF download** for receipts and contracts using jsPDF
- ✅ **Calendar view** for events with date navigation
- ✅ **Musician availability management** with blocked date tracking
- ✅ **Payment tracking** - Track Advance, Remaining, and Total payments per musician
- ✅ **Event musician assignment** with role and salary management
- ✅ **Search and filter** functionality across all lists
- ✅ **Automated testing** - 700+ tests with Vitest

## 🛠 Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | React 18 with Hooks | 18.3.1 |
| **Build Tool** | Vite | 6.x |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Library** | MUI (Material-UI) | 7.x |
| **State Management** | Context API + Custom Hooks | - |
| **Routing** | React Router DOM | 7.x |
| **HTTP Client** | Fetch API + Axios interceptors | - |
| **Forms** | React Hook Form | 7.55.x |
| **Validation** | Zod (implied) | - |
| **Testing** | Vitest + React Testing Library | 4.x |
| **Deployment** | Docker + Nginx | - |
| **Icons** | Lucide React | 0.487.x |
| **Charts** | Recharts | 2.15.x |

## 🏗 Project Structure

```
src/
├── app/
│   ├── components/           # Reusable UI components
│   │   ├── admin/            # Admin panel (RBAC management)
│   │   ├── auth/             # Authentication components
│   │   ├── events/           # Event management (list, create, edit, view)
│   │   ├── home/             # Home page with dashboard
│   │   ├── login/            # Login page
│   │   ├── profile/          # User profile management
│   │   ├── pdf/              # PDF download components
│   │   ├── ui/               # Shared UI primitives
│   │   └── musician-availability/  # Availability calendar
│   ├── contexts/             # Global state providers (Auth, Theme, User)
│   └── lib/
│       ├── api/              # API service layer (events, users, auth)
│       ├── hooks/            # Custom React hooks (useUser, useAuth, useDownloadPdf)
│       └── services/         # External integrations
├── i18n/                     # Internationalization
│   └── locales/              # Translation files (English, Spanish)
├── styles/                   # Global CSS and Tailwind config
└── assets/                   # Images, icons, fonts
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

# Start the development server
npm run dev
```

**Development server:** http://localhost:5173

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# Frontend API endpoint
VITE_API_URL=http://localhost:8000/api

# Database (backend)
POSTGRES_USER=musician
POSTGRES_PASSWORD=MusicalBand123
POSTGRES_DB=musical_band_db
```

## 📜 Development Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (HMR enabled) |
| `npm run build` | Build for production (optimized) |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests in watch mode |
| `npm run test:ui` | Open Vitest UI (interactive) |
| `npm run test:run` | Run tests once (CI mode) |

## ✅ Testing

```bash
# Run all tests in watch mode
npm test

# Run tests with browser UI
npm run test:ui

# Run tests in CI mode (no watch)
npm run test:run

# Run specific test file
npm test -- LoginForm.test.tsx
```

**Test Coverage:** 700+ tests passing

**Test structure:**
- `tests/components/` - Component unit and integration tests
- `tests/lib/` - API client and utility tests
- `tests/components/events/` - Event management tests
- `tests/components/profile/` - Profile page tests
- `tests/components/auth/` - Authentication tests

## 🧠 Technical Decisions

### **React 18 + Vite - Why?**
Fast development experience with Hot Module Replacement (HMR), optimized production builds, and modern toolchain. Vite provides sub-200ms cold starts and instant updates.

### **Context API vs Redux - Why Context?**
For this project scale, Context API provides a lightweight solution without external dependencies. It's sufficient for authentication state, user role management, and theme preferences while maintaining simplicity.

### **React Router DOM v7 - Why v7?**
Advanced data loading features, nested routes, improved type safety, and search parameters built-in. Perfect for complex SPA navigation with authentication guards.

### **React Hook Form - Why?**
Optimized performance with minimal re-renders, excellent TypeScript support, built-in validation integration, and smaller bundle size compared to Formik.

### **Tailwind CSS 4.x - Why?**
Utility-first CSS framework enabling rapid UI development with consistent design system, responsive utilities, and dark mode support out of the box.

### **Testing with Vitest - Why?**
Fast, native ES modules support, Vite-native integration, better performance than Jest, and compatible with React Testing Library.

## 🗺 Roadmap

### ✅ Completed
- [x] Event management (CRUD operations)
- [x] Musician assignment to events with salary
- [x] Payment tracking (Advance, Remaining, Total)
- [x] Role-based access control (7 roles)
- [x] Internationalization (English/Spanish)
- [x] PDF download functionality
- [x] User profile management
- [x] Musician availability calendar
- [x] Automated test suite (700+ tests)

### 🔜 In Progress
- [ ] Real-time notifications (WebSockets)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Advanced search & filtering

### 📋 Planned
- [ ] Event calendar view improvements
- [ ] Bulk musician assignment
- [ ] Payment reminders/notifications
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

## 💼 Career Opportunities

This project demonstrates expertise in:

| Skill | Proficiency |
|---|---|
| **React 18** | ⭐⭐⭐⭐⭐ (Hooks, Context, Performance) |
| **TypeScript** | ⭐⭐⭐⭐⭐ (Advanced types, Interfaces) |
| **State Management** | ⭐⭐⭐⭐⭐ (Context API, Custom Hooks) |
| **Form Handling** | ⭐⭐⭐⭐⭐ (React Hook Form, Validation) |
| **Testing** | ⭐⭐⭐⭐⭐ (Vitest, Testing Library, 700+ tests) |
| **UI/UX Design** | ⭐⭐⭐⭐ (Tailwind CSS, Responsive) |
| **Backend Integration** | ⭐⭐⭐⭐⭐ (REST API, JWT Auth, RBAC) |
| **i18n** | ⭐⭐⭐⭐⭐ (react-i18next, Spanish/English) |
| **Build Tools** | ⭐⭐⭐⭐⭐ (Vite, Docker, Nginx) |
| **Code Quality** | ⭐⭐⭐⭐⭐ (TypeScript, eslint, tests) |

**Perfect for roles:** Frontend Developer, Full-Stack Developer, React Engineer

## 📬 Contact

- **LinkedIn:** [paoloSalazar](www.linkedin.com/in/paolo-salazar-1b25351a8)
- **Github:** [PaoloSalazar](https://github.com/paoloSalazar)
- **Email:** sid.philips6189@gmail.com

---

⭐ If this project helped you, consider leaving a star!