/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2026 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/licenses/MIT.
 */

import assert from 'node:assert'
import * as util from 'node:util'

import { DoxygenXmlParser } from '../doxygen-xml-parser.js'
import { AbstractDataModelBase } from '../types.js'
import {
  AbstractDescriptionType,
  ProgramListingDataModel,
} from './descriptiontype-dm.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="conceptParts">
//   <xsd:sequence>
//     <xsd:choice minOccurs="0" maxOccurs="unbounded">
//       <xsd:element name="codepart" type="conceptCodePart"/>
//       <xsd:element name="docpart" type="conceptDocPart"/>
//     </xsd:choice>
//   </xsd:sequence>
// </xsd:complexType>

// ----------------------------------------------------------------------------

/**
 * Abstract base class for concept parts containers.
 *
 * @remarks
 * This class is useful because Doxygen emits concept parts as an ordered
 * mixture of code fragments and documentation fragments, and that order must
 * be preserved for later rendering. Use this class as the common parser for
 * `conceptparts`-style elements that contain repeated `codepart` and
 * `docpart` children. The parsed children are stored in the inherited
 * `children` collection.
 */
export abstract class AbstractConceptParts extends AbstractDataModelBase {
  /**
   * Creates a new abstract concept parts data model instance.
   *
   * @remarks
   * This constructor is useful because it parses the ordered child sequence
   * of a concept parts element and instantiates the corresponding concrete
   * child data models. Use it from subclasses that represent XML elements
   * following the `conceptParts` schema shape. The original ordering of
   * `codepart` and `docpart` elements is preserved in `children`.
   *
   * @param xml - The XML parser instance for processing elements.
   * @param element - The XML element object to parse.
   * @param elementName - The name of the XML element being processed.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(
    //   elementName,
    //   util.inspect(element, { compact: false, depth: 999 })
    // )

    // ------------------------------------------------------------------------
    // Process elements.

    // A sequence of codepart, docpart, in any order.
    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []
    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'codepart')) {
        this.children.push(new ConceptCodePartDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'docpart')) {
        this.children.push(new ConceptDocPartDataModel(xml, innerElement))
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
  }
}

// ----------------------------------------------------------------------------

//     <xsd:element name="conceptparts" type="conceptParts" minOccurs="0" />

/**
 * Data model for `conceptparts` elements.
 *
 * @remarks
 * This class is useful because it provides the concrete entry point for
 * parsing Doxygen `conceptparts` XML nodes into the internal data model.
 * Use it when a compound definition contains a `conceptparts` child. The
 * inherited parsing logic stores the ordered code and documentation parts in
 * the `children` collection.
 */
export class ConceptPartsDataModel extends AbstractConceptParts {
  /**
   * Creates a new `conceptparts` data model instance.
   *
   * @remarks
   * This constructor is useful because it binds the generic concept parts
   * parser to the concrete `conceptparts` XML element name. Use it when
   * parsing a Doxygen compound that includes concept parts content.
   *
   * @param xml - The XML parser instance for processing elements.
   * @param element - The XML element object to parse.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'conceptparts')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="conceptCodePart">
//   <xsd:sequence>
//     <xsd:element name="programlisting" type="listingType"/>
//   </xsd:sequence>
//   <xsd:attribute name="line" type="xsd:integer"/>
// </xsd:complexType>

// ----------------------------------------------------------------------------

/**
 * Abstract base class for concept code parts.
 *
 * @remarks
 * This class is useful because concept code fragments combine a mandatory
 * program listing with source-location metadata, and both must be parsed
 * together from the XML. Use this class as the common parser for elements
 * shaped like `conceptCodePart`. Subclasses provide the concrete XML element
 * name.
 */
export abstract class AbstractConceptCodePart extends AbstractDataModelBase {
  /**
   * Program listing contained in the concept code part.
   *
   * @remarks
   * This property is useful because it preserves the code fragment associated
   * with a concept part as a structured listing data model for later
   * rendering. It is populated from the `programlisting` child element.
   */
  programListing?: ProgramListingDataModel | undefined

  /**
   * Source line number of the concept code part.
   *
   * @remarks
   * This property is useful because it records the original source location
   * reported by Doxygen for the code fragment. It is populated from the
   * `line` XML attribute and is required to be greater than zero.
   */
  line: number | undefined

