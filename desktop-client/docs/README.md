# Medical Management Desktop Client

A comprehensive desktop application for medical practice management built with React, TypeScript, and Electron.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Features](#features)
- [Installation](#installation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Overview

This desktop client provides a complete solution for medical practice management, including:

- Patient registration and management
- Appointment scheduling
- Medical records management
- User authentication and role-based access
- Responsive UI with dark/light theme support

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
src/
├── api/              # API layer with HTTP client integration
├── components/       # Reusable UI components
├── config/          # Configuration files
├── contexts/        # React contexts for state management
├── features/        # Feature-specific components and logic
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries and helpers
├── pages/           # Page components
├── router/          # Routing configuration
├── services/        # Business logic and external services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── sampleDummyData/ # Sample data for backend development reference
```

## API Integration

The application is designed to integrate seamlessly with a REST API backend. All API calls are centralized through:

- **API Client**: Centralized HTTP client with error handling, timeouts, and authentication
- **API Modules**: Organized by domain (auth, patients, appointments, medical records)
- **Type Safety**: Full TypeScript support for API requests and responses
- **Error Handling**: Consistent error handling across all API calls

### Configuration

API configuration is managed through environment variables:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

See [API Documentation](./API.md) for detailed endpoint specifications.

## Features

### Authentication
- Secure login/logout
- Role-based access control (Receptionist, Doctor)
- Token-based authentication with refresh tokens
- Session management

### Patient Management
- Patient registration with comprehensive details
- Patient search and filtering
- Medical history tracking
- Patient profile management

### Appointment Management
- Appointment scheduling
- Calendar integration
- Appointment status tracking
- Doctor-specific appointment views

### Medical Records
- Electronic medical record creation
- Prescription management
- Medical history tracking
- Doctor notes and recommendations

### User Interface
- Modern, responsive design
- Dark/light theme support
- Accessibility compliance
- Intuitive navigation

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd desktop-client
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

5. For Electron development:
```bash
npm run electron:dev
```

## Development

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run electron` - Run Electron app
- `npm run electron:dev` - Run Electron in development mode
- `npm run electron:build` - Build Electron app for distribution
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Style

The project uses:
- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting (recommended)

### Testing

Testing setup includes:
- Unit tests with Jest/Vitest
- Component tests with React Testing Library
- E2E tests with Playwright (recommended)

## Deployment

### Web Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your web server.

### Desktop Deployment

1. Build the Electron application:
```bash
npm run electron:build
```

2. Distribute the generated installers from the `dist-electron` folder.

### Supported Platforms

- Windows (NSIS installer)
- macOS (DMG)
- Linux (AppImage)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Document API changes
- Follow the existing code style
- Update documentation as needed

## License

[Add your license information here]

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `docs/` folder

---

For detailed technical documentation, see:
- [API Documentation](./API.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)