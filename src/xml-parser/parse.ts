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

import path from 'node:path'
import * as fs from 'node:fs/promises'
import * as util from 'node:util'

// https://www.npmjs.com/package/fast-xml-parser
import { XMLParser } from 'fast-xml-parser'
import type { XmlCompoundFileElements, XmlDoxygenTypeElements } from './compound-xsd-types.js'
import type { XmlDoxygenIndexElement, XmlDoxygenIndexTypeElements, XmlIndexFile } from './index-xsd-types.js'
import type { XmlDoxyfileFile, XmlDoxygenFileTypeElements } from './doxyfile-xsd-types.js'
import assert from 'node:assert'
// import type { XmlData } from '../types/xml-data.js'
// import { indexKinds } from '../types/xml-data.js'

// ----------------------------------------------------------------------------
// Types mimicking the .xsd definitions.
// Top structure to hold all xml raw data.

export interface XmlRawData {
  version: string
  doxygenindex: XmlDoxygenIndexTypeElements[] // from index.xml
  doxygen: XmlDoxygenTypeElements[] // from `${'@_refid'}.xml`
  doxyfile: XmlDoxygenFileTypeElements[] // from Doxyfile.xml
}

// ----------------------------------------------------------------------------

// Actually a group of functions in a namespace.
export const xml = {
  hasAttributes,
  getAttributesNames,
  hasAttribute,
  getAttributeStringValue,
  getAttributeNumberValue,
  getAttributeBooleanValue,
  getOptionalAttributeValue,
  getOptionalValue,
  hasInnerElement,
  hasInnerText,
  getInnerElements,
  getInnerText,
  parseBoolean,
  parseXmlRawData
}

// ----------------------------------------------------------------------------

function hasAttributes (element: Object): boolean {
  return Object.hasOwn(element, ':@')
}

function getAttributesNames (element: Object): string[] {
  assert(Object.hasOwn(element, ':@'))
  return Object.keys((element as { ':@': {} })[':@'])
}

function hasAttribute (element: Object, name: string): boolean {
  if (Object.hasOwn(element, ':@') === true) {
    const elementWithAttributes = element as { ':@': {} }
    return elementWithAttributes[':@'] !== undefined && Object.hasOwn(elementWithAttributes[':@'], name)
  } else {
    return false
  }
}

function getAttributeStringValue (element: Object, name: string): string {
  if (hasAttribute(element, name)) {
    const elementWithNamedAttribute = (element as { ':@': { [name]: string } })[':@']
    const attributeValue = elementWithNamedAttribute[name]
    if (attributeValue !== undefined && typeof attributeValue === 'string') {
      return attributeValue
    }
  }
  throw new Error(`Element ${util.inspect(element)} does not have the ${name} attribute`)
}

function getAttributeNumberValue (element: Object, name: string): number {
  if (hasAttribute(element, name)) {
    const elementWithNamedAttribute = (element as { ':@': { [name]: number } })[':@']
    const attributeValue = elementWithNamedAttribute[name]
    if (attributeValue !== undefined && typeof attributeValue === 'number') {
      return attributeValue
    }
  }
  throw new Error(`Element ${util.inspect(element)} does not have the ${name} number attribute`)
}

function getAttributeBooleanValue (element: Object, name: string): boolean {
  if (hasAttribute(element, name)) {
    const elementWithNamedAttribute = (element as { ':@': { [name]: string } })[':@']
    const attributeValue = elementWithNamedAttribute[name]
    if (attributeValue !== undefined && typeof attributeValue === 'string') {
      return attributeValue.toLowerCase() === 'yes'
    }
  }
  throw new Error(`Element ${util.inspect(element)} does not have the ${name} boolean attribute`)
}

function getOptionalAttributeValue (element: Object, name: string, defaultValue: string = ''): string {
  if (hasAttribute(element, name)) {
    const elementWithNamedAttribute = (element as { ':@': { [name]: string } })[':@']
    const attributeValue = elementWithNamedAttribute[name]
    if (attributeValue !== undefined && typeof attributeValue === 'string') {
      return attributeValue
    } else {
      throw new Error(`Element ${util.inspect(element)} attribute ${name} is not string`)
    }
  }
  return defaultValue
}

function getOptionalValue (attributeValue: string | undefined, defaultValue: string = ''): string {
  if (attributeValue !== undefined) {
    if (typeof attributeValue === 'string') {
      return attributeValue
    } else {
      throw new Error(`Attribute ${String(attributeValue)} is not string`)
    }
  } else {
    return defaultValue
  }
}

function hasInnerElement (element: Object, name: string): boolean {
  if (Object.hasOwn(element, name) === true) {
    if (name === '#text') {
      const value = (element as { [ '#text']: any })['#text']
      return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    } else {
      return Array.isArray((element as { [name]: any })[name])
    }
  } else {
    return false
  }
}

function hasInnerText (element: Object): boolean {
  if (Object.hasOwn(element, '#text') === true) {
    const value = (element as { [ '#text']: any })['#text']
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
  } else {
    return false
  }
}

// T must be an array of elements.
function getInnerElements<T> (element: Object, name: string): T {
  assert(Object.hasOwn(element, name) === true && Array.isArray((element as { [name]: T })[name]))
  const value: T | undefined = (element as { [name]: T })[name]
  if (value !== undefined) {
    return value
  }
  throw new Error(`Element ${util.inspect(element)} does not have the ${name} child element`)
}

