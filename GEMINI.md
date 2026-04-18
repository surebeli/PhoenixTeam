# PhoenixTeam - Gemini CLI Context

This project, **PhoenixTeam**, is a distributed AI team document collaboration system implemented as a set of prompt-based skills. It allows multiple AI agents (or humans using AI tools) to collaborate on design documents with a structured workflow for synchronization and conflict resolution.

## Project Overview

- **Core Mission**: Enable "pure prompt, zero code" collaboration for AI teams.
- **Primary Mechanism**: Uses Git as the transport layer and a `.phoenix/` directory as the single source of truth for normalized design documents and collaboration metadata.
- **Key Concepts**:
  - **Member Code**: A unique identifier for each collaborator (e.g., `alice`, `bob`).
  - **THESIS.md**: The project's "North Star" goal and decision log.
  - **Divergences**: Detected inconsistencies between different collaborators' documents, managed via a Propose → Approve workflow.
  - **Normalized Documents**: Copies of local source documents stored in `.phoenix/design/{member-code}/` for cross-team sharing.

## Technical Architecture

The project is structured as a collection of "skills" (prompts) located in `plugin/skills/`.

- **`.phoenix/` Directory Structure**:
  - `COLLABORATORS.md`: Registry of members and their document directories.
  - `THESIS.md`: Project goal and authoritative decision log.
  - `DIVERGENCES.md`: Registry of all open, proposed, and resolved conflicts.
  - `INDEX.md`: Auto-generated index of all documents.
  - `design/`: Contains subdirectories for each collaborator's normalized docs.
  - `decisions/`: Detailed instruction files for resolved divergences.
  - `last-*.json`: Cache files for tracking hashes and review anchors.

## Operational Commands (Skills)

These commands are intended to be executed by the AI agent. Most require an identity (`phoenix-whoami`) and must be run on the designated "Main Branch" (Branch Guard).

### Initialization & Identity
- `/phoenix-init`: Initialize a new project or join an existing one.
- `/phoenix-whoami`: Check or bind the local machine's collaborator identity.

### Daily Workflow
- `/phoenix-pull`: Pull remote changes, parse them, and alert on pending approvals.
- `/phoenix-update`: Sync local source documents to the `.phoenix/` directory and verify action items.
- `/phoenix-push`: Push changes to the remote repository after a divergence check.

### Review & Alignment
- `/phoenix-review`: Analyze all collaborators' documents for divergences against the THESIS.
- `/phoenix-align`: Resolve divergences using a two-phase Propose → Approve process.
- `/phoenix-diff`: Inspect detailed changes grouped by collaborator.

### Utility & Status
- `/phoenix-status`: Comprehensive dashboard of the project's collaboration state.
- `/phoenix-suggest`: AI-driven suggestions based on recent diffs and divergence states.
- `/phoenix-parse`: Scan `.phoenix/` documents and update the `INDEX.md`.
- `/phoenix-archive`: Freeze and archive superseded proposals.

## Development & Collaboration Rules

1. **Source documents outside `.phoenix/` are READ-ONLY** for the PhoenixTeam plugin.
2. **Identity Guard**: Always verify `git config phoenix.member-code` before any operation.
3. **Branch Guard**: Operations (except `init`) must only run on the branch recorded in `git config phoenix.main-branch`.
4. **No Direct Edits**: Do not manually edit files like `DIVERGENCES.md` or `INDEX.md`; use the skills to update them.
5. **Conflict Resolution**: Divergences must go through the `review` -> `align` (propose) -> `align` (approve) cycle.

## Project Structure

- `plugin/skills/`: The prompt definitions for each PhoenixTeam command.
- `docs/design/`: Example documents and requirements for PhoenixTeam itself.
- `tests/mock-scenarios/`: Mock data for testing conflict resolution workflows.
- `PHOENIXTEAM.md`: A standalone, all-in-one prompt version of the plugin.
