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

import type { XmlText } from '../xml-parser/common-types.js'
import type { XmlBoldElement, XmlBriefDescriptionElement, XmlCodeLineElement, XmlCompoundDefElement, XmlCompoundNameElement, XmlComputerOutputElement, XmlDescriptionTypeElements, XmlDetailedDescriptionElement, XmlHighlightElement, XmlIncludesElement, XmlParaElement, XmlParameterDescriptionElement, XmlParameterItemElement, XmlParameterListElement, XmlParameterNameElement, XmlParameterNameListElement, XmlProgramListingElement, XmlRefElement, XmlSimpleSectElement, XmlSpElement, XmlTitleElement } from '../xml-parser/compound-xsd-types.js'
import { parseBoolean } from '../xml-parser/parse.js'

// ----------------------------------------------------------------------------

export class Compound {
  id: string
  kind: string
  name: string = ''
  briefDescription: string = ''
  detailedDescription: string = ''

  commonElements = ['compoundname', 'briefdescription', 'detaileddescription']

  constructor (element: XmlCompoundDefElement) {
    // console.log(util.inspect(xmlCompoundDef))

    assert(Object.hasOwn(element, ':@'))
    this.id = element[':@']['@_id']
    // console.log('-', this.id)
    this.kind = element[':@']['@_kind']

    for (const compoundElement of element.compounddef) {
      if (Object.hasOwn(compoundElement, 'compoundname') === true) {
        const compoundNameElements = (compoundElement as XmlCompoundNameElement).compoundname
        assert(compoundNameElements.length === 1)
        this.name = compoundNameElements[0]['#text']
        console.log('-', this.name, `(${this.id})`)
      } else if (Object.hasOwn(compoundElement, 'briefdescription') === true) {
        // console.log(util.inspect(item))
        this.briefDescription = this.generateDescription((compoundElement as XmlBriefDescriptionElement).briefdescription)
        // console.log('briefdescription:', this.briefDescription)
      } else if (Object.hasOwn(compoundElement, 'detaileddescription') === true) {
        // console.log(util.inspect(item))
        this.detailedDescription = this.generateDescription((compoundElement as XmlDetailedDescriptionElement).detaileddescription)
        // console.log('detaileddescription:', this.detailedDescription)
      }
    }
    assert(this.name)
  }

  wasItemProcessedByParent (element: Object): boolean {
    const keys = Object.keys(element)
    assert(keys.length > 0)
    return keys[0] !== undefined && this.commonElements.includes(keys[0])
  }

  // Usually an array of 'para:'. No attributes.
  generateDescription (elements: XmlDescriptionTypeElements[]): string {
    // console.log(util.inspect(items))
    if (elements.length === 0) {
      return ''
    }

    const result: string = this.generateDescriptionRecursive(elements)

    // console.log(result)
    return result
  }

  generateDescriptionRecursive (elements: XmlDescriptionTypeElements[]): string {
    let result = ''
    for (const element of elements) {
      // console.log(util.inspect(element))
      if (Object.hasOwn(element, '#text') === true) {
        result += (element as XmlText)['#text']
      } else if (Object.hasOwn(element, 'para') === true) {
        const paraElements = (element as XmlParaElement).para
        for (const paraElement of paraElements) {
          if (Object.hasOwn(paraElement, '#text') === true) {
            result += '<p>'
            result += this.generateDescriptionRecursive((element as XmlParaElement).para)
            result += '</p>\n'
          } else {
            result += this.generateDescriptionRecursive((element as XmlParaElement).para)
          }
        }
      } else if (Object.hasOwn(element, 'bold') === true) {
        result += '<b>'
        result += this.generateDescriptionRecursive((element as XmlBoldElement).bold)
        result += '</b>'
      } else if (Object.hasOwn(element, 'computeroutput') === true) {
        result += '<code>'
        // console.log(util.inspect((item as XmlComputerOutput).computeroutput))
        result += this.generateDescriptionRecursive((element as XmlComputerOutputElement).computeroutput)
        result += '</code>'
      } else if (Object.hasOwn(element, 'ref') === true) {
        assert(Object.hasOwn((element as XmlRefElement), ':@'))
        const refid = (element as XmlRefElement)[':@']['@_refid']
        const kindref = (element as XmlRefElement)[':@']['@_kindref']
        assert(kindref === 'compound')
        const permalink = refid // TODO
        result += `<Link to="/docs/api/${permalink}">`
        result += this.generateDescriptionRecursive((element as XmlRefElement).ref)
        result += '</Link>'
      } else if (Object.hasOwn(element, 'parameterlist') === true) {
        result += this.generateParameterList((element as XmlParameterListElement))
      } else if (Object.hasOwn(element, 'simplesect') === true) {
        result += this.generateSimpleSect(element as XmlSimpleSectElement)
      } else if (Object.hasOwn(element, 'programlisting') === true) {
        // console.log(util.inspect(item))
        result += this.generateProgramListing(element as XmlProgramListingElement)
      } else {
        console.log(util.inspect(element))
        console.error('description element:', Object.keys(element), 'not implemented yet')
      }
    }

    return result
  }

