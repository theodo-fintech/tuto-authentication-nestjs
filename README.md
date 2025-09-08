# Multi-Provider OAuth2 Authentication with Guide

## Description

This repository demonstrates a comprehensive implementation of authentication and authorization in a [NestJS](https://nestjs.com/) application using [Passport](https://www.passportjs.org/) middleware. The project features both traditional email/password authentication and multi-provider OAuth2 integration with **Google**, **GitHub**, and **Microsoft**.

### Key Features

- 🔐 **JWT-based Authentication** with configurable token expiration
- 🌐 **Multi-Provider OAuth2** (Google, GitHub, Microsoft)
- 🛡️ **Global Authentication Guards** with selective public routes
- 📊 **Modern Database Integration** using Prisma ORM
- 🏗️ **Scalable Architecture** with Provider Pattern for easy extensibility
- 🔒 **Security Best Practices** including password hashing and environment-based configuration

Check out the related article [here](https://www.sipios.com/blog-posts/implementing-authentication-in-nestjs-using-passport-and-jwt) 😊

![image](docs/architecture-schema.png)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# Using Docker Compose
docker compose up          # Start all services (app + database)
docker compose up -d       # Start in detached mode
docker compose down        # Stop all services
```

## Environment Setup

Before running the application, create a `.env` file with the following variables:

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_here
ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC=3600

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# OAuth2 Provider Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

## Database Setup

This project uses Prisma as the ORM. To set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

## Testing

A Bruno collection is provided in the repository for API testing purposes. Import the collection into Bruno to test all available authentication endpoints.

## Stay in touch

- Author - [Camille Fauchier](https://www.linkedin.com/in/camille-fauchier/)
