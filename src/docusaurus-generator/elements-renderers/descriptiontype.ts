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

import { ElementLinesRendererBase, ElementTextRendererBase } from './element-renderer-base.js'
import { AbstractDescriptionType, AbstractDocAnchorType, AbstractDocEmptyType, AbstractDocMarkupType, AbstractDocParamListType, AbstractDocParaType, AbstractDocRefTextType, AbstractDocSimpleSectType, AbstractDocURLLink, AbstractSpType, ParaDataModel, ParameterNameDataModel, ParameterTypeDataModel } from '../../data-model/compounds/descriptiontype-dm.js'
import { AbstractRefTextType } from '../../data-model/compounds/reftexttype-dm.js'
import { escapeQuotes, getPermalinkAnchor } from '../utils.js'

// ----------------------------------------------------------------------------

export class DescriptionTypeTextRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDescriptionType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.title !== undefined && element.title.length > 0) {
      console.error('title ignored in', element.constructor.name)
    }

    let text = ''
    text += this.workspace.renderElementsToMdxText(element.children).trim()

    // console.log(result)
    return text
  }
}

// ----------------------------------------------------------------------------

export class DocParaTypeTextRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocParaType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text: string = ''
    text += this.workspace.renderElementsToMdxText(element.children)
    if (element instanceof ParaDataModel) {
      text += '\n'
    }

    return text
  }
}

// ----------------------------------------------------------------------------

export class DocURLLinkTextRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocURLLink): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    text += `<a href="${element.url}">`
    text += this.workspace.renderElementsToMdxText(element.children)
    text += '</a>'

    return text
  }
}

// ----------------------------------------------------------------------------

const htmlElements: { [key: string]: string } = {
  BoldDataModel: 'b',
  ComputerOutputDataModel: 'code',
  EmphasisDataModel: 'em'
}

export class DocMarkupTypeTextRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocMarkupType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const htmlElement: string | undefined = htmlElements[element.constructor.name]
    if (htmlElement === undefined) {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error(element.constructor.name, 'not yet rendered in', this.constructor.name)
      return ''
    }

    let text = ''
    text += `<${htmlElement}>`
    text += this.workspace.renderElementsToMdxText(element.children)
    text += `</${htmlElement}>`

    return text
  }
}

// ----------------------------------------------------------------------------

export class DocRefTextTypeTextRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocRefTextType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.external !== undefined && element.external.length > 0) {
      console.error('external ignored in', element.constructor.name)
    }

    let text = ''

    const permalink: string = this.workspace.getPermalink({
      refid: element.refid,
      kindref: element.kindref
    })

    assert(permalink !== undefined && permalink.length > 1)

    text += `<a href="${permalink}">`
    text += this.workspace.renderElementsToMdxText(element.children)
    text += '</a>'

    return text
  }
}

// ----------------------------------------------------------------------------

// <xsd:simpleType name="DoxSimpleSectKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="see" />
//     <xsd:enumeration value="return" />
//     <xsd:enumeration value="author" />
//     <xsd:enumeration value="authors" />
//     <xsd:enumeration value="version" />
//     <xsd:enumeration value="since" />
//     <xsd:enumeration value="date" />
//     <xsd:enumeration value="note" />
//     <xsd:enumeration value="warning" />
//     <xsd:enumeration value="pre" />
//     <xsd:enumeration value="post" />
//     <xsd:enumeration value="copyright" />
//     <xsd:enumeration value="invariant" />
//     <xsd:enumeration value="remark" />
//     <xsd:enumeration value="attention" />
//     <xsd:enumeration value="important" />
//     <xsd:enumeration value="par" />
//     <xsd:enumeration value="rcs" />
//   </xsd:restriction>
// </xsd:simpleType>

export class DocSimpleSectTypeTextRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocSimpleSectType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    // doxygen.git/src/translator_en.h
    const DoxSimpleSectKind: Record<string, string> = {
      see: 'See Also',
      return: 'Returns',
      author: 'Author',
      authors: 'Authors',
      version: 'Version',
      since: 'Since',
      date: 'Date',
      // note -> :::info (note is white in Docusaurus)
      // warning -> :::warning
      pre: 'Precondition',
      post: 'Postcondition',
      copyright: 'Copyright',
      invariant: 'Invariant',
      remark: 'Remarks'
      // attention: -> :::danger
      // important: -> :::tip
      // par: - paragraph with custom title
      // rcs: - apparently ignored
    }

    lines.push('')
    if (DoxSimpleSectKind[element.kind] !== undefined) {
      lines.push(`<SectionUser title="${DoxSimpleSectKind[element.kind]}">`)
      lines.push(this.workspace.renderElementsToMdxText(element.children).trim())
      lines.push('</SectionUser>')
    } else if (element.kind === 'par') {
      assert(element.title !== undefined)
      const title = element.title.replace(/\.$/, '')
      lines.push(`<SectionUser title="${title}">`)
      lines.push(this.workspace.renderElementsToMdxText(element.children).trim())
      lines.push('</SectionUser>')
    } else if (element.kind === 'note') {
      // https://docusaurus.io/docs/markdown-features/admonitions
      lines.push(':::info')
      lines.push(this.workspace.renderElementToMdxText(element.children).trim())
      lines.push(':::')
    } else if (element.kind === 'warning') {
      lines.push(':::warning')
      lines.push(this.workspace.renderElementToMdxText(element.children).trim())
      lines.push(':::')
    } else if (element.kind === 'attention') {
      lines.push(':::danger')
      lines.push(this.workspace.renderElementToMdxText(element.children).trim())
      lines.push(':::')
    } else if (element.kind === 'important') {
      lines.push(':::tip')
      lines.push(this.workspace.renderElementToMdxText(element.children).trim())
      lines.push(':::')
    } else {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error(element.constructor.name, 'kind', element.kind, 'not yet rendered in', this.constructor.name)
    }
    lines.push('')

    return lines.join('\n')
  }
}

