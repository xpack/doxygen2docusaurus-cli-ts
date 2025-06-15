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
import { AbstractDescriptionType, AbstractDocAnchorType, AbstractDocEmptyType, AbstractDocFormulaType, AbstractDocHeadingType, AbstractDocImageType, AbstractDocMarkupType, AbstractDocParamListType, AbstractDocParaType, AbstractDocRefTextType, AbstractDocSimpleSectType, AbstractDocURLLink, AbstractSpType, AbstractVerbatimType, ParaDataModel, ParameterNameDataModel, ParameterTypeDataModel } from '../../data-model/compounds/descriptiontype-dm.js'
import { AbstractRefTextType } from '../../data-model/compounds/reftexttype-dm.js'
import { escapeHtml, escapeQuotes, getPermalinkAnchor } from '../utils.js'
import { AbstractDocHtmlOnlyType } from '../../data-model/compounds/compounddef-dm.js'

// ----------------------------------------------------------------------------

export class DescriptionTypeStringRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDescriptionType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.title !== undefined && element.title.length > 0) {
      console.error('title ignored in', element.constructor.name)
    }

    let text = ''
    text += this.workspace.renderElementsArrayToString(element.children).trim()

    // console.log(result)
    return text
  }
}

// ----------------------------------------------------------------------------

export class DocParaTypeStringRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocParaType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text: string = ''
    text += this.workspace.renderElementsArrayToString(element.children)
    if (element instanceof ParaDataModel) {
      text += '\n'
    }

    return text
  }
}

// ----------------------------------------------------------------------------

export class DocURLLinkStringRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocURLLink): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    text += `<a href="${element.url}">`
    text += this.workspace.renderElementsArrayToString(element.children)
    text += '</a>'

    return text
  }
}

// ----------------------------------------------------------------------------

const htmlElements: { [key: string]: string } = {
  BoldDataModel: 'b',
  ComputerOutputDataModel: 'code',
  EmphasisDataModel: 'em',
  UnderlineDataModel: 'u'
}

export class DocMarkupTypeStringRenderer extends ElementTextRendererBase {
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
    text += this.workspace.renderElementsArrayToString(element.children)
    text += `</${htmlElement}>`

    return text
  }
}

// ----------------------------------------------------------------------------

export class DocRefTextTypeStringRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocRefTextType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.external !== undefined && element.external.length > 0) {
      console.error('external ignored in', element.constructor.name)
    }

    let text = ''

    let permalink

    if (element.refid.length > 0) {
      permalink = this.workspace.getPermalink({
        refid: element.refid,
        kindref: element.kindref
      })
    }

    if (permalink !== undefined && permalink.length > 1) {
      text += `<a href="${permalink}">`
      text += this.workspace.renderElementsArrayToString(element.children)
      text += '</a>'
    } else {
      text += this.workspace.renderElementsArrayToString(element.children)
    }

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

export class DocSimpleSectTypeStringRenderer extends ElementTextRendererBase {
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
      lines.push(this.workspace.renderElementsArrayToString(element.children).trim())
      lines.push('</SectionUser>')
    } else if (element.kind === 'par') {
      assert(element.title !== undefined)
      const title = element.title.replace(/\.$/, '')
      lines.push(`<SectionUser title="${title}">`)
      lines.push(this.workspace.renderElementsArrayToString(element.children).trim())
      lines.push('</SectionUser>')
    } else if (element.kind === 'note') {
      // https://docusaurus.io/docs/markdown-features/admonitions
      lines.push(':::info')
      lines.push(this.workspace.renderElementToString(element.children).trim())
      lines.push(':::')
    } else if (element.kind === 'warning') {
      lines.push(':::warning')
      lines.push(this.workspace.renderElementToString(element.children).trim())
      lines.push(':::')
    } else if (element.kind === 'attention') {
      lines.push(':::danger')
      lines.push(this.workspace.renderElementToString(element.children).trim())
      lines.push(':::')
    } else if (element.kind === 'important') {
      lines.push(':::tip')
      lines.push(this.workspace.renderElementToString(element.children).trim())
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

export class SpTypeStringRenderer extends ElementTextRendererBase {
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

export class DocEmptyTypeStringRenderer extends ElementTextRendererBase {
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

export class DocParamListTypeStringRenderer extends ElementTextRendererBase {
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
                      const name = this.workspace.renderElementToString(subChild)
                      names.push(name)
                    } else {
                      console.error(util.inspect(subChild, { compact: false, depth: 999 }))
                      console.error(element.constructor.name, 'sub child not yet rendered in', this.constructor.name)
                    }
                  }
                }
              }
            }

            const parameterLines = this.workspace.renderElementToString(parameterItem.parameterDescription).split('\n')
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

export class VerbatimStringRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractVerbatimType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    text += '\n' // This is to end the previous line
    text += '\n' // This is an empty line for aesthetics.
    text += '<CodeBlock>\n'
    text += this.workspace.renderElementToString(element.text)
    text += '</CodeBlock>'

    return text
  }
}

// ----------------------------------------------------------------------------

export class FormulaStringRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocFormulaType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    text += '<CodeBlock>'
    // element.id is ignored.
    text += this.workspace.renderElementToString(element.text)
    text += '</CodeBlock>'

    return text
  }
}

// ----------------------------------------------------------------------------

export class ImageStringRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocImageType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    if (element.type === 'html') {
      text += '\n'
      text += '<figure>'
      text += '  <img'
      if (element.name !== undefined) {
        text += ` src="${element.name}"`
      }
      if (element.width !== undefined) {
        text += ` width="${element.width}"`
      }
      if (element.height !== undefined) {
        text += ` height="${element.height}"`
      }
      if (element.alt !== undefined) {
        text += ` alt="${element.alt}"`
      }
      if (element.inline?.valueOf()) {
        text += ' class="inline"'
      }
      text += ' />'
      if (element.caption !== undefined) {
        text += '\n'
        text += `  <figcaption>${escapeHtml(element.caption)}</figcaption>`
      }
      text += '\n'
      text += '</figure>'
    } else {
      console.error('Image type', element.type, 'not rendered in', this.constructor.name)
    }
    return text
  }
}

// ----------------------------------------------------------------------------

export class HtmlOnlyStringRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocHtmlOnlyType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    text += this.workspace.renderElementToString(element.text, 'unchanged')

    return text
  }
}

// ----------------------------------------------------------------------------

export class HeadingStringRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocHeadingType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    if (element.level === 1) {
      if (this.workspace.pluginOptions.verbose) {
        console.warn('Level 1 Heading interferes with Docusaurus pages')
      }
    }
    text += '\n'
    text += '#'.repeat(element.level)
    text += ' '
    text += this.workspace.renderElementsArrayToString(element.children)

    return text
  }
}

// ----------------------------------------------------------------------------
