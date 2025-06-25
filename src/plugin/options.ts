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

export interface Redirects {
  from: string | string[]
  to: string
}

export interface PluginConfigurationOptions {
  doxygenXmlInputFolderPath?: string
  docsFolderPath?: string
  apiFolderPath?: string
  docsBaseUrl?: string
  apiBaseUrl?: string
  imagesFolderPath?: string
  compatibilityRedirectsOutputFolderPath?: string
  mainPageTitle?: string
  sidebarCategoryFilePath?: string
  sidebarCategoryLabel?: string
  menuDropdownFilePath?: string
  menuDropdownLabel?: string
  customCssFilePath?: string
  verbose?: boolean
  debug?: boolean
  runOnStart?: boolean
  suggestToDoDescriptions?: boolean
  originalPagesNote?: string
  // redirects?: Redirects[]
  id?: string
}

export interface PluginOptions {
  /** Relative to the current website folder, like `doxygen/xml`, no initial/final slashes. */
  doxygenXmlInputFolderPath: string

  /** Relative to the current website folder, like `docs`, no initial/final slashes. */
  docsFolderPath: string

  /** Relative to the docs folder, like `api`, no initial/final slashes. */
  apiFolderPath: string

  /** Relative to the web home, like `docs`, without initial/final slashes. */
  docsBaseUrl: string

  /** Relative to the docs home, like `api`, without initial/final slashes. */
  apiBaseUrl: string

  /** Relative to `static` */
  imagesFolderPath: string

  /**  Relative to the current `website/static` folder, like `reference`. */
  compatibilityRedirectsOutputFolderPath?: string | undefined

  /** The title to be displayed on th main page. Default:`${projectBrief} API Reference`. */
  mainPageTitle: string

  /** Relative to the current website folder, default `sidebar-category-doxygen.json`. */
  sidebarCategoryFilePath: string

  /** Short text to be displayed in the sidebar. */
  sidebarCategoryLabel: string

  /** Relative to the current website folder, default `docusaurus-config-doxygen-menu-dropdown.json`. */
  menuDropdownFilePath: string

  /** Short text to be displayed in the menu. */
  menuDropdownLabel: string

  /** Relative to the current website folder, default `src/css/custom-doxygen.css` */
  customCssFilePath: string

  /** Boolean to control verbosity. */
  verbose: boolean

  /** Boolean to control debug verbosity. */
  debug: boolean

  /** Boolean to control if the plugin runs automatically on Docusaurus start. */
  runOnStart: boolean

  /** Boolean to control if the TODO suggestions are shown. */
  suggestToDoDescriptions: boolean

  /**
   * Location of original Doxygen pages
   *
   * 'For comparison, the original Doxygen html pages, styled with the <a href="https://jothepro.github.io/doxygen-awesome-css/">doxygen-awesome-css</a> plugin, continue to be available via the <a href="pathname:///doxygen/topics.html"><code>.../doxygen/*.html</b></code> URLs.'
   */
  originalPagesNote?: string

  // /** Array of redirect records, in case the Doxygen uses them in `htmlonly`. */
  // redirects: Redirects[]

  /** String identifier in case of multiple instances. */
  id: string
}

export const defaultOptions: PluginConfigurationOptions = {
  doxygenXmlInputFolderPath: 'doxygen/xml',
  docsFolderPath: 'docs',
  apiFolderPath: 'api',
  docsBaseUrl: 'docs',
  apiBaseUrl: 'api',
  imagesFolderPath: 'img/doxygen',
  sidebarCategoryFilePath: 'sidebar-category-doxygen.json',
  sidebarCategoryLabel: 'API Reference (Doxygen)',
  menuDropdownFilePath: 'docusaurus-config-menu-doxygen.json',
  menuDropdownLabel: 'Reference',
  customCssFilePath: 'src/css/custom-docusaurus-plugin-doxygen.css',
  verbose: false,
  debug: false,
  runOnStart: false,
  suggestToDoDescriptions: false,
  id: 'default'
}

export function getInstanceDefaultOptions (id: string | undefined): PluginConfigurationOptions {
  const options = { ...defaultOptions }

  if (id !== undefined && id.length > 0) {
    options.apiFolderPath = id
    options.apiBaseUrl = id
    options.imagesFolderPath = `img/doxygen-${id}`
    options.sidebarCategoryFilePath = `sidebar-category-doxygen-${id}.json`
    options.menuDropdownFilePath = `docusaurus-config-menu-doxygen-${id}.json`
  }

  return options
}

// ----------------------------------------------------------------------------