// ----------------------------------------------------------------------------

export class SpTypeTextRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractSpType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text: string = ''
    let spaces: number = 1

    if (element.value !== undefined && element.value.valueOf() > 1) {
      spaces = element.value.valueOf()
    }

    for (let i = 0; i < spaces; i++) {
      text += ' '
    }

    return text
  }
}

// ----------------------------------------------------------------------------

export class DocEmptyTypeLinesRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocEmptyType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    switch (element.constructor.name) {
      case 'HrulerDataModel':
        lines.push('<hr/>')
        break

      case 'LineBreakDataModel':
        lines.push('\n')
        break

      default:
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(element.constructor.name, 'not yet rendered in', this.constructor.name)
    }

    return lines.join('\n')
  }
}

// ----------------------------------------------------------------------------

export class DocParamListTypeTextRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocParamListType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    if (element.parameterItems !== undefined) {
      const titlesByKind: Record<string, string> = {
        templateparam: 'Template Parameters',
        retval: 'Return Values',
        param: 'Parameters',
        exception: 'Exceptions'
      }

      const title = titlesByKind[element.kind]
      if (title === undefined) {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(element.constructor.name, 'kind', element.kind, 'not yet rendered in', this.constructor.name)
      }

      switch (element.constructor.name) {
        case 'ParameterListDataModel':
          lines.push('')
          lines.push(`<ParametersList title="${title}">`)
          for (const parameterItem of element.parameterItems) {
            // console.log(util.inspect(parameterItem, { compact: false, depth: 999 }))

            const names: string[] = []
            if (parameterItem.parameterNameList !== undefined) {
              for (const parameterName of parameterItem.parameterNameList) {
                // console.log(util.inspect(parameterName.children, { compact: false, depth: 999 }))
                for (const child of parameterName.children) {
                  for (const subChild of child.children) {
                    if (typeof subChild === 'string') {
                      if (child instanceof ParameterNameDataModel) {
                        if (child.direction !== undefined) {
                          names.push(`[${child.direction}] ${subChild}`)
                        } else {
                          names.push((subChild))
                        }
                      } else if (child instanceof ParameterTypeDataModel) {
                        console.error(util.inspect(parameterName.children, { compact: false, depth: 999 }))
                        console.error(element.constructor.name, 'ParameterType not yet rendered in', this.constructor.name)
                      } else {
                        names.push((subChild))
                      }
                    } else if (subChild instanceof AbstractRefTextType) {
                      const name = this.workspace.renderElementToMdxText(subChild)
                      names.push(name)
                    } else {
                      console.error(util.inspect(subChild, { compact: false, depth: 999 }))
                      console.error(element.constructor.name, 'sub child not yet rendered in', this.constructor.name)
                    }
                  }
                }
              }
            }

            const parameterLines = this.workspace.renderElementToMdxText(parameterItem.parameterDescription).split('\n')
            const escapedName = escapeQuotes(names.join(', '))
            if (parameterLines.length > 1) {
              lines.push(`<ParametersListItem name="${escapedName}">`)
              lines.push(...parameterLines)
              lines.push('</ParametersListItem>')
            } else {
              lines.push(`<ParametersListItem name="${escapedName}">${parameterLines[0]}</ParametersListItem>`)
            }
          }
          lines.push('</ParametersList>')
          break

        default:
          console.error(util.inspect(element, { compact: false, depth: 999 }))
          console.error(element.constructor.name, 'not yet rendered in', this.constructor.name)
      }
    }

    return lines.join('\n')
  }
}

// ----------------------------------------------------------------------------

export class DocAnchorTypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractDocAnchorType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const anchor = getPermalinkAnchor(element.id)
    lines.push(`<Link id="${anchor}" />`)

    return lines
  }
}

// ----------------------------------------------------------------------------
