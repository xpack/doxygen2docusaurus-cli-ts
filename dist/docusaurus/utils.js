/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2025 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/licenses/MIT.
 */
// ----------------------------------------------------------------------------
import * as fs from 'node:fs/promises';
// ----------------------------------------------------------------------------
/**
 * Formats a Date object into a standardised UTC string representation.
 *
 * @remarks
 * Produces a timestamp in the format "YYYY-MM-DD HH:mm:ss +0000" using
 * UTC timezone for consistent date formatting across different environments.
 * This format ensures reproducible timestamps regardless of the local
 * system timezone, which is essential for documentation generation consistency.
 *
 * @param date - The Date object to format.
 * @returns A formatted date string in UTC with timezone offset.
 *
 * @public
 */
export function formatDate(date) {
    // Custom format: YYYY-MM-DD HH:mm:ss
    const year = date.getUTCFullYear();
    // The +1 is needed because months are zero-based.
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return (`${year.toString()}-${month}-${day} ${hours}:${minutes}:${seconds} ` +
        '+0000');
}
/**
 * Formats a duration value into a human-readable string representation.
 *
 * @remarks
 * Converts millisecond values into appropriate units (milliseconds, seconds,
 * or minutes) with appropriate precision for display purposes. The function
 * automatically selects the most suitable unit based on the magnitude of
 * the duration value to ensure optimal readability for performance reporting.
 *
 * @param n - The duration in milliseconds.
 * @returns A formatted duration string with appropriate units.
 *
 * @public
 */
export function formatDuration(n) {
    if (n < 1000) {
        return `${n.toString()} ms`;
    }
    else if (n < 100000) {
        return `${(n / 1000).toFixed(1)} sec`;
    }
    else {
        return `${(n / 60000).toFixed(1)} min`;
    }
}
// ----------------------------------------------------------------------------
// /**
//  * Escape characters that are problematic in MDX/JSX context.
//  * This includes HTML special chars and MDX/JSX delimiters.
//  */
// export function escapeMdx (text: string): string {
//   return text
//     .replaceAll(/[&]/g, '&amp;')
//     .replaceAll(/[<]/g, '&lt;')
//     .replaceAll(/[>]/g, '&gt;')
//     .replaceAll(/["]/g, '&quot;')
//     .replaceAll(/[']/g, '&#39;')
//     .replaceAll(/[`]/g, '&#96;')
//     .replaceAll(/{/g, '&#123;')
//     .replaceAll(/}/g, '&#125;')
//     .replaceAll(/\[/g, '&#91;')
//     .replaceAll(/\]/g, '&#93;')
//     .replaceAll(/~/g, '&#126;')
//     .replaceAll(/[\\]/g, '\\\\')
//     .replaceAll(/\*/g, '&#42;') // Markdown for bold
//     .replaceAll(/_/g, '&#95;') // Markdown for italics
// }
// export function encodeUrl (text: string): string {
//   return text
//     .replaceAll(/[<]/g, '%3C')
//     .replaceAll(/[>]/g, '%3E')
//     .replaceAll(/[(]/g, '%28')
//     .replaceAll(/[)]/g, '%29')
//     .replaceAll(/[&]/g, '%26')
//     .replaceAll(/[*]/g, '%2A')
// }
// /**
//  * Escape characters that are problematic in a markdown context.
//  * This includes HTML special chars and markdown delimiters.
//  */
// export function escapeMarkdown (text: string): string {
//   return text
//     .replaceAll(/&/g, '&amp;')
//     .replaceAll(/</g, '&lt;')
//     .replaceAll(/>/g, '&gt;')
//     .replaceAll(/\\/g, '\\\\') // Must be placed before \[ \]
//     .replaceAll(/\[/g, '\\[')
//     .replaceAll(/\]/g, '\\]')
//     .replaceAll(/\*/g, '\\*') // Markdown for bold
//     .replaceAll(/_/g, '\\_') // Markdown for italics
//     .replaceAll(/~/g, '\\~') // Markdown for strikethrough in GFM
// }
// /**
//  * In <code></code> only a few characters need to be escaped.
//  */
// export function escapeHtml (text: string): string {
//   return text
//     .replaceAll(/&/g, '&amp;')
//     .replaceAll(/</g, '&lt;')
//     .replaceAll(/>/g, '&gt;')
// }
// export function escapeQuotes (text: string): string {
//   return text
//     .replaceAll(/"/g, '&quot;')
// }
// // type='plain-html'
// export function escapeBraces (text: string): string {
//   return text
//     .replaceAll(/{/g, '&#123;') // MD
//     .replaceAll(/}/g, '&#125;') // MD
// }
/**
 * Removes empty lines from a text string.
 *
 * @remarks
 * Eliminates lines that contain only whitespace characters, helping to
 * clean up text content for documentation processing. This function is
 * particularly useful for normalising content extracted from XML sources
 * where formatting artefacts may introduce unwanted empty lines.
 *
 * @param text - The input text to process.
 * @returns The text with empty lines removed.
 *
 * @public
 */
