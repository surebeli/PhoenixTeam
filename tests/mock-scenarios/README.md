# Mock Scenarios for PhoenixTeam

This directory contains test data to help you quickly understand how PhoenixTeam works, especially how it handles conflicts and divergences between different AI agents or collaborators.

## Demo 1: API Design Conflict (2-Person)

In `demo-1-conflict/`, we have two collaborators (`alice` and `bob`) who have designed an API differently.
- `alice` proposes a traditional RESTful API.
- `bob` proposes a GraphQL API.

### How to run this demo:

1. Copy the `demo-1-conflict` folder to a new workspace.
2. Run `/phoenix-init`. When asked for document directories, provide the paths to both `alice` and `bob`'s folders.
3. Once initialized, run `/phoenix-review`.
4. Observe how the AI automatically detects the divergence (REST vs GraphQL) and generates a `DIVERGENCES.md` report.
5. Run `/phoenix-align D-001` to resolve the conflict!

## Demo 2: Solo Mode (1-Person)

In `demo-2-solo/`, we have a single collaborator (`dev-solo`) working alone.
- Tests that PhoenixTeam works correctly with only one collaborator.
- Review should find no divergences (nothing to compare against).
- Validates the full init → update → parse → push workflow without conflicts.

### How to run this demo:

1. Copy `demo-2-solo` to a new workspace.
2. Run `/phoenix-init` with member code `dev-solo` and document directory `./demo-2-solo/dev-solo`.
3. Run `/phoenix-review` — should report no divergences.
4. Run `/phoenix-status` — consistency score should be 100.

## Demo 3: Payment Architecture Conflict (3-Person)

In `demo-3-three-way/`, we have three collaborators with conflicting proposals for a payment system:
- `alice` proposes a **microservices architecture** (database-per-service, PCI Level 1)
- `bob` proposes a **monolithic approach** (single service, PCI Level 2)
- `carol` proposes a **serverless/event-driven architecture** (Lambda + DynamoDB)

### Key divergence axes:
- Architecture style: microservices vs monolith vs serverless
- Database: PostgreSQL-per-service vs single PostgreSQL vs DynamoDB
- Security level: PCI Level 1 vs Level 2 vs Level 1 (different approaches)
- PayPal support: alice ✅, bob ✅, carol ❌

### How to run this demo:

1. Copy `demo-3-three-way` to a new workspace.
2. Run `/phoenix-init` three times (once per collaborator) to join all three.
3. Run `/phoenix-review` — should detect multiple divergences across all three parties.
4. Observe how the AI handles 3-way conflicts (compared to simpler 2-way in Demo 1).
5. Run `/phoenix-align all` to resolve divergences one by one.

### Expected divergences:
- D-001: Architecture style (alice: microservices vs bob: monolith vs carol: serverless) — **blocking**
- D-002: Database choice (PostgreSQL variants vs DynamoDB) — **directional**
- D-003: PCI compliance level (Level 1 vs Level 2) — **directional**
- D-004: PayPal support scope (supported vs dropped) — **detail**
