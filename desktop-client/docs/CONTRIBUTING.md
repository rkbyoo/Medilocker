# Contributing Guide

Thank you for your interest in contributing to the Medical Management Desktop Client! This guide will help you get started with contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professionalism in all interactions

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Development Setup

1. **Fork the repository** on GitHub

2. **Clone your fork:**
```bash
git clone https://github.com/your-username/desktop-client.git
cd desktop-client
```

3. **Add upstream remote:**
```bash
git remote add upstream https://github.com/original-owner/desktop-client.git
```

4. **Install dependencies:**
```bash
npm install
```

5. **Set up environment:**
```bash
cp .env.example .env
# Edit .env with your local configuration
```

6. **Start development server:**
```bash
npm run dev
```

7. **Verify setup:**
- Open http://localhost:5173
- Ensure the application loads correctly

## Contributing Process

### 1. Choose an Issue

- Look for issues labeled `good first issue` for beginners
- Check existing issues before creating new ones
- Comment on issues you'd like to work on

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### 3. Make Changes

- Follow the coding standards (see below)
- Write tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 4. Test Your Changes

```bash
# Run all tests
npm run test

# Run linting
npm run lint

# Build to ensure no build errors
npm run build

# Test Electron app
npm run electron:dev
```

### 5. Commit Changes

Use conventional commit messages:

```bash
git commit -m "feat: add patient search functionality"
git commit -m "fix: resolve appointment scheduling bug"
git commit -m "docs: update API documentation"
```

Commit types:
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Test additions/updates
- `chore` - Maintenance tasks

### 6. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a pull request on GitHub.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use strict mode settings

```typescript
// Good
interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
}

// Avoid
const patient: any = { ... };
```

### React Components

- Use functional components with hooks
- Follow the component structure pattern
- Use proper prop types

```typescript
// Component structure
interface ComponentProps {
  title: string;
  onAction: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  // Hooks at the top
  const [state, setState] = useState('');
  
  // Event handlers
  const handleClick = () => {
    onAction();
  };
  
  // Render
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Action</button>
    </div>
  );
};
```

### File Organization

```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── forms/           # Form components
│   └── ui/              # UI library components
├── features/
│   ├── patients/        # Patient-related components
│   ├── appointments/    # Appointment-related components
│   └── auth/            # Authentication components
├── hooks/               # Custom hooks
├── utils/               # Utility functions
└── types/               # Type definitions
```

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

```typescript
// Files
PatientCard.tsx
apiClient.ts

// Components
const PatientCard = () => { ... };

// Functions
const formatDate = (date: string) => { ... };

// Constants
const API_BASE_URL = 'http://localhost:3000';

// Types
interface PatientData {
  id: string;
  name: string;
}
```

### CSS/Styling

- Use Tailwind CSS classes
- Create custom components for repeated patterns
- Follow responsive design principles

```tsx
// Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
  <button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
    Action
  </button>
</div>
```

## Testing Guidelines

### Unit Tests

Write unit tests for:
- Utility functions
- Custom hooks
- Complex component logic

```typescript
// utils/formatDate.test.ts
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('January 15, 2024');
  });
});
```

### Component Tests

Test component behavior, not implementation:

```typescript
// components/PatientCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientCard } from './PatientCard';

describe('PatientCard', () => {
  const mockPatient = {
    id: '1',
    name: 'John Doe',
    dateOfBirth: '1990-01-01'
  };

  it('should display patient information', () => {
    render(<PatientCard patient={mockPatient} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('1990-01-01')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<PatientCard patient={mockPatient} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockPatient.id);
  });
});
```

### API Tests

Mock API calls in tests:

```typescript
// api/patients.test.ts
import { apiClient } from '@/services';
import { getPatientById } from './patients';

jest.mock('@/services');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('patients API', () => {
  it('should fetch patient by id', async () => {
    const mockPatient = { id: '1', name: 'John Doe' };
    mockApiClient.get.mockResolvedValue({ success: true, data: mockPatient });

    const result = await getPatientById('1');
    
    expect(result).toEqual(mockPatient);
    expect(mockApiClient.get).toHaveBeenCalledWith('/patients/1');
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for public functions
- Document complex logic
- Include examples for utility functions

```typescript
/**
 * Formats a date string for display
 * @param date - ISO date string
 * @param format - Display format ('short' | 'long')
 * @returns Formatted date string
 * 
 * @example
 * formatDate('2024-01-15', 'long') // 'January 15, 2024'
 * formatDate('2024-01-15', 'short') // '01/15/2024'
 */
export const formatDate = (date: string, format: 'short' | 'long' = 'long'): string => {
  // Implementation
};
```

### README Updates

Update relevant documentation when:
- Adding new features
- Changing API endpoints
- Modifying build process
- Adding dependencies

## Pull Request Process

### Before Submitting

1. **Sync with upstream:**
```bash
git fetch upstream
git checkout main
git merge upstream/main
git checkout your-branch
git rebase main
```

2. **Run all checks:**
```bash
npm run lint
npm run test
npm run build
```

3. **Update documentation** if needed

### Pull Request Template

Use this template for your PR description:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in review environment
4. **Approval** from at least one maintainer
5. **Merge** by maintainer

### After Merge

1. **Delete your branch:**
```bash
git checkout main
git pull upstream main
git branch -d your-branch-name
git push origin --delete your-branch-name
```

2. **Update your fork:**
```bash
git push origin main
```

## Getting Help

### Resources

- **Documentation**: Check the `docs/` folder
- **Issues**: Search existing issues first
- **Discussions**: Use GitHub Discussions for questions

### Contact

- **General Questions**: Create a GitHub Discussion
- **Bug Reports**: Create a GitHub Issue
- **Security Issues**: Email [security@example.com]

### Development Environment Issues

Common solutions:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset git state
git clean -fd
git reset --hard HEAD

# Update dependencies
npm update
```

## Recognition

Contributors will be:
- Listed in the project's contributors section
- Mentioned in release notes for significant contributions
- Invited to join the maintainers team for consistent contributors

Thank you for contributing to the Medical Management Desktop Client! 🎉