# Overview

This is a personal finance management application built with React, Express, and PostgreSQL. The application allows users to track their income and expenses, categorize transactions, and view financial summaries through a modern web interface. It features a full-stack architecture with a React frontend using shadcn/ui components and a Node.js/Express backend with Drizzle ORM for database operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation integration
- **Design System**: Uses "New York" variant of shadcn/ui with neutral base colors

## Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **Session Management**: Uses connect-pg-simple for PostgreSQL session storage
- **Development Setup**: Vite integration for hot module replacement in development

## Database Design
- **Schema**: Single `transactions` table with fields for type (income/expense), description, amount, category, notes, date, and timestamps
- **Types**: Strong typing with Zod schemas for validation and TypeScript interfaces
- **Migrations**: Drizzle Kit for database migrations and schema management
- **Validation**: Input validation using Zod with custom error messages in Russian

## API Structure
- **Endpoints**: RESTful API with filtering capabilities for transactions
- **Query Parameters**: Supports search, category, type, date range, and amount filtering
- **Response Format**: JSON responses with consistent error handling
- **CRUD Operations**: Full create, read, update, delete operations for transactions

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database (configured via DATABASE_URL)
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL adapter

### UI Framework
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Runtime error overlay and cartographer for development

### Validation & Forms
- **Zod**: Schema validation library
- **React Hook Form**: Form library with TypeScript support
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Date Handling
- **date-fns**: Modern JavaScript date utility library for date formatting and manipulation

### Query Management
- **TanStack Query**: Server state management with caching, synchronization, and background updates