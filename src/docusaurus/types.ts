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

/**
 * Front matter configuration for Docusaurus Markdown files.
 *
 * @remarks
 * Defines the YAML front matter structure used in generated Markdown files
 * to control Docusaurus page behaviour and metadata. This interface supports
 * flexible property addition whilst maintaining type safety for common
 * front matter fields used throughout the documentation generation process.
 *
 * @public
 */
// https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
export interface FrontMatter {
  /** Array of keywords associated with the page for SEO purposes. */
  keywords: string[]
  /** Additional front matter properties with flexible typing. */
  [key: string]: string | string[] | null | boolean | number | undefined
}

/**
 * Structure for collapsible table rows in documentation displays.
 *
 * @remarks
 * Represents hierarchical data that can be rendered as expandable table
 * rows with nested children and associated metadata. This structure supports
 * tree-like navigation interfaces where users can explore documentation
 * hierarchies in an organised and intuitive manner.
 *
 * @public
 */
export interface collapsibleTableRow {
  /** Unique identifier for the table row. */
  id: string
  /** Optional single letter icon representation. */
  iconLetter?: string
  /** Optional CSS class for icon styling. */
  iconClass?: string
  /** Display label for the row. */
  label: string
  /** URL link associated with the row. */
  link: string
  /** Descriptive text for the row content. */
  description: string
  /** Optional nested child rows for hierarchical display. */
  children?: collapsibleTableRow[]
}

// ----------------------------------------------------------------------------
// Docusaurus sidebar.

/**
 * Docusaurus sidebar category configuration.
 *
 * @remarks
 * Defines a collapsible category in the Docusaurus sidebar that can contain
 * multiple items and has an associated documentation link. This represents
 * the top-level navigation structure with a fixed collapsed state and
 * mandatory link configuration for consistent navigation behaviour.
 *
 * @public
 */
export interface SidebarCategory {
  /** The type identifier for sidebar categories. */
  type: 'category'
  /** Display label for the category. */
  label: string
  /** Link configuration for the category header. */
  link: {
    /** The type of link (always 'doc' for documentation links). */
    type: 'doc'
    /** The document identifier for the category link. */
    id: string
  }
  /** Whether the category should be collapsed by default. */
  collapsed: false
  /** Array of sidebar items contained within this category. */
  items: SidebarItem[]
}

/**
 * Individual documentation item in the Docusaurus sidebar.
 *
 * @remarks
 * Represents a single documentation page entry within the sidebar
 * navigation structure. This interface provides the essential properties
 * for creating clickable navigation links with optional styling support
 * for consistent visual presentation across the documentation site.
 *
 * @public
 */
export interface SidebarDocItem {
  /** The type identifier for document items. */
  type: 'doc'
  /** Display label for the sidebar item. */
  label: string
  /** Optional CSS class name for styling. */
  className?: string
  /** The document identifier for linking. */
  id: string
}

/**
 * Nested category item within the Docusaurus sidebar.
 *
 * @remarks
 * Represents a hierarchical category that can contain other sidebar items
 * and may optionally have its own documentation link. This interface
 * enables the creation of multi-level navigation structures with flexible
 * collapse behaviour and optional styling for enhanced user experience.
 *
 * @public
 */
export interface SidebarCategoryItem {
  /** The type identifier for category items. */
  type: 'category'
  /** Display label for the category. */
  label: string
  /** Optional link configuration for the category. */
  link?: {
    /** The type of link (always 'doc' for documentation links). */
    type: 'doc'
    /** The document identifier for the category link. */
    id: string
  }
  /** Optional CSS class name for styling. */
  className?: string
  /** Whether the category should be collapsed by default. */
  collapsed: boolean
  /** Array of nested sidebar items within this category. */
  items: SidebarItem[]
}

/**
 * Union type for all possible sidebar item types.
 *
 * @remarks
 * Represents any item that can appear in the Docusaurus sidebar,
 * including documents and nested categories. This union type provides
 * type safety when working with heterogeneous sidebar structures whilst
 * maintaining flexibility for different navigation patterns.
 *
 * @public
 */
export type SidebarItem = SidebarDocItem | SidebarCategoryItem

// ----------------------------------------------------------------------------

/**
 * Docusaurus navigation bar item configuration.
 *
 * @remarks
 * Defines items that appear in the top navigation bar, including
 * dropdown menus and direct links. This interface supports both simple
 * navigation links and complex dropdown structures with nested items
 * for comprehensive site navigation capabilities.
 *
 * @public
 */
// Docusaurus menu dropdown.
// https://docusaurus.io/docs/api/themes/configuration#navbar-items
export interface NavbarItem {
  /** Optional type specification for the navbar item. */
  type?: string // 'dropdown'
  /** Display label for the navbar item. */
  label: string
  /** Target URL or path for the navbar item. */
  to: string
  /** Optional positioning within the navbar. */
  position?: 'left' | 'right'
  /** Optional array of nested items for dropdown menus. */
  items?: NavbarItem[]
}

// ----------------------------------------------------------------------------