  /**
   * Creates a new abstract concept code part data model instance.
   *
   * @remarks
   * This constructor is useful because it parses both the embedded program
   * listing and the source line metadata for a concept code part. Use it from
   * subclasses representing concrete XML elements that follow the
   * `conceptCodePart` schema definition. The constructor validates that the
   * required `line` attribute is present and positive.
   *
   * @param xml - The XML parser instance for processing elements.
   * @param element - The XML element object to parse.
   * @param elementName - The name of the XML element being processed.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(
    //   elementName,
    //   util.inspect(element, { compact: false, depth: 999 })
    // )

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'programlisting')) {
        this.programListing = new ProgramListingDataModel(xml, innerElement)
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
      if (attributeName === '@_line') {
        this.line = xml.getAttributeNumberValue(element, '@_line')
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

    assert(this.line !== undefined)
    assert(this.line > 0)
  }
}

/**
 * Data model for `codepart` elements within concept parts.
 *
 * @remarks
 * This class is useful because it provides the concrete parser for concept
 * code fragments emitted by Doxygen. Use it when a `conceptparts` element
 * contains a `codepart` child. The parsed data includes both the code listing
 * and the source line metadata.
 */
export class ConceptCodePartDataModel extends AbstractConceptCodePart {
  /**
   * Creates a new `codepart` data model instance.
   *
   * @remarks
   * This constructor is useful because it binds the abstract concept code
   * part parser to the concrete `codepart` XML element name. Use it when
   * parsing concept-part content from Doxygen output.
   *
   * @param xml - The XML parser instance for processing elements.
   * @param element - The XML element object to parse.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'codepart')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="conceptDocPart">
//   <xsd:complexContent>
//     <xsd:extension base="descriptionType">
//       <xsd:attribute name="line" type="xsd:integer"/>
//       <xsd:attribute name="col" type="xsd:integer"/>
//     </xsd:extension>
//   </xsd:complexContent>
// </xsd:complexType>

// ----------------------------------------------------------------------------

/**
 * Data model for `docpart` elements within concept parts.
 *
 * @remarks
 * This class is useful because it extends the standard description model
 * with source-location metadata specific to concept documentation fragments.
 * Use it when a `conceptparts` element contains a `docpart` child. The class
 * preserves both the rich description content and the line and column
 * position reported by Doxygen.
 */
export class ConceptDocPartDataModel extends AbstractDescriptionType {
  /**
   * Source line number of the documentation fragment.
   *
   * @remarks
   * This property is useful because it records where the documentation part
   * originated in the source file. It is populated from the `line` XML
   * attribute and is required to be greater than zero.
   */
  line: number | undefined

  /**
   * Source column number of the documentation fragment.
   *
   * @remarks
   * This property is useful because it complements {@link line} with the
   * column position reported by Doxygen for the documentation part. It is
   * populated from the `col` XML attribute and is required to be greater than
   * zero.
   */
  col: number | undefined

  /**
   * Creates a new `docpart` data model instance.
   *
   * @remarks
   * This constructor is useful because it parses description content using
   * the existing description-type logic, then extends that parsing with the
   * additional line and column attributes required by concept documentation
   * parts. Use it when parsing a `docpart` child from a `conceptparts`
   * element.
   *
   * @param xml - The XML parser instance for processing elements.
   * @param element - The XML element object to parse.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'docpart')

    // console.log(
    //   'docpart',
    //   util.inspect(element, { compact: false, depth: 999 })
    // )

    // ------------------------------------------------------------------------
    // Process attributes.

    // AbstractDescriptionType has no attributes, so all attributes are
    // processed here.
    assert(xml.hasAttributes(element))
    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_line') {
        this.line = xml.getAttributeNumberValue(element, '@_line')
      } else if (attributeName === '@_col') {
        this.col = xml.getAttributeNumberValue(element, '@_col')
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(
          `docpart attribute:`,
          attributeName,
          'not implemented yet in',
          this.constructor.name
        )
      }
    }

    assert(this.line !== undefined)
    assert(this.line > 0)
    assert(this.col !== undefined)
    assert(this.col > 0)
  }
}
// ----------------------------------------------------------------------------
