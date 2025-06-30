export declare function formatDate(date: Date): string;
/**
 * Escape characters that are problematic in a markdown context.
 * This includes HTML special chars and markdown delimiters.
 */
export declare function escapeMarkdown(text: string): string;
export declare function escapeHtml(text: string): string;
export declare function escapeQuotes(text: string): string;
export declare function escapeBraces(text: string): string;
export declare function sanitizeHierarchicalPath(text: string): string;
export declare function renderString(element: string, type: string): string;
export declare function flattenPath(text: string): string;
export declare function stripPermalinkHexAnchor(refid: string): string;
export declare function stripPermalinkTextAnchor(refid: string): string;
export declare function getPermalinkAnchor(refid: string): string;
export declare function folderExists(folderPath: string): Promise<boolean>;
export declare function joinWithLast(arr: string[], delimiter: string, lastDelimiter: string): string;
