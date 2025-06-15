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

import { Workspace } from '../workspace.js'

// ----------------------------------------------------------------------------

export abstract class ElementTextRendererBase {
  workspace: Workspace

  constructor (workspace: Workspace) {
    this.workspace = workspace
  }

  abstract renderToMdxText (element: Object, type: string): string
}

export abstract class ElementLinesRendererBase {
  workspace: Workspace

  constructor (workspace: Workspace) {
    this.workspace = workspace
  }

  abstract renderToMdxLines (element: Object, type: string): string[]
}

// ----------------------------------------------------------------------------
