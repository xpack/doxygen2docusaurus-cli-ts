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
// import * as util from 'node:util'

// https://www.npmjs.com/package/fast-xml-parser
import { XMLParser } from 'fast-xml-parser'
import type { XmlRawData, XmlDoxygenIndexParsed, XmlDoxygenFileParsed, XmlCompoundDef, XmlDoxygenParsed } from './types.js'
// import type { XmlData } from '../types/xml-data.js'
// import { indexKinds } from '../types/xml-data.js'

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

export async function parseXmlAll ({
  folderPath
}: {
  folderPath: string
}): Promise<XmlRawData> {
  const xmlParser = new XMLParser({
    preserveOrder: true,
    removeNSPrefix: true,
    ignoreAttributes: false,
    parseTagValue: true,
    parseAttributeValue: true
  })

  // console.log(folderPath)

  const parsedIndex: XmlDoxygenIndexParsed = await parseFile({ fileName: 'index.xml', folderPath, xmlParser })
  // console.log(util.inspect(parsedIndex))
  // console.log(JSON.stringify(parsedIndex, null, '  '))

  const doxygen: XmlCompoundDef[] = []

  for (const compound of parsedIndex[1].doxygenindex) {
    const refid = compound[':@']['@_refid']
    const parsedDoxygen: XmlDoxygenParsed = await parseFile({ fileName: `${refid}.xml`, folderPath, xmlParser })
    // console.log(util.inspect(parsedDoxygen))
    // console.log(JSON.stringify(parsedDoxygen, null, '  '))

    doxygen.push(...parsedDoxygen[1].doxygen)
  }

  const parsedDoxyfile: XmlDoxygenFileParsed = await parseFile({ fileName: 'Doxyfile.xml', folderPath, xmlParser })
  // console.log(util.inspect(parsedDoxyfile))
  // console.log(JSON.stringify(parsedDoxyfile, null, '  '))

  return {
    version: (parsedIndex[1])[':@']['@_version'],
    doxygenindex: (parsedIndex[1]).doxygenindex,
    doxygen,
    doxyfile: (parsedDoxyfile[1]).doxyfile
  }
}

export function parseBoolean (s: string): boolean {
  return s.toLowerCase() === 'yes'
}

// ----------------------------------------------------------------------------
