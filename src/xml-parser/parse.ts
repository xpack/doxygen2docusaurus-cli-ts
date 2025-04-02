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
import path from 'node:path'
import * as fs from 'node:fs/promises'
import * as util from 'node:util'

// https://www.npmjs.com/package/fast-xml-parser
import { XMLParser } from 'fast-xml-parser'
import { IndexDoxygenType } from './indexdoxygentype.js'
import { CompoundDefType } from './compounddef.js'
import { DoxygenType } from './doxygentype.js'
import { DoxygenFileType } from './doxyfiletype.js'
import { xml } from './xml.js'
import { XmlElement } from './types.js'

// ----------------------------------------------------------------------------
// Top structure to hold all parsed xml data as JS objects.

export interface DoxygenData {
  doxygenindex: IndexDoxygenType // from index.xml
  compoundDefs: CompoundDefType[] // from `${'@_refid'}.xml`
  doxyfile: DoxygenFileType // from Doxyfile.xml
}

// ----------------------------------------------------------------------------

export async function parseDoxygenData ({
  folderPath
}: {
  folderPath: string
}): Promise<DoxygenData> {
  // The parser is configured to preserve the original, non-trimmed content
  // and the original elements order.
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

  const parsedIndexElements: XmlElement[] = await parseFile({ fileName: 'index.xml', folderPath, xmlParser })
  // console.log(util.inspect(parsedIndex))
  // console.log(util.inspect(parsedIndex[0]['?xml']))
  // console.log(JSON.stringify(parsedIndex, null, '  '))

  let doxygenindex: IndexDoxygenType | undefined

  for (const element of parsedIndexElements) {
    if (xml.hasInnerElement(element, '?xml')) {
      // Ignore the top xml prologue.
    } else if (xml.hasInnerText(element)) {
      // Ignore top texts.
    } else if (xml.hasInnerElement(element, 'doxygenindex')) {
      doxygenindex = new IndexDoxygenType(element, 'doxygenindex')
    } else {
      console.error(util.inspect(element))
      console.error('index.xml element:', Object.keys(element), 'not implemented yet')
    }
  }

  assert(doxygenindex)

  // --------------------------------------------------------------------------

  const compoundDefs: CompoundDefType[] = []

  if (doxygenindex.compounds !== undefined) {
    for (const compound of doxygenindex.compounds) {
      const parsedDoxygenElements: XmlElement[] = await parseFile({ fileName: `${compound.refid}.xml`, folderPath, xmlParser })
      // console.log(util.inspect(parsedDoxygen))
      // console.log(JSON.stringify(parsedDoxygen, null, '  '))

      for (const element of parsedDoxygenElements) {
        if (xml.hasInnerElement(element, '?xml')) {
          // Ignore the top xml prologue.
        } else if (xml.hasInnerText(element)) {
          // Ignore top texts.
        } else if (xml.hasInnerElement(element, 'doxygen')) {
          const doxygen = new DoxygenType(element, 'doxygen')
          if (doxygen.compoundDefs !== undefined) {
            compoundDefs.push(...doxygen.compoundDefs)
          }
        } else {
          console.error(util.inspect(element))
          console.error(`${compound.refid}.xml element:`, Object.keys(element), 'not implemented yet')
        }
      }
    }
  }

  // --------------------------------------------------------------------------

  const parsedDoxyfileElements: XmlElement[] = await parseFile({ fileName: 'Doxyfile.xml', folderPath, xmlParser })
  // console.log(util.inspect(parsedDoxyfile))
  // console.log(JSON.stringify(parsedDoxyfile, null, '  '))

  let doxyfile: DoxygenFileType | undefined

  for (const element of parsedDoxyfileElements) {
    if (xml.hasInnerElement(element, '?xml')) {
      // Ignore the top xml prologue.
    } else if (xml.hasInnerElement(element, '#text')) {
      // Ignore top texts.
    } else if (xml.hasInnerElement(element, 'doxyfile')) {
      doxyfile = new DoxygenFileType(element, 'doxyfile')
    } else {
      console.error(util.inspect(element))
      console.error('Doxyfile.xml element:', Object.keys(element), 'not implemented yet')
    }
  }

  assert(doxyfile)

  // --------------------------------------------------------------------------

  return {
    doxygenindex,
    compoundDefs,
    doxyfile
  }
}

// ----------------------------------------------------------------------------

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
