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
import { AbstractDataModelBase } from '../types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="locationType">
//   <xsd:attribute name="file" type="xsd:string" />
//   <xsd:attribute name="line" type="xsd:integer" />
//   <xsd:attribute name="column" type="xsd:integer" use="optional"/>
//   <xsd:attribute name="declfile" type="xsd:string" use="optional"/>
//   <xsd:attribute name="declline" type="xsd:integer" use="optional"/>
//   <xsd:attribute name="declcolumn" type="xsd:integer" use="optional"/>
//   <xsd:attribute name="bodyfile" type="xsd:string" />
//   <xsd:attribute name="bodystart" type="xsd:integer" />
//   <xsd:attribute name="bodyend" type="xsd:integer" />
// </xsd:complexType>

/**
 * Abstract base class for location information data models.
 *
 * @remarks
 * Represents comprehensive source code location information as parsed from
 * Doxygen XML elements, including file paths, line numbers, and column
 * positions for both declarations and implementations. This class provides
 * the foundation for tracking source location references within the
 * documentation system, enabling precise navigation between documentation
 * and source code.
 *
 * The implementation handles the XML Schema definition for locationType
 * elements, which contain detailed positioning information for code elements
 * including separate tracking of declaration and implementation locations
 * when they differ (such as header/source file pairs).
 *
 * @public
 */
export abstract class AbstractLocationType extends AbstractDataModelBase {
  /**
   * The source file path containing the primary declaration or definition.
   *
   * @remarks
   * File path as recorded by Doxygen, typically relative to the source tree
   * root or absolute depending on configuration settings. This represents
   * the primary file location where the documented element is defined.
   *
   * @public
   */
  file = ''

  /**
   * The line number in the primary source file.
   *
   * @remarks
   * Line number where the declaration or definition appears within the
   * primary source file. Note that whilst the XSD specification indicates
   * this as mandatory, in practice it may be undefined for certain elements
   * where precise line information is not available or applicable.
   *
   * @public
   */
  line?: number | undefined

  /**
   * The column number in the primary source file.
   *
   * @remarks
   * Column position where the declaration or definition begins, providing
   * precise horizontal location information when available. This enables
   * accurate source code navigation and positioning within development
   * environments.
   *
   * @public
   */
  column?: number | undefined

  /**
   * The file path containing the declaration when separate from implementation.
   *
   * @remarks
   * File path for the declaration when it differs from the implementation
   * file, typically occurring in header/source file pairs where declarations
   * are placed in header files whilst implementations reside in source files.
   * This separation is common in C/C++ development patterns.
   *
   * @public
   */
  declfile?: string | undefined

  /**
   * The line number of the declaration within the declaration file.
   *
   * @remarks
   * Line number where the declaration appears, separate from the
   * implementation location when they differ. This provides precise
   * positioning within the declaration file for accurate source navigation.
   *
   * @public
   */
  declline?: number | undefined

  /**
   * The column number of the declaration within the declaration file.
   *
   * @remarks
   * Column position where the declaration begins, providing precise
   * horizontal location information for the declaration. This enables
   * accurate positioning within development environments when navigating
   * to declaration locations.
   *
   * @public
   */
  declcolumn?: number | undefined

  /**
   * The file path containing the implementation body.
   *
   * @remarks
   * File path where the function or method body is implemented, separate
   * from the declaration when they differ. This is particularly relevant
   * for languages that support separate declaration and implementation
   * files, enabling precise navigation to implementation code.
   *
   * @public
   */
  bodyfile?: string | undefined

  /**
   * The starting line number of the implementation body.
   *
   * @remarks
   * Line number where the implementation body begins, providing the starting
   * boundary for locating function or method implementations. This is useful
   * for identifying the complete scope of implementation code.
   *
   * @public
   */
  bodystart?: number | undefined

  /**
   * The ending line number of the implementation body.
   *
   * @remarks
   * Line number where the implementation body ends, providing the complete
   * range of the implementation. Together with bodystart, this defines the
   * full extent of the implementation code within the source file.
   *
   * @public
   */
  bodyend?: number | undefined

  /**
   * Constructs a new location data model from XML element data.
   *
   * @param xml - The XML parser instance for processing element data
   * @param element - The XML element containing location information
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * Parses the XML element representing location information and extracts
   * file paths, line numbers, and column positions for declarations and
   * implementations. The constructor processes all available location
   * attributes whilst handling the distinction between declaration and
   * implementation locations when they differ.
   *
   * The implementation ensures that mandatory file information is present
   * and validates the element structure according to the XML Schema
   * definition for locationType elements.
   *
   * @public
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    // There are no inner elements.
    assert(innerElements.length === 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_file') {
        this.file = xml.getAttributeStringValue(element, '@_file')
      } else if (attributeName === '@_line') {
        this.line = Number(xml.getAttributeNumberValue(element, '@_line'))
      } else if (attributeName === '@_column') {
        this.column = Number(xml.getAttributeNumberValue(element, '@_column'))
      } else if (attributeName === '@_declfile') {
        this.declfile = xml.getAttributeStringValue(element, '@_declfile')
      } else if (attributeName === '@_declline') {
        this.declline = Number(
          xml.getAttributeNumberValue(element, '@_declline')
        )
      } else if (attributeName === '@_declcolumn') {
        this.declcolumn = Number(
          xml.getAttributeNumberValue(element, '@_declcolumn')
        )
      } else if (attributeName === '@_bodyfile') {
        this.bodyfile = xml.getAttributeStringValue(element, '@_bodyfile')
      } else if (attributeName === '@_bodystart') {
        this.bodystart = xml.getAttributeNumberValue(element, '@_bodystart')
      } else if (attributeName === '@_bodyend') {
        this.bodyend = xml.getAttributeNumberValue(element, '@_bodyend')
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

    assert(this.file.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="location" type="locationType" minOccurs="0" />

/**
 * Concrete implementation for location elements within documentation.
 *
 * @remarks
 * Provides specific handling for location XML elements that contain
 * comprehensive source code positioning information. This implementation
 * extends the abstract base class functionality to process location
 * elements with the specific element name 'location'.
 *
 * The class ensures proper instantiation of location data models whilst
 * maintaining all the detailed positioning information required for
 * accurate source code navigation and reference generation.
 *
 * @public
 */
export class LocationDataModel extends AbstractLocationType {
  /**
   * Constructs a new location data model instance.
   *
   * @param xml - The XML parser instance for processing elements
   * @param element - The source XML element containing location data
   *
   * @remarks
   * Initialises the data model with the specific element name 'location'
   * and delegates processing to the abstract base class implementation.
   * This ensures consistent handling of location information whilst
   * maintaining proper element identification.
   *
   * @public
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'location')
  }
}

// ----------------------------------------------------------------------------
