# Medical Management System - Architecture Documentation

## Overview

This document outlines the improved, modular architecture of the Medical Management Desktop Application. The refactoring follows industry best practices for React applications with TypeScript.

## Architecture Principles

- **Separation of Concerns**: Clear separation between UI, business logic, and data layers
- **Modularity**: Feature-based organization with reusable components
- **Type Safety**: Comprehensive TypeScript coverage
- **Error Handling**: Robust error boundaries and loading states
- **Performance**: Lazy loading, memoization, and optimized re-renders
- **Maintainability**: Clean code structure with proper documentation

## Folder Structure

```
src/
├── api/                    # API layer - data fetching and mutations
│   ├── auth.ts
│   ├── patients.ts
│   ├── appointments.ts
│   ├── medicalRecords.ts
│   └── index.ts
├── components/             # Reusable UI components
│   ├── common/            # Generic components (LoadingSpinner, ErrorBoundary, etc.)
│   └── ui/                # shadcn/ui components
├── config/                # Configuration and constants
│   └── constants.ts
├── contexts/              # React contexts for global state
│   ├── AuthContext.tsx
│   └── index.ts
├── features/              # Feature-based modules
│   ├── auth/
│   │   └── components/
│   ├── appointments/
│   │   └── components/
│   └── index.ts
├── hooks/                 # Custom React hooks
│   ├── useAsync.ts
│   ├── useLocalStorage.ts
│   ├── useAppointments.ts
│   ├── usePatients.ts
│   └── index.ts
├── pages/                 # Page components
├── router/                # Routing configuration
│   ├── AppRouter.tsx
│   └── index.ts
├── services/              # External services and utilities
│   ├── apiClient.ts
│   └── index.ts
├── types/                 # TypeScript type definitions
│   └── index.ts
├── utils/                 # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── index.ts
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

## Key Improvements

### 1. **Centralized Configuration**
- All constants, routes, and configuration in `src/config/constants.ts`
- Environment-specific settings
- API endpoints and query keys

### 2. **Type Safety**
- Comprehensive TypeScript types in `src/types/index.ts`
- API response types with proper error handling
- Form validation schemas with Zod

### 3. **State Management**
- React Context for authentication state
- React Query for server state management
- Custom hooks for business logic

### 4. **Error Handling**
- Global error boundary component
- Async error handling in custom hooks
- Loading states and error messages

### 5. **Route Protection**
- Protected route component with role-based access
- Automatic redirects based on user roles
- Authentication state persistence

### 6. **Component Architecture**
- Feature-based component organization
- Reusable UI components
- Composition over inheritance

### 7. **Performance Optimizations**
- Lazy loading of pages
- React Query caching
- Memoized components where appropriate

## Usage Examples

### Using Custom Hooks

```typescript
// In a component
import { useAppointments } from '@/hooks';

const MyComponent = () => {
  const { 
    appointments, 
    isLoading, 
    createAppointment,
    isCreating 
  } = useAppointments();

  // Component logic...
};
```

### Using Feature Components

```typescript
// Using appointment components
import { AppointmentsList } from '@/features/appointments';

const DashboardPage = () => {
  return (
    <AppointmentsList
      appointments={appointments}
      isLoading={isLoading}
      onAppointmentClick={handleClick}
      variant="today"
    />
  );
};
```

### Using Contexts

```typescript
// Using auth context
import { useAuth } from '@/contexts';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Component logic...
};
```

## Best Practices Implemented

### 1. **Error Boundaries**
- Catch and handle React errors gracefully
- Fallback UI for error states
- Development vs production error display

### 2. **Loading States**
- Consistent loading indicators
- Skeleton screens for better UX
- Loading state management

### 3. **Form Handling**
- React Hook Form with Zod validation
- Type-safe form data
- Proper error display

### 4. **API Layer**
- Centralized API client
- Consistent error handling
- Type-safe API responses

### 5. **Routing**
- Protected routes with role-based access
- Lazy loading for performance
- Proper navigation handling

## Development Guidelines

### Adding New Features

1. Create feature folder in `src/features/`
2. Add components, hooks, and types specific to the feature
3. Export from feature index file
4. Update main features index

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route to `src/router/AppRouter.tsx`
3. Add route constants to `src/config/constants.ts`
4. Implement proper protection if needed

### Adding New API Endpoints

1. Add endpoint to appropriate API file in `src/api/`
2. Update types in `src/types/index.ts`
3. Add constants to `src/config/constants.ts`
4. Create custom hook if needed

### Adding New Components

1. Determine if component is generic (common) or feature-specific
2. Place in appropriate folder
3. Follow naming conventions
4. Add proper TypeScript types
5. Export from index files

## Testing Strategy

- Unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for API calls
- E2E tests for critical user flows

## Performance Considerations

- Lazy loading of routes and components
- React Query for efficient data fetching
- Memoization of expensive calculations
- Proper dependency arrays in hooks

## Security Considerations

- Input validation with Zod schemas
- XSS prevention through proper escaping
- Authentication state management
- Role-based access control

This architecture provides a solid foundation for scaling the application while maintaining code quality and developer experience.