  // Object with attributes.
  generateParameterList (element: XmlParameterListElement): string {
    let result: string = ''
    assert(element[':@'] !== undefined)
    const kind = element[':@']['@_kind']
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
    } else {
      console.error('parameterlist kind:', kind, 'not implemented yet')
    }
    return result
  }

  // Object, no attributes. Two items, name list & description.
  generateParameterItem (element: XmlParameterItemElement): string {
    let result: string = ''

    let description = ''
    const names = []
    // console.log(util.inspect(item.parameteritem))
    for (const parameterItemElement of element.parameteritem) {
      if (Object.hasOwn(parameterItemElement, 'parameternamelist') === true) {
        for (const parameterNameListElement of (parameterItemElement as XmlParameterNameListElement).parameternamelist) {
          if (Object.hasOwn(parameterNameListElement, 'parametername') === true) {
            const parameterNameElements = (parameterNameListElement as XmlParameterNameElement).parametername
            for (const parameterNameElement of parameterNameElements) {
              if (Object.hasOwn(parameterNameElement, '#text') === true) {
                names.push((parameterNameElement as XmlText)['#text'])
              }
            }
          }
        }
      } else if (Object.hasOwn(parameterItemElement, 'parameterdescription') === true) {
        assert(description.length === 0)
        description = this.generateDescriptionRecursive((parameterItemElement as XmlParameterDescriptionElement).parameterdescription)
      } else {
        console.error('parameteritem ', Object.keys(parameterItemElement), 'not implemented yet')
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
  generateSimpleSect (element: XmlSimpleSectElement): string {
    let result: string = ''

    assert(Object.hasOwn(element, ':@'))
    const kind = element[':@']['@_kind']
    // console.log(util.inspect(item.simplesect))
    if (kind === 'note') {
      result += '<Admonition type="info">\n'
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
    } else {
      console.error('simplesect kind:', kind, 'not implemented yet')
    }
    return result
  }

  generateProgramListing (element: XmlProgramListingElement): string {
    let result: string = ''
    assert(Object.hasOwn(element, ':@'))
    const filename = element[':@']['@_filename'].replace('.', '')
    result += `<CodeBlock language="${filename}">\n`
    result += this.parseProgramListing(element)
    result += '</CodeBlock>\n'
    return result
  }

  parseProgramListing (element: XmlProgramListingElement): string {
    let result: string = ''
    for (const programListingElement of element.programlisting) {
      // console.log(util.inspect(itemCodeline))
      for (const codeLineElement of (programListingElement as XmlCodeLineElement).codeline) {
        // console.log(util.inspect(itemHighlight))
        for (const highlightElement of (codeLineElement as XmlHighlightElement).highlight) {
          if (Object.hasOwn(highlightElement, '#text') === true) {
            result += (highlightElement as XmlText)['#text']
          } else if (Object.hasOwn(highlightElement, 'sp') === true) {
            // console.log(util.inspect(itemHighlightText))
            // All cases I encountered were empty <sp/>.
            assert((highlightElement as XmlSpElement).sp.length === 0)
            result += ' '
          } else if (Object.hasOwn(highlightElement, 'ref') === true) {
            // console.log(util.inspect(itemHighlightText))
            const refElement = (highlightElement as XmlRefElement).ref
            if (refElement[0] !== undefined) {
              if (Object.hasOwn(refElement[0], '#text') === true) {
                result += refElement[0]['#text']
              } else {
                console.log(refElement)
                console.error('ref element:', Object.keys(refElement[0]), 'not implemented yet')
              }
            }
          } else {
            console.log(util.inspect(highlightElement))
            console.error('programlisting element:', Object.keys(highlightElement), 'not implemented yet')
          }
        }
      }
      result += '\n'
    }
    return result
  }

  parseIncludes (item: XmlIncludesElement): Includes {
    assert(item.includes[0] !== undefined)
    const include = new Includes({
      path: item.includes[0]['#text']
    })

    if (Object.hasOwn(item[':@'], '@_refid') === true) {
      assert(item[':@']['@_refid'])
      include.fileId = item[':@']['@_refid']
    }
    if (Object.hasOwn(item[':@'], '@_local') === true) {
      include.local = parseBoolean(item[':@']['@_local'])
    }

    return include
  }
}

// ----------------------------------------------------------------------------

export class Includes {
  fileId: string = ''
  local: boolean = false
  path: string

  constructor ({
    path
  }: {
    path: string
  }) {
    this.path = path
  }
}

// ----------------------------------------------------------------------------
