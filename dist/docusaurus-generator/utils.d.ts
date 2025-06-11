export declare function formatDate(date: Date): string;
/**
 * Escape characters that are problematic in MDX/JSX context.
 * This includes HTML special chars and MDX/JSX delimiters.
 */
export declare function escapeMdx(text: string): string;
export declare function escapeHtml(text: string): string;
export declare function escapeQuotes(text: string): string;
export declare function sanitizeHierarchicalPath(text: string): string;
export declare function flattenPath(text: string): string;
export declare function stripPermalinkAnchor(refid: string): string;
export declare function getPermalinkAnchor(refid: string): string;
