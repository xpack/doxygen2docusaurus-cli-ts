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

export interface PluginConfigurationOptions {
  doxygenXmlInputFolderPath?: string
  outputFolderPath?: string
  outputBaseUrl?: string
  redirectsOutputFolderPath?: string
  sidebarCategoryFilePath?: string
  sidebarCategoryLabel?: string
  menuDropdownFilePath?: string
  menuDropdownLabel?: string
  verbose?: boolean
  runOnStart?: boolean
  id?: string
}

export interface PluginOptions {
  doxygenXmlInputFolderPath: string /** like `doxygen/xml`, no initial/final slash */
  outputFolderPath: string /** like `docs/api`, no initial/final slash */
  outputBaseUrl: string
  redirectsOutputFolderPath?: string | undefined
  sidebarCategoryFilePath: string
  sidebarCategoryLabel: string
  menuDropdownFilePath: string
  menuDropdownLabel: string
  verbose: boolean
  runOnStart: boolean
  id: string
}

export const defaultOptions: PluginConfigurationOptions = {
  doxygenXmlInputFolderPath: 'doxygen/xml',
  outputFolderPath: 'docs/api',
  outputBaseUrl: 'api',
  sidebarCategoryFilePath: 'sidebar-category-doxygen.json',
  sidebarCategoryLabel: 'API Reference (Doxygen)',
  menuDropdownFilePath: 'docusaurus-config-doxygen-menu-dropdown.json',
  menuDropdownLabel: 'Reference',
  verbose: false,
  runOnStart: false,
  id: 'default'
}

// ----------------------------------------------------------------------------
