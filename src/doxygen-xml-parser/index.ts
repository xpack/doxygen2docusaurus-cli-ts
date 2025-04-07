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
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as util from 'node:util'

import { XMLParser } from 'fast-xml-parser'
import { XmlElement } from './types.js'
import { DoxygenIndex, AbstractIndexDoxygenType } from './indexdoxygentype.js'
import { AbstractCompoundDefType } from './compounddef.js'
import { DoxygenFile, AbstractDoxygenFileType } from './doxyfiletype.js'
import { Doxygen } from './doxygentype.js'

// ----------------------------------------------------------------------------
// Top structure to hold the parsed Doxygen xml data as JS objects.

export interface DoxygenData {
  doxygenindex: AbstractIndexDoxygenType // from index.xml
  compoundDefs: AbstractCompoundDefType[] // from `${'@_refid'}.xml`
  doxyfile: AbstractDoxygenFileType // from Doxyfile.xml
}

// ----------------------------------------------------------------------------

export class DoxygenXmlParser {
  async parse ({
    folderPath
  }: {
    folderPath: string
  }): Promise<DoxygenData> {
    // The parser is configured to preserve the original, non-trimmed content
    // and the original elements order. The downsize
    // Some details are from the schematic documentation:
    // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/README.md#documents
    // The defaults are in the project source:
    // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/src/xmlparser/OptionsBuilder.js

    const xmlParser = new XMLParser({
      preserveOrder: true,
      removeNSPrefix: true,
      ignoreAttributes: false,
      parseTagValue: true,
      parseAttributeValue: true,
      trimValues: false
    })

    // console.log(folderPath)

    const parsedIndexElements: XmlElement[] = await this.parseFile({ fileName: 'index.xml', folderPath, xmlParser })
    // console.log(util.inspect(parsedIndex))
    // console.log(util.inspect(parsedIndex[0]['?xml']))
    // console.log(JSON.stringify(parsedIndex, null, '  '))

    let doxygenindex: AbstractIndexDoxygenType | undefined

    for (const element of parsedIndexElements) {
      if (this.hasInnerElement(element, '?xml')) {
        // Ignore the top xml prologue.
      } else if (this.hasInnerText(element)) {
        // Ignore top texts.
      } else if (this.hasInnerElement(element, 'doxygenindex')) {
        doxygenindex = new DoxygenIndex(this, element)
      } else {
        console.error(util.inspect(element))
        console.error('index.xml element:', Object.keys(element), 'not implemented yet')
      }
    }

    assert(doxygenindex)

    // ------------------------------------------------------------------------

    const compoundDefs: AbstractCompoundDefType[] = []

    if (Array.isArray(doxygenindex.compounds)) {
      for (const compound of doxygenindex.compounds) {
        const parsedDoxygenElements: XmlElement[] = await this.parseFile({ fileName: `${compound.refid}.xml`, folderPath, xmlParser })
        // console.log(util.inspect(parsedDoxygen))
        // console.log(JSON.stringify(parsedDoxygen, null, '  '))

        for (const element of parsedDoxygenElements) {
          if (this.hasInnerElement(element, '?xml')) {
            // Ignore the top xml prologue.
          } else if (this.hasInnerText(element)) {
            // Ignore top texts.
          } else if (this.hasInnerElement(element, 'doxygen')) {
            const doxygen = new Doxygen(this, element)
            if (Array.isArray(doxygen.compoundDefs)) {
              compoundDefs.push(...doxygen.compoundDefs)
            }
          } else {
            console.error(util.inspect(element))
            console.error(`${compound.refid}.xml element:`, Object.keys(element), 'not implemented yet')
          }
        }
      }
    }

    // ------------------------------------------------------------------------

    const parsedDoxyfileElements: XmlElement[] = await this.parseFile({ fileName: 'Doxyfile.xml', folderPath, xmlParser })
    // console.log(util.inspect(parsedDoxyfile))
    // console.log(JSON.stringify(parsedDoxyfile, null, '  '))

    let doxyfile: AbstractDoxygenFileType | undefined

    for (const element of parsedDoxyfileElements) {
      if (this.hasInnerElement(element, '?xml')) {
        // Ignore the top xml prologue.
      } else if (this.hasInnerElement(element, '#text')) {
        // Ignore top texts.
      } else if (this.hasInnerElement(element, 'doxyfile')) {
        doxyfile = new DoxygenFile(this, element)
      } else {
        console.error(util.inspect(element))
        console.error('Doxyfile.xml element:', Object.keys(element), 'not implemented yet')
      }
    }

    assert(doxyfile)

    // ------------------------------------------------------------------------

    return {
      doxygenindex,
      compoundDefs,
      doxyfile
    }
  }

  // --------------------------------------------------------------------------

