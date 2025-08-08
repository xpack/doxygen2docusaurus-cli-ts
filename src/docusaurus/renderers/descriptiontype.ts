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

/**
 * Primary renderer for description type elements in documentation.
 *
 * @remarks
 * Handles the rendering of Doxygen description elements that contain
 * formatted text, converting them into appropriate output lines for
 * documentation generation. Supports both brief and detailed descriptions.
 *
 * @public
 */
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

/**
 * Renderer for Doxygen paragraph elements in documentation.
 *
 * @remarks
 * Handles the complex rendering of paragraph elements that can contain
 * mixed content including text, markup, links, and block-level elements.
 * Manages paragraph boundaries and applies appropriate HTML wrapping.
 *
 * @public
 */
export class DocParaTypeLinesRenderer extends ElementLinesRendererBase {
  /**
   * Renders a paragraph element to formatted output lines.
   *
   * @remarks
   * Processes child elements to determine paragraph boundaries and applies
   * appropriate HTML paragraph tags when enabled. Handles mixed content
   * including inline elements and block-level elements with proper spacing.
   *
   * @param element - The paragraph element to render
   * @param type - The rendering context type
   * @returns Array of formatted output lines with paragraph structure
   */
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

  /**
   * Determines if an element should be rendered within a paragraph context.
   *
   * @remarks
   * Classifies documentation elements as either inline (paragraph content)
   * or block-level elements. This classification controls whether elements
   * are wrapped in paragraph tags or rendered as standalone blocks.
   *
   * @param element - The element to classify
   * @returns True if the element should be rendered within a paragraph
   */
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

/**
 * Renderer for URL link elements in documentation.
 *
 * @remarks
 * Converts Doxygen URL link elements to HTML anchor tags with proper
 * href attributes. Processes child elements to generate the link text
 * content while preserving formatting.
 *
 * @public
 */
export class DocURLLinkStringRenderer extends ElementStringRendererBase {
  /**
   * Renders a URL link element to a formatted HTML anchor string.
   *
   * @remarks
   * Creates an HTML anchor element with the specified URL and renders
   * child elements as the link text content. Maintains proper link
   * structure for external and internal references.
   *
   * @param element - The URL link element to render
   * @param type - The rendering context type
   * @returns The formatted HTML anchor string
   */
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

/**
 * Renderer for text markup elements in documentation.
 *
 * @remarks
 * Handles common text formatting elements such as bold, emphasis, underline,
 * subscript, and superscript. Maps Doxygen markup types to appropriate
 * HTML elements for consistent text formatting.
 *
 * @public
 */
export class DocMarkupTypeStringRenderer extends ElementStringRendererBase {
  /**
   * Renders a markup element to a formatted HTML string.
   *
   * @remarks
   * Converts Doxygen markup elements to their corresponding HTML tags
   * and processes child content. Supports standard formatting elements
   * with error handling for unrecognised markup types.
   *
   * @param element - The markup element to render
   * @param type - The rendering context type
   * @returns The formatted HTML string with markup tags
   */
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

/**
 * Renderer for computer output or code text elements.
 *
 * @remarks
 * Formats text as computer output using CSS styling rather than code blocks.
 * Handles inline code formatting that may contain HTML elements while
 * maintaining compatibility with Docusaurus rendering.
 *
 * @public
 */
export class ComputerOutputDataModelStringRenderer extends ElementStringRendererBase {
  /**
   * Renders computer output text to a formatted HTML string.
   *
   * @remarks
   * Wraps content in a styled span element for computer output formatting.
   * Uses CSS classes instead of code blocks to handle mixed content
   * including HTML elements like anchors.
   *
   * @param element - The computer output element to render
   * @param type - The rendering context type
   * @returns The formatted HTML string with computer output styling
   */
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

/**
 * Renderer for reference text elements within descriptions.
 *
 * @remarks
 * Handles cross-references to other documentation elements by generating
 * appropriate links when permalinks are available. Provides fallback
 * text rendering for unresolved references.
 *
 * @public
 */
export class DocRefTextTypeStringRenderer extends ElementStringRendererBase {
  /**
   * Renders a reference text element to a formatted string with linking.
   *
   * @remarks
   * Creates HTML anchor tags for valid references with permalinks,
   * otherwise renders as plain text. Logs warnings for unsupported
   * external references that are not yet implemented.
   *
   * @param element - The reference text element to render
   * @param type - The rendering context type
   * @returns The formatted string with optional link
   */
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

/**
 * Renderer for simple section elements in documentation.
 *
 * @remarks
 * Handles various types of documentation sections including returns,
 * authors, notes, warnings, and custom sections. Maps section types
 * to appropriate HTML structures and Docusaurus admonitions.
 *
 * @public
 */
export class DocSimpleSectTypeLinesRenderer extends ElementLinesRendererBase {
  /**
   * Renders a simple section element to formatted output lines.
   *
   * @remarks
   * Converts Doxygen simple sections to HTML definition lists or
   * Docusaurus admonitions based on section type. Supports standard
   * sections like returns and notes, plus custom paragraph sections.
   *
   * @param element - The simple section element to render
   * @param type - The rendering context type
   * @returns Array of formatted output lines for the section
   */
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

/**
 * Renderer for space elements in documentation.
 *
 * @remarks
 * Handles spacing elements that insert a specified number of space
 * characters into the output. Supports both single spaces and
 * multiple space sequences for formatting control.
 *
 * @public
 */
export class SpTypeStringRenderer extends ElementStringRendererBase {
  /**
   * Renders a space element to a string of space characters.
   *
   * @remarks
   * Generates the specified number of space characters based on the
   * element's value attribute. Defaults to a single space if no
   * value is specified.
   *
   * @param element - The space element to render
   * @param type - The rendering context type (unused in implementation)
   * @returns String containing the specified number of spaces
   */
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

/**
 * Renderer for empty or structural elements in documentation.
 *
 * @remarks
 * Handles various empty elements that provide structural formatting
 * including horizontal rules, line breaks, and non-breakable spaces.
 * Maps element types to appropriate HTML equivalents.
 *
 * @public
 */
export class DocEmptyTypeStringRenderer extends ElementStringRendererBase {
  /**
   * Renders an empty element to its HTML equivalent.
   *
   * @remarks
   * Converts structural elements like horizontal rules and line breaks
   * to their corresponding HTML tags. Provides error handling for
   * unrecognised empty element types.
   *
   * @param element - The empty element to render
   * @param type - The rendering context type (unused in implementation)
   * @returns The formatted HTML string for the structural element
   */
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

/**
 * Renderer for parameter list elements in documentation.
 *
 * @remarks
 * Handles complex parameter documentation including template parameters,
 * function parameters, return values, and exceptions. Generates structured
 * HTML tables for organised parameter presentation.
 *
 * @public
 */
export class DocParamListTypeLinesRenderer extends ElementLinesRendererBase {
  /**
   * Renders a parameter list element to formatted output lines.
   *
   * @remarks
   * Creates HTML definition lists and tables for parameter documentation.
   * Processes parameter names, types, directions, and descriptions to
   * generate comprehensive parameter documentation with proper formatting.
   *
   * @param element - The parameter list element to render
   * @param type - The rendering context type
   * @returns Array of HTML strings forming the parameter documentation
   */
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

/**
 * Renderer for anchor elements in documentation.
 *
 * @remarks
 * Creates HTML anchor elements for cross-referencing within documents.
 * Generates sanitised anchor IDs that can be used for permalink
 * navigation and internal linking.
 *
 * @public
 */
export class DocAnchorTypeLinesRenderer extends ElementLinesRendererBase {
  /**
   * Renders an anchor element to formatted output lines.
   *
   * @remarks
   * Creates an HTML anchor element with a sanitised ID attribute
   * for use in permalink generation and cross-referencing within
   * the documentation.
   *
   * @param element - The anchor element to render
   * @param type - The rendering context type (unused in implementation)
   * @returns Array containing the HTML anchor element
   */
  renderToLines(element: AbstractDocAnchorType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const anchor = getPermalinkAnchor(element.id)
    lines.push(`<a id="${anchor}"></a>`)

    return lines
  }
}

// ----------------------------------------------------------------------------

/**
 * Renderer for verbatim text elements in documentation.
 *
 * @remarks
 * Handles verbatim text blocks that should be displayed exactly as
 * written without interpretation. Generates HTML pre and code elements
 * with proper formatting for code snippets and literal text.
 *
 * @public
 */
export class VerbatimStringRenderer extends ElementStringRendererBase {
  /**
   * Renders a verbatim element to formatted HTML code block.
   *
   * @remarks
   * Creates HTML pre and code elements for literal text display.
   * Strips leading and trailing newlines while preserving internal
   * formatting and enables copy functionality through Docusaurus.
   *
   * @param element - The verbatim element to render
   * @param type - The rendering context type
   * @returns The formatted HTML code block string
   */
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

/**
 * Renderer for preformatted text elements in documentation.
 *
 * @remarks
 * Similar to verbatim rendering but specifically for preformatted content.
 * Maintains exact spacing and formatting while providing HTML code block
 * structure compatible with Docusaurus features.
 *
 * @public
 */
export class PreformattedStringRenderer extends ElementStringRendererBase {
  /**
   * Renders a preformatted element to formatted HTML code block.
   *
   * @remarks
   * Creates HTML pre and code elements for preformatted text display.
   * Preserves exact formatting while stripping unnecessary newlines
   * and enabling Docusaurus copy button functionality.
   *
   * @param element - The preformatted element to render
   * @param type - The rendering context type
   * @returns The formatted HTML code block string
   */
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

/**
 * Renderer for mathematical formula elements in documentation.
 *
 * @remarks
 * Handles LaTeX mathematical formulae by converting them to HTML code
 * elements. Provides warnings for limited formula rendering capabilities
 * and maintains formula content for basic display.
 *
 * @public
 */
export class FormulaStringRenderer extends ElementStringRendererBase {
  /**
   * Renders a formula element to formatted HTML code.
   *
   * @remarks
   * Converts LaTeX formulae to HTML code elements with basic formatting.
   * Logs warnings about limited rendering capabilities and ignores
   * formula IDs while preserving mathematical content.
   *
   * @param element - The formula element to render
   * @param type - The rendering context type
   * @returns The formatted HTML code string containing the formula
   */
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

/**
 * Renderer for image elements in documentation.
 *
 * @remarks
 * Handles image rendering with support for various attributes including
 * dimensions, captions, and source URLs. Generates HTML figure elements
 * with proper image handling for both local and remote sources.
 *
 * @public
 */
export class ImageStringRenderer extends ElementStringRendererBase {
  /**
   * Renders an image element to formatted HTML figure.
   *
   * @remarks
   * Creates HTML figure and img elements with support for width, height,
   * alt text, captions, and inline styling. Handles both URL and local
   * image sources while skipping LaTeX-specific images.
   *
   * @param element - The image element to render
   * @param type - The rendering context type (unused in implementation)
   * @returns The formatted HTML figure string
   */
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

/**
 * Renderer for HTML-only content elements in documentation.
 *
 * @remarks
 * Handles content that should only appear in HTML output formats.
 * Processes HTML-specific markup while converting it to appropriate
 * text format for cross-platform compatibility.
 *
 * @public
 */
export class HtmlOnlyStringRenderer extends ElementStringRendererBase {
  /**
   * Renders an HTML-only element to formatted text.
   *
   * @remarks
   * Converts HTML-only content to plain text format for broader
   * compatibility. Processes the element's text content through
   * the workspace renderer with text formatting.
   *
   * @param element - The HTML-only element to render
   * @param type - The rendering context type (unused in implementation)
   * @returns The formatted text string
   */
  renderToString(element: AbstractDocHtmlOnlyType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    text += this.workspace.renderString(element.text, 'text')

    return text
  }
}

// ----------------------------------------------------------------------------

/**
 * Renderer for heading elements in documentation.
 *
 * @remarks
 * Converts Doxygen heading elements to Markdown heading syntax.
 * Supports multiple heading levels while providing warnings for
 * potentially problematic heading configurations.
 *
 * @public
 */
export class HeadingLinesRenderer extends ElementLinesRendererBase {
  /**
   * Renders a heading element to formatted Markdown heading lines.
   *
   * @remarks
   * Creates Markdown-style headings with appropriate hash symbols
   * based on the heading level. Warns about level 1 headings that
   * may interfere with Docusaurus page structure.
   *
   * @param element - The heading element to render
   * @param type - The rendering context type
   * @returns Array containing the formatted Markdown heading
   */
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

/**
 * Renderer for emoji elements in documentation.
 *
 * @remarks
 * Handles Unicode emoji characters by wrapping them in appropriate
 * HTML span elements with CSS styling. Provides consistent emoji
 * display across different platforms and browsers.
 *
 * @public
 */
export class EmojiStringRenderer extends ElementStringRendererBase {
  /**
   * Renders an emoji element to formatted HTML span.
   *
   * @remarks
   * Creates an HTML span element with CSS class for emoji styling
   * and includes the Unicode emoji character. Ensures consistent
   * emoji presentation in documentation output.
   *
   * @param element - The emoji element to render
   * @param type - The rendering context type (unused in implementation)
   * @returns The formatted HTML span string with emoji
   */
  renderToString(element: AbstractEmojiType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    // <span class="emoji">&#x1f604;</span>
    text += `<span class="doxyEmoji">${element.unicode}</span>}`

    return text
  }
}

// ----------------------------------------------------------------------------

/**
 * Renderer for blockquote elements in documentation.
 *
 * @remarks
 * Handles blockquote formatting by wrapping content in HTML blockquote
 * elements with appropriate CSS styling. Processes child elements to
 * maintain proper content structure within quotes.
 *
 * @public
 */
export class BlockquoteLinesRenderer extends ElementLinesRendererBase {
  /**
   * Renders a blockquote element to formatted output lines.
   *
   * @remarks
   * Creates HTML blockquote elements with CSS styling and processes
   * child elements to generate properly formatted quoted content
   * with appropriate indentation and styling.
   *
   * @param element - The blockquote element to render
   * @param type - The rendering context type
   * @returns Array of HTML strings forming the blockquote structure
   */
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
