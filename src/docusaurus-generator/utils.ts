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

/**
 * Escape characters that are problematic in MDX/JSX context.
 * This includes HTML special chars and MDX/JSX delimiters.
 */
export function escapeMdx (text: string): string {
  return text
    .replaceAll(/[&]/g, '&amp;')
    .replaceAll(/[<]/g, '&lt;')
    .replaceAll(/[>]/g, '&gt;')
    .replaceAll(/["]/g, '&quot;')
    .replaceAll(/[']/g, '&#39;')
    .replaceAll(/[`]/g, '&#96;')
    .replaceAll(/{/g, '&#123;')
    .replaceAll(/}/g, '&#125;')
    .replaceAll(/\[/g, '&#91;')
    .replaceAll(/\]/g, '&#93;')
    .replaceAll(/[\\]/g, '\\\\')
    .replaceAll(/\*/g, '&#42;') // Markdown for bold
    .replaceAll(/_/g, '&#95;') // Markdown for italics
}

// export function encodeUrl (text: string): string {
//   return text
//     .replaceAll(/[<]/g, '%3C')
//     .replaceAll(/[>]/g, '%3E')
//     .replaceAll(/[(]/g, '%28')
//     .replaceAll(/[)]/g, '%29')
//     .replaceAll(/[&]/g, '%26')
//     .replaceAll(/[*]/g, '%2A')
// }

export function escapeHtml (text: string): string {
  return text
    .replaceAll(/&/g, '&amp;')
    .replaceAll(/</g, '&lt;')
    .replaceAll(/>/g, '&gt;')
    .replaceAll(/"/g, '&quot;')
    .replaceAll(/'/g, '&#39;')
    .replaceAll(/{/g, '&#123;') // MDX
    .replaceAll(/}/g, '&#125;') // MDX
}

export function escapeQuotes (text: string): string {
  return text
    .replaceAll(/"/g, '&quot;')
}

// Preserve '/' too.
export function sanitizeHierarchicalPath (text: string): string {
  return text.toLowerCase().replaceAll(/[ ]*/g, '').replaceAll(/[^a-zA-Z0-9/-]/g, '-')
}

export function sanitizeName (text: string): string {
  return text.toLowerCase().replaceAll(/[ ]*/g, '').replaceAll(/[^a-zA-Z0-9-]/g, '-')
}

export function flattenPath (text: string): string {
  return text.replaceAll('/', '-')
}

export function stripPermalinkAnchor (refid: string): string {
  // No idea why g is also used.
  return refid.replace(/_1[0-9a-fg]*$/, '')
}

export function getPermalinkAnchor (refid: string): string {
  return refid.replace(/^.*_1/, '')
}

// ----------------------------------------------------------------------------
