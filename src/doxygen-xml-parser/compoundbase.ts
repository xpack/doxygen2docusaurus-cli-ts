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
import * as util from 'node:util'

// import type { XmlText } from '../xml-parser/common-types.js'
// import type { XmlBoldElement, XmlBriefDescriptionElement, XmlCodeLineElement, XmlCompoundDefElement, XmlCompoundNameElement, XmlComputerOutputElement, XmlDescriptionTypeElements, XmlDetailedDescriptionElement, XmlHighlightElement, XmlIncludesElement, XmlParaElement, XmlParameterDescriptionElement, XmlParameterItemElement, XmlParameterListElement, XmlParameterNameElement, XmlParameterNameListElement, XmlProgramListingElement, XmlRefElement, XmlSimpleSectElement, XmlSpElement, XmlTitleElement } from '../xml-parser/compound-xsd-types.js'
// import { IncType } from './IncType.js'

import { DoxygenXmlParser } from './index.js'
import { BriefDescription, DetailedDescription } from './descriptiontype.js'

// ----------------------------------------------------------------------------

//     <xsd:element name="compoundname" type="xsd:string"/>
//     <xsd:element name="briefdescription" type="descriptionType" minOccurs="0" />
//     <xsd:element name="detaileddescription" type="descriptionType" minOccurs="0" />

//   <xsd:attribute name="id" type="xsd:string" />
//   <xsd:attribute name="kind" type="DoxCompoundKind" />

export class CompoundBase {
  // Mandatory elements.
  compoundName: string = ''

  // Optional elements.
  briefDescription?: BriefDescription | undefined
  detailedDescription?: DetailedDescription | undefined

  // Mandatory attributes.
  id: string = ''
  kind: string = ''

