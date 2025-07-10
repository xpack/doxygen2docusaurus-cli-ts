export declare function formatDate(date: Date): string;
export declare function formatDuration(n: number): string;
export declare function removeEmptyLines(text: string): string;
export declare function sanitizeHierarchicalPath(text: string): string;
export declare function sanitizeAnonymousNamespace(text: string): string;
export declare function flattenPath(text: string): string;
export declare function stripPermalinkHexAnchor(refid: string): string;
export declare function stripPermalinkTextAnchor(refid: string): string;
export declare function stripLeadingNewLines(text: string): string;
export declare function stripTrailingNewLines(text: string): string;
export declare function stripLeadingAndTrailingNewLines(text: string): string;
export declare function getPermalinkAnchor(refid: string): string;
export declare function folderExists(folderPath: string): Promise<boolean>;
export declare function joinWithLast(arr: string[], delimiter: string, lastDelimiter: string): string;
//# sourceMappingURL=utils.d.ts.map