export function removeEmptyLines(text) {
    return text.replace(/^\s*$(?:\r\n?|\n)/gm, '');
}
/**
 * Sanitises text for use in hierarchical URL paths.
 *
 * @remarks
 * Transforms text into a URL-safe format suitable for hierarchical paths
 * by converting to lowercase, removing spaces, encoding special characters,
 * and preserving forward slashes for path structure. This function ensures
 * that generated URLs are compatible with web standards whilst maintaining
 * the hierarchical nature of documentation structures.
 *
 * @param text - The input text to sanitise.
 * @returns A URL-safe hierarchical path string.
 *
 * @public
 */
// Preserve '/' too.
export function sanitizeHierarchicalPath(text) {
    return text
        .toLowerCase()
        .replaceAll(/[ ]*/g, '')
        .replaceAll(/\*/g, '2a')
        .replaceAll(/&/g, '26')
        .replaceAll(/</g, '3c')
        .replaceAll(/>/g, '3e')
        .replaceAll(/\(/g, '28')
        .replaceAll(/\)/g, '29')
        .replaceAll(/[^a-zA-Z0-9/-]/g, '-');
}
/**
 * Sanitises anonymous namespace identifiers for better readability.
 *
 * @remarks
 * Simplifies the representation of anonymous namespaces by removing
 * redundant text whilst preserving the essential identifying information.
 * This transformation improves the readability of documentation by reducing
 * verbose namespace representations commonly generated by Doxygen.
 *
 * @param text - The namespace identifier to sanitise.
 * @returns A cleaner namespace identifier.
 *
 * @public
 */
