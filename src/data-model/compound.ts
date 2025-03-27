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

import type { XmlBold, XmlBriefDescription, XmlCompoundDef, XmlCompoundName, XmlComputerOutput, XmlDescriptionType, XmlDetailedDescription, XmlIncludes, XmlPara, XmlParameterItem, XmlParameterList, XmlParameterNameList, XmlProgramListing, XmlRef, XmlRefText, XmlSimpleSect, XmlSp, XmlText, XmlTitle } from '../xml-parser/types.js'
import { parseBoolean } from '../xml-parser/parse.js'

// ----------------------------------------------------------------------------

export class Compound {
  id: string
  kind: string
  name: string = ''
  briefDescription: string = ''
  detailedDescription: string = ''

  commonElements = ['compoundname', 'briefdescription', 'detaileddescription']

  constructor (xmlCompoundDef: XmlCompoundDef) {
    // console.log(util.inspect(xmlCompoundDef))

    this.id = xmlCompoundDef[':@']['@_id']
    // console.log('-', this.id)
    this.kind = xmlCompoundDef[':@']['@_kind']

    for (const item of xmlCompoundDef.compounddef) {
      if (Object.hasOwn(item, 'compoundname') === true) {
        this.name = (item as XmlCompoundName).compoundname[0]['#text']
        console.log('-', this.name, `(${this.id})`)
      } else if (Object.hasOwn(item, 'briefdescription') === true) {
        // console.log(util.inspect(item))
        this.briefDescription = this.generateDescription((item as XmlBriefDescription).briefdescription)
        // console.log('briefdescription:', this.briefDescription)
      } else if (Object.hasOwn(item, 'detaileddescription') === true) {
        // console.log(util.inspect(item))
        this.detailedDescription = this.generateDescription((item as XmlDetailedDescription).detaileddescription)
        // console.log('detaileddescription:', this.detailedDescription)
      }
    }
    assert(this.name)
  }

  wasItemProcessedByParent (item: Object): boolean {
    const keys = Object.keys(item)
    assert(keys.length > 0)
    return keys[0] !== undefined && this.commonElements.includes(keys[0])
  }

  // Usually an array of 'para:'. No attributes.
  generateDescription (items: XmlDescriptionType[]): string {
    // console.log(util.inspect(items))
    if (items.length === 0) {
      return ''
    }

    const result: string = this.generateDescriptionRecursive(items)

    // console.log(result)
    return result
  }

  generateDescriptionRecursive (items: XmlDescriptionType[]): string {
    let result = ''
    for (const item of items) {
      // console.log(util.inspect(item))
      if (Object.hasOwn(item, 'para') === true) {
        const firstChild: XmlDescriptionType | undefined = (item as XmlPara).para[0]
        if (firstChild !== undefined && Object.hasOwn(firstChild, '#text') === true) {
          result += '<p>'
          result += this.generateDescriptionRecursive((item as XmlPara).para)
          result += '</p>\n'
        } else {
          result += this.generateDescriptionRecursive((item as XmlPara).para)
        }
      } else if (Object.hasOwn(item, 'bold') === true) {
        result += '<b>'
        result += this.generateDescriptionRecursive((item as XmlBold).bold)
        result += '</b>'
      } else if (Object.hasOwn(item, 'computeroutput') === true) {
        result += '<code>'
        // console.log(util.inspect((item as XmlComputerOutput).computeroutput))
        result += this.generateDescriptionRecursive((item as XmlComputerOutput).computeroutput)
        result += '</code>'
      } else if (Object.hasOwn(item, 'ref') === true) {
        const refid = (item as XmlRef)[':@']['@_refid']
        const kindref = (item as XmlRef)[':@']['@_kindref']
        assert(kindref === 'compound')
        const permalink = refid // TODO
        result += `<Link to="/docs/api/${permalink}">`
        result += this.generateDescriptionRecursive((item as XmlRef).ref)
        result += '</Link>'
      } else if (Object.hasOwn(item, 'parameterlist') === true) {
        result += this.generateParameterList((item as XmlParameterList))
      } else if (Object.hasOwn(item, 'simplesect') === true) {
        result += this.generateSimpleSect(item as XmlSimpleSect)
      } else if (Object.hasOwn(item, 'programlisting') === true) {
        // console.log(util.inspect(item))
        result += this.generateProgramListing(item as XmlProgramListing)
      } else if (Object.hasOwn(item, '#text') === true) {
        result += (item as XmlText)['#text']
      } else {
        console.log(util.inspect(item))
        console.error('description element:', Object.keys(item), 'not implemented yet')
      }
    }

    return result
  }