  commonElements = ['compoundname', 'briefdescription', 'detaileddescription']
  commonAttributes = ['@_id', '@_kind']

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string = 'compounddef') {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore top texts.
      } else if (xml.isInnerElementText(innerElement, 'name')) {
        this.compoundName = xml.getInnerElementText(innerElement, 'name')
      } else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
        this.briefDescription = new BriefDescription(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
        this.detailedDescription = new DetailedDescription(xml, innerElement)
      }
    }

    assert(this.compoundName.length > 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    this.id = xml.getAttributeStringValue(element, '@_id')
    // console.log('-', this.id)
    this.kind = xml.getAttributeStringValue(element, '@_kind')

    assert(this.id.length > 0)
    assert(this.kind.length > 0)

    // ------------------------------------------------------------------------

    console.log('-', this.compoundName, `(${this.id})`)
  }

  wasElementProcessedByParent (element: Object): boolean {
    const keys = Object.keys(element)
    assert(keys.length > 0)
    return keys[0] !== undefined && this.commonElements.includes(keys[0])
  }

  wasAttributeProcessedByParent (attributeName: string): boolean {
    return this.commonAttributes.includes(attributeName)
  }

  /*
  // Usually an array of 'para:'. No attributes.
  generateDescription(elements: XmlDescriptionTypeElements[]): string {
    // console.log(util.inspect(items))
    if (elements.length === 0) {
      return ''
    }

    const result: string = this.generateDescriptionRecursive(elements)

    // console.log(result)
    return result
  }

  generateDescriptionRecursive(elements: XmlDescriptionTypeElements[]): string {
    let result = ''
    for (const element of elements) {
      // console.log(util.inspect(element, { compact: false, depth: 999 })
      if (xml.hasInnerElement(element, '#text')) {
        result += xml.getInnerText(element)
      } else if (xml.hasInnerElement(element, 'para')) {
        const paraInnerElements = (element as XmlParaElement).para
        if (paraInnerElements.length > 0) {
          assert(paraInnerElements[0])
          const paraElement = paraInnerElements[0]
          // If the <para> element start with text, generate <p>.
          if (xml.hasInnerElement(paraElement, '#text')) {
            result += '<p>'
            result += this.generateDescriptionRecursive(paraInnerElements)
            result += '</p>\n'
          } else {
            result += this.generateDescriptionRecursive(paraInnerElements)
          }
        }
      } else if (xml.hasInnerElement(element, 'bold')) {
        result += '<b>'
        result += this.generateDescriptionRecursive((element as XmlBoldElement).bold)
        result += '</b>'
      } else if (xml.hasInnerElement(element, 'computeroutput')) {
        result += '<code>'
        // console.log(util.inspect((item as XmlComputerOutput).computeroutput))
        result += this.generateDescriptionRecursive((element as XmlComputerOutputElement).computeroutput)
        result += '</code>'
      } else if (xml.hasInnerElement(element, 'ref')) {
        assert(xml.hasAttributes(element))
        const refid = xml.getAttributeStringValue(element, '@_refid')
        const kindref = xml.getAttributeStringValue(element, '@_kindref')
        // console.log(kindref)
        const permalink = `TODO-link-to-${kindref}-${refid}`
        result += `<Link to="/docs/api/${permalink}">`
        result += this.generateDescriptionRecursive((element as XmlRefElement).ref)
        result += '</Link>'
      } else if (xml.hasInnerElement(element, 'parameterlist')) {
        result += this.generateParameterList((element as XmlParameterListElement))
      } else if (xml.hasInnerElement(element, 'simplesect')) {
        result += this.generateSimpleSect(element as XmlSimpleSectElement)
      } else if (xml.hasInnerElement(element, 'programlisting')) {
        // console.log(util.inspect(item))
        result += this.generateProgramListing(element as XmlProgramListingElement)
      } else if (xml.hasInnerElement(element, 'emphasis')) {
        // TODO
      } else if (xml.hasInnerElement(element, 'itemizedlist')) {
        // TODO
      } else if (xml.hasInnerElement(element, 'linebreak')) {
        // TODO
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error('description element:', Object.keys(element), 'not implemented yet in', this.constructor.name)
      }
    }

    // console.log(result)
    return result
  }

  // Object with attributes.
  generateParameterList(element: XmlParameterListElement): string {
    let result: string = ''
    assert(xml.hasAttributes(element))
    const kind = xml.getAttributeStringValue(element, '@_kind')
    if (kind === 'templateparam') {
      result += '<dl class="tparams">\n'
      result += '<dt>Template Parameters</dt>\n'
      result += '<dd>\n'
      result += '<table class="tparams">\n'
      for (const parameterListElement of element.parameterlist) {
        // console.log(util.inspect(parameterItem))
        result += this.generateParameterItem(parameterListElement as XmlParameterItemElement)
      }
      result += '</table>\n'
      result += '</dd>\n'
      result += '</dl>\n'
    } else if (kind === 'retval') {
      result += '<dl class="retval">\n'
      result += '<dt>Return values</dt>\n'
      result += '<dd>\n'
      result += '<table class="retval">\n'
      for (const parameterListElement of element.parameterlist) {
        // console.log(util.inspect(parameterItem))
        result += this.generateParameterItem(parameterListElement as XmlParameterItemElement)
      }
      result += '</table>\n'
      result += '</dd>\n'
      result += '</dl>\n'
    } else if (kind === 'param') {
      result += '<dl class="params">\n'
      result += '<dt>Parameters</dt>\n'
      result += '<dd>\n'
      result += '<table class="params">\n'
      for (const parameterListElement of element.parameterlist) {
        // console.log(util.inspect(parameterItem))
        result += this.generateParameterItem(parameterListElement as XmlParameterItemElement)
      }
      result += '</table>\n'
      result += '</dd>\n'
      result += '</dl>\n'
    } else {
      console.error('parameterlist kind:', kind, 'not implemented yet in', this.constructor.name)
    }
    return result
  }

  // Object, no attributes. Two items, name list & description.
  generateParameterItem(element: XmlParameterItemElement): string {
    if (xml.hasInnerElement(element, '#text')) {
      return ''
    }

    let result: string = ''

    let description = ''
    const names = []

    for (const parameterItemElement of element.parameteritem) {
      if (xml.hasInnerElement(parameterItemElement, '#text')) {
        // Ignore texts.
      } else if (xml.hasInnerElement(parameterItemElement, 'parameternamelist')) {
        for (const parameterNameListElement of (parameterItemElement as XmlParameterNameListElement).parameternamelist) {
          if (xml.hasInnerElement(parameterNameListElement, 'parametername')) {
            const parameterNameElements = (parameterNameListElement as XmlParameterNameElement).parametername
            for (const parameterNameElement of parameterNameElements) {
              if (xml.hasInnerElement(parameterNameElement, '#text')) {
                names.push((parameterNameElement as XmlText)['#text'])
              }
            }
          }
        }
      } else if (xml.hasInnerElement(parameterItemElement, 'parameterdescription')) {
        assert(description.length === 0)
        description = this.generateDescriptionRecursive((parameterItemElement as XmlParameterDescriptionElement).parameterdescription)
      } else {
        console.error('parameteritem element:', Object.keys(parameterItemElement), 'not implemented yet in', this.constructor.name)
      }
    }

    result += '<td class="paramname">'
    result += names.join(', ')
    result += '</td>\n'

    result += '<td>\n'
    result += description
    result += '</td>\n'

    return result
  }

  // Object with attributes.
  generateSimpleSect(element: XmlSimpleSectElement): string {
    let result: string = ''

    assert(xml.hasAttributes(element))
    const kind = xml.getAttributeStringValue(element, '@_kind')
    // console.log(util.inspect(item.simplesect))
    if (kind === 'note') {
      result += '<Admonition type="info">\n'
      result += this.generateDescriptionRecursive(element.simplesect as XmlDescriptionTypeElements[])
      result += '</Admonition>\n'
    } else if (kind === 'warning') {
      result += '<Admonition type="caution">\n'
      result += this.generateDescriptionRecursive(element.simplesect as XmlDescriptionTypeElements[])
      result += '</Admonition>\n'
    } else if (kind === 'par') {
      result += '<dl class="section user">\n'
      result += '<dt>'
      // console.log(util.inspect(item.simplesect[0]))
      const itemTitle = element.simplesect[0] as XmlTitleElement
      assert(itemTitle !== undefined)
      const title: string = (itemTitle.title[0])['#text']
      result += title
      result += '</dt>\n'
      result += '<dd>'
      assert(element.simplesect.length > 1)
      const items = element.simplesect.slice(1)
      result += this.generateDescriptionRecursive(items as XmlDescriptionTypeElements[])
      result += '</dd>'
      result += '</dl>\n'
    } else if (kind === 'return') {
      result += '<dl class="section return">\n'
      result += '<dt>'
      result += 'Returns'
      result += '</dt>\n'
      result += '<dd>'
      assert(element.simplesect.length > 1)
      const items = element.simplesect.slice(1)
      result += this.generateDescriptionRecursive(items as XmlDescriptionTypeElements[])
      result += '</dd>'
      result += '</dl>\n'
    } else {
      console.error('simplesect kind:', kind, 'not implemented yet in', this.constructor.name)
    }
    return result
  }

  generateProgramListing(element: XmlProgramListingElement): string {
    let result: string = ''
    assert(xml.hasAttributes(element))
    const filename = xml.getAttributeStringValue(element, '@_filename').replace('.', '')
    result += `<CodeBlock language="${filename}">{\n`
    result += this.parseProgramListing(element)
    result += '}</CodeBlock>\n'
    return result
  }

  parseProgramListing(element: XmlProgramListingElement): string {
    let result: string = ''
    for (const programListingElement of element.programlisting) {
      // console.log(util.inspect(itemCodeline))
      if (xml.hasInnerElement(programListingElement, '#text')) {
        // Ignore texts.
      } else if (xml.hasInnerElement(programListingElement, 'codeline')) {
        result += '\''
        const codeLineInnerElements = (programListingElement as XmlCodeLineElement).codeline
        for (const codeLineInnerElement of codeLineInnerElements) {
          // console.log(util.inspect(itemHighlight))
          if (xml.hasInnerElement(codeLineInnerElement, '#text')) {
            // Ignore texts.
          } else if (xml.hasInnerElement(codeLineInnerElement, 'highlight')) {
            for (const highlightElement of (codeLineInnerElement as XmlHighlightElement).highlight) {
              if (xml.hasInnerElement(highlightElement, '#text')) {
                result += xml.getInnerText(highlightElement)
              } else if (xml.hasInnerElement(highlightElement, 'sp')) {
                // console.log(util.inspect(itemHighlightText))
                // All cases I encountered were empty <sp/>.
                assert((highlightElement as XmlSpElement).sp.length === 0)
                result += ' '
              } else if (xml.hasInnerElement(highlightElement, 'ref')) {
                // console.log(util.inspect(itemHighlightText))
                const refElement = (highlightElement as XmlRefElement).ref
                if (refElement[0] !== undefined) {
                  if (Object.hasOwn(refElement[0], '#text') === true) {
                    result += refElement[0]['#text']
                  } else {
                    console.error(util.inspect(refElement))
                    console.error('ref element:', Object.keys(refElement[0]), 'not implemented yet in', this.constructor.name)
                  }
                }
              } else {
                console.error(util.inspect(highlightElement))
                console.error('programlisting element:', Object.keys(highlightElement), 'not implemented yet in', this.constructor.name)
              }
            }
          }
        }
        result += '\\n\'+\n'
      }
    }
    return result
  }
  */
}
