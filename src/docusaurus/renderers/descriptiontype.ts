/* eslint-disable @typescript-eslint/no-unused-vars */
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

import assert from 'node:assert'
import util from 'node:util'

import {
  ElementLinesRendererBase,
  ElementStringRendererBase,
} from './element-renderer-base.js'
import {
  AbstractDocAnchorType,
  type AbstractDocBlockQuoteType,
  AbstractDocEmptyType,
  AbstractDocFormulaType,
  type AbstractDocHeadingType,
  AbstractDocImageType,
  AbstractDocMarkupType,
  type AbstractDocParamListType,
  type AbstractDocParaType,
  AbstractDocRefTextType,
  type AbstractDocSimpleSectType,
  AbstractDocURLLink,
  AbstractEmojiType,
  type AbstractPreformattedType,
  type AbstractSpType,
  type AbstractVerbatimType,
  ParameterNameDataModel,
  ParameterTypeDataModel,
  type AbstractDescriptionType,
  HrulerDataModel,
} from '../../doxygen/data-model/compounds/descriptiontype-dm.js'
import { AbstractRefTextType } from '../../doxygen/data-model/compounds/reftexttype-dm.js'
import {
  getPermalinkAnchor,
  isUrl,
  stripLeadingAndTrailingNewLines,
} from '../utils.js'
import {
  AbstractDocHtmlOnlyType,
  LatexOnlyDataModel,
  ManOnlyDataModel,
  RtfOnlyDataModel,
  XmlOnlyDataModel,
} from '../../doxygen/data-model/compounds/compounddef-dm.js'
import { renderParagraphs } from '../cli-options.js'
import { AbstractDataModelBase } from '../../doxygen/data-model/types.js'

// ----------------------------------------------------------------------------

export class DescriptionTypeLinesRenderer extends ElementLinesRendererBase {
  renderToLines(element: AbstractDescriptionType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.title !== undefined && element.title.length > 0) {
      console.error('title ignored in', element.constructor.name)
    }

    const lines: string[] = []
    lines.push(
      ...this.workspace.renderElementsArrayToLines(element.children, type)
    )

    return lines
  }
}

// ----------------------------------------------------------------------------

export class DocParaTypeLinesRenderer extends ElementLinesRendererBase {
  renderToLines(element: AbstractDocParaType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))
    // console.log(element)

    const lines: string[] = []

    let inParagraph = false
    let text = ''
    assert(element.children !== undefined)
    for (const child of element.children) {
      // console.log(child)
      if (this.isParagraph(child)) {
        inParagraph = true
        text += this.workspace.renderElementToString(
          child,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          renderParagraphs ? 'html' : type
        )
      } else {
        if (inParagraph) {
          text = text.trim()
          // console.log(text)
          if (text.length > 0) {
            lines.push('')
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if ((element.skipPara ?? false) || !renderParagraphs) {
              lines.push(text)
            } else {
              lines.push(`<p>${text}</p>`)
              lines.push('')
            }
          }
          inParagraph = false
          text = ''
        }
        lines.push(...this.workspace.renderElementToLines(child, type))
      }
    }

    if (inParagraph) {
      text = text.trim()
      // console.log(text)
      if (text.length > 0) {
        lines.push('')
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if ((element.skipPara ?? false) || !renderParagraphs) {
          lines.push(text)
        } else {
          lines.push(`<p>${text}</p>`)
          lines.push('')
        }
      }
    }

    // console.log(lines)
    return lines
  }

  // docCmdGroup: 2109

  isParagraph(element: string | AbstractDataModelBase): boolean {
    if (typeof element === 'string') {
      return true
    } else if (element instanceof HrulerDataModel) {
      return false // Explicitly not inside a paragraph.
      // } else if (element instanceof LineBreakDataModel) {
      //   return false // Explicitly not inside a paragraph.
    } else if (element instanceof AbstractDocHtmlOnlyType) {
      return false // Explicitly not inside a paragraph.
    } else if (element instanceof ManOnlyDataModel) {
      return false // Explicitly not inside a paragraph.
    } else if (element instanceof XmlOnlyDataModel) {
      return false // Explicitly not inside a paragraph.
    } else if (element instanceof RtfOnlyDataModel) {
      return false // Explicitly not inside a paragraph.
    } else if (element instanceof LatexOnlyDataModel) {
      return false // Explicitly not inside a paragraph.
    } else if (element instanceof AbstractDocURLLink) {
      return true
    } else if (element instanceof AbstractDocMarkupType) {
      return true
    } else if (element instanceof AbstractDocImageType) {
      return true
      // Not defined yet.
      //  <xsd:element name="dot" type="docDotMscType" />
      //  <xsd:element name="msc" type="docDotMscType" />
      //  <xsd:element name="plantuml" type="docPlantumlType" />
    } else if (element instanceof AbstractDocAnchorType) {
      return true
    } else if (element instanceof AbstractDocFormulaType) {
      return true
    } else if (element instanceof AbstractDocRefTextType) {
      return true
    } else if (element instanceof AbstractEmojiType) {
      return true
    } else if (element instanceof AbstractDocEmptyType) {
      return true
    }

    // The rest, from "programlisting" on, are not paragraphs.
    return false
  }
}