  // Object with attributes.
  generateParameterList (item: XmlParameterList): string {
    let result: string = ''
    const kind = item[':@']['@_kind']
    if (kind === 'templateparam') {
      result += '<dl class="tparams">\n'
      result += '<dt>Template Parameters</dt>\n'
      result += '<dd>\n'
      result += '<table class="tparams">\n'
      for (const parameterItem of item.parameterlist) {
        // console.log(util.inspect(parameterItem))
        result += this.generateParameterItem(parameterItem)
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
  generateParameterItem (item: XmlParameterItem): string {
    let result: string = ''

    // console.log(util.inspect(item.parameteritem[0]))
    const itemNameList: XmlParameterNameList = item.parameteritem[0]
    // console.log(util.inspect(itemNameList))
    const names = []
    for (const parameterNameItem of itemNameList.parameternamelist) {
      names.push(parameterNameItem.parametername[0]['#text'])
    }
    result += '<td class="paramname">'
    result += names.join(', ')
    result += '</td>\n'

    // console.log(util.inspect(item.parameteritem[1]))
    result += '<td>\n'
    result += this.generateDescriptionRecursive(item.parameteritem[1].parameterdescription)
    result += '</td>\n'

    return result
  }

  // Object with attributes.
  generateSimpleSect (item: XmlSimpleSect): string {
    let result: string = ''

    const kind = item[':@']['@_kind']
    // console.log(util.inspect(item.simplesect))
    if (kind === 'note') {
      result += '<Admonition type="info">\n'
      result += this.generateDescriptionRecursive(item.simplesect as XmlDescriptionType[])
      result += '</Admonition>\n'
    } else if (kind === 'par') {
      result += '<dl class="section user">\n'
      result += '<dt>'
      // console.log(util.inspect(item.simplesect[0]))
      const itemTitle = item.simplesect[0] as XmlTitle
      assert(itemTitle !== undefined)
      const title: string = (itemTitle.title[0])['#text']
      result += title
      result += '</dt>\n'
      result += '<dd>'
      assert(item.simplesect.length > 1)
      const items = item.simplesect.slice(1)
      result += this.generateDescriptionRecursive(items as XmlDescriptionType[])
      result += '</dd>'
      result += '</dl>\n'
    } else {
      console.error('simplesect kind:', kind, 'not implemented yet')
    }
    return result
  }

  generateProgramListing (item: XmlProgramListing): string {
    let result: string = ''
    const filename = item[':@']['@_filename'].replace('.', '')
    result += `<CodeBlock language="${filename}">\n`
    result += this.parseProgramListing(item)
    result += '</CodeBlock>\n'
    return result
  }

  parseProgramListing (item: XmlProgramListing): string {
    let result: string = ''
    for (const itemCodeline of item.programlisting) {
      // console.log(util.inspect(itemCodeline))
      for (const itemHighlight of itemCodeline.codeline) {
        // console.log(util.inspect(itemHighlight))
        for (const itemHighlightText of itemHighlight.highlight) {
          if (Object.hasOwn(itemHighlightText, '#text') === true) {
            result += (itemHighlightText as XmlText)['#text']
          } else if (Object.hasOwn(itemHighlightText, 'sp') === true) {
            // console.log(itemHighlightText)
            assert((itemHighlightText as XmlSp).sp.length === 0)
            result += ' '
          } else if (Object.hasOwn(itemHighlightText, 'ref') === true) {
            // console.log(itemHighlightText)
            const itemsRefText = (itemHighlightText as XmlRefText).ref
            if (itemsRefText[0] !== undefined) {
              if (Object.hasOwn(itemsRefText[0], '#text') === true) {
                result += itemsRefText[0]['#text']
              } else {
                console.log(itemsRefText)
                console.error('ref element:', Object.keys(itemsRefText[0]), 'not implemented yet')
              }
            }
          } else {
            console.log(util.inspect(itemHighlightText))
            console.error('programlisting element:', Object.keys(itemHighlightText), 'not implemented yet')
          }
        }
      }
      result += '\n'
    }
    return result
  }

  parseIncludes (item: XmlIncludes): Includes {
    const include = new Includes({
      path: item.includes[0]['#text']
    })

    if (Object.hasOwn(item[':@'], '@_refid') === true) {
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
