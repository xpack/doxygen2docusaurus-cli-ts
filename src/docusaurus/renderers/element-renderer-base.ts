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

import type { Workspace } from '../workspace.js'

// ----------------------------------------------------------------------------

/**
 * Abstract base class for renderers that output string content.
 *
 * @remarks
 * Provides common functionality for element renderers that convert
 * Doxygen XML elements into formatted string output. Maintains a
 * reference to the workspace for accessing configuration and utilities.
 *
 * @public
 */
export abstract class ElementStringRendererBase {
  /**
   * The workspace containing global configuration and utilities.
   *
   * @remarks
   * Provides access to rendering utilities, permalink generation,
   * and global configuration options needed for element processing.
   */
  workspace: Workspace

  /**
   * Creates a new string element renderer.
   *
   * @remarks
   * Initialises the renderer with the workspace reference for accessing
   * global configuration and rendering utilities.
   *
   * @param workspace - The workspace instance
   */
  constructor(workspace: Workspace) {
    this.workspace = workspace
  }

  /**
   * Renders an element to a formatted string.
   *
   * @remarks
   * Abstract method that must be implemented by derived classes to
   * convert specific element types into their string representation.
   *
   * @param element - The element to render
   * @param type - The rendering context type
   * @returns Formatted string output
   */
  abstract renderToString(element: object, type: string): string
}

/**
 * Abstract base class for renderers that output multiple lines.
 *
 * @remarks
 * Provides common functionality for element renderers that convert
 * Doxygen XML elements into formatted multi-line output. Maintains
 * a reference to the workspace for accessing configuration and utilities.
 *
 * @public
 */
export abstract class ElementLinesRendererBase {
  /**
   * The workspace containing global configuration and utilities.
   *
   * @remarks
   * Provides access to rendering utilities, permalink generation,
   * and global configuration options needed for element processing.
   */
  workspace: Workspace

  /**
   * Creates a new lines element renderer.
   *
   * @remarks
   * Initialises the renderer with the workspace reference for accessing
   * global configuration and rendering utilities.
   *
   * @param workspace - The workspace instance
   */
  constructor(workspace: Workspace) {
    this.workspace = workspace
  }

  /**
   * Renders an element to an array of formatted lines.
   *
   * @remarks
   * Abstract method that must be implemented by derived classes to
   * convert specific element types into their multi-line representation.
   *
   * @param element - The element to render
   * @param type - The rendering context type
   * @returns Array of formatted output lines
   */
  abstract renderToLines(element: object, type: string): string[]
}

// ----------------------------------------------------------------------------