// ----------------------------------------------------------------------------

export class DocURLLinkStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractDocURLLink, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    text += `<a href="${element.url}">`
    text += this.workspace.renderElementsArrayToString(element.children, type)
    text += '</a>'

    return text
  }
}

// ----------------------------------------------------------------------------

const htmlElements: Record<string, string> = {
  BoldDataModel: 'b',
  EmphasisDataModel: 'em',
  UnderlineDataModel: 'u',
  SubscriptDataModel: 'sub',
  SuperscriptDataModel: 'sup',
}

export class DocMarkupTypeStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractDocMarkupType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const htmlElement: string | undefined =
      htmlElements[element.constructor.name]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (htmlElement === undefined) {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error(
        element.constructor.name,
        'not yet rendered in',
        this.constructor.name
      )
      return ''
    }

    let text = ''
    text += `<${htmlElement}>`
    text += this.workspace.renderElementsArrayToString(element.children, type)
    text += `</${htmlElement}>`

    return text
  }
}

export class ComputerOutputDataModelStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractDocMarkupType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''

    // Cannot use `...` since it may include html code (like <a>).
    // Cannot use <code> since Docusaurus renders it as a block if it includes
    // other elements like <a>.
    text += '<span class="doxyComputerOutput">'
    // Inherit type, do not use 'html' since Docusaurus may parse
    // it as markdown.
    text += this.workspace.renderElementsArrayToString(element.children, type)
    text += '</span>'

    return text
  }
}

// ----------------------------------------------------------------------------

export class DocRefTextTypeStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractDocRefTextType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.external !== undefined && element.external.length > 0) {
      console.error('external ignored in', element.constructor.name)
    }

    let text = ''

    let permalink: string | undefined = undefined

    if (element.refid.length > 0) {
      permalink = this.workspace.getPermalink({
        refid: element.refid,
        kindref: element.kindref,
      })
    }

    if (permalink !== undefined && permalink.length > 1) {
      text += `<a href="${permalink}">`
      text += this.workspace.renderElementsArrayToString(element.children, type)
      text += '</a>'
    } else {
      text += this.workspace.renderElementsArrayToString(element.children, type)
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

export class DocSimpleSectTypeLinesRenderer extends ElementLinesRendererBase {
  renderToLines(element: AbstractDocSimpleSectType, type: string): string[] {
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
      remark: 'Remarks',
      // attention: -> :::danger
      // important: -> :::tip
      // par: - paragraph with custom title
      // rcs: - apparently ignored
    }

    lines.push('')
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (DoxSimpleSectKind[element.kind] !== undefined) {
      const { kind } = element

      const title = DoxSimpleSectKind[kind]
      const body = this.workspace
        .renderElementsArrayToString(element.children, 'html')
        .trim()
      lines.push('<dl class="doxySectionUser">')
      lines.push(`<dt>${title}</dt>`)
      if (body.length === 0) {
        lines.push('<dd></dd>')
      } else {
        if (!body.includes('\n')) {
          lines.push(`<dd>${body}</dd>`)
        } else {
          lines.push('<dd>')
          lines.push(...body.split('\n'))
          lines.push('</dd>')
        }
      }
      lines.push('</dl>')
    } else if (element.kind === 'par') {
      assert(element.title !== undefined)
      const title = element.title.replace(/\.$/, '')
      const body = this.workspace
        .renderElementsArrayToString(element.children, 'html')
        .trim()
      lines.push('<dl class="doxySectionUser">')
      lines.push(`<dt>${title}</dt>`)
      if (body.length === 0) {
        lines.push('<dd></dd>')
      } else {
        if (!body.includes('\n')) {
          lines.push(`<dd>${body}</dd>`)
        } else {
          lines.push('<dd>')
          lines.push(...body.split('\n'))
          lines.push('</dd>')
        }
      }
      lines.push('</dl>')
    } else if (element.kind === 'note') {
      // https://docusaurus.io/docs/markdown-features/admonitions
      lines.push('')
      lines.push(':::info')
      lines.push(
        this.workspace
          .renderElementToString(
            element.children,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            renderParagraphs ? 'html' : 'markdown'
          )
          .trim()
      )
      lines.push(':::')
    } else if (element.kind === 'warning') {
      lines.push('')
      lines.push(':::warning')
      // console.log(util.inspect(element, { compact: false, depth: 999 }))
      lines.push(
        this.workspace
          .renderElementToString(
            element.children,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            renderParagraphs ? 'html' : 'markdown'
          )
          .trim()
      )
      lines.push(':::')
    } else if (element.kind === 'attention') {
      lines.push('')
      lines.push(':::danger')
      lines.push(
        this.workspace
          .renderElementToString(
            element.children,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            renderParagraphs ? 'html' : 'markdown'
          )
          .trim()
      )
      lines.push(':::')
    } else if (element.kind === 'important') {
      lines.push('')
      lines.push(':::tip')
      lines.push(
        this.workspace
          .renderElementToString(
            element.children,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            renderParagraphs ? 'html' : 'markdown'
          )
          .trim()
      )
      lines.push(':::')
    } else {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error(
        element.constructor.name,
        'kind',
        element.kind,
        'not yet rendered in',
        this.constructor.name
      )
    }
    lines.push('')

    return lines
  }
}

