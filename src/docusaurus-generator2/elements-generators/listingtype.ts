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
import util from 'util'
import { AbstractCodeLineType, CodeLineDataModel, AbstractHighlightType, HighlightDataModel, AbstractListingType } from '../../data-model/compounds/descriptiontype-dm.js'
import { ElementLinesRendererBase } from './element-renderer-base.js'

// ----------------------------------------------------------------------------

export class ListingTypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractListingType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    let text = ''
    text += '\n'
    text += '<ProgramListing'
    if (element.filename !== undefined && element.filename.length > 0) {
      const extension = element.filename.replace('.', '')
      text += ` extension="${extension}"`
    }
    text += '>'
    lines.push(text)

    lines.push('')
    lines.push(...this.workspace.renderElementsToMdxLines(element.codelines))

    lines.push('')
    lines.push('</ProgramListing>')

    return lines
  }
}

export class CodeLineTypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractCodeLineType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))
    assert(element instanceof CodeLineDataModel)

    if (element.external !== undefined) {
      console.error('external ignored in', element.constructor.name)
    }

    let permalink: string | undefined
    if (element.refid !== undefined && element.refkind !== undefined) {
      permalink = this.workspace.getPermalink({
        refid: element.refid,
        kindref: element.refkind
      })
    }

    let text = ''

    if (element.lineno !== undefined) {
      const anchor = `l${element.lineno.toString().padStart(5, '0')}`
      text += `<Link id="${anchor}" />`
    }

    text += '<CodeLine'
    if (element.lineno !== undefined) {
      text += ` lineNumber="${element.lineno.toString()}"`
    }
    if (permalink !== undefined) {
      text += ` lineLink="${permalink}"`
    }
    text += '>'

    text += this.workspace.renderElementsToMdxText(element.highlights)

    text += '</CodeLine>'

    return [text]
  }
}

export class HighlightTypeLinesRenderer extends ElementLinesRendererBase {
  knownClasses = [
    'normal',
    'comment',
    'preprocessor',
    'keyword',
    'keywordtype',
    'keywordflow',
    'token',
    'stringliteral',
    'charliteral'
  ]

  override renderToMdxLines (element: AbstractHighlightType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))
    assert(element instanceof HighlightDataModel)

    let kind = element.classs
    if (!this.knownClasses.includes(element.classs)) {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error(element.classs, 'not implemented yet in', this.constructor.name)
      kind = 'normal'
    }

    let text = ''

    text += `<Highlight kind="${kind}">`
    text += this.workspace.renderElementsToMdxText(element.children)
    text += '</Highlight>'

    return [text]
  }
}

// ----------------------------------------------------------------------------
