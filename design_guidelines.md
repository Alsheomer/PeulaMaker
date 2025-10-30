# Peula Maker - Design Guidelines

## Design Approach

**Design System Foundation:** Material Design principles adapted for educational productivity, with inspiration from Notion's content organization and Linear's clean efficiency. This approach prioritizes clarity, structure, and task completion over visual flair—essential for a tool used by scout leaders planning educational activities.

**Core Principle:** Create a calm, focused environment where madrichim can efficiently plan peulot through guided AI assistance, review structured outputs, and manage their activity library.

---

## Typography System

**Font Family:** 
- Primary: Inter or Roboto (via Google Fonts CDN)
- Monospace: JetBrains Mono for table data and structured content

**Hierarchy:**
- Page Titles: 2xl font-size, semibold (600) weight
- Section Headers: xl font-size, semibold (600) weight
- Component Titles: lg font-size, medium (500) weight
- Body Text: base font-size, regular (400) weight
- Table Headers: sm font-size, medium (500) weight, uppercase tracking
- Table Content: sm font-size, regular (400) weight
- Helper Text/Labels: xs font-size, regular (400) weight

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, and 8** consistently throughout
- Component padding: p-6
- Section margins: mb-8
- Card spacing: p-4 to p-6
- Input field padding: p-3
- Button padding: px-6 py-3
- Grid gaps: gap-6

**Container Strategy:**
- Main content: max-w-6xl mx-auto
- Questionnaire forms: max-w-3xl mx-auto
- Table displays: max-w-7xl mx-auto for wider data
- Sidebar (library view): w-64 fixed

---

## Information Architecture & Layout

### 1. Main Navigation Structure
**Top Navigation Bar:**
- Fixed header with logo/title "Peula Maker"
- Primary navigation: "Create New Peula" | "My Peulot" | "Export"
- Height: h-16
- Padding: px-6

### 2. Create Peula Flow (Multi-Step Questionnaire)
**Layout Pattern:**
- Centered single-column form: max-w-3xl
- Progress indicator at top showing: Question X of Y
- Each question card: p-6, mb-6, rounded corners
- Question text: lg font-size, mb-4
- Input fields: Full width with proper spacing (mb-4)
- Navigation buttons at bottom: "Back" (left) | "Next" (right)

**Question Types to Support:**
- Text inputs (topic, goals)
- Dropdowns (age groups, duration)
- Multi-select checkboxes (available materials)
- Textarea (special considerations)

### 3. Generated Peula Display
**Table Layout (matches Google Docs format):**
- Three-column table structure:
  - Column 1: "Peula Component" (30% width)
  - Column 2: "Description & Guidelines" (40% width)
  - Column 3: "Tzofim Best Practices & Tips" (30% width)
- Table header: Bold, slightly elevated background treatment
- Row padding: p-4
- Borders: Clean lines between rows and columns
- Responsive: Stack to single column on mobile

**Above Table:**
- Peula title and metadata (age group, duration, topic): mb-8
- Action buttons: "Export to Google Docs" | "Save to Library" | "Edit"

### 4. Library/Management View
**Layout:**
- Two-column layout (desktop): Sidebar (w-64) + Main content area
- Sidebar: List of saved peulot with search/filter
- Main area: Grid of peula cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6)

**Peula Card Design:**
- Compact card: p-4
- Title: font-medium, mb-2
- Metadata: Age group, duration (text-sm)
- Quick actions: View | Edit | Export | Delete icons
- Hover state: Subtle elevation increase

---

## Component Library

### Forms & Inputs
**Text Input Fields:**
- Border treatment with focus state
- Label above input (text-sm, mb-2)
- Placeholder text for guidance
- Height: h-12 for standard inputs
- Rounded corners: rounded-md

**Textarea:**
- Minimum height: h-32
- Resizable vertically
- Same styling as text inputs

**Select/Dropdown:**
- Matches text input styling
- Custom arrow indicator
- Options with proper padding: p-2

**Radio Buttons & Checkboxes:**
- Larger hit areas: p-3
- Clear labels with proper spacing

### Buttons
**Primary Button (CTAs like "Generate Peula", "Export"):**
- Solid background, rounded-md
- Padding: px-6 py-3
- Font: medium (500) weight
- Hover/active states with subtle elevation

