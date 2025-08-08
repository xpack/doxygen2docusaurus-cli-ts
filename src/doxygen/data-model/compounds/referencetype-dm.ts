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

// <xsd:complexType name="referenceType" mixed="true">
//   <xsd:attribute name="refid" type="xsd:string" />
//   <xsd:attribute name="compoundref" type="xsd:string" use="optional" />
//   <xsd:attribute name="startline" type="xsd:integer" />
//   <xsd:attribute name="endline" type="xsd:integer" />
// </xsd:complexType>

/**
 * Abstract base class for reference type data models.
 *
 * @remarks
 * Represents the foundational structure for reference relationship elements
 * within Doxygen XML documentation, corresponding to the referenceType
 * complex type in the XML schema. This class manages bidirectional reference
 * relationships between documented entities, capturing both the descriptive
 * text and precise location information including line number ranges. The
 * reference system enables comprehensive dependency tracking and cross-
 * referencing capabilities, essential for understanding code relationships
 * and generating accurate documentation navigation structures.
 *
 * @public
 */
export abstract class AbstractReferenceType extends AbstractDataModelBase {
  /**
   * The descriptive text content for this reference relationship.
   *
   * @remarks
   * Contains the textual description of the reference relationship, typically
   * including the name or signature of the referenced entity. This text
   * provides human-readable context about the relationship and is used for
   * display purposes within the generated documentation. Note that this
   * property is not explicitly defined in the XML schema DTD but appears
   * in practice within reference elements.
   */
  // WARNING: not in DTD?
  text = ''

  /**
   * The unique reference identifier for the referenced entity.
   *
   * @remarks
   * Mandatory attribute that provides a unique identifier for the entity
   * being referenced. This identifier enables precise linking and cross-
   * referencing between documentation elements, allowing navigation to the
   * detailed documentation of the referenced item within the documentation
   * structure.
   */
  refid = ''

  /**
   * The starting line number where the reference occurs.
   *
   * @remarks
   * Specifies the line number in the source code where the reference
   * relationship begins. This location information enables precise source
   * code navigation and helps establish the exact context of the reference
   * within the original source files. Note that this attribute may be missing
   * in some reference elements despite being defined as mandatory in the
   * XML schema.
   */
  // WARNING: may be missing
  startline: number | undefined

  /**
   * The ending line number where the reference concludes.
   *
   * @remarks
   * Specifies the line number in the source code where the reference
   * relationship ends. Combined with the starting line, this provides a
   * complete range for the reference occurrence, enabling precise source
   * code highlighting and navigation capabilities. Note that this attribute
   * may be missing in some reference elements despite being defined as
   * mandatory in the XML schema.
   */
  // WARNING: may be missing
  endline: number | undefined

  /**
   * The compound reference identifier for the containing entity.
   *
   * @remarks
   * Optional attribute that provides the identifier of the compound entity
   * (such as a class or namespace) that contains the referenced item. This
   * additional context enables more precise navigation and helps establish
   * the hierarchical relationship between the referencing and referenced
   * entities within the documentation structure.
   */
  compoundref?: string | undefined

  /**
   * Constructs a new abstract reference type from XML data.
   *
   * @param xml - The Doxygen XML parser instance
   * @param element - The XML element containing reference relationship data
   * @param elementName - The expected XML element name
   *
   * @remarks
   * Parses the provided XML element to construct a complete reference
   * relationship data model. The parsing process extracts the textual content
   * from the element and processes all defined attributes including the
   * mandatory refid attribute, line number information, and optional compound
   * reference data. Validation ensures that the reference identifier is
   * present, maintaining the integrity of the reference relationship
   * documentation.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

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
      if (attributeName === '@_refid') {
        this.refid = xml.getAttributeStringValue(element, '@_refid')
      } else if (attributeName === '@_startline') {
        this.startline = Number(
          xml.getAttributeNumberValue(element, '@_startline')
        )
      } else if (attributeName === '@_endline') {
        this.endline = Number(xml.getAttributeNumberValue(element, '@_endline'))
      } else if (attributeName === '@_compoundref') {
        this.compoundref = xml.getAttributeStringValue(element, '@_compoundref')
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

    assert(this.refid.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="references" type="referenceType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="referencedby" type="referenceType" minOccurs="0" maxOccurs="unbounded" />

/**
 * Data model for reference relationship elements.
 *
 * @remarks
 * Represents a forward reference relationship within Doxygen XML
 * documentation, corresponding to the references XML element. This class
 * manages relationships where the current entity references or depends upon
 * another documented entity. The relationship captures both the descriptive
 * information and precise location data, enabling comprehensive dependency
 * tracking and navigation capabilities. Forward references help document
 * how entities use or depend on other components within the codebase.
 *
 * @public
 */
export class ReferenceDataModel extends AbstractReferenceType {
  /**
   * Constructs a new reference relationship data model from XML.
   *
   * @param xml - The Doxygen XML parser instance
   * @param element - The XML element containing reference relationship data
   *
   * @remarks
   * Creates a complete forward reference relationship data model by parsing
   * the provided XML element. This constructor delegates to the parent class
   * to handle all standard parsing operations for the references element type,
   * establishing the forward dependency relationship between the current
   * entity and the referenced component.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'references')
  }
}

/**
 * Data model for referenced-by relationship elements.
 *
 * @remarks
 * Represents a reverse reference relationship within Doxygen XML
 * documentation, corresponding to the referencedby XML element. This class
 * manages relationships where the current entity is referenced or used by
 * another documented entity. The relationship provides bidirectional
 * dependency information, enabling comprehensive understanding of how
 * entities are utilised throughout the codebase. Referenced-by relationships
 * are essential for impact analysis and understanding the scope of changes
 * when modifying documented components.
 *
 * @public
 */
export class ReferencedByDataModel extends AbstractReferenceType {
  /**
   * Constructs a new referenced-by relationship data model from XML.
   *
   * @param xml - The Doxygen XML parser instance
   * @param element - The XML element containing referenced-by relationship data
   *
   * @remarks
   * Creates a complete reverse reference relationship data model by parsing
   * the provided XML element. This constructor delegates to the parent class
   * to handle all standard parsing operations for the referencedby element
   * type, establishing the reverse dependency relationship indicating how
   * other entities utilise the current component.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'referencedby')
  }
}

// ----------------------------------------------------------------------------
