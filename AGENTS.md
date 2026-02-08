# AGENTS.md

Guidelines for AI coding agents working on the Hospital Management System.

**IMPORTANT**: This is a DESKTOP APPLICATION (Electron), not a web app. Design for desktop use.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm electron         # Start server + Electron desktop app (PRIMARY)
pnpm dev              # Start both server and client (web preview)
pnpm dev:server       # Backend only (port 4000)
pnpm dev:client       # Frontend only (port 5173)

# Building
pnpm build            # Build both packages
pnpm build:server     # Build backend only
pnpm build:client     # Build frontend only
pnpm electron:build   # Build and package Electron app

# Linting (ALWAYS run after changes)
pnpm lint             # Lint all packages

# Database (from root)
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio

# Utilities
pnpm clean            # Remove node_modules and builds
```

## Testing Commands

```bash
# Run all tests
pnpm test

# No test framework currently configured - add tests using:
# - Client: Vitest (recommended) or Jest
# - Server: Jest with ts-jest
```

## Code Style Guidelines

### TypeScript Configuration

- **Server**: Strict mode enabled (`strict: true` in tsconfig.json)
- **Client**: Relaxed strictness for rapid development
  - `noImplicitAny: false`
  - `strictNullChecks: false`
  - Use `@ts-ignore` sparingly, prefer `@ts-expect-error` with reason

### Import Patterns

**Server (Node.js/CommonJS style):**
```typescript
// Internal modules - use relative paths
import { UserService } from '../user/user.service';
import { prisma } from '../../config/prisma';

// Types from global.d.ts
import { DatabaseUser } from '../../types/global';

// External packages
import express from 'express';
import bcrypt from 'bcryptjs';
```

**Client (React/Vite with path aliases):**
```typescript
// Use @/ alias for src directory
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';

// React imports
import React, { useState, useEffect } from 'react';