**Secondary Button (Back, Cancel):**
- Outlined style or subtle background
- Same size/padding as primary
- Lower visual weight

**Icon Buttons (Actions in library):**
- Square: w-10 h-10
- Centered icon
- Rounded-md

### Cards
**Standard Card Container:**
- Padding: p-6
- Rounded corners: rounded-lg
- Subtle border or shadow treatment
- Margin bottom: mb-6

**Table Card (for generated peula):**
- Contains the full structured table
- Minimal padding around table: p-2
- Table itself has internal padding

### Progress Indicator
**Step Progress (Questionnaire):**
- Horizontal progress bar or step indicators
- Shows current step highlighted
- Total steps visible
- Height: h-2 for bar, or circular steps

### Loading States
**AI Generation Loading:**
- Centered spinner or skeleton screen
- Loading message: "Generating your peula based on Tzofim best practices..."
- Overlay or dedicated loading view

---

## Specific Page Layouts

### Home/Landing (Create New Peula Start)
**Hero Section (80vh):**
- Centered content: max-w-4xl
- Main heading: "Create Expert-Level Peulot in Minutes"
- Subheading explaining AI-powered planning
- Large CTA button: "Start Planning a Peula"
- Supporting text about Tzofim methodology
- Background: Large hero image of scouts in activity/planning session

### Questionnaire Pages
**Consistent Pattern for Each Question:**
- Progress indicator: Sticky top
- Question container: Centered card (max-w-3xl)
- Large question text: text-xl, mb-6
- Helper text if needed: text-sm, mb-4
- Input area: Full width
- Button row: Flex justify-between, mt-8

### Generated Peula View
**Full-Width Table Display:**
- Page header with title and metadata: mb-8
- Action buttons row: mb-6
- Full table display: max-w-7xl
- Table scrolls horizontally on mobile if needed

### Library View
**Desktop Layout:**
- Sidebar navigation (left): Fixed w-64
  - Search input at top
  - Filter options
  - List of saved peulot
- Main content area: Grid of cards
  - Empty state if no peulot: Centered message with CTA

**Mobile Layout:**
- Hamburger menu reveals sidebar
- Cards stack in single column

---

## Data Display Patterns

### Tables
**Structured Content Table:**
- Clear headers with visual separation
- Alternating row treatment optional for readability
- Cell padding: p-4
- Text alignment: Left for text, center for short labels
- Wrap text appropriately, no truncation of important content

### Lists
**Peula Library List (Sidebar):**
- Each item: p-3
- Title: font-medium
- Subtitle metadata: text-xs
- Hover: Highlight background
- Active/selected: Distinct visual treatment

---

## Responsive Breakpoints

**Mobile (base to md):**
- Single column layouts
- Sidebar becomes drawer/modal
- Tables may scroll horizontally or stack
- Larger touch targets: minimum 44x44px

**Tablet (md to lg):**
- Two-column grids where appropriate
- Table remains tabular
- Sidebar can be collapsible

**Desktop (lg and above):**
- Three-column grids in library
- Full table display
- Sidebar always visible
- Optimal reading widths maintained

---

## Interaction Patterns

**Questionnaire Navigation:**
- Linear flow: Users move through questions sequentially
- Back button always available
- Validation before proceeding to next question
- Save draft option at any step

**AI Generation Trigger:**
- Final "Generate Peula" button after last question
- Loading state with progress indication
- Success state reveals generated peula

**Export Flow:**
- Single-click export to Google Docs
- Loading indicator during export
- Success confirmation message
- Option to open exported document

**Peula Management:**
- Quick actions on hover for cards
- Confirmation dialogs for destructive actions (Delete)
- Inline editing for peula titles/metadata

---

## Images

**Hero Section Image:**
- Large, high-quality image of Israeli scouts in an engaging activity or planning session
- Should convey teamwork, learning, and leadership
- Placement: Full-width hero section (80vh) on homepage
- Image should be slightly dimmed if text overlays it for readability

**Optional Section Images:**
- Feature showcase: Small icons or illustrations for key features (AI-powered, Export, Save)
- Placeholder for empty states in library view

---

This design creates a professional, efficient tool that respects madrichim's time while providing powerful AI assistance grounded in Tzofim methodology. The structured, calm interface enables focus on creating meaningful educational experiences for chanichim.