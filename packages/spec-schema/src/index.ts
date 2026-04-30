export { CURRENT_SCHEMA_VERSION, VERSION } from "./metadata";
export type {
	ActionItem,
	ActionItemCompletionState,
	CollaboratorDocument,
	CollaboratorMember,
	CollaboratorRole,
	DecisionDocument,
	DivergenceDocument,
	DivergenceEntry,
	DivergencePriority,
	DivergenceProposal,
	DivergenceResolution,
	DivergenceStatus,
	DivergenceVote,
	DivergenceVoteChoice,
	EntityType,
	EntityTypeMap,
	Envelope,
	IndexDocument,
	IndexDivergenceSummary,
	IndexDocumentTreeGroup,
	IndexDocumentTreeItem,
	SignalDocument,
	SignalEntry,
	ThesisDecisionLogItem,
	ThesisDocument,
} from "./types";
export { schemaRegistry } from "./schemas";
export type {
	ValidationError,
	ValidationFailure,
	ValidationResult,
	ValidationSuccess,
} from "./validator";
export { validate } from "./validator";
export type { ParseError, ParseResult } from "./parsers";
export {
	parseCollaborators,
	parseDecisions,
	parseDivergences,
	parseIndex,
	parseSignals,
	parseThesis,
} from "./parsers";
export type {
	LegacyPre30Draft,
	LegacyPre30MarkdownWorkspace,
	MigratedWorkspace,
	MigrationError,
	MigrationResult,
} from "./migrations";
export { buildLegacyPre30Draft, migrateLegacyPre30 } from "./migrations";