// ----------------------------------------------------------------------------

export class SpTypeStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractSpType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    let spaces = 1

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

export class DocEmptyTypeStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractDocEmptyType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''

    switch (element.constructor.name) {
      case 'HrulerDataModel':
        text += '\n'
        text += '<hr/>'
        text += '\n'
        break

      case 'LineBreakDataModel':
        text += '\n'
        text += '<br/>'
        break

      case 'NonBreakableSpaceDataModel':
        text += '&nbsp;'
        break

      default:
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(
          element.constructor.name,
          'not yet rendered in',
          this.constructor.name
        )
    }

    return text
  }
}

// ----------------------------------------------------------------------------

export class DocParamListTypeLinesRenderer extends ElementLinesRendererBase {
  renderToLines(element: AbstractDocParamListType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    if (element.parameterItems !== undefined) {
      const titlesByKind: Record<string, string> = {
        templateparam: 'Template Parameters',
        retval: 'Return Values',
        param: 'Parameters',
        exception: 'Exceptions',
      }

      const { kind } = element

      const title = titlesByKind[kind]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (title === undefined) {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(
          element.constructor.name,
          'kind',
          kind,
          'not yet rendered in',
          this.constructor.name
        )
      }

      switch (element.constructor.name) {
        case 'ParameterListDataModel':
          lines.push('')
          lines.push('<dl class="doxyParamsList">')
          lines.push(`<dt class="doxyParamsTableTitle">${title}</dt>`)
          lines.push('<dd>')
          lines.push('<table class="doxyParamsTable">')

          for (const parameterItem of element.parameterItems) {
            // console.log(util.inspect(parameterItem,
            // { compact: false, depth: 999 }))

            const names: string[] = []
            if (parameterItem.parameterNameList !== undefined) {
              for (const parameterName of parameterItem.parameterNameList) {
                // console.log(util.inspect(parameterName.children,
                // { compact: false, depth: 999 }))
                assert(parameterName.children !== undefined)
                for (const child of parameterName.children) {
                  assert(child instanceof AbstractDataModelBase)
                  assert(child.children !== undefined)
                  for (const subChild of child.children) {
                    if (typeof subChild === 'string') {
                      if (child instanceof ParameterNameDataModel) {
                        if (child.direction !== undefined) {
                          names.push(`[${child.direction}] ${subChild}`)
                        } else {
                          names.push(subChild)
                        }
                      } else if (child instanceof ParameterTypeDataModel) {
                        console.error(
                          util.inspect(parameterName.children, {
                            compact: false,
                            depth: 999,
                          })
                        )
                        console.error(
                          element.constructor.name,
                          'ParameterType not yet rendered in',
                          this.constructor.name
                        )
                      } else {
                        names.push(subChild)
                      }
                    } else if (subChild instanceof AbstractRefTextType) {
                      const name = this.workspace.renderElementToString(
                        subChild,
                        'html'
                      )
                      names.push(name)
                    } else {
                      console.error(
                        util.inspect(subChild, { compact: false, depth: 999 })
                      )
                      console.error(
                        element.constructor.name,
                        'sub child not yet rendered in',
                        this.constructor.name
                      )
                    }
                  }
                }
              }
            }

            const parameters = this.workspace
              .renderElementToString(parameterItem.parameterDescription, 'html')
              .trim()
            const escapedName = this.workspace.renderString(
              names.join(', '),
              'html'
            )
            lines.push('<tr class="doxyParamItem">')
            lines.push(`<td class="doxyParamItemName">${escapedName}</td>`)
            lines.push(
              `<td class="doxyParamItemDescription">${parameters}</td>`
            )
            lines.push('</tr>')
          }
          lines.push('</table>')
          lines.push('</dd>')
          lines.push('</dl>')

          break

        default:
          console.error(util.inspect(element, { compact: false, depth: 999 }))
          console.error(
            element.constructor.name,
            'not yet rendered in',
            this.constructor.name
          )
      }
    }

    return lines
  }
}

