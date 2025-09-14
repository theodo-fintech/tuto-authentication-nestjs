# Multi-Provider OAuth2 Authentication Architecture

## Problem Statement

Building upon a traditional email/password authentication system in NestJS, we need to:

1. **Add multiple OAuth2 providers** (Google, GitHub, Microsoft) while maintaining existing authentication
2. **Make it easy to add new providers** without duplicating code or breaking existing functionality
3. **Handle user account linking** - users should be able to authenticate via multiple methods
4. **Maintain a clean, scalable architecture** that follows NestJS best practices

### Challenges:

- Different OAuth2 providers have varying APIs and response formats
- Users may sign up with one method and later want to add another
- Need to avoid code duplication across providers
- Must preserve existing JWT-based authentication flow

## Proposed Architecture Solution

### 1. Provider Pattern + Factory Design

**Core Concept**: Abstract the OAuth2 flow into a common interface, with concrete implementations for each provider.

```typescript
interface IOAuthProvider {
  authorize(): string; // Generate authorization URL
  callback(code: string): Promise<OAuthUser>; // Handle provider callback
  getProviderName(): string; // Provider identifier
}
```

**Benefits**:

- ✅ Consistent interface across all providers
- ✅ Easy to add new providers
- ✅ Isolated provider-specific logic
- ✅ Testable and maintainable

### 2. Database Schema Design

**Enhanced User Entity**:

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ nullable: true }) // Optional for OAuth-only users
  password?: string;

  @Column({ default: false })
  isOAuthUser: boolean;

  @OneToMany(() => OAuthAccount, (account) => account.user)
  oauthAccounts: OAuthAccount[];
}
```

**New OAuthAccount Entity**:

```typescript
@Entity()
export class OAuthAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  provider: string; // 'google', 'github', 'microsoft'

  @Column()
  providerId: string; // Provider's unique user ID

  @Column()
  email: string;

  @ManyToOne(() => User, (user) => user.oauthAccounts)
  user: User;
}
```

**Key Features**:

- Users can have multiple authentication methods
- OAuth accounts are linked to users via email matching
- Supports both OAuth-only and hybrid users

### 3. Unified Authentication Flow

**Registration/Login Options**:

1. **Email/Password**: Traditional signup with password
2. **Google OAuth**: Instant signup/login with Google
3. **GitHub OAuth**: Instant signup/login with GitHub
4. **Microsoft OAuth**: Instant signup/login with Microsoft

**Account Linking Logic**:

```typescript
async handleOAuthCallback(provider: string, oauthUser: OAuthUser) {
  // 1. Check if OAuth account already exists
  let oauthAccount = await this.findOAuthAccount(provider, oauthUser.id);

  if (oauthAccount) {
    return this.login(oauthAccount.user);
  }

  // 2. Find existing user by email or create new one
  let user = await this.usersService.findOneByEmail(oauthUser.email);

  if (!user) {
    user = await this.usersService.create({
      email: oauthUser.email,
      isOAuthUser: true,
    });
  }

  // 3. Link OAuth account to user
  await this.createOAuthAccount(provider, oauthUser, user);

  return this.login(user);
}
```

### 4. File Structure

```
src/auth/
├── oauth/
│   ├── providers/
│   │   ├── google.provider.ts
│   │   ├── github.provider.ts
│   │   └── microsoft.provider.ts
│   ├── entities/
│   │   └── oauth-account.entity.ts
│   ├── oauth-provider.interface.ts
│   ├── oauth-provider.factory.ts
│   ├── oauth.controller.ts
│   └── oauth.service.ts
├── auth.module.ts
├── auth.service.ts
└── auth.controller.ts
```

### 5. API Endpoints

```
# Traditional Authentication
POST /auth/register          → Email/password registration
POST /auth/login             → Email/password login

