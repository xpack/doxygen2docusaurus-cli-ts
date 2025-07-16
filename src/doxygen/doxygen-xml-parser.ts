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

/**
 * @file doxygen-xml-parser.ts
 * @brief Provides the DoxygenXmlParser class for parsing Doxygen-generated XML files.
 *
 * This module defines the {@link DoxygenXmlParser} class, which is responsible for
 * parsing XML output produced by Doxygen and constructing the internal data model
 * used by doxygen2docusaurus. It supports parsing the main index, compound files,
 * and configuration files, and provides utility methods for extracting attributes
 * and inner elements from the XML structure.
 *
 * The parser is designed to preserve the original XML content and element order,
 * ensuring accurate conversion to the documentation model. It is intended for use
 * within the xPack doxygen2docusaurus CLI tool.
 */

import assert from 'node:assert'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as util from 'node:util'

import { XMLParser } from 'fast-xml-parser'
import { XmlElement, DataModel } from './data-model/types.js'
import { DoxygenIndexDataModel } from './data-model/index/indexdoxygentype-dm.js'
import { DoxygenFileDataModel } from './data-model/doxyfile/doxyfiletype-dm.js'
import { DoxygenDataModel } from './data-model/compounds/doxygentype-dm.js'
import { MemberDefDataModel } from './data-model/compounds/memberdeftype-dm.js'
import { IndexCompoundDataModel } from './data-model/index/indexcompoundtype-dm.js'
import { CliOptions, maxParallelPromises } from '../docusaurus/options.js'

// ----------------------------------------------------------------------------

/**
 * @class
 * The DoxygenXmlParser class is responsible for parsing
 * Doxygen-generated XML files and constructing the internal data model.
 *
 * @remarks
 * This class initialises the XML parser with options that preserve the order
 * and structure of the original XML content, ensuring accurate conversion
 * for documentation purposes. It maintains a counter for the number of files
 * parsed and stores the resulting data model.
 *
 * @example
 * const parser = new DoxygenXmlParser({ options });
 */
export class DoxygenXmlParser {
  /** The global configuration options. */
  options: CliOptions

  /** Tracks the number of XML files parsed. */
  parsedFilesCounter: number = 0

  /** The XML parser instance configured for Doxygen XML. */
  xmlParser: XMLParser

  /** The internal data model constructed from the XML files. */
  dataModel: DataModel = {
    compoundDefs: [],
  }

  /**
   * Constructs a new instance of the DoxygenXmlParser class.
   *
   * @param options - The global configuration options.
   *
   * @remarks
   * This constructor initialises the XML parser with settings that preserve the
   * order and structure of the original XML content, remove namespace prefixes,
   * and ensure that both tag and attribute values are parsed. The values are not
   * trimmed, maintaining fidelity to the source XML. The provided options are
   * stored for use throughout the parsing process.
   */
  constructor({ options }: { options: CliOptions }) {
    this.options = options

    this.xmlParser = new XMLParser({
      preserveOrder: true,
      removeNSPrefix: true,
      ignoreAttributes: false,
      parseTagValue: true,
      parseAttributeValue: true,
      trimValues: false,
    })
  }