// Third-party
import { useQuery } from '@tanstack/react-query';
```

### Naming Conventions

- **Files**: PascalCase for components (`LoginForm.tsx`), camelCase for utilities (`formatDate.ts`)
- **Components**: PascalCase (`const LoginForm: React.FC = () => {}`)
- **Hooks**: camelCase starting with "use" (`useAuth`, `useLocalStorage`)
- **Services**: PascalCase with Service suffix (`AuthService`, `PatientService`)
- **Types/Interfaces**: PascalCase (`interface UserData`, `type ApiResponse`)
- **Constants**: UPPER_SNAKE_CASE for true constants (`const MAX_RETRIES = 3`)
- **Server modules**: controller/service/model/routes pattern
  - `auth.controller.ts`
  - `auth.service.ts`
  - `auth.model.ts`
  - `auth.routes.ts`
  - `auth.dto.ts` (Data Transfer Objects)

### Error Handling

**Server (Express):**
```typescript
// Use centralized error handler
try {
  const user = await UserService.findById(id);
  if (!user) {
    return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND);
  }
  return sendSuccess(res, user);
} catch (error) {
  logger.error('Failed to fetch user:', error);
  return sendError(res, 'Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
}
```

**Client:**
```typescript
try {
  const response = await apiClient.get('/users');
  if (!response.success) {
    throw new Error(response.error);
  }
  setUsers(response.data);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  toast.error(message);
}
```

### Code Formatting

- **No trailing semicolons** (enforced by ESLint)
- **Single quotes** for strings
- **2 spaces** indentation
- **Max line length**: 100 characters
- **Always use** TypeScript types (avoid `any` when possible)

### Database/Prisma

- Use Prisma Client generated at `server/prisma/generated/`
- Run `pnpm db:generate` after schema changes
- Use transactions for multi-table operations
- Always sanitize user input with Zod validators

### React Patterns

- Use functional components with hooks
- Props interface naming: `ComponentNameProps`
- Export default for page components
- Named exports for reusable components
- Use `React.FC` for component typing

### API Client Usage

```typescript
import { apiClient } from '@/services/apiClient';

// Always handle both success and error cases
const result = await apiClient.get<User[]>('/users');
if (result.success) {
  return result.data;
} else {
  throw new Error(result.error);
}
```

### Environment Variables

- **Server**: Use `process.env.VARIABLE` with dotenv
- **Client**: Use `import.meta.env.VITE_VARIABLE` (Vite)
- Never commit `.env` files
- Default values should be set in config files, not code

## Pre-commit Checklist

1. Run `pnpm lint` - fix any ESLint errors
2. Check TypeScript compilation: `pnpm build`
3. Verify no console.log statements in production code
4. Ensure error handling is in place for async operations
5. Test critical user flows manually

## Technology Stack

- **Package Manager**: pnpm (workspace mode)
- **Client**: React 18 + TypeScript + Vite + Electron + Tailwind CSS + Shadcn UI
- **Server**: Node.js + Express + TypeScript + Prisma ORM + PostgreSQL
- **Auth**: JWT with refresh tokens
- **Linting**: ESLint with TypeScript
- **State**: React Query (TanStack) for server state

## Desktop Application Design Guidelines

**CRITICAL: This is an Electron Desktop App, NOT a website.**

### Design Philosophy: "Professional Desktop Application"

**Target**: Hospital staff using desktop computers in a clinical setting.
**Goal**: Efficient, professional, data-dense UI that maximizes screen real estate.

#### 1. Layout Patterns

**Use Sidebar Navigation (ALWAYS):**
- Fixed left sidebar (240-280px width)
- Main content area takes remaining space
- Collapsible sidebar on smaller screens
- Sidebar shows current user and role

**Content Density:**
- **DENSE layouts** - Desktop apps need information density
- Reduce padding (p-3 instead of p-6)
- Compact form fields (h-9 instead of h-11)
- Smaller font sizes (13-14px base)
- Multiple columns for forms (2-3 columns)

**Screen Utilization:**
- Use full width and height (no max-width containers)
- Data tables should fill available space
- Forms should be multi-column
- Cards should be compact with less whitespace

#### 2. Typography

**Use System Fonts (NEVER decorative fonts):**
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Desktop App Standards:**
- **Base size**: 13-14px (not 16px)
- **Headings**: 15-18px (not 24px+)
- **Font weight**: 400-500 normal, 600 for emphasis
- **Line height**: 1.4-1.5 (compact)
- **NO serif fonts** - use clean sans-serif only

#### 3. Color Palette

**Professional Desktop Colors:**
- **Primary**: `#2563eb` (professional blue)
- **Background**: `#ffffff` (white)
- **Surface**: `#f8fafc` (slate-50)
- **Border**: `#e2e8f0` (slate-200)
- **Text**: `#0f172a` (slate-900)
- **Muted**: `#64748b` (slate-500)
- **Success**: `#16a34a` (green-600)
- **Warning**: `#d97706` (amber-600)
- **Error**: `#dc2626` (red-600)

**Rules:**
- NO gradients in headers (use solid colors)
- NO decorative backgrounds
- NO pastel colors
- Use high contrast for readability
- Subtle borders to define sections

#### 4. Component Guidelines

**Buttons:**
- Compact size (h-8 or h-9)
- Sharp corners (rounded-sm, not rounded-lg)
- Clear hierarchy: Primary (filled) vs Secondary (outline)
- Icon + text combos for actions

**Forms:**
- Multi-column layouts (2-3 columns)
- Inline labels when possible
- Compact input fields
- Group related fields visually
- Validation errors inline

**Tables:**
- Dense rows (py-2)
- Striped rows for readability
- Sortable headers
- Actions in row (edit/delete icons)
- Pagination or infinite scroll

**Cards:**
- Use for grouping content
- Sharp corners (rounded-sm)
- Subtle borders (border, not shadow-lg)
- Compact padding (p-3 or p-4)

**Modals/Dialogs:**
- Centered on screen
- Backdrop blur
- Sharp corners
- Compact padding
- Clear action buttons

#### 5. Navigation Pattern

**Sidebar Structure:**
```
┌─────────────────────────────────────┐
│ LOGO                                │
│ User Name (Role)                    │
├─────────────────────────────────────┤
│ DASHBOARD                           │
│   • Today's Patients                │
│   • Schedule                        │
│ PATIENTS                            │
│   • Search                          │
│   • Register New                    │
│ APPOINTMENTS                        │
│   • View All                        │
│   • Book New                        │
│ SETTINGS                            │
├─────────────────────────────────────┤
│ Logout                              │
└─────────────────────────────────────┘
```

**Header Bar:**
- Breadcrumb navigation
- Page title
- Action buttons (right side)
- User menu (optional)

#### 6. Data Display

**Information Density Priority:**
- Show more data on screen
- Use smaller fonts
- Compact spacing
- Efficient use of whitespace
- Collapsible sections for details

**Tables Over Cards:**
- For lists of data, always use tables
- Tables are more efficient for desktop
- Cards are for single-item detail views

#### 7. Animations & Interactions

**Keep it Subtle:**
- NO bouncy/spring animations
- Use simple fades (150-200ms)
- NO staggered reveals
- Instant feedback on clicks
- Smooth but quick transitions

**Desktop Interactions:**
- Right-click context menus
- Keyboard shortcuts
- Drag and drop where appropriate
- Multi-select with checkboxes
- Double-click to open/edit

#### 8. Electron-Specific

**Window Controls:**
- Respect native window chrome
- Use native menus where possible
- Support keyboard shortcuts
- Handle window state (minimize, maximize)

**Platform Considerations:**
- Windows: Use Segoe UI, standard spacing
- macOS: Use San Francisco, slightly more spacing
- Linux: Use system default

### Implementation Checklist

When building UI components:
- [ ] Uses sidebar navigation layout
- [ ] Dense, compact design (not spacious)
- [ ] System fonts only (no custom fonts)
- [ ] Solid colors (no gradients)
- [ ] Sharp corners (not rounded)
- [ ] Professional blue-gray color scheme
- [ ] Multi-column forms
- [ ] Data tables for lists
- [ ] Subtle animations only
- [ ] Full screen utilization
- [ ] Looks like a desktop app (VS Code, Figma, Slack)

### Example Layout

```tsx
// Desktop App Layout Pattern
<div className="h-screen flex">
  {/* Sidebar - 260px fixed */}
  <aside className="w-[260px] bg-slate-900 text-white flex flex-col">
    <div className="p-4 border-b border-slate-700">
      <h1 className="font-semibold text-lg">Hospital MS</h1>
    </div>
    <nav className="flex-1 p-2">
      <NavItem icon={Home} label="Dashboard" active />
      <NavItem icon={Users} label="Patients" />
      <NavItem icon={Calendar} label="Appointments" />
    </nav>
    <div className="p-4 border-t border-slate-700">
      <UserProfile />
    </div>
  </aside>
  
  {/* Main Content */}
  <main className="flex-1 flex flex-col bg-white">
    <header className="h-14 border-b flex items-center px-4">
      <Breadcrumb />
      <div className="ml-auto">
        <ActionButtons />
      </div>
    </header>
    <div className="flex-1 p-4 overflow-auto">
      {/* Dense content here */}
    </div>
  </main>
</div>
```

## Critical Notes

- ALWAYS use pnpm commands, never npm/yarn
- Server runs on port 4000, client on 5173 (Vite default)
- Database uses Neon PostgreSQL (cloud) - check connection string in `.env`
- Prisma client must be regenerated after schema changes
- Electron uses `shamefully-hoist=true` for compatibility
- Use path aliases (`@/`) in client, relative paths in server
- **UI Library Active**: Shadcn UI + Radix - Use these primitives, never build custom
- **THIS IS A DESKTOP APP**: Design for efficiency and density, not web aesthetics
