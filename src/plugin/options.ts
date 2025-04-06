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

export interface PluginOptions {
  doxygenXmlInputFolderPath?: string
  outputFolderPath?: string
  sidebarFileName?: string
  id?: string
}

export const defaultOptions: PluginOptions = {
  doxygenXmlInputFolderPath: 'doxygen/xml',
  outputFolderPath: 'docs/api',
  sidebarFileName: 'sidebar-doxygen.json'
}

// ----------------------------------------------------------------------------
