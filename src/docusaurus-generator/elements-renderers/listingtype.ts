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

import { AbstractCodeLineType, CodeLineDataModel, AbstractHighlightType, HighlightDataModel, AbstractListingTypeBase, MemberProgramListingDataModel } from '../../data-model/compounds/descriptiontype-dm.js'
import { ElementLinesRendererBase } from './element-renderer-base.js'
import { Workspace } from '../workspace.js'

// ----------------------------------------------------------------------------

export class ListingTypeLinesRenderer extends ElementLinesRendererBase {
  override renderToLines (element: AbstractListingTypeBase, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.codelines === undefined) {
      return []
    }

    let showAnchor: boolean = true
    if (element instanceof MemberProgramListingDataModel) {
      showAnchor = false
    }

    const lines: string[] = []

    lines.push('')
    lines.push('<div class="doxyProgramListing">')

    lines.push('')
    for (const codeline of element.codelines) {
      // Explicit type, since it may come from a markdown environment,
      // like in the Doxygen docblocks page.
      lines.push(renderCodeLinesToString(this.workspace, codeline, 'html', showAnchor))
    }

    lines.push('')
    lines.push('</div>')
    lines.push('')

    return lines
  }
}

function renderCodeLinesToString (workspace: Workspace, element: AbstractCodeLineType, type: string, showAnchor: boolean): string {
  // console.log(util.inspect(element, { compact: false, depth: 999 }))
  assert(element instanceof CodeLineDataModel)

  if (element.external !== undefined) {
    console.error('external ignored in', element.constructor.name)
  }

  let permalink: string | undefined
  if (element.refid !== undefined && element.refkind !== undefined) {
    permalink = workspace.getPermalink({
      refid: element.refid,
      kindref: element.refkind
    })
  }

  let text = ''

  text += '<div class="doxyCodeLine">'
  if (element.lineno !== undefined) {
    text += '<span class="doxyLineNumber">'
    const anchor = `l${element.lineno.toString().padStart(5, '0')}`
    if (showAnchor) {
      text += `<a id="${anchor}"></a>`
    }
    if (permalink !== undefined) {
      text += `<a href="${permalink}">${element.lineno.toString()}</a>`
    } else {
      text += element.lineno.toString()
    }
    text += '</span>'
  } else {
    text += '<span class="doxyNoLineNumber">&nbsp;</span>'
  }

  if (type !== 'html') {
    console.log('Expecting html type')
  }
  const content = workspace.renderElementsArrayToString(element.highlights, type)
  if (content.length > 0) {
    text += `<span class="doxyLineContent">${content}</span>`
  }
  text += '</div>'

  return text
}

// Optimise this to directly generate plain html, to save the compiler/bundler
// a lot of efforts, since the file references are very large.
export class HighlightTypeLinesRenderer extends ElementLinesRendererBase {
  knownClasses: Record<string, string> = {
    normal: 'doxyHighlight',
    charliteral: 'doxyHighlightCharLiteral',
    comment: 'doxyHighlightComment',
    preprocessor: 'doxyHighlightPreprocessor',
    keyword: 'doxyHighlightKeyword',
    keywordtype: 'doxyHighlightKeywordType',
    keywordflow: 'doxyHighlightKeywordFlow',
    token: 'doxyHighlightToken',
    stringliteral: 'doxyHighlightStringLiteral',
    vhdlchar: 'doxyHighlightVhdlChar',
    vhdlkeyword: 'doxyHighlightVhdlKeyword',
    vhdllogic: 'doxyHighlightVhdlLogic'
  }

  override renderToLines (element: AbstractHighlightType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))
    assert(element instanceof HighlightDataModel)

    let spanClass = this.knownClasses[element.classs]
    if (spanClass === undefined) {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error(element.classs, 'not implemented yet in', this.constructor.name)
      spanClass = 'doxyHighlight'
    }

    let text = ''

    assert(element.children !== undefined)
    if (element.children.length > 0) {
      text += `<span class="${spanClass}">`
      text += this.workspace.renderElementsArrayToString(element.children, type)
      text += '</span>'
    }

    return [text]
  }
}

// ----------------------------------------------------------------------------
