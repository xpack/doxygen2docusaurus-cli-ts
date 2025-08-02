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

import { CliOptions } from '../../docusaurus/cli-options.js'
import { CompoundDefDataModel } from './compounds/compounddef-dm.js'
import { DoxygenFileDataModel } from './doxyfile/doxyfiletype-dm.js'
import { DoxygenIndexDataModel } from './index/indexdoxygentype-dm.js'
import { XmlElement } from './types.js'
import { IndexCompoundDataModel } from './index/indexcompoundtype-dm.js'
import { DoxygenDataModel } from './compounds/doxygentype-dm.js'
import { MemberDefDataModel } from './compounds/memberdeftype-dm.js'
import { DoxygenXmlParser } from './doxygen-xml-parser.js'

// ----------------------------------------------------------------------------
// Top structure to hold the parsed Doxygen xml data as JS objects.
// All objects are defined in the `data-model` folder.
/**
 * @public
 */

export class DataModel {
  /**
   * The global configuration options.
   */
  options: CliOptions

  xml: DoxygenXmlParser

  /**
   * Keep track of the number of XML files parsed.
   *
   * @defaultValue 0
   */
  parsedFilesCounter = 0

  doxygenindex?: DoxygenIndexDataModel // from index.xml
  compoundDefs: CompoundDefDataModel[] // from `${'@_refid'}.xml`
  doxyfile?: DoxygenFileDataModel // from Doxyfile.xml

  projectVersion?: string

  constructor(options: CliOptions) {
    this.options = options

    this.xml = new DoxygenXmlParser(options)

    this.compoundDefs = []
  }

  async parse(): Promise<void> {
    // The parser is configured to preserve the original, non-trimmed content
    // and the original elements order. The downsize
    // Some details are from the schematic documentation:
    // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/README.md#documents
    // The defaults are in the project source:
    // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/src/xmlparser/OptionsBuilder.js

    // ------------------------------------------------------------------------
    // Parse the top index.xml file.

    if (!this.options.verbose) {
      console.log('Parsing Doxygen generated .xml files...')
    }

    await this.parseDoxygenIndex()

    assert(this.doxygenindex !== undefined)

    // ------------------------------------------------------------------------
    // Parse all compound *.xml files mentioned in the index.

    if (Array.isArray(this.doxygenindex.compounds)) {
      for (const indexCompound of this.doxygenindex.compounds) {
        // Parallelise not possible, the order is relevant.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsedDoxygenElements: XmlElement[] = await this.parseFile({
          fileName: `${indexCompound.refid}.xml`,
        })
        // console.log(util.inspect(parsedDoxygen))
        // console.log(JSON.stringify(parsedDoxygen, null, '  '))
        this.processCompoundDefs(indexCompound, parsedDoxygenElements)
      }

