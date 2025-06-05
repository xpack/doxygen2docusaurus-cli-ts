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

export class DocS1TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractDocSect1Type): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    // Ignore the H1 header, it is generated automatically by Docusaurus.

    // const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '')
    // if (title.length > 0) {
    //   lines.push('')
    //   lines.push(`## ${title} {#details}`)
    // } else {
    //   lines.push('')
    //   lines.push('<Link id="details" />')
    // }

    if (element.title !== undefined) {
      // console.log(element)
      // Note that `.md` files have the sections promoted one level,
      // so `## RTOS` is generated as `sect1`.
      console.warn('H1 header', this.workspace.renderElementToMdxText(element.title), 'ignored')
    }
    // Add the anchor referred by the 'More...' link.
    // TODO: investigate why this does not work.
    lines.push('<Link id="details" />')

    lines.push('')
    lines.push(...this.workspace.renderElementsToMdxLines(element.children))

    return lines
  }
}

export class DocS2TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractDocSect2Type): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '')
    if (title.length > 0) {
      lines.push('')
      lines.push(`## ${title}`)
    }
    lines.push('')
    lines.push(...this.workspace.renderElementsToMdxLines(element.children))

    return lines
  }
}

export class DocS3TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractDocSect3Type): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '')
    if (title.length > 0) {
      lines.push('')
      lines.push(`### ${title}`)
    }
    lines.push('')
    lines.push(...this.workspace.renderElementsToMdxLines(element.children))

    return lines
  }
}

export class DocS4TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractDocSect4Type): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '')
    if (title.length > 0) {
      lines.push('')
      lines.push(`#### ${title}`)
    }
    lines.push('')
    lines.push(...this.workspace.renderElementsToMdxLines(element.children))

    return lines
  }
}

export class DocS5TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractDocSect5Type): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '')
    if (title.length > 0) {
      lines.push('')
      lines.push(`##### ${title}`)
    }
    lines.push('')
    lines.push(...this.workspace.renderElementsToMdxLines(element.children))

    return lines
  }
}

export class DocS6TypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractDocSect6Type): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '')
    if (title.length > 0) {
      lines.push('')
      lines.push(`###### ${title}`)
    }

    lines.push('')
    lines.push(...this.workspace.renderElementsToMdxLines(element.children))

    return lines
  }
}

// ----------------------------------------------------------------------------