function getInnerText (element: Object): string {
  assert(Object.hasOwn(element, '#text') === true)
  const value = (element as { [ '#text']: any })['#text']
  assert(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
  return value.toString()
}

function parseBoolean (attributeValue: string | undefined): boolean {
  if (attributeValue !== undefined) {
    if (typeof attributeValue === 'string') {
      return attributeValue.toLowerCase() === 'yes'
    } else {
      throw new Error(`Attribute ${String(attributeValue)} is not string`)
    }
  } else {
    return false
  }
}

async function parseFile ({
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

// ----------------------------------------------------------------------------

async function parseXmlRawData ({
  folderPath
}: {
  folderPath: string
}): Promise<XmlRawData> {
  // The parser is configured to preserve the original, non-trimmed content
  // and the original elements order.
  // Some details are from the schematic documentation, some directly from the
  // parser sources.
  // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/README.md#documents
  const xmlParser = new XMLParser({
    preserveOrder: true,
    removeNSPrefix: true,
    ignoreAttributes: false,
    parseTagValue: true,
    parseAttributeValue: true,
    trimValues: false
  })

  // console.log(folderPath)

  const parsedIndex: XmlIndexFile = await parseFile({ fileName: 'index.xml', folderPath, xmlParser })
  // console.log(util.inspect(parsedIndex))
  // console.log(util.inspect(parsedIndex[0]['?xml']))
  // console.log(JSON.stringify(parsedIndex, null, '  '))

  let doxygenVersion: string = ''
  let doxygenIndexInnerElements: XmlDoxygenIndexTypeElements[] | undefined

  for (const element of parsedIndex) {
    if (hasInnerElement(element, '?xml')) {
      // Ignore the top xml prolog.
    } else if (hasInnerElement(element, '#text')) {
      // Ignore top texts.
    } else if (hasInnerElement(element, 'doxygenindex')) {
      const doxygenIndexElement = (element as XmlDoxygenIndexElement)
      assert(hasAttributes(doxygenIndexElement))
      doxygenVersion = getAttributeStringValue(doxygenIndexElement, '@_version')
      doxygenIndexInnerElements = getInnerElements<XmlDoxygenIndexTypeElements[]>(element, 'doxygenindex')
    } else {
      console.error(util.inspect(element))
      console.error('index.xml element:', Object.keys(element), 'not implemented yet')
    }
  }

  assert(doxygenVersion)
  assert(doxygenIndexInnerElements)

  // --------------------------------------------------------------------------

  const doxygen: XmlDoxygenTypeElements[] = []

  for (const element of parsedIndex) {
    if (hasInnerElement(element, 'doxygenindex')) {
      const doxygenIndexInnerElements = getInnerElements<XmlDoxygenIndexTypeElements[]>(element, 'doxygenindex')
      for (const innerElement of doxygenIndexInnerElements) {
        // console.log(util.inspect(innerElement))
        if (hasInnerElement(innerElement, '#text')) {
          // Ignore top texts.
        } else if (hasInnerElement(innerElement, 'compound')) {
          const refid = getAttributeStringValue(innerElement, '@_refid')
          const parsedDoxygen: XmlCompoundFileElements[] = await parseFile({ fileName: `${refid}.xml`, folderPath, xmlParser })
          // console.log(util.inspect(parsedDoxygen))
          // console.log(JSON.stringify(parsedDoxygen, null, '  '))

          for (const compoundElement of parsedDoxygen) {
            if (hasInnerElement(compoundElement, '?xml')) {
              // Ignore the top xml prolog.
            } else if (hasInnerElement(compoundElement, '#text')) {
              // Ignore top texts.
            } else if (hasInnerElement(compoundElement, 'doxygen')) {
              const doxygenInnerElements = getInnerElements<XmlDoxygenTypeElements[]>(compoundElement, 'doxygen')

              // Collect the arrays from all files.
              doxygen.push(...doxygenInnerElements)
            } else {
              console.error(util.inspect(compoundElement))
              console.error('index.xml element:', Object.keys(compoundElement), 'not implemented yet')
            }
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------

  const parsedDoxyfile: XmlDoxyfileFile = await parseFile({ fileName: 'Doxyfile.xml', folderPath, xmlParser })
  // console.log(util.inspect(parsedDoxyfile))
  // console.log(JSON.stringify(parsedDoxyfile, null, '  '))

  let doxyfileInnerElements: XmlDoxygenFileTypeElements[] | undefined

  for (const element of parsedDoxyfile) {
    if (hasInnerElement(element, '?xml')) {
      // Ignore the top xml prolog.
    } else if (hasInnerElement(element, '#text')) {
      // Ignore top texts.
    } else if (hasInnerElement(element, 'doxyfile')) {
      doxyfileInnerElements = getInnerElements<XmlDoxygenFileTypeElements[]>(element, 'doxyfile')
    } else {
      console.error(util.inspect(element))
      console.error('Doxyfile.xml element:', Object.keys(element), 'not implemented yet')
    }
  }

  assert(doxyfileInnerElements)

  // --------------------------------------------------------------------------

  return {
    version: doxygenVersion,
    doxygenindex: doxygenIndexInnerElements,
    doxygen,
    doxyfile: doxyfileInnerElements
  }
}

// ----------------------------------------------------------------------------