      this.processMemberdefs()
    }

    // ------------------------------------------------------------------------
    // Parse the Doxyfile.xml with the options.

    await this.parseDoxyfile()

    assert(this.doxyfile)

    console.log(this.parsedFilesCounter, 'xml files parsed')
    if (this.options.verbose) {
      if (this.xml.images.length > 0) {
        console.log(this.xml.images.length, 'images identified')
      }
    }
  }

  /**
   * Parses the main Doxygen index XML file and initialises the index data
   * model.
   *
   * @remarks
   * This method reads and parses the `index.xml` file, ignoring the XML
   * prologue and top-level text nodes. It extracts the `doxygenindex`
   * element and constructs the corresponding data model. Any unrecognised
   * elements are logged for diagnostic purposes.
   */
  async parseDoxygenIndex(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsedIndexElements: XmlElement[] = await this.parseFile({
      fileName: 'index.xml',
    })
    // console.log(util.inspect(parsedIndex))
    // console.log(util.inspect(parsedIndex[0]['?xml']))
    // console.log(JSON.stringify(parsedIndex, null, '  '))

    for (const element of parsedIndexElements) {
      if (this.xml.hasInnerElement(element, '?xml')) {
        // Ignore the top xml prologue.
      } else if (this.xml.hasInnerText(element)) {
        // Ignore top texts.
      } else if (this.xml.hasInnerElement(element, 'doxygenindex')) {
        this.doxygenindex = new DoxygenIndexDataModel(this.xml, element)
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(
          'index.xml element:',
          Object.keys(element),
          'not implemented yet in',
          this.constructor.name
        )
      }
    }
  }

  /**
   * Processes compound definitions from the parsed Doxygen XML elements.
   *
   * @param indexCompound - The compound index data model
   * @param parsedDoxygenElements - The array of parsed XML elements for the
   * compound
   *
   * @remarks
   * This method iterates through the parsed XML elements, ignoring the XML
   * prologue and top-level text nodes. For recognised `doxygen` elements, it
   * constructs the compound definitions and appends them to the internal data
   * model. Unrecognised elements are logged for further analysis.
   */
  processCompoundDefs(
    indexCompound: IndexCompoundDataModel,
    parsedDoxygenElements: XmlElement[]
  ) {
    for (const element of parsedDoxygenElements) {
      if (this.xml.hasInnerElement(element, '?xml')) {
        // Ignore the top xml prologue.
      } else if (this.xml.hasInnerText(element)) {
        // Ignore top texts.
      } else if (this.xml.hasInnerElement(element, 'doxygen')) {
        const doxygen = new DoxygenDataModel(this.xml, element)
        if (Array.isArray(doxygen.compoundDefs)) {
          this.compoundDefs.push(...doxygen.compoundDefs)
        }
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(
          `${indexCompound.refid}.xml element:`,
          Object.keys(element),
          'not implemented yet in',
          this.constructor.name
        )
      }
    }
  }

  /**
   * Processes member definitions and updates member kinds where necessary.
   *
   * @remarks
   * This method traverses all compound definitions and their associated
   * sections. It collects member definitions by their identifiers and, for
   * each member with an empty kind, assigns the kind from the corresponding
   * member definition. This ensures that all members are correctly classified
   * within the internal data model.
   */
  processMemberdefs() {
    const memberDefsById = new Map<string, MemberDefDataModel>()
    for (const compoundDef of this.compoundDefs) {
      if (compoundDef.sectionDefs !== undefined) {
        for (const sectionDef of compoundDef.sectionDefs) {
          if (sectionDef.memberDefs !== undefined) {
            for (const memberDef of sectionDef.memberDefs) {
              memberDefsById.set(memberDef.id, memberDef)
            }
          }
          if (sectionDef.members !== undefined) {
            for (const member of sectionDef.members) {
              if (member.kind.length === 0) {
                const memberDef = memberDefsById.get(member.refid)
                assert(memberDef !== undefined)
                member.kind = memberDef.kind
              }
            }
          }
        }
      }
    }
  }

  /**
   * Parses the Doxyfile XML and initialises the configuration data model.
   *
   * @remarks
   * This method reads and parses the `Doxyfile.xml` file, ignoring the XML
   * prologue and top-level text nodes. It extracts the `doxyfile` element and
   * constructs the corresponding configuration data model. Any unrecognised
   * elements are logged for diagnostic purposes.
   */
  async parseDoxyfile(): Promise<void> {
    const parsedDoxyfileElements = (await this.parseFile({
      fileName: 'Doxyfile.xml',
    })) as XmlElement[]
    // console.log(util.inspect(parsedDoxyfile))
    // console.log(JSON.stringify(parsedDoxyfile, null, '  '))

    for (const element of parsedDoxyfileElements) {
      if (this.xml.hasInnerElement(element, '?xml')) {
        // Ignore the top xml prologue.
      } else if (this.xml.hasInnerElement(element, '#text')) {
        // Ignore top texts.
      } else if (this.xml.hasInnerElement(element, 'doxyfile')) {
        this.doxyfile = new DoxygenFileDataModel(this.xml, element)
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(
          'Doxyfile.xml element:',
          Object.keys(element),
          'not implemented yet in',
          this.constructor.name
        )
      }
    }
  }

  // --------------------------------------------------------------------------
  // Support methods.

  /**
   * Reads and parses the specified XML file, returning the parsed content.
   *
   * @param fileName - The name of the XML file to be parsed
   * @returns A promise that resolves to the parsed XML content
   *
   * @remarks
   * This method constructs the full file path using the configured input
   * folder, reads the XML file as a UTF-8 string, and parses it using the
   * configured XML parser. The method increments the internal counter for
   * parsed files and, if verbose mode is enabled, logs the file being parsed.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async parseFile({ fileName }: { fileName: string }): Promise<any> {
    const folderPath = this.options.doxygenXmlInputFolderPath
    const filePath: string = path.join(folderPath, fileName)
    const xmlString: string = await fs.readFile(filePath, { encoding: 'utf8' })

    if (this.options.verbose) {
      console.log(`Parsing ${fileName}...`)
    }
    this.parsedFilesCounter += 1

    return this.xml.xmlParser.parse(xmlString)
  }
}

// ----------------------------------------------------------------------------
