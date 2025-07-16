import * as fs from 'node:fs/promises';
export function formatDate(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0000`;
}
export function formatDuration(n) {
    if (n < 1000) {
        return `${n} ms`;
    }
    else if (n < 100000) {
        return `${(n / 1000).toFixed(1)} sec`;
    }
    else {
        return `${(n / 60000).toFixed(1)} min`;
    }
}
export function removeEmptyLines(text) {
    return text.replace(/^\s*$(?:\r\n?|\n)/gm, '');
}
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
export function sanitizeAnonymousNamespace(text) {
    return text.replaceAll(/anonymous_namespace\{/g, 'anonymous{');
}
export function flattenPath(text) {
    return text.replaceAll('/', '-');
}
export function stripPermalinkHexAnchor(refid) {
    return refid.replace(/_1[0-9a-fg]*$/, '');
}
export function stripPermalinkTextAnchor(refid) {
    return refid.replace(/_1_[0-9a-z]*$/, '');
}
export function stripLeadingNewLines(text) {
    return text.replace(/^[\r\n]+/, '');
}
export function stripTrailingNewLines(text) {
    return text.replace(/[ \r\n]+$/, '');
}
export function stripLeadingAndTrailingNewLines(text) {
    return text.replace(/^[\r\n]+/, '').replace(/[ \r\n]+$/, '');
}
export function getPermalinkAnchor(refid) {
    return refid.replace(/^.*_1/, '');
}
export async function folderExists(folderPath) {
    try {
        const stat = await fs.stat(folderPath);
        return stat.isDirectory();
    }
    catch {
        return false;
    }
}
export function joinWithLast(arr, delimiter, lastDelimiter) {
    if (arr.length === 0)
        return '';
    if (arr.length === 1)
        return arr[0];
    return arr.slice(0, -1).join(delimiter) + lastDelimiter + arr[arr.length - 1];
}
export function isUrl(str) {
    try {
        new URL(str);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=utils.js.map