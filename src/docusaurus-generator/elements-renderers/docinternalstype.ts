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

import assert from 'assert'
import * as util from 'util'

import { ElementLinesRendererBase } from './element-renderer-base.js'
import { AbstractDocSect1Type, AbstractDocSect2Type, AbstractDocSect3Type, AbstractDocSect4Type, AbstractDocSect5Type, AbstractDocSect6Type } from '../../data-model/compounds/descriptiontype-dm.js'

// ----------------------------------------------------------------------------

// Sections are entered with @sect, @subsect, etc and in Docusaurus
// start wih H2. The markdown syntax is used to make the titles appear
// in the table of contents.

export class DocS1TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToLines (element: AbstractDocSect1Type, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = this.workspace.renderElementToString(element.title, type).trim().replace(/\.$/, '')
    if (title.length > 0) {
      lines.push('')
      lines.push(`## ${title}`)
    }

    lines.push('')
    lines.push(...this.workspace.renderElementsArrayToLines(element.children, type))

    return lines
  }
}

export class DocS2TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToLines (element: AbstractDocSect2Type, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = this.workspace.renderElementToString(element.title, type).trim().replace(/\.$/, '')
    if (title.length > 0) {
      lines.push('')
      lines.push(`### ${title}`)
    }
    lines.push('')
    lines.push(...this.workspace.renderElementsArrayToLines(element.children, type))

    return lines
  }
}

export class DocS3TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToLines (element: AbstractDocSect3Type, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = this.workspace.renderElementToString(element.title, type).trim().replace(/\.$/, '')
    if (title.length > 0) {
      lines.push('')
      lines.push(`#### ${title}`)
    }
    lines.push('')
    lines.push(...this.workspace.renderElementsArrayToLines(element.children, type))

    return lines
  }
}

export class DocS4TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToLines (element: AbstractDocSect4Type, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = this.workspace.renderElementToString(element.title, type).trim().replace(/\.$/, '')
    if (title.length > 0) {
      lines.push('')
      lines.push(`##### ${title}`)
    }
    lines.push('')
    lines.push(...this.workspace.renderElementsArrayToLines(element.children, type))

    return lines
  }
}

export class DocS5TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToLines (element: AbstractDocSect5Type, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = this.workspace.renderElementToString(element.title, type).trim().replace(/\.$/, '')
    if (title.length > 0) {
      lines.push('')
      lines.push(`###### ${title}`)
    }
    lines.push('')
    lines.push(...this.workspace.renderElementsArrayToLines(element.children, type))

    return lines
  }
}

export class DocS6TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToLines (element: AbstractDocSect6Type, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = this.workspace.renderElementToString(element.title, type).trim().replace(/\.$/, '')
    if (title.length > 0) {
      lines.push('')
      lines.push(`####### ${title}`)
    }

    lines.push('')
    lines.push(...this.workspace.renderElementsArrayToLines(element.children, type))

    return lines
  }
}

// ----------------------------------------------------------------------------
