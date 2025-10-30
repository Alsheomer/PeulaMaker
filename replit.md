# Peula Maker - AI-Powered Activity Planning for Tzofim

## Overview

Peula Maker is an AI-powered web application designed to help Israeli Scout (Tzofim) leaders (madrichim) create high-quality educational activities (peulot) efficiently. The application guides users through a structured questionnaire about their activity needs and leverages AI to generate comprehensive, methodology-driven activity plans. Generated peulot can be saved to a personal library and exported to Google Docs for easy distribution and editing.

**Core Value Proposition:** Transform the complex task of planning scout activities from hours to minutes by providing AI-generated, expert-level peulot based on elite Tzofim methodology and best practices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript as the primary UI framework
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (not React Router)
- File-based routing with pages in `client/src/pages/`

**UI Component Strategy:**
- Shadcn/ui component library (New York style variant) providing accessible, customizable components built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens defined in CSS variables
- Design system inspired by Material Design, Notion, and Linear with focus on calm, focused productivity
- Component composition pattern using Radix UI primitives for accessibility

**State Management:**
- TanStack Query (React Query) for server state management and data fetching
- React Hook Form with Zod for form state and validation
- Local component state with React hooks for UI-only state

**Key Design Decisions:**
- **Multi-step questionnaire flow:** The create-peula page uses a wizard pattern with 7 steps, progressively collecting information about the activity (topic, age group, duration, materials, etc.)
- **Typography system:** Uses Inter/Roboto for primary text and JetBrains Mono for structured content, with a clear hierarchy (2xl for page titles down to xs for helper text)
- **Spacing primitives:** Consistent use of Tailwind units (2, 4, 6, 8) throughout the application
- **Responsive layout:** Mobile-first approach with breakpoint at 768px

### Backend Architecture

**Runtime & Framework:**
- Node.js with Express.js as the HTTP server
- TypeScript for type safety across the entire stack
- ESM (ES Modules) as the module system

**API Design:**
- RESTful API structure with routes defined in `server/routes.ts`
- JSON request/response format
- Centralized route registration pattern

**Key Endpoints:**
- `GET /api/peulot` - List all saved peulot
- `GET /api/peulot/:id` - Get single peula by ID
- `POST /api/peulot/generate` - Generate new peula using AI (validates input with Zod schema)
- `POST /api/peulot/:id/export` - Export peula to Google Docs
- `DELETE /api/peulot/:id` - Delete a peula

**Data Validation:**
- Zod schemas shared between frontend and backend (in `shared/schema.ts`)
- Runtime validation of API requests using `safeParse()`

### Data Storage

**Database:**
- PostgreSQL as the primary database (configured via DATABASE_URL environment variable)
- Neon serverless Postgres driver (`@neondatabase/serverless`)
- Drizzle ORM for type-safe database queries and schema management

**Schema Design:**
- `peulot` table stores generated activities with fields:
  - `id` (UUID primary key)
  - `title`, `topic`, `ageGroup`, `duration`, `groupSize`, `goals` (text fields)
  - `availableMaterials` (text array)
  - `specialConsiderations` (optional text)
  - `content` (JSONB field storing structured peula components)
  - `createdAt` (timestamp)

**Data Model:**
- Peula content stored as JSONB with 9 structured components, each containing description, best practices, and time structure
- Components: Topic & Goal, Know Your Audience, Methods & Activities, Structure/Flow, Time Management, Materials & Logistics, Risk & Safety, Delivery & Facilitation, Reflection & Debrief

**Storage Abstraction:**
- `IStorage` interface defining data access methods
- `MemStorage` in-memory implementation for development/testing
- Designed to be replaceable with database-backed storage without changing business logic

### External Dependencies

**AI Integration:**
- OpenAI API via Replit's AI Integrations service (no API key required)
- Uses environment variables: `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`
- Generates comprehensive peula plans based on questionnaire responses
- Structured prompt engineering to ensure output matches Tzofim methodology

**Google Docs Integration:**
- Google APIs Node.js client for document export functionality
- OAuth 2.0 authentication via Replit Connectors
- Environment variables: `REPLIT_CONNECTORS_HOSTNAME`, `REPL_IDENTITY`, `WEB_REPL_RENEWAL`
- Access token management with automatic refresh
- Creates formatted Google Docs with peula content for sharing and editing

**Third-Party UI Libraries:**
- Radix UI for accessible, unstyled component primitives
- Lucide React for icon components
- Embla Carousel for carousel functionality
- cmdk for command palette/search interface
- date-fns for date manipulation
- class-variance-authority and clsx for conditional styling

**Development Tools:**
- Replit-specific plugins for development (cartographer, dev banner, runtime error overlay)
- Drizzle Kit for database migrations and schema management

**Rationale for Key Architectural Choices:**

1. **Vite over Create React App:** Faster development experience, better build performance, native ESM support
2. **Drizzle ORM over Prisma:** Lightweight, type-safe with minimal overhead, better PostgreSQL feature support
3. **Wouter over React Router:** Smaller bundle size, simpler API, sufficient for this application's routing needs
4. **TanStack Query for data fetching:** Automatic caching, background refetching, optimistic updates, and loading/error state management
5. **Shadcn/ui component approach:** Copy-paste components into codebase for full control and customization vs. NPM package dependency
6. **JSONB for peula content:** Flexible schema for structured activity components while maintaining queryability
7. **Replit AI Integrations:** Simplified AI integration without managing API keys directly