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
import { ElementLinesGeneratorBase } from './element-generator-base.js'

// ----------------------------------------------------------------------------

export class ListingTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractListingType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    let text = ''
    text += '<ProgramListing'
    if (element.filename !== undefined && element.filename.length > 0) {
      const extension = element.filename.replace('.', '')
      text += ` extension="${extension}"`
    }
    text += '>'
    lines.push(text)

    lines.push(...this.workspace.renderElementsToMdxLines(element.codelines))

    lines.push('</ProgramListing>')

    return lines
  }
}

export class CodeLineTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractCodeLineType): string[] {
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

    const lines: string[] = []

    if (element.lineno !== undefined) {
      const anchor = `l${element.lineno.toString().padStart(5, '0')}`
      lines.push(`<Link id="${anchor}" />`)
    }

    let text = ''
    text += '<CodeLine'
    if (element.lineno !== undefined) {
      text += ` lineNumber="${element.lineno.toString()}"`
    }
    if (permalink !== undefined) {
      text += ` lineLink="${permalink}"`
    }
    text += '>'
    lines.push(text)

    lines.push(...this.workspace.renderElementsToMdxLines(element.highlights))

    lines.push('</CodeLine>')

    return lines
  }
}

export class HighlightTypeGenerator extends ElementLinesGeneratorBase {
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

  renderToMdxLines (element: AbstractHighlightType): string[] {
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
