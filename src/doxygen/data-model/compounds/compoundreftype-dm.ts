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

// <xsd:complexType name="compoundRefType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//       <xsd:attribute name="refid" type="xsd:string" use="optional" />
//       <xsd:attribute name="prot" type="DoxProtectionKind" />
//       <xsd:attribute name="virt" type="DoxVirtualKind" />
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>

/**
 * Abstract base class for compound reference data models.
 *
 * @remarks
 * Represents references to other compound entities in Doxygen XML output,
 * including inheritance relationships and cross-references. This class
 * handles the 'compoundRefType' XML schema structure with text content
 * and attributes for protection level, virtual specification, and optional
 * reference identifiers.
 *
 * @public
 */
export abstract class AbstractCompoundRefType extends AbstractDataModelBase {
  // Mandatory elements.

  /**
   * The name or identifier text of the referenced compound.
   *
   * @remarks
   * Contains the textual content extracted from the compound reference XML
   * element, typically representing the name of the referenced class,
   * structure, or other compound entity. This text content serves as the
   * primary identifier for the referenced compound in inheritance
   * relationships and cross-references.
   */
  text = '' // Passed as element text.

  // Mandatory attributes.

  /**
   * Protection level of the compound reference.
   *
   * @remarks
   * Specifies the access protection level using DoxProtectionKind
   * enumeration values ('public', 'protected', 'private', 'package').
   * This mandatory attribute determines the visibility and accessibility
   * of the referenced compound in inheritance relationships.
   */
  prot = ''

  /**
   * Virtual specification of the compound reference.
   *
   * @remarks
   * Specifies the virtual nature using DoxVirtualKind enumeration values
   * ('non-virtual', 'virtual', 'pure-virtual'). This mandatory attribute
   * indicates whether the compound reference involves virtual inheritance
   * or virtual methods in object-oriented programming contexts.
   */
  virt = ''

  // Optional attributes.

  /**
   * Optional reference identifier for cross-linking.
   *
   * @remarks
   * Contains the unique identifier that can be used to create hyperlinks
   * or cross-references to the referenced compound's documentation. When
   * present, this identifier enables navigation between related compound
   * definitions in the generated documentation.
   */
  refid?: string | undefined

  /**
   * Constructs a new compound reference data model instance.
   *
   * @remarks
   * Parses compound reference elements from Doxygen XML output, extracting
   * the text content representing the compound name and processing attributes
   * for protection level, virtual specification, and optional reference
   * identifier. This provides the foundation for inheritance and
   * cross-reference relationships in the documentation structure.
   *
   * @param xml - The XML parser instance for processing elements
   * @param element - The XML element object to parse
   * @param elementName - The name of the XML element being processed
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
      if (attributeName === '@_prot') {
        this.prot = xml.getAttributeStringValue(element, '@_prot')
      } else if (attributeName === '@_virt') {
        this.virt = xml.getAttributeStringValue(element, '@_virt')
      } else if (attributeName === '@_refid') {
        this.refid = xml.getAttributeStringValue(element, '@_refid')
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

    assert(this.prot.length > 0)
    assert(this.virt.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:simpleType name="DoxProtectionKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="public" />
//     <xsd:enumeration value="protected" />
//     <xsd:enumeration value="private" />
//     <xsd:enumeration value="package" />
//   </xsd:restriction>
// </xsd:simpleType>

/**
 * Type definition for Doxygen protection levels.
 *
 * @remarks
 * Represents the access protection levels available in object-oriented
 * programming languages as recognised by Doxygen. These values correspond
 * to the visibility modifiers used in class inheritance and member access
 * control throughout the documentation system.
 *
 * @public
 */
export type DoxProtectionKind = 'public' | 'protected' | 'private' | 'package'

// ----------------------------------------------------------------------------

// <xsd:simpleType name="DoxVirtualKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="non-virtual" />
//     <xsd:enumeration value="virtual" />
//     <xsd:enumeration value="pure-virtual" />
//   </xsd:restriction>
// </xsd:simpleType>

/**
 * Type definition for Doxygen virtual function specifications.
 *
 * @remarks
 * Represents the virtual function categories recognised by Doxygen for
 * object-oriented programming languages. These values indicate the virtual
 * nature of methods and functions in inheritance hierarchies, enabling
 * proper documentation of polymorphic behaviour and interface contracts.
 *
 * @public
 */
export type DoxVirtualKind = 'non-virtual' | 'virtual' | 'pure-virtual'

// ----------------------------------------------------------------------------

// <xsd:element name="basecompoundref" type="compoundRefType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="derivedcompoundref" type="compoundRefType" minOccurs="0" maxOccurs="unbounded" />

/**
 * Data model for base compound references in inheritance relationships.
 *
 * @remarks
 * Represents references to base classes or parent compounds in inheritance
 * hierarchies as documented by Doxygen. This class handles the
 * 'basecompoundref' XML elements that establish parent-child relationships
 * in object-oriented documentation structures.
 *
 * @public
 */
export class BaseCompoundRefDataModel extends AbstractCompoundRefType {
  /**
   * Constructs a new BaseCompoundRefDataModel instance.
   *
   * @remarks
   * Creates a data model object for 'basecompoundref' XML elements,
   * representing inheritance relationships where the current compound
   * derives from the referenced base compound.
   *
   * @param xml - The XML parser instance for processing elements
   * @param element - The XML element object to parse
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'basecompoundref')
  }
}

/**
 * Data model for derived compound references in inheritance relationships.
 *
 * @remarks
 * Represents references to derived classes or child compounds in inheritance
 * hierarchies as documented by Doxygen. This class handles the
 * 'derivedcompoundref' XML elements that establish child-parent relationships
 * in object-oriented documentation structures.
 *
 * @public
 */
export class DerivedCompoundRefDataModel extends AbstractCompoundRefType {
  /**
   * Constructs a new DerivedCompoundRefDataModel instance.
   *
   * @remarks
   * Creates a data model object for 'derivedcompoundref' XML elements,
   * representing inheritance relationships where other compounds derive
   * from the current compound as their base.
   *
   * @param xml - The XML parser instance for processing elements
   * @param element - The XML element object to parse
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'derivedcompoundref')
  }
}

// ----------------------------------------------------------------------------
