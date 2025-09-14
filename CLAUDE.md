# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run start:dev          # Watch mode development server
npm run start:debug        # Debug mode with watch

# Testing
npm run test              # Run unit tests
npm run test:watch        # Unit tests in watch mode
npm run test:cov          # Unit tests with coverage
npm run test:e2e          # End-to-end tests

# Code Quality
npm run lint              # ESLint with auto-fix
npm run format            # Prettier formatting

# Production
npm run build             # Build for production
npm run start:prod        # Start production server
```

## Architecture Overview

This is a NestJS authentication system implementing JWT-based authentication with Passport strategies. The project follows a modular architecture with clear separation of concerns.

### Core Authentication Flow
- **Global JWT Guard**: All routes are protected by default via `JwtAuthGuard` configured in `main.ts`
- **Public Routes**: Use `@Public()` decorator to bypass authentication
- **User Extraction**: Use `@User()` decorator to get current authenticated user
- **JWT Strategy**: Validates Bearer tokens and extracts user from payload
- **Local Strategy**: Handles email/password validation for login

### Database & ORM
- **Current**: TypeORM with PostgreSQL
- **Entity**: User entity with id, email, password (bcrypt hashed), firstName, lastName
- **Planned Migration**: Moving to Prisma (see OAUTH_ARCHITECTURE.md)

### Module Structure
- **AuthModule**: Handles authentication (JWT, local strategies, guards, decorators)
- **UsersModule**: User CRUD operations and entity management
- **AppModule**: Root module with TypeORM configuration and global guards

### Environment Configuration
Required environment variables (see `.env.example`):
```
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC=3600s
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydatabase
DB_PASSWORD=mypassword
```

### Security Implementation
- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with configurable expiration
- Global authentication with selective public routes
- Environment-based configuration for sensitive data

## Planned OAuth2 Extension

The codebase includes a comprehensive plan (OAUTH_ARCHITECTURE.md) for implementing multi-provider OAuth2 authentication:

### Provider Pattern Architecture
- Abstract `IOAuthProvider` interface for consistent OAuth flow
- Factory pattern for provider instantiation (Google, GitHub, Microsoft)
- Account linking system allowing multiple auth methods per user

### Database Schema Changes
- New `OAuthAccount` entity linking providers to users
- Enhanced User model supporting OAuth-only accounts
- Migration from TypeORM to Prisma for better type safety

### Implementation Phases
1. **Phase 0**: Dependencies update to latest stable versions
2. **Phase 1**: TypeORM to Prisma migration
3. **Phase 2**: OAuth foundation setup (interfaces, entities)
4. **Phase 3**: Google provider implementation (proof of concept)
5. **Phase 4**: GitHub and Microsoft providers
6. **Phase 5**: Advanced account linking and edge cases
7. **Phase 6**: User management and documentation

### Future API Endpoints
```
# Traditional Auth (existing)
POST /auth/register
POST /auth/login

# OAuth2 (planned)
GET /auth/{provider}           # Redirect to OAuth provider
GET /auth/{provider}/callback  # Handle OAuth callback
```

## Development Notes

- All routes are protected by default - remember to use `@Public()` for open endpoints
- User object is available via `@User()` decorator in protected routes
- Database auto-synchronization is enabled in development
- Follow existing patterns when extending authentication features
- Refer to OAUTH_ARCHITECTURE.md for detailed OAuth2 implementation guidance

## Git Commit Guidelines

### Commit Message Format

•⁠  ⁠Use conventional commits format
•⁠  ⁠Make atomic commits (one logical change per commit)

### Pre-commit Requirements

Before committing any changes, you must:

1.⁠ ⁠Run typecheck
2.⁠ ⁠Run linter
3.⁠ ⁠Clean dead code/imports
4.⁠ ⁠Fix all linting issues and test failures until there are no errors

### Development Flow

For each implementation phase:

1.⁠ ⁠Make atomic commits per logical change
2.⁠ ⁠Update the markdown file to mark completed steps
3.⁠ ⁠Run pre-commit checks (typecheck, lint, tests)