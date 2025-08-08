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
import * as util from 'node:util'

import { DoxygenXmlParser } from '../doxygen-xml-parser.js'
import { CompoundDefDataModel } from './compounddef-dm.js'
import { AbstractDataModelBase } from '../types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="DoxygenType">
//   <xsd:sequence maxOccurs="unbounded">
//     <xsd:element name="compounddef" type="compounddefType" minOccurs="0" />
//   </xsd:sequence>
//   <xsd:attribute name="version" type="DoxVersionNumber" use="required" />
//   <xsd:attribute ref="xml:lang" use="required"/>
// </xsd:complexType>

/**
 * Abstract base class for the root Doxygen document type.
 *
 * @remarks
 * Represents the top-level Doxygen XML document structure containing
 * compound definitions and document metadata. This is the root element
 * that contains all other documentation elements parsed from Doxygen XML.
 *
 * @public
 */
export abstract class AbstractDoxygenType extends AbstractDataModelBase {
  // Mandatory attributes.
  /**
   * The version of Doxygen that generated the XML.
   *
   * @remarks
   * Version string indicating which Doxygen version was used to
   * generate the XML output, useful for compatibility checking.
   */
  version = ''

  /**
   * The language code for the documentation.
   *
   * @remarks
   * XML language attribute indicating the primary language used
   * in the documentation content.
   */
  lang = ''

  // Optional elements.
  /**
   * Array of compound definition data models.
   *
   * @remarks
   * Contains all the compound definitions (classes, files, namespaces, etc.)
   * that are documented within this Doxygen XML file. This is the main
   * content of the documentation.
   */
  compoundDefs?: CompoundDefDataModel[] | undefined

  // Optional attributes.
  /**
   * XML schema location when no namespace is specified.
   *
   * @remarks
   * Optional attribute specifying the schema location for XML
   * validation when no explicit namespace is used.
   */
  noNamespaceSchemaLocation?: string | undefined

  /**
   * Creates a new Doxygen document data model from XML.
   *
   * @remarks
   * Parses the root XML element representing a Doxygen document and
   * extracts all compound definitions and metadata attributes.
   *
   * @param xml - The XML parser instance
   * @param element - The XML element to parse
   * @param elementName - The name of the XML element
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element,
    //   { compact: false, depth: 999 }))

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'compounddef')) {
        this.compoundDefs ??= []
        this.compoundDefs.push(new CompoundDefDataModel(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(
          `${elementName} element:`,
          Object.keys(innerElement),
          'not implemented yet in',
          this.constructor.name
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_version') {
        this.version = xml.getAttributeStringValue(element, '@_version')
      } else if (attributeName === '@_lang') {
        this.lang = xml.getAttributeStringValue(element, '@_lang')
      } else if (attributeName === '@_noNamespaceSchemaLocation') {
        this.noNamespaceSchemaLocation = xml.getAttributeStringValue(
          element,
          '@_noNamespaceSchemaLocation'
        )
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(
          `${elementName} attribute:`,
          attributeName,
          'not implemented yet in',
          this.constructor.name
        )
      }
    }
    assert(this.version.length > 0)
    assert(this.lang.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="doxygen" type="DoxygenType"/>

/**
 * Concrete implementation of the Doxygen document data model.
 *
 * @remarks
 * Represents the root doxygen element in Doxygen XML files. Inherits
 * all functionality from the abstract base class and provides the
 * specific element name for parsing.
 *
 * @public
 */
export class DoxygenDataModel extends AbstractDoxygenType {
  /**
   * Creates a new Doxygen document data model from XML.
   *
   * @remarks
   * Parses the XML element representing the root doxygen element using
   * the inherited parsing logic with the 'doxygen' element name.
   *
   * @param xml - The XML parser instance
   * @param element - The XML element to parse
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'doxygen')
  }
}

// ----------------------------------------------------------------------------
