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

## Recent Changes

### Feedback System (Completed October 30, 2025)

Implemented a complete feedback system that enables continuous AI improvement:

**Database Schema:**
- Added `feedback` table with fields: `id`, `peulaId`, `componentIndex`, `comment`, `createdAt`
- Foreign key relationship with cascade delete to `peulot` table
- Component index (0-8) tracks which of the 9 peula components the feedback relates to

**Backend API:**
- `GET /api/peulot/:id/feedback` - Retrieve all feedback for a specific peula
- `POST /api/feedback` - Submit new feedback (with server-side validation for component index range)
- `DELETE /api/feedback/:id` - Delete feedback
- Storage interface extended with feedback CRUD methods in both MemStorage and DbStorage

**Frontend UI:**
- Each peula component has a feedback button (💬 icon) with badge showing comment count
- Expandable feedback section displays existing comments and allows adding new ones
- Feedback input uses controlled Textarea component with submit button
- Toast notifications confirm successful feedback submission
- Data fetching and mutations use TanStack Query with proper cache invalidation

**AI Integration:**
- `generatePeula()` fetches all feedback, groups by component, and includes last 5 comments per component in AI prompt
- `regenerateSection()` fetches component-specific feedback and uses it to improve regenerated content
- Prompt engineering instructs AI to learn from feedback and incorporate successful practices
- Feedback context clearly labeled in prompts to guide AI learning

**Quality Measures:**
- Server-side validation ensures componentIndex is in valid range (0-8)
- Feedback limited to 5 most recent comments per component to avoid prompt bloat
- Proper error handling and user-friendly error messages
- All interactive elements have data-testid attributes for testing

## Future Enhancement Roadmap

The following enhancements have been identified for future implementation to make the feedback system more sophisticated and effective:

### Phase 1: Structured Feedback & Rating System
- Replace free-text comments with structured feedback:
  - Multi-dimensional ratings (1-5): overall, clarity, safety, inclusion
  - Tag-based feedback with predefined chips: `too_long`, `missing_safety`, `weak_debrief`, `low_energy`, `unclear_roles`, `great_flow`, `scout_identity+`
  - Suggested fixes field for concrete improvement recommendations
  - Track implicit signals: section edits, time overruns, regeneration triggers

### Phase 2: Online Learning with EMA Scoring
- Implement exponential moving average (EMA) scoring for continuous learning:
  - Maintain `method_stats` per (methodKey, topicKey, ageBand)
  - Convert feedback to normalized reward ∈ [0,1] with tag-based penalties/bonuses
  - Update scores online: `ema_score = (1-α)*ema_score + α*reward` (α=0.3)
  - Track average duration and usage count per method

### Phase 3: Thompson Sampling for Method Selection
- Use Thompson Sampling bandit algorithm for exploration/exploitation:
  - Maintain Beta distribution parameters (α, β) per method
  - Sample scores and rank candidates while respecting hard constraints
  - Balance exploration of new methods with exploitation of proven ones
  - Small computational overhead, no model retraining required

### Phase 4: Tag-Driven Automatic Fixes
- Create deterministic tag→action mappings:
  - `missing_safety` → prepend "Safety Hunt 60ש׳", enforce safety line in gear notes
  - `too_long` → reduce word cap from 120→90, require rule cards
  - `weak_debrief` → enforce 2 questions after games/challenges
  - `low_energy` → insert 90-ש׳ energizer if 12-min gap without movement
  - `unclear_roles` → force explicit role assignments in content

### Phase 5: Post-Processing Quality Gate
- Implement deterministic post-processor to ensure quality standards:
  1. Retiming to match duration (never cut Reflection)
  2. Safety injection for physical keywords (חבל/מסלול/כדורים/ריצה)
  3. Movement gap detection and energizer insertion
  4. Automatic Shigra + Maslul append if missing
  5. Content linting: enforce word limits, concise gear lists

### Phase 6: Dynamic Form Validation
- Real-time validation with inline feedback:
  - Hard rules (block generation): Reflection ≥20%, Movement cadence ≤12min, Shigra+Maslul present, Safety lines for physical activities
  - Soft rules (warn): ≤120 words per section, debrief prompts after games, role assignments
  - Live checklist with pass/fail indicators
  - One-click fixes: "Add Shigra (3') + Maslul (2')", "Insert Safety Hunt 60-ש׳"

### Phase 7: Team-Level Personalization
- Per-shevet/team profile system:
  - Customizable constraints: `reflection_min_pct` (0.20-0.30), `no_running` flag
  - Preferred methods: `['stations', 'roleplay']`
  - Language preference: Hebrew/English/mixed
  - Apply as rule overrides and bandit priors

### Phase 8: Robustness & Noise Filtering
- Prevent noisy feedback from degrading quality:
  - Time-weighted feedback: recent comments weighted higher
  - Wilson lower bound for display ranking
  - Outlier detection: drop top/bottom 1% for duration calculations
  - Minimum feedback threshold (n≥5) before method dominates

### Phase 9: Metrics & Evaluation Dashboard
- Track continuous improvement with weekly metrics:
  - Edit rate (% sections edited before running - should decrease)
  - Regeneration rate (% sections regenerated - should decrease)
  - Safety violation rate (should approach zero)
  - Reflection coverage (median % - target ≥20%)
  - User satisfaction: "I led at least once" (≥80%), "Process was clear" (≥80%)

### Phase 10: Performance Optimizations
- Micro-caching: reuse outputs for identical inputs within 24h (if no new feedback)
- Single LLM call per peula (two only if hard validation fails)
- Efficient feedback retrieval with database indexing
- Lazy loading of feedback in UI

**Implementation Priority:** These enhancements should be implemented incrementally, validating each phase with real user feedback before proceeding to the next. The current system provides a solid foundation for all future enhancements.