  /**
   * Parses all relevant Doxygen-generated XML files and constructs the internal data model.
   *
   * @returns {Promise<DataModel>} A promise that resolves to the populated data model.
   *
   * @remarks
   * This method sequentially parses the main index XML file, all compound XML files referenced
   * in the index, and the Doxyfile XML containing configuration options. The parser is
   * configured to preserve the original content and element order for accuracy. The method
   * also processes member definitions and logs progress and statistics, such as the number
   * of files parsed and images identified, depending on the verbosity setting.
   */
  async parse(): Promise<DataModel> {
    // The parser is configured to preserve the original, non-trimmed content
    // and the original elements order. The downsize
    // Some details are from the schematic documentation:
    // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/README.md#documents
    // The defaults are in the project source:
    // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/src/xmlparser/OptionsBuilder.js

    // console.log(folderPath)

    // ------------------------------------------------------------------------
    // Parse the top index.xml file.

    if (!this.options.verbose) {
      console.log('Parsing Doxygen generated .xml files...')
    }

    await this.parseDoxygenIndex()

    assert(this.dataModel.doxygenindex !== undefined)

    // ------------------------------------------------------------------------
    // Parse all compound *.xml files mentioned in the index.

    if (Array.isArray(this.dataModel.doxygenindex.compounds)) {
      for (const indexCompound of this.dataModel.doxygenindex.compounds) {
        // Parallelise not possible, the order is relevant.
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

    assert(this.dataModel.doxyfile)

    console.log(this.parsedFilesCounter, 'xml files parsed')
    if (this.options.verbose) {
      if (this.dataModel.images !== undefined) {
        console.log(this.dataModel.images.length, 'images identified')
      }
    }

    // ------------------------------------------------------------------------

    return this.dataModel
  }

  /**
   * Parses the main Doxygen index XML file and initialises the index data model.
   *
   * @returns {Promise<void>} A promise that resolves when the index has been parsed.
   *
   * @remarks
   * This method reads and parses the `index.xml` file, ignoring the XML prologue and
   * top-level text nodes. It extracts the `doxygenindex` element and constructs the
   * corresponding data model. Any unrecognised elements are logged for diagnostic purposes.
   */
  async parseDoxygenIndex(): Promise<void> {
    const parsedIndexElements: XmlElement[] = await this.parseFile({
      fileName: 'index.xml',
    })
    // console.log(util.inspect(parsedIndex))
    // console.log(util.inspect(parsedIndex[0]['?xml']))
    // console.log(JSON.stringify(parsedIndex, null, '  '))

    for (const element of parsedIndexElements) {
      if (this.hasInnerElement(element, '?xml')) {
        // Ignore the top xml prologue.
      } else if (this.hasInnerText(element)) {
        // Ignore top texts.
      } else if (this.hasInnerElement(element, 'doxygenindex')) {
        this.dataModel.doxygenindex = new DoxygenIndexDataModel(this, element)
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
   * @param indexCompound - The compound index data model.
   * @param parsedDoxygenElements - The array of parsed XML elements for the compound.
   *
   * @remarks
   * This method iterates through the parsed XML elements, ignoring the XML prologue and
   * top-level text nodes. For recognised `doxygen` elements, it constructs the compound
   * definitions and appends them to the internal data model. Unrecognised elements are
   * logged for further analysis.
   */
  processCompoundDefs(
    indexCompound: IndexCompoundDataModel,
    parsedDoxygenElements: XmlElement[]
  ) {
    for (const element of parsedDoxygenElements) {
      if (this.hasInnerElement(element, '?xml')) {
        // Ignore the top xml prologue.
      } else if (this.hasInnerText(element)) {
        // Ignore top texts.
      } else if (this.hasInnerElement(element, 'doxygen')) {
        const doxygen = new DoxygenDataModel(this, element)
        if (Array.isArray(doxygen.compoundDefs)) {
          this.dataModel.compoundDefs.push(...doxygen.compoundDefs)
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
   * This method traverses all compound definitions and their associated sections.
   * It collects member definitions by their identifiers and, for each member with
   * an empty kind, assigns the kind from the corresponding member definition.
   * This ensures that all members are correctly classified within the internal
   * data model.
   */
  processMemberdefs() {
    const memberDefsById = new Map<string, MemberDefDataModel>()
    for (const compoundDef of this.dataModel.compoundDefs) {
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
   * @returns {Promise<void>} A promise that resolves when the Doxyfile has been parsed.
   *
   * @remarks
   * This method reads and parses the `Doxyfile.xml` file, ignoring the XML prologue
   * and top-level text nodes. It extracts the `doxyfile` element and constructs the
   * corresponding configuration data model. Any unrecognised elements are logged for
   * diagnostic purposes.
   */
  async parseDoxyfile(): Promise<void> {
    const parsedDoxyfileElements: XmlElement[] = await this.parseFile({
      fileName: 'Doxyfile.xml',
    })
    // console.log(util.inspect(parsedDoxyfile))
    // console.log(JSON.stringify(parsedDoxyfile, null, '  '))

    for (const element of parsedDoxyfileElements) {
      if (this.hasInnerElement(element, '?xml')) {
        // Ignore the top xml prologue.
      } else if (this.hasInnerElement(element, '#text')) {
        // Ignore top texts.
      } else if (this.hasInnerElement(element, 'doxyfile')) {
        this.dataModel.doxyfile = new DoxygenFileDataModel(this, element)
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
   * @param fileName - The name of the XML file to be parsed.
   * @returns {Promise<any>} A promise that resolves to the parsed XML content.
   *
   * @remarks
   * This method constructs the full file path using the configured input folder,
   * reads the XML file as a UTF-8 string, and parses it using the configured XML parser.
   * The method increments the internal counter for parsed files and, if verbose mode
   * is enabled, logs the file being parsed.
   */
  async parseFile({ fileName }: { fileName: string }): Promise<any> {
    const folderPath = this.options.doxygenXmlInputFolderPath
    const filePath: string = path.join(folderPath, fileName)
    const xmlString: string = await fs.readFile(filePath, { encoding: 'utf8' })

    if (this.options.verbose) {
      console.log(`Parsing ${fileName}...`)
    }
    this.parsedFilesCounter += 1

    return this.xmlParser.parse(xmlString)
  }

  // --------------------------------------------------------------------------

  hasAttributes(element: Object): boolean {
    return Object.hasOwn(element, ':@')
  }

  getAttributesNames(element: Object): string[] {
    return Object.keys((element as { ':@': {} })[':@'])
  }

  /**
   * Determines whether the specified attribute exists on the given XML element.
   *
   * @param element - The XML element to inspect.
   * @param name - The name of the attribute to check for.
   * @returns {boolean} True if the attribute exists; otherwise, false.
   *
   * @remarks
   * This method checks for the presence of an attribute within the ':@' property
   * of the XML element, which is the convention used by the XML parser for storing
   * attributes. It returns true if the attribute is found, otherwise false.
   */
  hasAttribute(element: Object, name: string): boolean {
    if (Object.hasOwn(element, ':@') === true) {
      const elementWithAttributes = element as { ':@': {} }
      return (
        elementWithAttributes[':@'] !== undefined &&
        Object.hasOwn(elementWithAttributes[':@'], name)
      )
    } else {
      return false
    }
  }

  getAttributeStringValue(element: Object, name: string): string {
    if (this.hasAttribute(element, name)) {
      const elementWithNamedAttribute = (
        element as { ':@': { [name]: string } }
      )[':@']
      const attributeValue = elementWithNamedAttribute[name]
      if (attributeValue !== undefined && typeof attributeValue === 'string') {
        return attributeValue
      } else if (
        attributeValue !== undefined &&
        typeof attributeValue === 'number'
      ) {
        // The xml parser returns attributes like `refid="21"` as numbers,
        // but the DTD defines them as strings and the applications expects
        // strings.
        return String(attributeValue)
      }
    }
    throw new Error(
      `Element ${util.inspect(element)} does not have the ${name} attribute`
    )
  }

  /**
   * Retrieves the value of a named attribute as a number.
   *
   * @param element - The XML element containing the attribute.
   * @param name - The name of the attribute to retrieve.
   * @returns {number} The attribute value as a number.
   * @throws If the attribute does not exist or is not a number.
   *
   * @remarks
   * This method checks whether the specified attribute exists on the XML element
   * and returns its value as a number. If the attribute is missing or its value
   * is not a number, an error is thrown to indicate the absence or incorrect type.
   */
  getAttributeNumberValue(element: Object, name: string): number {
    if (this.hasAttribute(element, name)) {
      const elementWithNamedAttribute = (
        element as { ':@': { [name]: number } }
      )[':@']
      const attributeValue = elementWithNamedAttribute[name]
      if (attributeValue !== undefined && typeof attributeValue === 'number') {
        return attributeValue
      }
    }
    throw new Error(
      `Element ${util.inspect(element)} does not have the ${name} number attribute`
    )
  }

  /**
   * Retrieves the value of a named attribute as a boolean.
   *
   * @param element - The XML element containing the attribute.
   * @param name - The name of the attribute to retrieve.
   * @returns {boolean} True if the attribute value is 'yes' (case-insensitive); otherwise, false.
   * @throws If the attribute does not exist or is not a string.
   *
   * @remarks
   * This method checks whether the specified attribute exists on the XML element,
   * and returns true if its value is the string 'yes' (case-insensitive). If the
   * attribute is missing or its value is not a string, an error is thrown.
   */
  getAttributeBooleanValue(element: Object, name: string): boolean {
    if (this.hasAttribute(element, name)) {
      const elementWithNamedAttribute = (
        element as { ':@': { [name]: string } }
      )[':@']
      const attributeValue = elementWithNamedAttribute[name]
      if (attributeValue !== undefined && typeof attributeValue === 'string') {
        return attributeValue.toLowerCase() === 'yes'
      }
    }
    throw new Error(
      `Element ${util.inspect(element)} does not have the ${name} boolean attribute`
    )
  }

  /**
   * Determines whether the specified inner element exists on the given XML element.
   *
   * @param element - The XML element to inspect.
   * @param name - The name of the inner element to check for.
   * @returns {boolean} True if the inner element exists; otherwise, false.
   *
   * @remarks
   * This method checks for the presence of a named property on the XML element.
   * For text nodes ('#text'), it verifies the value is a string, number, or boolean.
   * For other elements, it confirms the property is an array, as per the XML parser's convention.
   */
  hasInnerElement(element: Object, name: string): boolean {
    if (Object.hasOwn(element, name) === true) {
      if (name === '#text') {
        const value = (element as { ['#text']: any })['#text']
        return (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        )
      } else {
        return Array.isArray((element as { [name]: any })[name])
      }
    } else {
      return false
    }
  }

  /**
   * Determines whether a named inner element contains text.
   *
   * @param element - The XML element to inspect.
   * @param name - The name of the inner element.
   * @returns {boolean} True if the inner element contains text or is empty; otherwise, false.
   *
   * @remarks
   * This method checks if the specified inner element exists and contains a single text node,
   * or is an empty array (representing an empty string). It asserts the expected structure
   * and type of the value for robustness.
   */
  isInnerElementText(element: Object, name: string): boolean {
    if (Object.hasOwn(element, name) === true) {
      const innerElements: XmlElement[] | undefined = (
        element as { [name]: XmlElement[] }
      )[name]
      // console.log('isInnerElementText', util.inspect(element, { compact: false, depth: 999 })
      assert(innerElements !== undefined)
      if (innerElements.length === 1) {
        assert(innerElements[0] !== undefined)
        if (Object.hasOwn(innerElements[0], '#text') === true) {
          const value = (innerElements[0] as { ['#text']: any })['#text']
          assert(
            typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean'
          )
          return true
        }
      } else if (innerElements.length === 0) {
        // Empty string.
        return true
      }
    }
    return false
  }

  /**
   * Determines whether the XML element contains a text node.
   *
   * @param element - The XML element to inspect.
   * @returns {boolean} True if the element contains a text node; otherwise, false.
   *
   * @remarks
   * This method checks for the presence of a '#text' property on the XML element,
   * and verifies that its value is a string, number, or boolean.
   */
  hasInnerText(element: Object): boolean {
    if (Object.hasOwn(element, '#text') === true) {
      const value = (element as { ['#text']: any })['#text']
      return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      )
    } else {
      return false
    }
  }

  /**
   * Retrieves an array of named child elements from the given XML element.
   *
   * @template T - The expected type of the child elements array.
   * @param element - The XML element containing the child elements.
   * @param name - The name of the child elements to retrieve.
   * @returns {T} The array of child elements.
   * @throws If the child elements do not exist.
   *
   * @remarks
   * This method accesses the specified property on the XML element and returns it
   * as an array of child elements. If the property is undefined, an error is thrown
   * indicating the absence of the expected child element.
   */
  getInnerElements<T = XmlElement[]>(element: Object, name: string): T {
    // assert(Object.hasOwn(element, name) === true && Array.isArray((element as { [name]: T })[name]))
    const innerElements: T | undefined = (element as { [name]: T })[name]
    if (innerElements !== undefined) {
      return innerElements
    }
    throw new Error(
      `Element ${util.inspect(element, { compact: false, depth: 999 })} does not have the ${name} child element`
    )
  }

  /**
   * Retrieves the text content of a named child element.
   *
   * @param element - The XML element containing the child element.
   * @param name - The name of the child element.
   * @returns {string} The text content of the child element.
   * @throws If the child element does not exist or contains more than one element.
   *
   * @remarks
   * This method accesses the specified child element and returns its text content.
   * If the child element is missing, an error is thrown. If the child element is empty,
   * an empty string is returned. If there is more than one child element, an error is thrown
   * to indicate unexpected structure.
   */
  getInnerElementText(element: Object, name: string): string {
    const innerElements: XmlElement[] | undefined = (
      element as { [name]: XmlElement[] }
    )[name]

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

  /**
   * Retrieves the numeric value of a named child element.
   *
   * @param element - The XML element containing the child element.
   * @param name - The name of the child element.
   * @returns {number} The numeric value of the child element.
   * @throws If the child element does not exist or contains more than one element.
   *
   * @remarks
   * This method accesses the specified child element and returns its value as a number.
   * If the child element is missing, an error is thrown. If the child element is empty,
   * NaN is returned. If there is more than one child element, an error is thrown to
   * indicate unexpected structure.
   */
  getInnerElementNumber(element: Object, name: string): number {
    const innerElements: XmlElement[] | undefined = (
      element as { [name]: XmlElement[] }
    )[name]

    if (innerElements === undefined) {
      throw new Error('No inner elements')
    }
    if (innerElements.length === 1) {
      const value = (innerElements[0] as { ['#text']: any })['#text']
      return parseInt(value)
    } else if (innerElements.length === 0) {
      return NaN
    } else {
      throw new Error('Too many elements')
    }
  }

  /**
   * Retrieves the boolean value of a named child element.
   *
   * @param element - The XML element containing the child element.
   * @param name - The name of the child element.
   * @returns {boolean} True if the child element's text is 'true' (case-insensitive); otherwise, false.
   * @throws If the child element does not exist or contains more than one element.
   *
   * @remarks
   * This method accesses the specified child element and returns its value as a boolean.
   * If the child element is missing, an error is thrown. If the child element is empty,
   * false is returned. If there is more than one child element, an error is thrown to
   * indicate unexpected structure.
   */
  getInnerElementBoolean(element: Object, name: string): boolean {
    const innerElements: XmlElement[] | undefined = (
      element as { [name]: XmlElement[] }
    )[name]

    if (innerElements === undefined) {
      throw new Error('No inner elements')
    }
    if (innerElements.length === 1) {
      const value = (innerElements[0] as { ['#text']: any })['#text']
        .trim()
        .toLowerCase()
      return value === 'true'
    } else if (innerElements.length === 0) {
      return false
    } else {
      throw new Error('Too many elements')
    }
  }

  /**
   * Retrieves the text content of the XML element.
   *
   * @param element - The XML element to retrieve text from.
   * @returns {string} The text content of the element.
   * @throws If the element does not contain a valid text node.
   *
   * @remarks
   * This method accesses the '#text' property of the XML element and returns its value
   * as a string. It asserts that the value is of type string, number, or boolean before
   * converting it to a string. If the property is missing or the value is of an unexpected
   * type, an error is thrown.
   */
  getInnerText(element: Object): string {
    // assert(Object.hasOwn(element, '#text') === true)
    const value = (element as { ['#text']: any })['#text']
    assert(
      typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    )
    return value.toString()
  }
}

// ----------------------------------------------------------------------------
