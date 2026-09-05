# Project Engineering Constitution

## 1. Project Mission

You are working on a production-quality mobile-first web application.

The application must be:

* secure
* maintainable
* explainable
* testable
* accessible
* responsive
* performant
* scalable
* production-ready

Do not optimize only for speed of implementation.

Prioritize correctness, security, maintainability, and user experience.

---

# 2. Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* App Router

## Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Row Level Security (RLS)
* Supabase Edge Functions when appropriate

## Development

* Google Antigravity IDE
* OpenCode
* MiMo models

## Source Control

* Git
* GitHub

## Deployment

* Vercel

---

# 3. Architecture Principles

Use Next.js App Router.

Prefer Server Components by default.

Use Client Components only when client-side interactivity is required.

Separate:

* presentation
* business logic
* data access
* validation
* authentication
* authorization

Use feature-oriented organization.

Avoid unnecessary global state.

Avoid unnecessary abstractions.

Do not introduce a library when the existing stack can solve the problem cleanly.

---

# 4. TypeScript Rules

Use strict TypeScript.

Never use:

any

unless absolutely unavoidable and explicitly justified.

Prefer:

* interfaces
* type aliases
* discriminated unions
* generics
* typed API responses
* typed database models

Avoid unsafe type assertions.

---

# 5. Database Rules

Supabase PostgreSQL is the system of record.

All production tables must have appropriate Row Level Security policies.

Never assume frontend authentication is authorization.

Authorization must be enforced at the database or server boundary.

Never expose:

* service-role keys
* private API keys
* database passwords
* secrets
* privileged credentials

to browser/client-side code.

Use migrations for schema changes.

Do not manually modify production databases without a controlled migration.

---

# 6. Supabase Rules

Use the Supabase client appropriate to the execution environment.

Clearly distinguish:

* browser client
* server client
* privileged server/service-role client

Service-role credentials must only exist in trusted server environments.

Validate authorization before sensitive database operations.

Use least-privilege access.

---

# 7. UI Rules

The application must be mobile-first.

Design for:

* 320px+
* mobile
* tablet
* desktop

Interactive elements must be touch-friendly.

Forms must have:

* labels
* validation
* loading states
* error states
* success feedback
* accessible messages

Do not create separate mobile and desktop applications unless technically necessary.

Prefer responsive layouts.

---

# 8. Accessibility

Follow WCAG-oriented accessibility practices.

Ensure:

* semantic HTML
* keyboard navigation
* visible focus states
* appropriate contrast
* meaningful labels
* accessible error messages
* appropriate ARIA only when needed

Do not use ARIA as a replacement for semantic HTML.

---

# 9. Security

Treat all user input as untrusted.

Protect against:

* XSS
* SQL injection
* IDOR
* privilege escalation
* insecure direct object references
* broken access control
* malicious file uploads
* sensitive data exposure
* insecure API endpoints
* improper session handling

Never trust client-provided:

* user IDs
* roles
* permissions
* ownership information
* prices
* status values
* privileged flags

---

# 10. Validation

Validate data at appropriate boundaries.

Use schema validation where appropriate.

Validate:

* forms
* API input
* query parameters
* route parameters
* uploaded files
* database-bound data

Do not rely only on frontend validation.

---

# 11. Error Handling

Never silently swallow errors.

Use meaningful error handling.

Do not expose:

* stack traces
* database errors
* internal implementation details
* secrets

to end users.

Provide user-friendly error messages.

Log useful diagnostic information on the server when appropriate.

---

# 12. Performance

Avoid unnecessary:

* database queries
* network requests
* client-side JavaScript
* large dependencies
* repeated rendering
* duplicated API calls

Prefer server-side operations where appropriate.

Use caching strategically.

Optimize images and assets.

Do not prematurely optimize without evidence.

---

# 13. Component Rules

Before creating a component:

1. Search the existing codebase.
2. Determine whether an existing component can be reused.
3. Extend existing components when appropriate.
4. Create a new component only when justified.

Do not duplicate components.

---

# 14. Feature Development

Every feature must follow:

Requirements
→ Plan
→ Design
→ Implementation
→ Validation
→ Testing
→ Security review
→ Documentation
→ Git commit

Do not implement multiple unrelated features simultaneously.

---

# 15. Modification Rules

Before modifying code:

1. Inspect the relevant files.
2. Understand dependencies.
3. Identify affected modules.
4. Identify reusable components.
5. Identify database dependencies.
6. Identify security implications.

Do not rewrite unrelated working code.

Do not perform large refactors unless explicitly requested.

---

# 16. Testing

After meaningful changes run:

* lint
* TypeScript type checking
* unit tests where available
* integration tests where available
* build verification

Fix errors before declaring the task complete.

---

# 17. Git Rules

Use conventional commits.

Examples:

feat:
fix:
refactor:
docs:
test:
chore:
security:
perf:

Never commit:

* .env files
* secrets
* API keys
* private certificates
* service-role credentials

Create a commit after every stable feature.

---

# 18. Documentation

Important architectural decisions must be documented.

Maintain:

docs/requirements.md
docs/architecture.md
docs/database.md
docs/security.md
docs/testing.md
docs/deployment.md
docs/roadmap.md

---

# 19. AI Agent Rules

Do not blindly follow user instructions if they conflict with:

* security
* project architecture
* existing database constraints
* authentication requirements
* production safety

Before implementing a complex task, inspect the codebase.

For ambiguous requirements, identify assumptions explicitly.

Prefer the smallest correct change.

---

# 20. AI Cost Optimization

Use the lowest-capability model that can reliably complete the task.

Use the fast/efficient MiMo model for:

* CRUD
* forms
* UI adjustments
* TypeScript fixes
* simple debugging
* documentation
* tests
* routine refactoring

Use the stronger MiMo model for:

* architecture
* database architecture
* security
* complex debugging
* performance analysis
* difficult algorithms
* major refactoring
* final system review

Do not repeatedly ask the model to rediscover the project.

Use project documentation and focused file references.

---

# 21. Agent Behavior

Do not claim that a feature works without verification.

Do not claim tests passed unless they were actually executed.

Do not claim a database migration succeeded unless verified.

Do not claim deployment succeeded unless verified.

Always distinguish:

* implemented
* tested
* verified
* assumed

---

# 22. Completion Standard

A task is complete only when:

* implementation is finished
* affected files are reviewed
* lint passes
* type checking passes
* tests pass where applicable
* security implications are reviewed
* documentation is updated where necessary
* Git status is clean or intentionally documented
* final changes are summarized