// ----------------------------------------------------------------------------

export class DocAnchorTypeLinesRenderer extends ElementLinesRendererBase {
  renderToLines(element: AbstractDocAnchorType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const anchor = getPermalinkAnchor(element.id)
    lines.push(`<a id="${anchor}"></a>`)

    return lines
  }
}

// ----------------------------------------------------------------------------

export class VerbatimStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractVerbatimType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''

    text += '\n'

    // Docusaurus adds the copy button.
    // The content must be on the same line.
    text += '\n'
    text += '<pre><code>'
    text += stripLeadingAndTrailingNewLines(
      this.workspace.renderElementsArrayToString(element.children, 'html')
    )
    text += '\n'
    text += '</code></pre>'
    text += '\n'
    // text += '\n'

    return text
  }
}

export class PreformattedStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractPreformattedType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''

    text += '\n'

    // Docusaurus adds the copy button.
    // The content must be on the same line.
    text += '\n'
    text += '<pre><code>'
    text += stripLeadingAndTrailingNewLines(
      this.workspace.renderElementsArrayToString(element.children, 'html')
    )
    text += '\n'
    text += '</code></pre>'
    text += '\n'
    // text += '\n'

    return text
  }
}

// ----------------------------------------------------------------------------

export class FormulaStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractDocFormulaType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''

    const formula = this.workspace.renderString(element.text, 'html')
    if (this.workspace.options.verbose) {
      console.warn('LaTeX formula', formula, 'not rendered properly')
    }

    // element.id is ignored.
    // Docusaurus renders it as a div with copy button.
    text += `<code>${formula}</code>`

    return text
  }
}

// ----------------------------------------------------------------------------

export class ImageStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractDocImageType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    if (element.type === 'html') {
      text += '\n'
      text += '<figure>\n'
      text += '  <img'
      if (element.name !== undefined) {
        const { name } = element
        let imageSrc = ''
        if (isUrl(name)) {
          imageSrc = name
        } else {
          imageSrc = this.workspace.options.baseUrl
          imageSrc += this.workspace.options.imagesFolderPath
          imageSrc += '/'
          imageSrc += name
        }
        text += ` src="${imageSrc}"`
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
      if (element.inline?.valueOf() ?? false) {
        text += ' class="inline"'
      }
      text += '></img>'
      if (element.caption !== undefined) {
        const elementCaptionHtml = this.workspace.renderString(
          element.caption,
          'html'
        )
        text += '\n'
        text += `  <figcaption>${elementCaptionHtml}</figcaption>`
      } else if (element.children !== undefined) {
        const caption = this.workspace
          .renderElementsArrayToString(element.children, 'html')
          .trim()
        if (caption.length > 0) {
          text += '\n'
          text += `  <figcaption>${caption}</figcaption>`
        }
      }
      text += '\n'
      text += '</figure>'
    } else if (element.type === 'latex') {
      // Skipped, no LaTeX images rendered.
    } else {
      console.error(
        'Image type',
        element.type,
        'not rendered in',
        this.constructor.name
      )
    }
    return text
  }
}

// ----------------------------------------------------------------------------

export class HtmlOnlyStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractDocHtmlOnlyType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    text += this.workspace.renderString(element.text, 'text')

    return text
  }
}

// ----------------------------------------------------------------------------

export class HeadingLinesRenderer extends ElementLinesRendererBase {
  renderToLines(element: AbstractDocHeadingType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    if (element.level === 1) {
      if (this.workspace.options.verbose) {
        console.warn('Level 1 Heading interferes with Docusaurus pages')
      }
    }
    lines.push('')

    let text = ''
    text += '#'.repeat(element.level)
    text += ' '
    text += this.workspace.renderElementsArrayToString(
      element.children,
      'markdown'
    )
    lines.push(text)

    return lines
  }
}

// ----------------------------------------------------------------------------

export class EmojiStringRenderer extends ElementStringRendererBase {
  renderToString(element: AbstractEmojiType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    // <span class="emoji">&#x1f604;</span>
    text += `<span class="doxyEmoji">${element.unicode}</span>}`

    return text
  }
}

// ----------------------------------------------------------------------------

export class BlockquoteLinesRenderer extends ElementLinesRendererBase {
  renderToLines(element: AbstractDocBlockQuoteType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []
    lines.push('<blockquote class="doxyBlockQuote">')
    lines.push(
      ...this.workspace.renderElementsArrayToLines(element.children, 'html')
    )
    lines.push('</blockquote>')

    return lines
  }
}

// ----------------------------------------------------------------------------