  async parseFile ({
    fileName,
    folderPath,
    xmlParser
  }: {
    fileName: string
    folderPath: string
    xmlParser: XMLParser
  }): Promise<any> {
    const filePath: string = path.join(folderPath, fileName)
    const xmlString: string = await fs.readFile(filePath, { encoding: 'utf8' })

    console.log(`Parsing ${fileName}...`)
    return xmlParser.parse(xmlString)
  }

  // --------------------------------------------------------------------------

  hasAttributes (element: Object): boolean {
    return Object.hasOwn(element, ':@')
  }

  getAttributesNames (element: Object): string[] {
    return Object.keys((element as { ':@': {} })[':@'])
  }

  hasAttribute (element: Object, name: string): boolean {
    if (Object.hasOwn(element, ':@') === true) {
      const elementWithAttributes = element as { ':@': {} }
      return elementWithAttributes[':@'] !== undefined && Object.hasOwn(elementWithAttributes[':@'], name)
    } else {
      return false
    }
  }

  getAttributeStringValue (element: Object, name: string): string {
    if (this.hasAttribute(element, name)) {
      const elementWithNamedAttribute = (element as { ':@': { [name]: string } })[':@']
      const attributeValue = elementWithNamedAttribute[name]
      if (attributeValue !== undefined && typeof attributeValue === 'string') {
        return attributeValue
      }
    }
    throw new Error(`Element ${util.inspect(element)} does not have the ${name} attribute`)
  }

  getAttributeNumberValue (element: Object, name: string): number {
    if (this.hasAttribute(element, name)) {
      const elementWithNamedAttribute = (element as { ':@': { [name]: number } })[':@']
      const attributeValue = elementWithNamedAttribute[name]
      if (attributeValue !== undefined && typeof attributeValue === 'number') {
        return attributeValue
      }
    }
    throw new Error(`Element ${util.inspect(element)} does not have the ${name} number attribute`)
  }

  getAttributeBooleanValue (element: Object, name: string): boolean {
    if (this.hasAttribute(element, name)) {
      const elementWithNamedAttribute = (element as { ':@': { [name]: string } })[':@']
      const attributeValue = elementWithNamedAttribute[name]
      if (attributeValue !== undefined && typeof attributeValue === 'string') {
        return attributeValue.toLowerCase() === 'yes'
      }
    }
    throw new Error(`Element ${util.inspect(element)} does not have the ${name} boolean attribute`)
  }

  hasInnerElement (element: Object, name: string): boolean {
    if (Object.hasOwn(element, name) === true) {
      if (name === '#text') {
        const value = (element as { ['#text']: any })['#text']
        return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      } else {
        return Array.isArray((element as { [name]: any })[name])
      }
    } else {
      return false
    }
  }

  isInnerElementText (element: Object, name: string): boolean {
    if (Object.hasOwn(element, name) === true) {
      const innerElements: XmlElement[] | undefined = (element as { [name]: XmlElement[] })[name]
      // console.log('isInnerElementText', util.inspect(element))
      assert(innerElements !== undefined)
      if (innerElements.length === 1) {
        assert(innerElements[0] !== undefined)
        if (Object.hasOwn(innerElements[0], '#text') === true) {
          const value = (innerElements[0] as { ['#text']: any })['#text']
          assert(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
          return true
        }
      } else if (innerElements.length === 0) {
        // Empty string.
        return true
      }
    }
    return false
  }

  hasInnerText (element: Object): boolean {
    if (Object.hasOwn(element, '#text') === true) {
      const value = (element as { ['#text']: any })['#text']
      return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    } else {
      return false
    }
  }

  // T must be an array of elements.
  getInnerElements < T = XmlElement[] > (element: Object, name: string): T {
    // assert(Object.hasOwn(element, name) === true && Array.isArray((element as { [name]: T })[name]))
    const innerElements: T | undefined = (element as { [name]: T })[name]
    if (innerElements !== undefined) {
      return innerElements
    }
    throw new Error(`Element ${util.inspect(element)} does not have the ${name} child element`)
  }

  getInnerElementText (element: Object, name: string): string {
    const innerElements: XmlElement[] | undefined = (element as { [name]: XmlElement[] })[name]

    if (innerElements === undefined) {
      throw new Error('No inner elements')
    }
    if (innerElements.length === 1) {
      const value = (innerElements[0] as { ['#text']: any })['#text']
      return value.toString()
    } else if (innerElements.length === 0) {
      return ''
    } else {
      throw new Error('Too many elements')
    }
  }

  getInnerText (element: Object): string {
    // assert(Object.hasOwn(element, '#text') === true)
    const value = (element as { ['#text']: any })['#text']
    assert(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return value.toString()
  }
}
