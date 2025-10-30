# Peula Maker - AI-Powered Activity Planning for Tzofim

## Overview

Peula Maker is an AI-powered web application designed to help Israeli Scout (Tzofim) leaders create high-quality educational activities (peulot) efficiently. The application guides users through a structured questionnaire and leverages AI to generate comprehensive, methodology-driven activity plans. Generated peulot can be saved to a personal library and exported to Google Docs for easy distribution and editing. Its core purpose is to transform the complex task of planning scout activities from hours to minutes by providing AI-generated, expert-level peulot based on elite Tzofim methodology and best practices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework:** React 18 with TypeScript, Vite for bundling.
- **Routing:** Wouter for client-side routing, file-based (`client/src/pages/`).
- **UI:** Shadcn/ui (New York style) built on Radix UI, Tailwind CSS for styling with custom design tokens. Design inspired by Material Design, Notion, and Linear.
- **State Management:** TanStack Query for server state, React Hook Form with Zod for form validation, React hooks for local UI state.
- **Key Design:** Multi-step questionnaire (7 steps), responsive typography (Inter/Roboto, JetBrains Mono), mobile-first responsive layout.

### Backend

- **Runtime:** Node.js with Express.js, TypeScript, ESM.
- **API:** RESTful API with JSON format. Key endpoints include `GET /api/peulot`, `POST /api/peulot/generate`, `POST /api/peulot/:id/export`, `DELETE /api/peulot/:id`.
- **Validation:** Zod schemas shared between frontend and backend for runtime validation.

### Data Storage

- **Database:** PostgreSQL (Neon serverless driver) with Drizzle ORM for type-safe queries.
- **Schema:** `peulot` table stores activities, including structured `content` as JSONB.
- **Data Model:** Peula content is stored as JSONB with 9 structured components (e.g., Topic & Goal, Methods & Activities, Risk & Safety).
- **Abstraction:** `IStorage` interface allows for replaceable storage implementations (e.g., in-memory for testing).

### System Design Choices

- **Vite over Create React App:** For faster development and better performance.
- **Drizzle ORM over Prisma:** Lightweight, type-safe, and better PostgreSQL support.
- **Wouter over React Router:** Simpler API and smaller bundle size.
- **TanStack Query:** For advanced data fetching capabilities.
- **Shadcn/ui:** Components are copied into the codebase for full control and customization.
- **JSONB for peula content:** Provides flexible schema for structured components.

## External Dependencies

- **AI Integration:** OpenAI API via Replit's AI Integrations service for generating peula plans.
- **Google Docs Integration:** Google APIs Node.js client for document import/export, OAuth 2.0 via Replit Connectors. Used for creating formatted Google Docs and importing training examples.
- **Third-Party UI Libraries:** Radix UI (accessible primitives), Lucide React (icons), Embla Carousel, cmdk (command palette), date-fns, class-variance-authority, clsx.
- **Development Tools:** Drizzle Kit for database migrations, Replit-specific plugins.