export function sanitizeAnonymousNamespace(text) {
    return text.replaceAll(/anonymous_namespace\{/g, 'anonymous{');
}
/**
 * Flattens a hierarchical path by replacing separators with hyphens.
 *
 * @remarks
 * Converts forward slashes to hyphens to create a flat string suitable
 * for use in contexts where hierarchical separators are not appropriate.
 * This is particularly useful for creating file names or identifiers
 * that must not contain path separators whilst preserving readability.
 *
 * @param text - The hierarchical path to flatten.
 * @returns A flattened path string with hyphens instead of slashes.
 *
 * @public
 */
export function flattenPath(text) {
    return text.replaceAll('/', '-');
}
/**
 * Removes hexadecimal anchor suffixes from reference identifiers.
 *
 * @remarks
 * Strips trailing hexadecimal anchor patterns from Doxygen reference
 * identifiers to obtain the base reference without anchor information.
 * This is essential for creating clean reference links whilst preserving
 * the ability to extract anchor information separately when needed.
 *
 * @param refid - The reference identifier to process.
 * @returns The reference identifier with hexadecimal anchor removed.
 *
 * @public
 */
export function stripPermalinkHexAnchor(refid) {
    return refid.replace(/_1[0-9a-fg]*$/, '');
}
/**
 * Removes text anchor suffixes from reference identifiers.
 *
 * @remarks
 * Strips trailing text-based anchor patterns from Doxygen reference
 * identifiers to obtain the base reference without anchor information.
 * This complements the hexadecimal anchor removal function by handling
 * text-based anchor patterns that may appear in certain Doxygen outputs.
 *
 * @param refid - The reference identifier to process.
 * @returns The reference identifier with text anchor removed.
 *
 * @public
 */
export function stripPermalinkTextAnchor(refid) {
    return refid.replace(/_1_[0-9a-z]*$/, '');
}
/**
 * Removes leading newline characters from text.
 *
 * @remarks
 * Strips newline characters from the beginning of a text string whilst
 * preserving the remainder of the content. This function is useful for
 * cleaning up text content that may have unwanted leading whitespace
 * from XML parsing or template processing operations.
 *
 * @param text - The input text to process.
 * @returns The text with leading newlines removed.
 *
 * @public
 */
export function stripLeadingNewLines(text) {
    return text.replace(/^[\r\n]+/, '');
}
/**
 * Removes trailing whitespace and newline characters from text.
 *
 * @remarks
 * Strips trailing spaces, carriage returns, and newlines from the end
 * of a text string whilst preserving the main content. This function
 * ensures clean text output by removing formatting artefacts that may
 * interfere with proper Markdown rendering or display.
 *
 * @param text - The input text to process.
 * @returns The text with trailing whitespace and newlines removed.
 *
 * @public
 */
export function stripTrailingNewLines(text) {
    return text.replace(/[ \r\n]+$/, '');
}
/**
 * Removes both leading and trailing newline characters from text.
 *
 * @remarks
 * Combines the functionality of stripping both leading and trailing
 * newlines to clean up text content for processing. This comprehensive
 * cleaning function is particularly useful for normalising content
 * extracted from various sources that may have inconsistent whitespace.
 *
 * @param text - The input text to process.
 * @returns The text with leading and trailing newlines removed.
 *
 * @public
 */
export function stripLeadingAndTrailingNewLines(text) {
    return text.replace(/^[\r\n]+/, '').replace(/[ \r\n]+$/, '');
}
/**
 * Extracts the anchor portion from a reference identifier.
 *
 * @remarks
 * Retrieves the anchor part of a Doxygen reference identifier by removing
 * the base reference portion and returning only the anchor suffix. This
 * function is essential for creating proper internal links within
 * documentation pages where anchor-based navigation is required.
 *
 * @param refid - The reference identifier to process.
 * @returns The anchor portion of the reference identifier.
 *
 * @public
 */
export function getPermalinkAnchor(refid) {
    return refid.replace(/^.*_1/, '');
}
/**
 * Checks whether a folder exists at the specified path.
 *
 * @remarks
 * Asynchronously verifies the existence of a directory at the given path
 * and confirms that it is indeed a directory rather than a file. This
 * function provides safe filesystem access with proper error handling
 * for cases where the path does not exist or is inaccessible.
 *
 * @param folderPath - The path to check for folder existence.
 * @returns A promise that resolves to true if the folder exists.
 *
 * @public
 */
export async function folderExists(folderPath) {
    try {
        const stat = await fs.stat(folderPath);
        return stat.isDirectory();
    }
    catch {
        return false;
    }
}
/**
 * Joins an array of strings with different delimiters for the final item.
 *
 * @remarks
 * Concatenates array elements using a standard delimiter between most items
 * and a special delimiter before the last item, useful for creating
 * grammatically correct lists (e.g., "A, B, and C"). This function ensures
 * proper English grammar in generated text whilst handling edge cases
 * such as empty arrays and single-item arrays appropriately.
 *
 * @param arr - The array of strings to join.
 * @param delimiter - The standard delimiter between items.
 * @param lastDelimiter - The special delimiter before the last item.
 * @returns The joined string with appropriate delimiters.
 *
 * @public
 */
export function joinWithLast(arr, delimiter, lastDelimiter) {
    if (arr.length === 0)
        return '';
    if (arr.length === 1)
        return arr[0];
    return arr.slice(0, -1).join(delimiter) + lastDelimiter + arr[arr.length - 1];
}
/**
 * Validates whether a string represents a valid URL.
 *
 * @remarks
 * Attempts to construct a URL object from the input string to determine
 * if it represents a valid, well-formed URL. This validation method
 * leverages the native URL constructor's built-in validation capabilities
 * to provide robust URL checking without implementing custom parsing logic.
 *
 * @param str - The string to validate as a URL.
 * @returns True if the string is a valid URL, false otherwise.
 *
 * @public
 */
export function isUrl(str) {
    try {
        new URL(str);
        return true;
    }
    catch {
        return false;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=utils.js.map