# OAuth2 Authentication
GET  /auth/google            → Redirect to Google OAuth
GET  /auth/google/callback   → Handle Google callback
GET  /auth/github            → Redirect to GitHub OAuth
GET  /auth/github/callback   → Handle GitHub callback
GET  /auth/microsoft         → Redirect to Microsoft OAuth
GET  /auth/microsoft/callback → Handle Microsoft callback
```

## Implementation Benefits

### Extensibility

- **Adding a new provider** requires only implementing the `IOAuthProvider` interface
- **No changes needed** to existing controllers or services
- **Factory pattern** handles provider instantiation automatically

### User Experience

- **Flexible signup**: Users choose their preferred authentication method
- **Account linking**: Can add multiple authentication methods to one account
- **Seamless experience**: Same JWT token regardless of authentication method

### Maintainability

- **Separation of concerns**: Each provider handles its own logic
- **Code reuse**: Common OAuth flow logic is shared
- **Easy testing**: Each provider can be tested independently

## Implementation Plan

### **Phase 0: Dependencies Update** 📦 ✅ COMPLETED

- [x] Audit current dependencies in package.json
- [x] Update NestJS to latest stable version (v11.x)
- [x] Update Node.js types and TypeScript
- [x] Update testing frameworks (Jest)
- [x] Update linting tools (ESLint, Prettier)
- [x] Update auth dependencies (@nestjs/jwt, @nestjs/passport, passport, bcrypt)
- [x] Run tests to ensure no breaking changes
- [x] Fix any compatibility issues

### **Phase 1: TypeORM to Prisma Migration** 🔄 ✅ COMPLETED

- [x] Install Prisma and @prisma/client
- [x] Initialize Prisma with `npx prisma init`
- [x] Configure database connection in schema.prisma
- [x] Convert existing User entity to Prisma schema
- [x] Generate and run Prisma migration
- [x] Replace TypeORM repositories with Prisma client in UsersService
- [x] Update AuthService to work with Prisma
- [x] Test login/register functionality
- [x] Remove TypeORM dependencies and configuration
- [x] Update imports and clean up decorators

### **Phase 2: OAuth Foundation Setup** 🔄 ✅ COMPLETED

- [x] Add isOAuthUser field to User model in Prisma schema
- [x] Create OAuthAccount model with relations in Prisma
- [x] Generate and run migration for OAuth tables
- [x] Create IOAuthProvider interface
- [x] Define OAuthUser type for standardized user data
- [x] Create provider configuration types
- [x] Create OAuthService with Prisma client
- [x] Implement account linking logic with Prisma queries
- [x] Add OAuth-specific user creation logic

### **Phase 3: Google Provider (Proof of Concept)** 🔍

- [x] Install passport-google-oauth20
- [x] Create GoogleOAuthProvider implementing IOAuthProvider
- [x] Configure Google OAuth strategy
- [x] Create OAuthProviderFactory service
- [x] Implement provider instantiation logic
- [x] Add provider registration mechanism
- [x] Create /auth/google and /auth/google/callback endpoints
- [x] Implement redirect and callback handling
- [x] Integrate with existing JWT flow
- [x] Add Google OAuth credentials to .env
- [x] Configure callback URLs and scopes
- [x] Test complete Google OAuth flow

### **Phase 4: GitHub & Microsoft Providers** 🚀

- [ ] Install passport-github2
- [ ] Create GitHubOAuthProvider following Google pattern
- [ ] Add GitHub-specific configuration
- [ ] Install passport-microsoft
- [ ] Create MicrosoftOAuthProvider following established pattern
- [ ] Handle Microsoft Graph API specifics
- [ ] Register new providers in factory
- [ ] Add corresponding endpoints in controller
- [ ] Update environment configuration
- [ ] Test all three providers independently
- [ ] Verify consistent user creation flow with Prisma
- [ ] Validate JWT token generation

### **Phase 6: User Management & Documentation** 📚

- [ ] Add endpoint to view linked accounts using Prisma
- [ ] Implement account unlinking functionality
- [ ] Add ability to link additional providers to existing account
- [ ] Include provider information in JWT payload
- [ ] Add authentication method tracking
- [ ] Update user decorator to include OAuth data
- [ ] Write unit tests for Prisma queries
- [ ] Create integration tests for complete OAuth flows
- [ ] Add E2E tests for account linking scenarios
- [ ] Update API documentation
- [ ] Create Prisma schema documentation
- [ ] Add troubleshooting section
- [ ] Create provider setup guides

## Implementation Validation Checkpoints

**After Phase 0**: ✅ All dependencies updated, tests passing
**After Phase 1**: ✅ Prisma fully integrated, existing auth working
**After Phase 2**: ✅ Prisma schema ready for OAuth, interfaces defined
**After Phase 3**: ✅ Google login works with Prisma backend
**After Phase 4**: ✅ All three providers work with optimized Prisma queries
**After Phase 5**: ✅ Edge cases handled, security and performance optimized
**After Phase 6**: ✅ Complete system with user management and documentation

**Total Estimated Time**: 14-20 hours
**Risk Level**: Medium (major ORM migration + OAuth implementation)
**Key Benefits**: Modern dependency stack, superior type safety with Prisma, scalable OAuth architecture

This architecture provides a solid foundation for multi-provider OAuth2 authentication while maintaining the flexibility to add new providers and authentication methods in the future.
