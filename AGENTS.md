# Project Rules & Standards (BMG) 🤖⚖️

This file contains the core principles and coding standards for this project. Any AI Agent (Antigravity, Cursor, Claude, etc.) working on this repository MUST follow these rules to ensure consistency across different development environments.

## 🏗️ Architecture Standards
- **Pattern:** Clean Architecture.
- **Backend:** .NET 8 Web API. Follow CQRS with MediatR.
- **Frontend:** Next.js 15 (App Router). Use Client/Server components appropriately.
- **Database:** PostgreSQL (Neon.tech). All schema changes must be done via EF Core Migrations.
- **State Management:** Use React Context for global auth, local state for UI.

## 💎 Coding Style
- **Naming:** PascalCase for C# files/classes, camelCase for JS/TS variables, kebab-case for CSS classes.
- **Validation:** Always implement client-side validation (regex/length) before calling API.
- **Security:** NEVER hardcode secrets. Always use `.env` or Environment Variables.
- **Components:** Use TailwindCSS and Lucide-React icons. Follow the existing "Glassmorphism" design system.

## 🔄 Workflow
- **Git:** Always use descriptive commit messages (e.g., `feat:`, `fix:`, `docs:`).
- **Docker:** All backend dependencies (Redis, Postgres context) should be managed via `docker-compose`.
- **Documentation:** Keep `DOCUMENTATION.md` updated when adding new modules.

## 🛠️ Tech Stack Specifics
- **Backend:** Npgsql for Postgres, AutoMapper (if applicable), FluentValidation.
- **Frontend:** Axios for API calls, Framer Motion for animations.

---
*By following these rules, we ensure that the project remains maintainable and consistent regardless of which machine or AI agent is performing the development.*
