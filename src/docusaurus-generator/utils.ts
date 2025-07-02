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

import * as fs from 'node:fs'

// ----------------------------------------------------------------------------

export function formatDate (date: Date): string {
  // Custom format: YYYY-MM-DD HH:mm:ss
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0') // Months are zero-based
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0000`
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

export function removeEmptyLines (text: string): string {
  return text.replace(/^\s*$(?:\r\n?|\n)/gm, '')
}

// Preserve '/' too.
export function sanitizeHierarchicalPath (text: string): string {
  return text.toLowerCase()
    .replaceAll(/[ ]*/g, '')
    .replaceAll(/\*/g, '2a')
    .replaceAll(/&/g, '26')
    .replaceAll(/</g, '3c')
    .replaceAll(/>/g, '3e')
    .replaceAll(/\(/g, '28')
    .replaceAll(/\)/g, '29')
    .replaceAll(/[^a-zA-Z0-9/-]/g, '-')
}

export function flattenPath (text: string): string {
  return text.replaceAll('/', '-')
}

export function stripPermalinkHexAnchor (refid: string): string {
  return refid.replace(/_1[0-9a-fg]*$/, '')
}

export function stripPermalinkTextAnchor (refid: string): string {
  return refid.replace(/_1_[0-9a-z]*$/, '')
}

export function stripLeadingNewLines (text: string): string {
  return text.replace(/^[\r\n]+/, '')
}

export function stripTrailingNewLines (text: string): string {
  return text.replace(/[ \r\n]+$/, '')
}

export function stripLeadingAndTrailingNewLines (text: string): string {
  return text.replace(/^[\r\n]+/, '').replace(/[ \r\n]+$/, '')
}

export function getPermalinkAnchor (refid: string): string {
  return refid.replace(/^.*_1/, '')
}

export async function folderExists (folderPath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(folderPath)
    return stat.isDirectory()
  } catch {
    return false
  }
}

export function joinWithLast (arr: string[], delimiter: string, lastDelimiter: string): string {
  if (arr.length === 0) return ''
  if (arr.length === 1) return String(arr[0])
  return arr.slice(0, -1).join(delimiter) + lastDelimiter + arr[arr.length - 1]
}

// ----------------------------------------------------------------------------
