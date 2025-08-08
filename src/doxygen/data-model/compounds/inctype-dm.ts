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
import util from 'node:util'

import { DoxygenXmlParser } from '../doxygen-xml-parser.js'
import { AbstractDataModelBase } from '../types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="incType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//       <xsd:attribute name="refid" type="xsd:string" use="optional" />
//       <xsd:attribute name="local" type="DoxBool" />
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>

/**
 * Abstract base class for include-type elements within documentation.
 *
 * @remarks
 * Implements processing for include-type elements that represent file inclusion
 * relationships within source code documentation. This class handles the XML
 * Schema definition for incType elements, which contain textual content
 * representing file paths or names along with attributes that specify inclusion
 * behaviour and reference relationships.
 *
 * The implementation processes both local and system includes, distinguishing
 * between quoted includes ("filename") and angle-bracket includes (<filename>)
 * through the local attribute. Optional reference identifiers enable
 * cross-referencing to the included file's documentation.
 *
 * @public
 */
export abstract class AbstractIncType extends AbstractDataModelBase {
  /**
   * The textual content representing the file path or name being included.
   *
   * @remarks
   * Contains the file path or filename as specified in the include directive.
   * This text content represents the actual filename that appears within
   * the include statement in the source code, providing the reference to
   * the included file within the documentation structure.
   */
  // Mandatory elements.
  text = '' // Passed as element text.

  /**
   * Indicates whether the include uses local or system include syntax.
   *
   * @remarks
   * Determines the include syntax style: when true, indicates a local include
   * using quotation marks ("filename"), when false, indicates a system include
   * using angle brackets (<filename>). This distinction affects how the
   * preprocessor searches for the included file.
   */
  // Mandatory attributes.
  local = false // It means to use "..." instead of <...>.

  /**
   * Optional reference identifier for cross-linking to the included file.
   *
   * @remarks
   * Contains the reference identifier that links to the documentation of
   * the included file. This enables navigation from include statements to
   * the actual file documentation within the generated documentation system.
   */
  // Optional attributes.
  refId?: string | undefined // file id

  /**
   * Constructs an AbstractIncType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the include data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes include-type elements by extracting the
   * textual content representing the filename and processing attributes
   * that specify inclusion behaviour. The parser validates the presence
   * of required content and attributes whilst maintaining compliance with
   * the XML Schema definition for include elements.
   *
   * The implementation distinguishes between local and system includes
   * through the local attribute and optionally associates reference
   * identifiers for cross-linking to included file documentation.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))ect(element))ect(element))

    // ------------------------------------------------------------------------
    // Process elements.

    assert(xml.isInnerElementText(element, elementName))
    this.text = xml.getInnerElementText(element, elementName)

    assert(this.text.length > 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_local') {
        this.local = xml.getAttributeBooleanValue(element, '@_local')
      } else if (attributeName === '@_refid') {
        this.refId = xml.getAttributeStringValue(element, '@_refid')
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

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="includes" type="incType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="includedby" type="incType" minOccurs="0" maxOccurs="unbounded" />

/**
 * Data model for includes elements within documentation content.
 *
 * @remarks
 * Represents includes elements that document files included by the current
 * source file. This implementation processes Doxygen's includes elements,
 * which contain information about files that are included through preprocessor
 * directives such as #include statements within the documented source code.
 *
 * The includes relationship indicates a dependency where the current file
 * incorporates content from the referenced file during compilation.
 *
 * @public
 */
export class IncludesDataModel extends AbstractIncType {
  /**
   * Constructs an IncludesDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the includes data
   *
   * @remarks
   * This constructor delegates to the parent AbstractIncType to handle
   * include processing whilst identifying the element as 'includes' for
   * proper XML schema compliance and include relationship documentation.
   * The processed data represents files that are included by the current
   * source file through preprocessor directives.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'includes')
  }
}

/**
 * Data model for includedby elements within documentation content.
 *
 * @remarks
 * Represents includedby elements that document files which include the
 * current source file. This implementation processes Doxygen's includedby
 * elements, which contain information about files that incorporate the
 * current file through preprocessor directives, establishing reverse
 * inclusion relationships within the documentation system.
 *
 * The includedby relationship indicates a dependency where other files
 * incorporate content from the current file during compilation.
 *
 * @public
 */
export class IncludedByDataModel extends AbstractIncType {
  /**
   * Constructs an IncludedByDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the includedby data
   *
   * @remarks
   * This constructor delegates to the parent AbstractIncType to handle
   * include processing whilst identifying the element as 'includedby' for
   * proper XML schema compliance and reverse include relationship handling.
   * The processed data represents files that include the current source file
   * through preprocessor directives, establishing dependency relationships.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'includedby')
  }
}

// ----------------------------------------------------------------------------
