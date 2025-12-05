This directory contains module-wise documentation for the JECSmart Patient Health Card System.

## 📚 Module Documentation

- [Authentication Module](./auth.md) - JWT-based authentication and authorization
- [User Management](./user-management.md) - User profiles and role management
- [NFC Card Module](./nfc-card.md) - Smart health card operations
- [Hospital Desktop App](./hospital-desktop.md) - C# desktop application for hospitals
- [Patient Mobile App](./patient-mobile.md) - Flutter mobile app for patients
- [Backend API](./backend-api.md) - FastAPI backend services
- [Database Schema](./database.md) - PostgreSQL database structure
- [File Storage](./file-storage.md) - S3/Blob storage for medical files
- [Security](./security.md) - Security implementation and best practices
- [Deployment](./deployment.md) - Production deployment guide

## 🏗️ System Architecture

The system follows a microservices architecture with clear separation between:
- Smart NFC Cards (offline data storage)
- Hospital Desktop Applications (C# .NET)
- Patient Mobile Applications (Flutter)
- Cloud Backend (FastAPI + PostgreSQL + S3)
- Authentication Services (JWT/OAuth2)

## 📋 Getting Started

1. Start with the [Backend API](./backend-api.md) documentation
2. Review the [Database Schema](./database.md)
3. Check [Security](./security.md) implementation
4. Follow [Deployment](./deployment.md) guide for production setup