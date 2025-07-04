# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a multi-component project for ZK authentication:

- `next_frontend/` - Next.js 15 frontend with TypeScript and React 19
- `java_backend/` - Spring Boot 3.5 backend with JPA and Lombok
- `local_resources/` - Local resource files
- `docker-compose.yml` - Docker configuration (currently empty)

## Common Commands

### Frontend (Next.js)
```bash
cd next_frontend
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server  
npm run lint         # Run ESLint
```

### Backend (Spring Boot)
```bash
cd java_backend
./gradlew bootRun    # Run the application
./gradlew build      # Build the project
./gradlew test       # Run tests
./gradlew clean      # Clean build artifacts
```

## Architecture Notes

- Frontend uses Next.js App Router with TypeScript
- Backend is a Spring Boot application with JPA for data persistence
- Java backend uses Lombok for reducing boilerplate code
- Project appears to be in early stages with minimal Cairo/ZK implementation present
- No Cairo smart contracts or Scarb configuration found yet

## Development Workflow

1. Frontend development: Work in `next_frontend/` directory
2. Backend development: Work in `java_backend/` directory  
3. Both components can be developed independently
4. Docker Compose file exists but is currently empty - likely for future orchestration