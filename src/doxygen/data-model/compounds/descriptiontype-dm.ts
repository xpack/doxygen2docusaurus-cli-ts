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
import { RefTextDataModel } from './reftexttype-dm.js'
import { VariableListDataModel } from './docvarlistentrytype-dm.js'
import { DocBookOnlyDataModel, HtmlOnlyDataModel } from './compounddef-dm.js'
import { TocListDataModel } from './tableofcontentstype-dm.js'
import { isUrl } from '../../../docusaurus/utils.js'

// ----------------------------------------------------------------------------

/**
 * Abstract base class for XML elements that contain simple string content.
 *
 * @remarks
 * Whilst it might appear unusual to encapsulate string values within object
 * properties, this approach maintains consistency with format-specific
 * elements (such as XXXonly types) and provides a unified interface for
 * XML content processing throughout the Doxygen data model hierarchy.
 *
 * @public
 */
export abstract class AbstractStringType extends AbstractDataModelBase {
  /**
   * The textual content extracted from the XML element.
   *
   * @remarks
   * This property stores the inner text content of XML elements that follow
   * the simple string pattern, providing a standardised mechanism for
   * accessing textual data within the Doxygen XML structure.
   */
  text = ''

  /**
   * Constructs an AbstractStringType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the string data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor validates that the provided element contains inner text
   * content and extracts it into the text property. The implementation
   * ensures that no attributes are present on simple string elements,
   * maintaining the expected XML schema constraints.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    assert(xml.isInnerElementText(element, elementName))
    this.text = xml.getInnerElementText(element, elementName)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="descriptionType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="xsd:string" minOccurs="0"/>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="internal" type="docInternalType" minOccurs="0" maxOccurs="unbounded"/>
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

/**
 * Abstract base class for Doxygen description elements containing mixed
 * content.
 *
 * @remarks
 * Implements the XML Schema definition for descriptionType elements, which
 * support mixed content (character data between child elements). This class
 * handles the complex structure of documentation descriptions including
 * titles, paragraphs, internal sections, and hierarchical section elements.
 *
 * The implementation processes the sequence of optional title elements
 * followed by various documentation components such as paragraphs, internal
 * documentation, and nested section structures up to level 1.
 *
 * @public
 */
export abstract class AbstractDescriptionType extends AbstractDataModelBase {
  /**
   * Optional title element for the description.
   *
   * @remarks
   * Contains the title text for the description section when present.
   * According to the XML schema, only one title element is permitted
   * per description, hence the assertion that ensures uniqueness during
   * parsing.
   */
  title?: string | undefined // Only one.

  /**
   * Constructs an AbstractDescriptionType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the description data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes mixed content descriptions by iterating through
   * all inner elements and handling text nodes, title elements, paragraphs,
   * internal sections, and level-1 sections. The parser maintains the
   * original order of elements in the children array whilst extracting
   * the title into a separate property for convenient access.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = xml.getInnerElementText(innerElement, 'title')
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect1')) {
        this.children.push(new Sect1DataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="listingType">
// <xsd:sequence>
//   <xsd:element name="codeline" type="codelineType" minOccurs="0" maxOccurs="unbounded" />
// </xsd:sequence>
// <xsd:attribute name="filename" type="xsd:string" use="optional"/>
// </xsd:complexType>

/**
 * Abstract base class providing properties for listing-type XML elements.
 *
 * @remarks
 * Defines the common structure for elements that contain code listings
 * with optional filename attributes. This base class establishes the
 * foundation for both full listing implementations and filtered subsets
 * of code lines.
 *
 * @public
 */
export abstract class AbstractListingTypeBase extends AbstractDataModelBase {
  /**
   * Array of code line elements within the listing.
   *
   * @remarks
   * Contains the individual code lines that comprise the listing content.
   * Each code line may include syntax highlighting information, line
   * numbers, and cross-reference data depending on the source
   * documentation configuration.
   */
  codelines?: CodeLineDataModel[] | undefined

  /**
   * Optional filename attribute for the listing source.
   *
   * @remarks
   * Specifies the original filename of the source code when the listing
   * represents content from a specific file. This attribute assists in
   * providing context and navigation capabilities within the generated
   * documentation.
   */
  filename?: string | undefined
}

/**
 * Abstract base class for processing listing-type XML elements with parsing
 * logic.
 *
 * @remarks
 * Extends the base listing properties with comprehensive XML parsing
 * capabilities. This class handles the extraction of code lines and
 * filename attributes from Doxygen XML structures, providing the
 * foundation for program listings and similar code-containing elements.
 *
 * The parser processes codeline elements whilst ignoring textual content
 * that may appear between structured elements, maintaining compatibility
 * with the mixed-content nature of XML listings.
 *
 * @public
 */
export abstract class AbstractListingType extends AbstractListingTypeBase {
  /**
   * Constructs an AbstractListingType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the listing data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes listing elements by extracting codeline
   * children and filename attributes. Text content between elements is
   * deliberately ignored to accommodate the mixed-content model of XML
   * listings, focusing on the structured code line elements that contain
   * the meaningful programming content.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'codeline')) {
        this.codelines ??= []
        this.codelines.push(new CodeLineDataModel(xml, innerElement))
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_filename') {
          this.filename = xml.getAttributeStringValue(element, '@_filename')
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

//  <xsd:element name="programlisting" type="listingType" />

/**
 * Data model for programlisting XML elements containing source code.
 *
 * @remarks
 * Represents program listings that contain source code with optional
 * syntax highlighting and line numbering. This implementation processes
 * Doxygen's programlisting elements, which are commonly used to display
 * code examples, function implementations, and other programming content
 * within documentation.
 *
 * @public
 */
export class ProgramListingDataModel extends AbstractListingType {
  /**
   * Constructs a ProgramListingDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the programlisting data
   *
   * @remarks
   * This constructor delegates to the parent AbstractListingType to handle
   * the standard listing processing whilst specifically identifying the
   * element as a 'programlisting' type for proper XML schema compliance.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'programlisting')
  }
}

/**
 * Filtered data model for member-specific program listing content.
 *
 * @remarks
 * Creates a subset of a program listing containing only the code lines
 * that fall within a specified line number range. This class is particularly
 * useful for displaying member function implementations or specific code
 * sections within larger source files, enabling focused documentation
 * that highlights relevant portions of the codebase.
 *
 * The filtering process preserves all code line attributes including
 * syntax highlighting, cross-references, and line numbering whilst
 * restricting the content to the specified range.
 *
 * @public
 */
export class MemberProgramListingDataModel extends AbstractListingTypeBase {
  /**
   * Constructs a filtered program listing for member-specific content.
   *
   * @param programListing - The source program listing to filter
   * @param startLine - The first line number to include (inclusive)
   * @param endLine - The last line number to include (inclusive)
   *
   * @remarks
   * This constructor creates a new listing containing only the code lines
   * that fall within the specified line number range. The filtering process
   * examines each code line's line number attribute and includes only those
   * lines where the number falls between startLine and endLine (inclusive).
   *
   * If no lines fall within the specified range, the codelines property
   * remains undefined, indicating an empty filtered result.
   */
  constructor(
    programListing: ProgramListingDataModel,
    startLine: number,
    endLine: number
  ) {
    super(programListing.elementName)

    assert(startLine <= endLine)
    if (programListing.codelines !== undefined) {
      const filteredCodelines: CodeLineDataModel[] = []
      for (const codeline of programListing.codelines) {
        if (codeline.lineno !== undefined) {
          const lineno = codeline.lineno.valueOf()
          if (startLine <= lineno && lineno <= endLine) {
            filteredCodelines.push(codeline)
          }
        }
      }
      if (filteredCodelines.length > 0) {
        this.codelines = filteredCodelines
      }
    }
  }
}

// WARNING: attributes are all optional
// <xsd:complexType name="codelineType">
// <xsd:sequence>
//   <xsd:element name="highlight" type="highlightType" minOccurs="0" maxOccurs="unbounded" />
// </xsd:sequence>
// <xsd:attribute name="lineno" type="xsd:integer" />
// <xsd:attribute name="refid" type="xsd:string" />
// <xsd:attribute name="refkind" type="DoxRefKind" />
// <xsd:attribute name="external" type="DoxBool" />
// </xsd:complexType>

/**
 * Abstract base class for code line elements with syntax highlighting support.
 *
 * @remarks
 * Implements the XML Schema definition for codelineType elements, which
 * represent individual lines of source code within program listings. Each
 * code line may contain syntax highlighting information, line numbers,
 * cross-references to documentation elements, and external link indicators.
 *
 * All attributes are optional according to the schema, allowing for flexible
 * representation of code content ranging from simple text lines to fully
 * annotated source code with comprehensive metadata.
 *
 * @public
 */
export abstract class AbstractCodeLineType extends AbstractDataModelBase {
  /**
   * Array of syntax highlighting elements within the code line.
   *
   * @remarks
   * Contains highlight elements that provide syntax colouring information
   * for different parts of the code line. Each highlight element specifies
   * a highlight class (such as keyword, comment, or string literal) and
   * the corresponding text content to be styled.
   */
  highlights?: HighlightDataModel[] | undefined

  /**
   * Optional line number for the code line.
   *
   * @remarks
   * Specifies the line number of this code line within the source file.
   * This attribute enables line-based navigation and referencing within
   * the documentation system.
   */
  lineno?: number | undefined

  /**
   * Optional reference identifier for cross-linking.
   *
   * @remarks
   * Contains a reference ID that can be used to create hyperlinks to
   * related documentation elements such as function definitions, variable
   * declarations, or other documented entities.
   */
  refid?: string | undefined

  /**
   * Optional reference kind classification.
   *
   * @remarks
   * Specifies the type of reference represented by the refid attribute,
   * such as compound, member, or other Doxygen reference kinds. This
   * classification assists in determining the appropriate link target
   * and display behaviour.
   */
  refkind?: string | undefined

  /**
   * Optional flag indicating external reference status.
   *
   * @remarks
   * When true, indicates that the reference points to an external
   * documentation source rather than an element within the current
   * documentation set. This flag influences link generation and
   * navigation behaviour.
   */
  external?: boolean | undefined

  /**
   * Constructs an AbstractCodeLineType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the code line data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes code line elements by extracting highlight
   * children and optional attributes including line numbers, reference IDs,
   * reference kinds, and external flags. The parser handles empty code
   * lines gracefully whilst ignoring textual content that may appear
   * between structured highlight elements.
   */

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    // May be empty, like `<codeline></codeline>`
    const innerElements = xml.getInnerElements(element, elementName)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'highlight')) {
        this.highlights ??= []
        this.highlights.push(new HighlightDataModel(xml, innerElement))
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_lineno') {
          this.lineno = Number(xml.getAttributeNumberValue(element, '@_lineno'))
        } else if (attributeName === '@_refid') {
          this.refid = xml.getAttributeStringValue(element, '@_refid')
        } else if (attributeName === '@_refkind') {
          this.refkind = xml.getAttributeStringValue(element, '@_refkind')
        } else if (attributeName === '@_external') {
          this.external = Boolean(
            xml.getAttributeBooleanValue(element, '@_external')
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="codeline" type="codelineType" minOccurs="0" maxOccurs="unbounded" />

/**
 * Data model for individual code line elements within program listings.
 *
 * @remarks
 * Represents a single line of source code with optional syntax highlighting,
 * line numbering, and cross-reference information. This implementation
 * processes Doxygen's codeline elements, which form the fundamental
 * building blocks of program listings and code examples within the
 * documentation.
 *
 * @public
 */
export class CodeLineDataModel extends AbstractCodeLineType {
  /**
   * Constructs a CodeLineDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the codeline data
   *
   * @remarks
   * This constructor delegates to the parent AbstractCodeLineType to handle
   * the standard code line processing whilst specifically identifying the
   * element as a 'codeline' type for proper XML schema compliance.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'codeline')
  }
}

// <xsd:complexType name="highlightType" mixed="true">   <-- Character data is allowed to appear between the child elements!
// <xsd:choice minOccurs="0" maxOccurs="unbounded">
//   <xsd:element name="sp" type="spType" />
//   <xsd:element name="ref" type="refTextType" />
// </xsd:choice>
// <xsd:attribute name="class" type="DoxHighlightClass" />
// </xsd:complexType>

// <xsd:simpleType name="DoxHighlightClass">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="comment" />
//     <xsd:enumeration value="normal" />
//     <xsd:enumeration value="preprocessor" />
//     <xsd:enumeration value="keyword" />
//     <xsd:enumeration value="keywordtype" />
//     <xsd:enumeration value="keywordflow" />
//     <xsd:enumeration value="stringliteral" />
//     <xsd:enumeration value="xmlcdata" />
//     <xsd:enumeration value="charliteral" />
//     <xsd:enumeration value="vhdlkeyword" />
//     <xsd:enumeration value="vhdllogic" />
//     <xsd:enumeration value="vhdlchar" />
//     <xsd:enumeration value="vhdldigit" />
//   </xsd:restriction>
// </xsd:simpleType>

/**
 * Type definition for Doxygen highlight classification values.
 *
 * @remarks
 * Defines the enumerated values used to classify syntax highlighting
 * within source code listings. These classifications correspond to
 * different programming language constructs and enable appropriate
 * styling and colour coding in the generated documentation.
 *
 * The enumeration includes standard programming constructs such as
 * comments, keywords, and literals, as well as specialised VHDL
 * highlighting categories for hardware description language support.
 *
 * @public
 */
export type DoxHighlightClass =
  | 'comment'
  | 'normal'
  | 'preprocessor'
  | 'keyword'
  | 'keywordtype'
  | 'keywordflow'
  | 'stringliteral'
  | 'xmlcdata'
  | 'charliteral'
  | 'vhdlkeyword'
  | 'vhdllogic'
  | 'vhdlchar'
  | 'vhdldigit'

/**
 * Abstract base class for syntax highlighting elements within code listings.
 *
 * @remarks
 * Implements the XML Schema definition for highlightType elements, which
 * provide syntax highlighting information for portions of source code.
 * Each highlight element contains a mandatory class attribute that specifies
 * the type of syntax element (keyword, comment, etc.) and may contain
 * mixed content including text, spacing elements, and cross-references.
 *
 * The implementation supports the full range of Doxygen highlight classes
 * including standard programming language constructs and specialised
 * VHDL categories for hardware description language documentation.
 *
 * @public
 */
export abstract class AbstractHighlightType extends AbstractDataModelBase {
  /**
   * Mandatory highlight classification attribute.
   *
   * @remarks
   * Specifies the syntax highlighting class for this element, determining
   * how the contained text should be styled in the generated documentation.
   * The value must be one of the predefined DoxHighlightClass enumeration
   * values such as 'keyword', 'comment', or 'stringliteral'.
   */
  classs = ''

  /**
   * Constructs an AbstractHighlightType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the highlight data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes highlight elements by extracting the mandatory
   * class attribute and any mixed content including text nodes, spacing
   * elements, and cross-reference elements. The parser maintains the original
   * order of content elements in the children array to preserve the intended
   * layout and formatting of the highlighted code segment.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    this.children = []

    const innerElements = xml.getInnerElements(element, elementName)
    if (innerElements.length > 0) {
      for (const innerElement of innerElements) {
        if (xml.hasInnerText(innerElement)) {
          this.children.push(xml.getInnerText(innerElement))
        } else if (xml.isInnerElementText(innerElement, 'sp')) {
          this.children.push(new SpDataModel(xml, innerElement))
        } else if (xml.hasInnerElement(innerElement, 'ref')) {
          this.children.push(new RefTextDataModel(xml, innerElement))
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

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_class') {
        this.classs = xml.getAttributeStringValue(element, '@_class')
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

    assert(this.classs.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="highlight" type="highlightType" minOccurs="0" maxOccurs="unbounded" />

/**
 * Data model for syntax highlight elements within code listings.
 *
 * @remarks
 * Represents individual syntax highlighting segments that specify how
 * portions of source code should be styled in the generated documentation.
 * This implementation processes Doxygen's highlight elements, which contain
 * the highlight class information and associated text content for proper
 * syntax colouring.
 *
 * @public
 */
export class HighlightDataModel extends AbstractHighlightType {
  /**
   * Constructs a HighlightDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the highlight data
   *
   * @remarks
   * This constructor delegates to the parent AbstractHighlightType to handle
   * the standard highlight processing whilst specifically identifying the
   * element as a 'highlight' type for proper XML schema compliance.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'highlight')
  }
}

// <xsd:complexType name="spType" mixed="true">   <-- Character data is allowed to appear between the child elements!
// <xsd:attribute name="value" type="xsd:integer" use="optional"/>
// </xsd:complexType>

/**
 * Abstract base class for spacing elements within highlighted code.
 *
 * @remarks
 * Implements the XML Schema definition for spType elements, which represent
 * spacing or whitespace within syntax-highlighted code listings. These
 * elements support mixed content and may include an optional numeric value
 * attribute to specify the amount or type of spacing.
 *
 * Spacing elements are commonly used within highlight elements to preserve
 * proper formatting and indentation of source code whilst maintaining
 * the structured nature of the XML representation.
 *
 * @public
 */
export abstract class AbstractSpType extends AbstractDataModelBase {
  /**
   * The textual content of the spacing element.
   *
   * @remarks
   * Contains any text content associated with the spacing element. For
   * simple whitespace elements, this typically contains space characters,
   * tabs, or other whitespace sequences that preserve the original
   * formatting of the source code.
   */
  text = ''

  /**
   * Optional numeric value attribute for spacing specifications.
   *
   * @remarks
   * Specifies a numeric value that may indicate the amount of spacing,
   * tab stops, or other formatting-related measurements. The interpretation
   * of this value depends on the context and the specific spacing
   * requirements of the documentation generator.
   */
  value?: number | undefined

  /**
   * Constructs an AbstractSpType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the spacing data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes spacing elements by validating that they
   * contain no inner elements (only text content) and extracting any
   * optional value attribute. The implementation ensures proper handling
   * of whitespace preservation within syntax-highlighted code sections.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length === 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_value') {
          this.value = Number(xml.getAttributeNumberValue(element, '@_value'))
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="sp" type="spType" />

/**
 * Data model for spacing elements within syntax-highlighted code.
 *
 * @remarks
 * Represents individual spacing elements that preserve whitespace and
 * formatting within highlighted code segments. This implementation
 * processes Doxygen's sp elements, which maintain proper indentation
 * and spacing in source code listings whilst supporting the structured
 * XML representation of the documentation.
 *
 * @public
 */
export class SpDataModel extends AbstractSpType {
  /**
   * Constructs a SpDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the spacing data
   *
   * @remarks
   * This constructor delegates to the parent AbstractSpType to handle
   * the standard spacing processing whilst specifically identifying the
   * element as an 'sp' type for proper XML schema compliance.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sp')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docSect1Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS1Type" minOccurs="0"  maxOccurs="unbounded" />
//       <xsd:element name="sect2" type="docSect2Type" minOccurs="0" maxOccurs="unbounded" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

/**
 * Abstract base class for hierarchical documentation section elements.
 *
 * @remarks
 * Provides the common structure for documentation sections at various
 * levels of the hierarchy. All section types share the ability to have
 * an optional title and an optional ID attribute for cross-referencing
 * and navigation purposes.
 *
 * This base class establishes the foundation for the nested section
 * structure that allows for well-organised documentation with proper
 * hierarchical relationships between content elements.
 *
 * @public
 */
export abstract class AbstractDocSectType extends AbstractDataModelBase {
  /**
   * Optional title element for the section.
   *
   * @remarks
   * Contains the title data model for the section when present. Section
   * titles provide descriptive headers that help organise and navigate
   * the documentation content within the hierarchical structure.
   */
  title?: TitleDataModel | undefined

  /**
   * Optional identifier attribute for cross-referencing.
   *
   * @remarks
   * Specifies a unique identifier for the section that can be used for
   * cross-references, hyperlinks, and navigation within the documentation.
   * This ID enables direct linking to specific sections from other parts
   * of the documentation or external sources.
   */
  id: string | undefined
}

/**
 * Abstract base class for first-level documentation section elements.
 *
 * @remarks
 * Implements the XML Schema definition for docSect1Type elements, which
 * represent the first level of hierarchical sections within documentation
 * descriptions. These sections support mixed content and may contain
 * titles, paragraphs, internal documentation sections, and nested
 * second-level sections.
 *
 * First-level sections form the primary organisational structure for
 * complex documentation content, enabling authors to create well-structured
 * and navigable documentation with clear hierarchical relationships.
 *
 * @public
 */
export abstract class AbstractDocSect1Type extends AbstractDocSectType {
  /**
   * Constructs an AbstractDocSect1Type instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the section data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes first-level section elements by extracting
   * title elements, paragraphs, internal sections, and nested second-level
   * sections. The parser maintains the original order of content elements
   * whilst extracting titles and ID attributes for convenient access and
   * cross-referencing capabilities.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new TitleDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS1DataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect2')) {
        this.children.push(new Sect2DataModel(xml, innerElement))
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_id') {
          this.id = xml.getAttributeStringValue(element, '@_id')
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docSect2Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect3" type="docSect3Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS2Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

/**
 * Abstract base class for second-level documentation section elements.
 *
 * @remarks
 * Implements the XML Schema definition for docSect2Type elements, which
 * represent the second level of hierarchical sections within documentation
 * descriptions. These sections support mixed content and may contain
 * titles, paragraphs, internal documentation sections, and nested
 * third-level sections.
 *
 * Second-level sections provide additional organisational depth for
 * complex documentation structures, enabling detailed content organisation
 * within first-level sections whilst maintaining clear hierarchical
 * relationships.
 *
 * @public
 */
export abstract class AbstractDocSect2Type extends AbstractDocSectType {
  /**
   * Constructs an AbstractDocSect2Type instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the section data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes second-level section elements by extracting
   * title elements, paragraphs, internal sections, and nested third-level
   * sections. The implementation maintains content ordering whilst providing
   * structured access to section metadata and hierarchical content
   * organisation.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new TitleDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS2DataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect3')) {
        this.children.push(new Sect3DataModel(xml, innerElement))
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_id') {
          this.id = xml.getAttributeStringValue(element, '@_id')
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docSect3Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect4" type="docSect4Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS3Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractDocSect3Type extends AbstractDocSectType {
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new TitleDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS3DataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect4')) {
        this.children.push(new Sect4DataModel(xml, innerElement))
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_id') {
          this.id = xml.getAttributeStringValue(element, '@_id')
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docSect4Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect5" type="docSect5Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS4Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractDocSect4Type extends AbstractDocSectType {
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new TitleDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS4DataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect5')) {
        this.children.push(new Sect5DataModel(xml, innerElement))
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_id') {
          this.id = xml.getAttributeStringValue(element, '@_id')
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docSect5Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect6" type="docSect6Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS5Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractDocSect5Type extends AbstractDocSectType {
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new TitleDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS5DataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect6')) {
        this.children.push(new Sect6DataModel(xml, innerElement))
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_id') {
          this.id = xml.getAttributeStringValue(element, '@_id')
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docSect6Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS6Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractDocSect6Type extends AbstractDocSectType {
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new TitleDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS6DataModel(xml, innerElement))
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_id') {
          this.id = xml.getAttributeStringValue(element, '@_id')
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docInternalType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

/**
 * Abstract base class for internal documentation section elements.
 *
 * @remarks
 * Implements the XML Schema definition for docInternalType elements, which
 * represent internal documentation sections containing mixed content. These
 * sections typically contain implementation details, internal notes, or
 * other content that may be conditionally included in the documentation
 * output based on configuration settings.
 *
 * Internal sections support paragraphs and first-level sections, providing
 * flexible content organisation for detailed technical information that
 * may be intended for specific audiences or documentation contexts.
 *
 * @public
 */
export abstract class AbstractDocInternalType extends AbstractDataModelBase {
  /**
   * Constructs an AbstractDocInternalType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the internal section
   *   data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes internal documentation sections by extracting
   * paragraphs and first-level sections whilst maintaining the mixed content
   * structure. The implementation handles text nodes and structured elements
   * in their original order to preserve the intended layout and flow of
   * internal documentation content.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect1')) {
        this.children.push(new Sect1DataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docInternalS1Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect2" type="docSect2Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS1Type extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | ParaDataModel | Sect2DataModel> = []

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect2')) {
        this.children.push(new Sect2DataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docInternalS2Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect3" type="docSect3Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS2Type extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | ParaDataModel | Sect3DataModel> = []

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect3')) {
        this.children.push(new Sect3DataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docInternalS3Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect4" type="docSect4Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS3Type extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | ParaDataModel | Sect4DataModel> = []

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect4')) {
        this.children.push(new Sect4DataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docInternalS4Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect5" type="docSect5Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS4Type extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | ParaDataModel | Sect5DataModel> = []

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect5')) {
        this.children.push(new Sect5DataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// WARNING: should be "sect6"

// <xsd:complexType name="docInternalS5Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect5" type="docSect6Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS5Type extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | ParaDataModel | Sect6DataModel> = []

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect6')) {
        this.children.push(new Sect6DataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docInternalS6Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS6Type extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | ParaDataModel> = []

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:group name="docTitleCmdGroup">
//   <xsd:choice>
//     <xsd:element name="ulink" type="docURLLink" />

//     <xsd:element name="bold" type="docMarkupType" />
//     <xsd:element name="s" type="docMarkupType" />
//     <xsd:element name="strike" type="docMarkupType" />
//     <xsd:element name="underline" type="docMarkupType" />
//     <xsd:element name="emphasis" type="docMarkupType" />
//     <xsd:element name="computeroutput" type="docMarkupType" />
//     <xsd:element name="subscript" type="docMarkupType" />
//     <xsd:element name="superscript" type="docMarkupType" />
//     <xsd:element name="center" type="docMarkupType" />
//     <xsd:element name="small" type="docMarkupType" />
//     <xsd:element name="cite" type="docMarkupType" />
//     <xsd:element name="del" type="docMarkupType" />
//     <xsd:element name="ins" type="docMarkupType" />

//     <xsd:element name="htmlonly" type="docHtmlOnlyType" />

//     <xsd:element name="manonly" type="xsd:string" />
//     <xsd:element name="xmlonly" type="xsd:string" />
//     <xsd:element name="rtfonly" type="xsd:string" />
//     <xsd:element name="latexonly" type="xsd:string" />
//     <xsd:element name="docbookonly" type="xsd:string" />

//     <xsd:element name="image" type="docImageType" />
//     <xsd:element name="dot" type="docDotMscType" />
//     <xsd:element name="msc" type="docDotMscType" />
//     <xsd:element name="plantuml" type="docPlantumlType" />
//     <xsd:element name="anchor" type="docAnchorType" />
//     <xsd:element name="formula" type="docFormulaType" />
//     <xsd:element name="ref" type="docRefTextType" />
//     <xsd:element name="emoji" type="docEmojiType" />

//     <xsd:element name="linebreak" type="docEmptyType" />
//     <xsd:element name="nonbreakablespace" type="docEmptyType" />
//     <xsd:element name="iexcl" type="docEmptyType" />
//     <xsd:element name="cent" type="docEmptyType" />
//     <xsd:element name="pound" type="docEmptyType" />
//     <xsd:element name="curren" type="docEmptyType" />
//     <xsd:element name="yen" type="docEmptyType" />
//     <xsd:element name="brvbar" type="docEmptyType" />
//     <xsd:element name="sect" type="docEmptyType" />
//     <xsd:element name="umlaut" type="docEmptyType" />
//     <xsd:element name="copy" type="docEmptyType" />
//     <xsd:element name="ordf" type="docEmptyType" />
//     <xsd:element name="laquo" type="docEmptyType" />
//     <xsd:element name="not" type="docEmptyType" />
//     <xsd:element name="shy" type="docEmptyType" />
//     <xsd:element name="registered" type="docEmptyType" />
//     <xsd:element name="macr" type="docEmptyType" />
//     <xsd:element name="deg" type="docEmptyType" />
//     <xsd:element name="plusmn" type="docEmptyType" />
//     <xsd:element name="sup2" type="docEmptyType" />
//     <xsd:element name="sup3" type="docEmptyType" />
//     <xsd:element name="acute" type="docEmptyType" />
//     <xsd:element name="micro" type="docEmptyType" />
//     <xsd:element name="para" type="docEmptyType" />
//     <xsd:element name="middot" type="docEmptyType" />
//     <xsd:element name="cedil" type="docEmptyType" />
//     <xsd:element name="sup1" type="docEmptyType" />
//     <xsd:element name="ordm" type="docEmptyType" />
//     <xsd:element name="raquo" type="docEmptyType" />
//     <xsd:element name="frac14" type="docEmptyType" />
//     <xsd:element name="frac12" type="docEmptyType" />
//     <xsd:element name="frac34" type="docEmptyType" />
//     <xsd:element name="iquest" type="docEmptyType" />
//     <xsd:element name="Agrave" type="docEmptyType" />
//     <xsd:element name="Aacute" type="docEmptyType" />
//     <xsd:element name="Acirc" type="docEmptyType" />
//     <xsd:element name="Atilde" type="docEmptyType" />
//     <xsd:element name="Aumlaut" type="docEmptyType" />
//     <xsd:element name="Aring" type="docEmptyType" />
//     <xsd:element name="AElig" type="docEmptyType" />
//     <xsd:element name="Ccedil" type="docEmptyType" />
//     <xsd:element name="Egrave" type="docEmptyType" />
//     <xsd:element name="Eacute" type="docEmptyType" />
//     <xsd:element name="Ecirc" type="docEmptyType" />
//     <xsd:element name="Eumlaut" type="docEmptyType" />
//     <xsd:element name="Igrave" type="docEmptyType" />
//     <xsd:element name="Iacute" type="docEmptyType" />
//     <xsd:element name="Icirc" type="docEmptyType" />
//     <xsd:element name="Iumlaut" type="docEmptyType" />
//     <xsd:element name="ETH" type="docEmptyType" />
//     <xsd:element name="Ntilde" type="docEmptyType" />
//     <xsd:element name="Ograve" type="docEmptyType" />
//     <xsd:element name="Oacute" type="docEmptyType" />
//     <xsd:element name="Ocirc" type="docEmptyType" />
//     <xsd:element name="Otilde" type="docEmptyType" />
//     <xsd:element name="Oumlaut" type="docEmptyType" />
//     <xsd:element name="times" type="docEmptyType" />
//     <xsd:element name="Oslash" type="docEmptyType" />
//     <xsd:element name="Ugrave" type="docEmptyType" />
//     <xsd:element name="Uacute" type="docEmptyType" />
//     <xsd:element name="Ucirc" type="docEmptyType" />
//     <xsd:element name="Uumlaut" type="docEmptyType" />
//     <xsd:element name="Yacute" type="docEmptyType" />
//     <xsd:element name="THORN" type="docEmptyType" />
//     <xsd:element name="szlig" type="docEmptyType" />
//     <xsd:element name="agrave" type="docEmptyType" />
//     <xsd:element name="aacute" type="docEmptyType" />
//     <xsd:element name="acirc" type="docEmptyType" />
//     <xsd:element name="atilde" type="docEmptyType" />
//     <xsd:element name="aumlaut" type="docEmptyType" />
//     <xsd:element name="aring" type="docEmptyType" />
//     <xsd:element name="aelig" type="docEmptyType" />
//     <xsd:element name="ccedil" type="docEmptyType" />
//     <xsd:element name="egrave" type="docEmptyType" />
//     <xsd:element name="eacute" type="docEmptyType" />
//     <xsd:element name="ecirc" type="docEmptyType" />
//     <xsd:element name="eumlaut" type="docEmptyType" />
//     <xsd:element name="igrave" type="docEmptyType" />
//     <xsd:element name="iacute" type="docEmptyType" />
//     <xsd:element name="icirc" type="docEmptyType" />
//     <xsd:element name="iumlaut" type="docEmptyType" />
//     <xsd:element name="eth" type="docEmptyType" />
//     <xsd:element name="ntilde" type="docEmptyType" />
//     <xsd:element name="ograve" type="docEmptyType" />
//     <xsd:element name="oacute" type="docEmptyType" />
//     <xsd:element name="ocirc" type="docEmptyType" />
//     <xsd:element name="otilde" type="docEmptyType" />
//     <xsd:element name="oumlaut" type="docEmptyType" />
//     <xsd:element name="divide" type="docEmptyType" />
//     <xsd:element name="oslash" type="docEmptyType" />
//     <xsd:element name="ugrave" type="docEmptyType" />
//     <xsd:element name="uacute" type="docEmptyType" />
//     <xsd:element name="ucirc" type="docEmptyType" />
//     <xsd:element name="uumlaut" type="docEmptyType" />
//     <xsd:element name="yacute" type="docEmptyType" />
//     <xsd:element name="thorn" type="docEmptyType" />
//     <xsd:element name="yumlaut" type="docEmptyType" />
//     <xsd:element name="fnof" type="docEmptyType" />
//     <xsd:element name="Alpha" type="docEmptyType" />
//     <xsd:element name="Beta" type="docEmptyType" />
//     <xsd:element name="Gamma" type="docEmptyType" />
//     <xsd:element name="Delta" type="docEmptyType" />
//     <xsd:element name="Epsilon" type="docEmptyType" />
//     <xsd:element name="Zeta" type="docEmptyType" />
//     <xsd:element name="Eta" type="docEmptyType" />
//     <xsd:element name="Theta" type="docEmptyType" />
//     <xsd:element name="Iota" type="docEmptyType" />
//     <xsd:element name="Kappa" type="docEmptyType" />
//     <xsd:element name="Lambda" type="docEmptyType" />
//     <xsd:element name="Mu" type="docEmptyType" />
//     <xsd:element name="Nu" type="docEmptyType" />
//     <xsd:element name="Xi" type="docEmptyType" />
//     <xsd:element name="Omicron" type="docEmptyType" />
//     <xsd:element name="Pi" type="docEmptyType" />
//     <xsd:element name="Rho" type="docEmptyType" />
//     <xsd:element name="Sigma" type="docEmptyType" />
//     <xsd:element name="Tau" type="docEmptyType" />
//     <xsd:element name="Upsilon" type="docEmptyType" />
//     <xsd:element name="Phi" type="docEmptyType" />
//     <xsd:element name="Chi" type="docEmptyType" />
//     <xsd:element name="Psi" type="docEmptyType" />
//     <xsd:element name="Omega" type="docEmptyType" />
//     <xsd:element name="alpha" type="docEmptyType" />
//     <xsd:element name="beta" type="docEmptyType" />
//     <xsd:element name="gamma" type="docEmptyType" />
//     <xsd:element name="delta" type="docEmptyType" />
//     <xsd:element name="epsilon" type="docEmptyType" />
//     <xsd:element name="zeta" type="docEmptyType" />
//     <xsd:element name="eta" type="docEmptyType" />
//     <xsd:element name="theta" type="docEmptyType" />
//     <xsd:element name="iota" type="docEmptyType" />
//     <xsd:element name="kappa" type="docEmptyType" />
//     <xsd:element name="lambda" type="docEmptyType" />
//     <xsd:element name="mu" type="docEmptyType" />
//     <xsd:element name="nu" type="docEmptyType" />
//     <xsd:element name="xi" type="docEmptyType" />
//     <xsd:element name="omicron" type="docEmptyType" />
//     <xsd:element name="pi" type="docEmptyType" />
//     <xsd:element name="rho" type="docEmptyType" />
//     <xsd:element name="sigmaf" type="docEmptyType" />
//     <xsd:element name="sigma" type="docEmptyType" />
//     <xsd:element name="tau" type="docEmptyType" />
//     <xsd:element name="upsilon" type="docEmptyType" />
//     <xsd:element name="phi" type="docEmptyType" />
//     <xsd:element name="chi" type="docEmptyType" />
//     <xsd:element name="psi" type="docEmptyType" />
//     <xsd:element name="omega" type="docEmptyType" />
//     <xsd:element name="thetasym" type="docEmptyType" />
//     <xsd:element name="upsih" type="docEmptyType" />
//     <xsd:element name="piv" type="docEmptyType" />
//     <xsd:element name="bull" type="docEmptyType" />
//     <xsd:element name="hellip" type="docEmptyType" />
//     <xsd:element name="prime" type="docEmptyType" />
//     <xsd:element name="Prime" type="docEmptyType" />
//     <xsd:element name="oline" type="docEmptyType" />
//     <xsd:element name="frasl" type="docEmptyType" />
//     <xsd:element name="weierp" type="docEmptyType" />
//     <xsd:element name="imaginary" type="docEmptyType" />
//     <xsd:element name="real" type="docEmptyType" />
//     <xsd:element name="trademark" type="docEmptyType" />
//     <xsd:element name="alefsym" type="docEmptyType" />
//     <xsd:element name="larr" type="docEmptyType" />
//     <xsd:element name="uarr" type="docEmptyType" />
//     <xsd:element name="rarr" type="docEmptyType" />
//     <xsd:element name="darr" type="docEmptyType" />
//     <xsd:element name="harr" type="docEmptyType" />
//     <xsd:element name="crarr" type="docEmptyType" />
//     <xsd:element name="lArr" type="docEmptyType" />
//     <xsd:element name="uArr" type="docEmptyType" />
//     <xsd:element name="rArr" type="docEmptyType" />
//     <xsd:element name="dArr" type="docEmptyType" />
//     <xsd:element name="hArr" type="docEmptyType" />
//     <xsd:element name="forall" type="docEmptyType" />
//     <xsd:element name="part" type="docEmptyType" />
//     <xsd:element name="exist" type="docEmptyType" />
//     <xsd:element name="empty" type="docEmptyType" />
//     <xsd:element name="nabla" type="docEmptyType" />
//     <xsd:element name="isin" type="docEmptyType" />
//     <xsd:element name="notin" type="docEmptyType" />
//     <xsd:element name="ni" type="docEmptyType" />
//     <xsd:element name="prod" type="docEmptyType" />
//     <xsd:element name="sum" type="docEmptyType" />
//     <xsd:element name="minus" type="docEmptyType" />
//     <xsd:element name="lowast" type="docEmptyType" />
//     <xsd:element name="radic" type="docEmptyType" />
//     <xsd:element name="prop" type="docEmptyType" />
//     <xsd:element name="infin" type="docEmptyType" />
//     <xsd:element name="ang" type="docEmptyType" />
//     <xsd:element name="and" type="docEmptyType" />
//     <xsd:element name="or" type="docEmptyType" />
//     <xsd:element name="cap" type="docEmptyType" />
//     <xsd:element name="cup" type="docEmptyType" />
//     <xsd:element name="int" type="docEmptyType" />
//     <xsd:element name="there4" type="docEmptyType" />
//     <xsd:element name="sim" type="docEmptyType" />
//     <xsd:element name="cong" type="docEmptyType" />
//     <xsd:element name="asymp" type="docEmptyType" />
//     <xsd:element name="ne" type="docEmptyType" />
//     <xsd:element name="equiv" type="docEmptyType" />
//     <xsd:element name="le" type="docEmptyType" />
//     <xsd:element name="ge" type="docEmptyType" />
//     <xsd:element name="sub" type="docEmptyType" />
//     <xsd:element name="sup" type="docEmptyType" />
//     <xsd:element name="nsub" type="docEmptyType" />
//     <xsd:element name="sube" type="docEmptyType" />
//     <xsd:element name="supe" type="docEmptyType" />
//     <xsd:element name="oplus" type="docEmptyType" />
//     <xsd:element name="otimes" type="docEmptyType" />
//     <xsd:element name="perp" type="docEmptyType" />
//     <xsd:element name="sdot" type="docEmptyType" />
//     <xsd:element name="lceil" type="docEmptyType" />
//     <xsd:element name="rceil" type="docEmptyType" />
//     <xsd:element name="lfloor" type="docEmptyType" />
//     <xsd:element name="rfloor" type="docEmptyType" />
//     <xsd:element name="lang" type="docEmptyType" />
//     <xsd:element name="rang" type="docEmptyType" />
//     <xsd:element name="loz" type="docEmptyType" />
//     <xsd:element name="spades" type="docEmptyType" />
//     <xsd:element name="clubs" type="docEmptyType" />
//     <xsd:element name="hearts" type="docEmptyType" />
//     <xsd:element name="diams" type="docEmptyType" />
//     <xsd:element name="OElig" type="docEmptyType" />
//     <xsd:element name="oelig" type="docEmptyType" />
//     <xsd:element name="Scaron" type="docEmptyType" />
//     <xsd:element name="scaron" type="docEmptyType" />
//     <xsd:element name="Yumlaut" type="docEmptyType" />
//     <xsd:element name="circ" type="docEmptyType" />
//     <xsd:element name="tilde" type="docEmptyType" />
//     <xsd:element name="ensp" type="docEmptyType" />
//     <xsd:element name="emsp" type="docEmptyType" />
//     <xsd:element name="thinsp" type="docEmptyType" />
//     <xsd:element name="zwnj" type="docEmptyType" />
//     <xsd:element name="zwj" type="docEmptyType" />
//     <xsd:element name="lrm" type="docEmptyType" />
//     <xsd:element name="rlm" type="docEmptyType" />
//     <xsd:element name="ndash" type="docEmptyType" />
//     <xsd:element name="mdash" type="docEmptyType" />
//     <xsd:element name="lsquo" type="docEmptyType" />
//     <xsd:element name="rsquo" type="docEmptyType" />
//     <xsd:element name="sbquo" type="docEmptyType" />
//     <xsd:element name="ldquo" type="docEmptyType" />
//     <xsd:element name="rdquo" type="docEmptyType" />
//     <xsd:element name="bdquo" type="docEmptyType" />
//     <xsd:element name="dagger" type="docEmptyType" />
//     <xsd:element name="Dagger" type="docEmptyType" />
//     <xsd:element name="permil" type="docEmptyType" />
//     <xsd:element name="lsaquo" type="docEmptyType" />
//     <xsd:element name="rsaquo" type="docEmptyType" />
//     <xsd:element name="euro" type="docEmptyType" />
//     <xsd:element name="tm" type="docEmptyType" />
//   </xsd:choice>
// </xsd:group>

/**
 * Union type for document title command group elements.
 *
 * @remarks
 * Defines the various types of inline markup elements that can appear
 * within document titles according to the Doxygen XML schema. This union
 * encompasses formatting elements (bold, underline, emphasis), interactive
 * elements (links, anchors, references), structural elements (line breaks),
 * and special character markup elements.
 *
 * The type provides type safety for title parsing operations whilst
 * supporting the full range of inline content that can appear within
 * documentation titles, ensuring proper handling of complex formatted
 * headings and cross-references.
 *
 * @public
 */
export type DocTitleCmdGroup =
  | BoldDataModel
  | UnderlineDataModel
  | EmphasisDataModel
  | ComputerOutputDataModel
  | RefDataModel
  | LineBreakDataModel
  | UlinkDataModel
  | AnchorDataModel
  | SubstringDocMarkupType

/**
 * Parser function for processing document title command group elements.
 *
 * @param xml - The Doxygen XML parser instance for processing XML content
 * @param element - The XML element object containing the title command data
 * @param elementName - The name of the XML element being processed
 * @returns Array of parsed DocTitleCmdGroup elements
 *
 * @remarks
 * This function processes XML elements that contain title command groups,
 * parsing various markup elements such as bold text, emphasis, links,
 * anchors, and special character entities. The parser recognises the
 * different element types and creates appropriate data model instances
 * for each command group element.
 *
 * The function handles the complex variety of inline markup elements
 * that can appear within documentation titles, ensuring proper
 * representation of formatting and cross-reference information.
 *
 * @public
 */
export function parseDocTitleCmdGroup(
  xml: DoxygenXmlParser,
  element: object,
  elementName: string
): DocTitleCmdGroup[] {
  const children: DocTitleCmdGroup[] = []

  // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

  if (xml.hasInnerElement(element, 'ulink')) {
    children.push(new UlinkDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'bold')) {
    children.push(new BoldDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'underline')) {
    children.push(new UnderlineDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'emphasis')) {
    children.push(new EmphasisDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'computeroutput')) {
    children.push(new ComputerOutputDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'subscript')) {
    children.push(new SubscriptDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'superscript')) {
    children.push(new SuperscriptDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'center')) {
    children.push(new CenterDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'small')) {
    children.push(new SmallDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cite')) {
    children.push(new CiteDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'del')) {
    children.push(new DelDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ins')) {
    children.push(new InsDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'htmlonly')) {
    children.push(new HtmlOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'manonly')) {
    // Skipped, no Man output.
    // children.push(new ManOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'xmlonly')) {
    // children.push(new XmlOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rtfonly')) {
    // Skipped, no RTF output.
    // children.push(new RtfOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'latexonly')) {
    // Skipped, no LaTeX output.
    // children.push(new LatexOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'docbookonly')) {
    // Skipped, no DocBook output.
    // children.push(new DocBookOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'image')) {
    children.push(new ImageDataModel(xml, element))
    // dot
    // msc
    // plantuml
  } else if (xml.hasInnerElement(element, 'anchor')) {
    children.push(new AnchorDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'formula')) {
    children.push(new FormulaDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ref')) {
    children.push(new RefDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'emoji')) {
    children.push(new EmojiDataModel(xml, element))
    // Substring elements.
  } else if (xml.hasInnerElement(element, 'linebreak')) {
    children.push(new LineBreakDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'nonbreakablespace')) {
    children.push(new NonBreakableSpaceDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'nzwj')) {
    children.push(new NzwjDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'zwj')) {
    children.push(new ZwjDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ndash')) {
    children.push(new NdashDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'mdash')) {
    children.push(new MdashDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lsquo')) {
    children.push(new LsquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rsquo')) {
    children.push(new RsquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'copy')) {
    children.push(new CopyDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'iexcl')) {
    children.push(new IexclDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cent')) {
    children.push(new CentDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'pound')) {
    children.push(new PoundDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'curren')) {
    children.push(new CurrenDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'yen')) {
    children.push(new YenDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'brvbar')) {
    children.push(new BrvbarDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sect')) {
    children.push(new SectDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'umlaut')) {
    children.push(new UmlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ordf')) {
    children.push(new OrdfDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'laquo')) {
    children.push(new LaquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'not')) {
    children.push(new NotDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'shy')) {
    children.push(new ShyDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'registered')) {
    children.push(new RegisteredDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'macr')) {
    children.push(new MacrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'deg')) {
    children.push(new DegDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'plusmn')) {
    children.push(new PlusmnDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sup2')) {
    children.push(new Sup2DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sup3')) {
    children.push(new Sup3DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'acute')) {
    children.push(new AcuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'micro')) {
    children.push(new MicroDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'para')) {
    children.push(new ParaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'middot')) {
    children.push(new MiddotDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cedil')) {
    children.push(new CedilDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sup1')) {
    children.push(new Sup1DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ordm')) {
    children.push(new OrdmDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'raquo')) {
    children.push(new RaquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'frac14')) {
    children.push(new Frac14DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'frac12')) {
    children.push(new Frac12DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'frac34')) {
    children.push(new Frac34DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'iquest')) {
    children.push(new IquestDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Agrave')) {
    children.push(new AgraveDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Aacute')) {
    children.push(new AacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Acirc')) {
    children.push(new AcircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Atilde')) {
    children.push(new AtildeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Aumlaut')) {
    children.push(new AumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Aring')) {
    children.push(new AringDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'AElig')) {
    children.push(new AEligDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ccedil')) {
    children.push(new CcedilDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Egrave')) {
    children.push(new EgraveDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Eacute')) {
    children.push(new EacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ecirc')) {
    children.push(new EcircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Eumlaut')) {
    children.push(new EumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Igrave')) {
    children.push(new IgraveDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Iacute')) {
    children.push(new IacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Icirc')) {
    children.push(new IcircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Iumlaut')) {
    children.push(new IumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ETH')) {
    children.push(new ETHDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ntilde')) {
    children.push(new NtildeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ograve')) {
    children.push(new OgraveDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Oacute')) {
    children.push(new OacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ocirc')) {
    children.push(new OcircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Otilde')) {
    children.push(new OtildeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Oumlaut')) {
    children.push(new OumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'times')) {
    children.push(new TimesDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Oslash')) {
    children.push(new OslashDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ugrave')) {
    children.push(new UgraveDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Uacute')) {
    children.push(new UacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ucirc')) {
    children.push(new UcircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Uumlaut')) {
    children.push(new UumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Yacute')) {
    children.push(new YacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'THORN')) {
    children.push(new THORNDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'szlig')) {
    children.push(new SzligDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'agrave')) {
    children.push(new AgraveSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'aacute')) {
    children.push(new AacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'acirc')) {
    children.push(new AcircSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'atilde')) {
    children.push(new AtildeSmallDocMarkupType(xml, element))
  } else if (xml.hasInnerElement(element, 'aumlaut')) {
    children.push(new AumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'aring')) {
    children.push(new AringSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'aelig')) {
    children.push(new AeligSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ccedil')) {
    children.push(new CcedilSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'egrave')) {
    children.push(new EgraveSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'eacute')) {
    children.push(new EacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ecirc')) {
    children.push(new EcircSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'eumlaut')) {
    children.push(new EumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'igrave')) {
    children.push(new IgraveSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'iacute')) {
    children.push(new IacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'icirc')) {
    children.push(new IcircSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'iumlaut')) {
    children.push(new IumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'eth')) {
    children.push(new EthSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ntilde')) {
    children.push(new NtildeSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ograve')) {
    children.push(new OgraveSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oacute')) {
    children.push(new OacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ocirc')) {
    children.push(new OcircSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'otilde')) {
    children.push(new OtildeSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oumlaut')) {
    children.push(new OumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oslash')) {
    children.push(new OslashSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ugrave')) {
    children.push(new UgraveSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'uacute')) {
    children.push(new UacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ucirc')) {
    children.push(new UcircSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'uumlaut')) {
    children.push(new UumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'yacute')) {
    children.push(new YacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'thorn')) {
    children.push(new ThornSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'yumlaut')) {
    children.push(new YumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'divide')) {
    children.push(new DivideDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'fnof')) {
    children.push(new FnofDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Alpha')) {
    children.push(new AlphaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Beta')) {
    children.push(new BetaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Gamma')) {
    children.push(new GammaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Delta')) {
    children.push(new DeltaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Epsilon')) {
    children.push(new EpsilonDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Zeta')) {
    children.push(new ZetaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Eta')) {
    children.push(new EtaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Theta')) {
    children.push(new ThetaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Iota')) {
    children.push(new IotaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Kappa')) {
    children.push(new KappaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Lambda')) {
    children.push(new LambdaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Mu')) {
    children.push(new MuDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Nu')) {
    children.push(new NuDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Xi')) {
    children.push(new XiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Omicron')) {
    children.push(new OmicronDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Pi')) {
    children.push(new PiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Rho')) {
    children.push(new RhoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Sigma')) {
    children.push(new SigmaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Tau')) {
    children.push(new TauDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Upsilon')) {
    children.push(new UpsilonDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Phi')) {
    children.push(new PhiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Chi')) {
    children.push(new ChiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Psi')) {
    children.push(new PsiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Omega')) {
    children.push(new OmegaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'alpha')) {
    children.push(new AlphaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'beta')) {
    children.push(new BetaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'gamma')) {
    children.push(new GammaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'delta')) {
    children.push(new DeltaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'epsilon')) {
    children.push(new EpsilonSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'zeta')) {
    children.push(new ZetaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'eta')) {
    children.push(new EtaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'theta')) {
    children.push(new ThetaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'iota')) {
    children.push(new IotaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'kappa')) {
    children.push(new KappaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lambda')) {
    children.push(new LambdaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'mu')) {
    children.push(new MuSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'nu')) {
    children.push(new NuSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'xi')) {
    children.push(new XiSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'omicron')) {
    children.push(new OmicronSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'pi')) {
    children.push(new PiSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rho')) {
    children.push(new RhoSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sigma')) {
    children.push(new SigmaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sigmaf')) {
    children.push(new SigmafSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'tau')) {
    children.push(new TauSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'upsilon')) {
    children.push(new UpsilonSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'phi')) {
    children.push(new PhiSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'chi')) {
    children.push(new ChiSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'psi')) {
    children.push(new PsiSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'omega')) {
    children.push(new OmegaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'thetasym')) {
    children.push(new ThetasymDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'upsih')) {
    children.push(new UpsihDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'piv')) {
    children.push(new PivDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'bull')) {
    children.push(new BullDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'hellip')) {
    children.push(new HellipDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'prime')) {
    children.push(new PrimeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Prime')) {
    children.push(new PrimeUpperDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oline')) {
    children.push(new OlineDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'frasl')) {
    children.push(new FraslDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'weierp')) {
    children.push(new WeierpDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'imaginary')) {
    children.push(new ImaginaryDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'real')) {
    children.push(new RealDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'trademark')) {
    children.push(new TrademarkDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'alefsym')) {
    children.push(new AlefsymDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'larr')) {
    children.push(new LarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'uarr')) {
    children.push(new UarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rarr')) {
    children.push(new RarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'darr')) {
    children.push(new DarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'harr')) {
    children.push(new HarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'crarr')) {
    children.push(new CrarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lArr')) {
    children.push(new LArrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'uArr')) {
    children.push(new UArrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rArr')) {
    children.push(new RArrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'dArr')) {
    children.push(new DArrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'hArr')) {
    children.push(new HArrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'forall')) {
    children.push(new ForallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'part')) {
    children.push(new PartDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'exist')) {
    children.push(new ExistDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'empty')) {
    children.push(new EmptyDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'nabla')) {
    children.push(new NablaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'isin')) {
    children.push(new IsinDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'notin')) {
    children.push(new NotinDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ni')) {
    children.push(new NiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'prod')) {
    children.push(new ProdDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sum')) {
    children.push(new SumDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'minus')) {
    children.push(new MinusDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lowast')) {
    children.push(new LowastDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'radic')) {
    children.push(new RadicDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'prop')) {
    children.push(new PropDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'infin')) {
    children.push(new InfinDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ang')) {
    children.push(new AngDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'and')) {
    children.push(new AndDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'or')) {
    children.push(new OrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cap')) {
    children.push(new CapDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cup')) {
    children.push(new CupDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'int')) {
    children.push(new IntDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'there4')) {
    children.push(new There4DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sim')) {
    children.push(new SimDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cong')) {
    children.push(new CongDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'asymp')) {
    children.push(new AsympDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ne')) {
    children.push(new NeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'equiv')) {
    children.push(new EquivDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'le')) {
    children.push(new LeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ge')) {
    children.push(new GeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sub')) {
    children.push(new SubDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sup')) {
    children.push(new SupDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'nsub')) {
    children.push(new NsubDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sube')) {
    children.push(new SubeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'supe')) {
    children.push(new SupeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oplus')) {
    children.push(new OplusDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'otimes')) {
    children.push(new OtimesDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'perp')) {
    children.push(new PerpDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sdot')) {
    children.push(new SdotDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lceil')) {
    children.push(new LceilDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rceil')) {
    children.push(new RceilDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lfloor')) {
    children.push(new LfloorDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rfloor')) {
    children.push(new RfloorDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lang')) {
    children.push(new LangDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rang')) {
    children.push(new RangDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'loz')) {
    children.push(new LozDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'spades')) {
    children.push(new SpadesDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'clubs')) {
    children.push(new ClubsDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'hearts')) {
    children.push(new HeartsDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'diams')) {
    children.push(new DiamsDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'OElig')) {
    children.push(new OEligDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oelig')) {
    children.push(new OeligDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Scaron')) {
    children.push(new ScaronDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'scaron')) {
    children.push(new ScaronSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Yumlaut')) {
    children.push(new YumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'circ')) {
    children.push(new CircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'tilde')) {
    children.push(new TildeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ensp')) {
    children.push(new EnspDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'emsp')) {
    children.push(new EmspDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'thinsp')) {
    children.push(new ThinspDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'zwnj')) {
    children.push(new ZwnjDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lrm')) {
    children.push(new LrmDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rlm')) {
    children.push(new RlmDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sbquo')) {
    children.push(new SbquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ldquo')) {
    children.push(new LdquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rdquo')) {
    children.push(new RdquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'bdquo')) {
    children.push(new BdquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'dagger')) {
    children.push(new DaggerDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Dagger')) {
    children.push(new DaggerUpperDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'permil')) {
    children.push(new PermilDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lsaquo')) {
    children.push(new LsaquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rsaquo')) {
    children.push(new RsaquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'euro')) {
    children.push(new EuroDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'tm')) {
    children.push(new TmDocMarkupDataModel(xml, element))
  } else {
    console.error(util.inspect(element, { compact: false, depth: 999 }))
    console.error(
      `${elementName} element:`,
      Object.keys(element),
      'not implemented yet by parseDocTitleCmdGroup()'
    )
  }
  return children
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docTitleType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>

/**
 * Base class for document title elements containing mixed content.
 *
 * @remarks
 * Implements the XML Schema definition for docTitleType elements, which
 * represent document titles containing mixed content including text and
 * various title command group elements. These titles support rich formatting
 * and interactive elements whilst maintaining proper structure for
 * documentation headings and section titles.
 *
 * The implementation processes both textual content and structured markup
 * elements, preserving their original order to maintain the intended
 * formatting and presentation of title content within the documentation
 * hierarchy.
 *
 * @public
 */
export class AbstractDocTitleType extends AbstractDataModelBase {
  /**
   * Constructs an AbstractDocTitleType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the title data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes title elements by extracting both textual
   * content and title command group elements. The parser maintains the
   * original order of content elements whilst delegating structured element
   * processing to the parseDocTitleCmdGroup function for comprehensive
   * title markup support.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    // May be empty.
    // assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(
          ...parseDocTitleCmdGroup(xml, innerElement, elementName)
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docSummaryType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>

// ----------------------------------------------------------------------------

// <xsd:group name="docCmdGroup">
//   <xsd:choice>
//     <!-- start workaround for xsd.exe
//       <xsd:group ref="docTitleCmdGroup"/>
//     -->
//     <xsd:element name="ulink" type="docURLLink" />

//     <xsd:element name="bold" type="docMarkupType" />
//     <xsd:element name="s" type="docMarkupType" />
//     <xsd:element name="strike" type="docMarkupType" />
//     <xsd:element name="underline" type="docMarkupType" />
//     <xsd:element name="emphasis" type="docMarkupType" />
//     <xsd:element name="computeroutput" type="docMarkupType" />
//     <xsd:element name="subscript" type="docMarkupType" />
//     <xsd:element name="superscript" type="docMarkupType" />
//     <xsd:element name="center" type="docMarkupType" />
//     <xsd:element name="small" type="docMarkupType" />
//     <xsd:element name="cite" type="docMarkupType" />
//     <xsd:element name="del" type="docMarkupType" />
//     <xsd:element name="ins" type="docMarkupType" />

//     <xsd:element name="htmlonly" type="docHtmlOnlyType" />

//     <xsd:element name="manonly" type="xsd:string" />
//     <xsd:element name="xmlonly" type="xsd:string" />
//     <xsd:element name="rtfonly" type="xsd:string" />
//     <xsd:element name="latexonly" type="xsd:string" />
//     <xsd:element name="docbookonly" type="xsd:string" />

//     <xsd:element name="image" type="docImageType" />
//     <xsd:element name="dot" type="docDotMscType" />
//     <xsd:element name="msc" type="docDotMscType" />
//     <xsd:element name="plantuml" type="docPlantumlType" />
//     <xsd:element name="anchor" type="docAnchorType" />
//     <xsd:element name="formula" type="docFormulaType" />
//     <xsd:element name="ref" type="docRefTextType" />

//     <xsd:element name="emoji" type="docEmojiType" />
//     <xsd:element name="linebreak" type="docEmptyType" />
//     <xsd:element name="nonbreakablespace" type="docEmptyType" />
//     <xsd:element name="iexcl" type="docEmptyType" />
//     <xsd:element name="cent" type="docEmptyType" />
//     <xsd:element name="pound" type="docEmptyType" />
//     <xsd:element name="curren" type="docEmptyType" />
//     <xsd:element name="yen" type="docEmptyType" />
//     <xsd:element name="brvbar" type="docEmptyType" />
//     <xsd:element name="sect" type="docEmptyType" />
//     <xsd:element name="umlaut" type="docEmptyType" />
//     <xsd:element name="copy" type="docEmptyType" />
//     <xsd:element name="ordf" type="docEmptyType" />
//     <xsd:element name="laquo" type="docEmptyType" />
//     <xsd:element name="not" type="docEmptyType" />
//     <xsd:element name="shy" type="docEmptyType" />
//     <xsd:element name="registered" type="docEmptyType" />
//     <xsd:element name="macr" type="docEmptyType" />
//     <xsd:element name="deg" type="docEmptyType" />
//     <xsd:element name="plusmn" type="docEmptyType" />
//     <xsd:element name="sup2" type="docEmptyType" />
//     <xsd:element name="sup3" type="docEmptyType" />
//     <xsd:element name="acute" type="docEmptyType" />
//     <xsd:element name="micro" type="docEmptyType" />
//     <xsd:element name="para" type="docEmptyType" />
//     <xsd:element name="middot" type="docEmptyType" />
//     <xsd:element name="cedil" type="docEmptyType" />
//     <xsd:element name="sup1" type="docEmptyType" />
//     <xsd:element name="ordm" type="docEmptyType" />
//     <xsd:element name="raquo" type="docEmptyType" />
//     <xsd:element name="frac14" type="docEmptyType" />
//     <xsd:element name="frac12" type="docEmptyType" />
//     <xsd:element name="frac34" type="docEmptyType" />
//     <xsd:element name="iquest" type="docEmptyType" />
//     <xsd:element name="Agrave" type="docEmptyType" />
//     <xsd:element name="Aacute" type="docEmptyType" />
//     <xsd:element name="Acirc" type="docEmptyType" />
//     <xsd:element name="Atilde" type="docEmptyType" />
//     <xsd:element name="Aumlaut" type="docEmptyType" />
//     <xsd:element name="Aring" type="docEmptyType" />
//     <xsd:element name="AElig" type="docEmptyType" />
//     <xsd:element name="Ccedil" type="docEmptyType" />
//     <xsd:element name="Egrave" type="docEmptyType" />
//     <xsd:element name="Eacute" type="docEmptyType" />
//     <xsd:element name="Ecirc" type="docEmptyType" />
//     <xsd:element name="Eumlaut" type="docEmptyType" />
//     <xsd:element name="Igrave" type="docEmptyType" />
//     <xsd:element name="Iacute" type="docEmptyType" />
//     <xsd:element name="Icirc" type="docEmptyType" />
//     <xsd:element name="Iumlaut" type="docEmptyType" />
//     <xsd:element name="ETH" type="docEmptyType" />
//     <xsd:element name="Ntilde" type="docEmptyType" />
//     <xsd:element name="Ograve" type="docEmptyType" />
//     <xsd:element name="Oacute" type="docEmptyType" />
//     <xsd:element name="Ocirc" type="docEmptyType" />
//     <xsd:element name="Otilde" type="docEmptyType" />
//     <xsd:element name="Oumlaut" type="docEmptyType" />
//     <xsd:element name="times" type="docEmptyType" />
//     <xsd:element name="Oslash" type="docEmptyType" />
//     <xsd:element name="Ugrave" type="docEmptyType" />
//     <xsd:element name="Uacute" type="docEmptyType" />
//     <xsd:element name="Ucirc" type="docEmptyType" />
//     <xsd:element name="Uumlaut" type="docEmptyType" />
//     <xsd:element name="Yacute" type="docEmptyType" />
//     <xsd:element name="THORN" type="docEmptyType" />
//     <xsd:element name="szlig" type="docEmptyType" />
//     <xsd:element name="agrave" type="docEmptyType" />
//     <xsd:element name="aacute" type="docEmptyType" />
//     <xsd:element name="acirc" type="docEmptyType" />
//     <xsd:element name="atilde" type="docEmptyType" />
//     <xsd:element name="aumlaut" type="docEmptyType" />
//     <xsd:element name="aring" type="docEmptyType" />
//     <xsd:element name="aelig" type="docEmptyType" />
//     <xsd:element name="ccedil" type="docEmptyType" />
//     <xsd:element name="egrave" type="docEmptyType" />
//     <xsd:element name="eacute" type="docEmptyType" />
//     <xsd:element name="ecirc" type="docEmptyType" />
//     <xsd:element name="eumlaut" type="docEmptyType" />
//     <xsd:element name="igrave" type="docEmptyType" />
//     <xsd:element name="iacute" type="docEmptyType" />
//     <xsd:element name="icirc" type="docEmptyType" />
//     <xsd:element name="iumlaut" type="docEmptyType" />
//     <xsd:element name="eth" type="docEmptyType" />
//     <xsd:element name="ntilde" type="docEmptyType" />
//     <xsd:element name="ograve" type="docEmptyType" />
//     <xsd:element name="oacute" type="docEmptyType" />
//     <xsd:element name="ocirc" type="docEmptyType" />
//     <xsd:element name="otilde" type="docEmptyType" />
//     <xsd:element name="oumlaut" type="docEmptyType" />
//     <xsd:element name="divide" type="docEmptyType" />
//     <xsd:element name="oslash" type="docEmptyType" />
//     <xsd:element name="ugrave" type="docEmptyType" />
//     <xsd:element name="uacute" type="docEmptyType" />
//     <xsd:element name="ucirc" type="docEmptyType" />
//     <xsd:element name="uumlaut" type="docEmptyType" />
//     <xsd:element name="yacute" type="docEmptyType" />
//     <xsd:element name="thorn" type="docEmptyType" />
//     <xsd:element name="yumlaut" type="docEmptyType" />
//     <xsd:element name="fnof" type="docEmptyType" />
//     <xsd:element name="Alpha" type="docEmptyType" />
//     <xsd:element name="Beta" type="docEmptyType" />
//     <xsd:element name="Gamma" type="docEmptyType" />
//     <xsd:element name="Delta" type="docEmptyType" />
//     <xsd:element name="Epsilon" type="docEmptyType" />
//     <xsd:element name="Zeta" type="docEmptyType" />
//     <xsd:element name="Eta" type="docEmptyType" />
//     <xsd:element name="Theta" type="docEmptyType" />
//     <xsd:element name="Iota" type="docEmptyType" />
//     <xsd:element name="Kappa" type="docEmptyType" />
//     <xsd:element name="Lambda" type="docEmptyType" />
//     <xsd:element name="Mu" type="docEmptyType" />
//     <xsd:element name="Nu" type="docEmptyType" />
//     <xsd:element name="Xi" type="docEmptyType" />
//     <xsd:element name="Omicron" type="docEmptyType" />
//     <xsd:element name="Pi" type="docEmptyType" />
//     <xsd:element name="Rho" type="docEmptyType" />
//     <xsd:element name="Sigma" type="docEmptyType" />
//     <xsd:element name="Tau" type="docEmptyType" />
//     <xsd:element name="Upsilon" type="docEmptyType" />
//     <xsd:element name="Phi" type="docEmptyType" />
//     <xsd:element name="Chi" type="docEmptyType" />
//     <xsd:element name="Psi" type="docEmptyType" />
//     <xsd:element name="Omega" type="docEmptyType" />
//     <xsd:element name="alpha" type="docEmptyType" />
//     <xsd:element name="beta" type="docEmptyType" />
//     <xsd:element name="gamma" type="docEmptyType" />
//     <xsd:element name="delta" type="docEmptyType" />
//     <xsd:element name="epsilon" type="docEmptyType" />
//     <xsd:element name="zeta" type="docEmptyType" />
//     <xsd:element name="eta" type="docEmptyType" />
//     <xsd:element name="theta" type="docEmptyType" />
//     <xsd:element name="iota" type="docEmptyType" />
//     <xsd:element name="kappa" type="docEmptyType" />
//     <xsd:element name="lambda" type="docEmptyType" />
//     <xsd:element name="mu" type="docEmptyType" />
//     <xsd:element name="nu" type="docEmptyType" />
//     <xsd:element name="xi" type="docEmptyType" />
//     <xsd:element name="omicron" type="docEmptyType" />
//     <xsd:element name="pi" type="docEmptyType" />
//     <xsd:element name="rho" type="docEmptyType" />
//     <xsd:element name="sigmaf" type="docEmptyType" />
//     <xsd:element name="sigma" type="docEmptyType" />
//     <xsd:element name="tau" type="docEmptyType" />
//     <xsd:element name="upsilon" type="docEmptyType" />
//     <xsd:element name="phi" type="docEmptyType" />
//     <xsd:element name="chi" type="docEmptyType" />
//     <xsd:element name="psi" type="docEmptyType" />
//     <xsd:element name="omega" type="docEmptyType" />
//     <xsd:element name="thetasym" type="docEmptyType" />
//     <xsd:element name="upsih" type="docEmptyType" />
//     <xsd:element name="piv" type="docEmptyType" />
//     <xsd:element name="bull" type="docEmptyType" />
//     <xsd:element name="hellip" type="docEmptyType" />
//     <xsd:element name="prime" type="docEmptyType" />
//     <xsd:element name="Prime" type="docEmptyType" />
//     <xsd:element name="oline" type="docEmptyType" />
//     <xsd:element name="frasl" type="docEmptyType" />
//     <xsd:element name="weierp" type="docEmptyType" />
//     <xsd:element name="imaginary" type="docEmptyType" />
//     <xsd:element name="real" type="docEmptyType" />
//     <xsd:element name="trademark" type="docEmptyType" />
//     <xsd:element name="alefsym" type="docEmptyType" />
//     <xsd:element name="larr" type="docEmptyType" />
//     <xsd:element name="uarr" type="docEmptyType" />
//     <xsd:element name="rarr" type="docEmptyType" />
//     <xsd:element name="darr" type="docEmptyType" />
//     <xsd:element name="harr" type="docEmptyType" />
//     <xsd:element name="crarr" type="docEmptyType" />
//     <xsd:element name="lArr" type="docEmptyType" />
//     <xsd:element name="uArr" type="docEmptyType" />
//     <xsd:element name="rArr" type="docEmptyType" />
//     <xsd:element name="dArr" type="docEmptyType" />
//     <xsd:element name="hArr" type="docEmptyType" />
//     <xsd:element name="forall" type="docEmptyType" />
//     <xsd:element name="part" type="docEmptyType" />
//     <xsd:element name="exist" type="docEmptyType" />
//     <xsd:element name="empty" type="docEmptyType" />
//     <xsd:element name="nabla" type="docEmptyType" />
//     <xsd:element name="isin" type="docEmptyType" />
//     <xsd:element name="notin" type="docEmptyType" />
//     <xsd:element name="ni" type="docEmptyType" />
//     <xsd:element name="prod" type="docEmptyType" />
//     <xsd:element name="sum" type="docEmptyType" />
//     <xsd:element name="minus" type="docEmptyType" />
//     <xsd:element name="lowast" type="docEmptyType" />
//     <xsd:element name="radic" type="docEmptyType" />
//     <xsd:element name="prop" type="docEmptyType" />
//     <xsd:element name="infin" type="docEmptyType" />
//     <xsd:element name="ang" type="docEmptyType" />
//     <xsd:element name="and" type="docEmptyType" />
//     <xsd:element name="or" type="docEmptyType" />
//     <xsd:element name="cap" type="docEmptyType" />
//     <xsd:element name="cup" type="docEmptyType" />
//     <xsd:element name="int" type="docEmptyType" />
//     <xsd:element name="there4" type="docEmptyType" />
//     <xsd:element name="sim" type="docEmptyType" />
//     <xsd:element name="cong" type="docEmptyType" />
//     <xsd:element name="asymp" type="docEmptyType" />
//     <xsd:element name="ne" type="docEmptyType" />
//     <xsd:element name="equiv" type="docEmptyType" />
//     <xsd:element name="le" type="docEmptyType" />
//     <xsd:element name="ge" type="docEmptyType" />
//     <xsd:element name="sub" type="docEmptyType" />
//     <xsd:element name="sup" type="docEmptyType" />
//     <xsd:element name="nsub" type="docEmptyType" />
//     <xsd:element name="sube" type="docEmptyType" />
//     <xsd:element name="supe" type="docEmptyType" />
//     <xsd:element name="oplus" type="docEmptyType" />
//     <xsd:element name="otimes" type="docEmptyType" />
//     <xsd:element name="perp" type="docEmptyType" />
//     <xsd:element name="sdot" type="docEmptyType" />
//     <xsd:element name="lceil" type="docEmptyType" />
//     <xsd:element name="rceil" type="docEmptyType" />
//     <xsd:element name="lfloor" type="docEmptyType" />
//     <xsd:element name="rfloor" type="docEmptyType" />
//     <xsd:element name="lang" type="docEmptyType" />
//     <xsd:element name="rang" type="docEmptyType" />
//     <xsd:element name="loz" type="docEmptyType" />
//     <xsd:element name="spades" type="docEmptyType" />
//     <xsd:element name="clubs" type="docEmptyType" />
//     <xsd:element name="hearts" type="docEmptyType" />
//     <xsd:element name="diams" type="docEmptyType" />
//     <xsd:element name="OElig" type="docEmptyType" />
//     <xsd:element name="oelig" type="docEmptyType" />
//     <xsd:element name="Scaron" type="docEmptyType" />
//     <xsd:element name="scaron" type="docEmptyType" />
//     <xsd:element name="Yumlaut" type="docEmptyType" />
//     <xsd:element name="circ" type="docEmptyType" />
//     <xsd:element name="tilde" type="docEmptyType" />
//     <xsd:element name="ensp" type="docEmptyType" />
//     <xsd:element name="emsp" type="docEmptyType" />
//     <xsd:element name="thinsp" type="docEmptyType" />
//     <xsd:element name="zwnj" type="docEmptyType" />
//     <xsd:element name="zwj" type="docEmptyType" />
//     <xsd:element name="lrm" type="docEmptyType" />
//     <xsd:element name="rlm" type="docEmptyType" />
//     <xsd:element name="ndash" type="docEmptyType" />
//     <xsd:element name="mdash" type="docEmptyType" />
//     <xsd:element name="lsquo" type="docEmptyType" />
//     <xsd:element name="rsquo" type="docEmptyType" />
//     <xsd:element name="sbquo" type="docEmptyType" />
//     <xsd:element name="ldquo" type="docEmptyType" />
//     <xsd:element name="rdquo" type="docEmptyType" />
//     <xsd:element name="bdquo" type="docEmptyType" />
//     <xsd:element name="dagger" type="docEmptyType" />
//     <xsd:element name="Dagger" type="docEmptyType" />
//     <xsd:element name="permil" type="docEmptyType" />
//     <xsd:element name="lsaquo" type="docEmptyType" />
//     <xsd:element name="rsaquo" type="docEmptyType" />
//     <xsd:element name="euro" type="docEmptyType" />
//     <xsd:element name="tm" type="docEmptyType" />
//     <!-- end workaround for xsd.exe -->
//     <xsd:element name="hruler" type="docEmptyType" />
//     <xsd:element name="preformatted" type="docMarkupType" />

//     <xsd:element name="programlisting" type="listingType" />
//     <xsd:element name="verbatim" type="xsd:string" />
//     <xsd:element name="javadocliteral" type="xsd:string" />
//     <xsd:element name="javadoccode" type="xsd:string" />
//     <xsd:element name="indexentry" type="docIndexEntryType" />
//     <xsd:element name="orderedlist" type="docListType" />
//     <xsd:element name="itemizedlist" type="docListType" />
//     <xsd:element name="simplesect" type="docSimpleSectType" />
//     <xsd:element name="title" type="docTitleType" />
//     <xsd:element name="variablelist" type="docVariableListType" />
//     <xsd:element name="table" type="docTableType" />
//     <xsd:element name="heading" type="docHeadingType" />
//     <xsd:element name="dotfile" type="docImageFileType" />
//     <xsd:element name="mscfile" type="docImageFileType" />
//     <xsd:element name="diafile" type="docImageFileType" />
//     <xsd:element name="plantumlfile" type="docImageFileType" />
//     <xsd:element name="toclist" type="docTocListType" />
//     <xsd:element name="language" type="docLanguageType" />
//     <xsd:element name="parameterlist" type="docParamListType" />
//     <xsd:element name="xrefsect" type="docXRefSectType" />
//     <xsd:element name="copydoc" type="docCopyType" />
//     <xsd:element name="details" type="docDetailsType" />
//     <xsd:element name="blockquote" type="docBlockQuoteType" />
//     <xsd:element name="parblock" type="docParBlockType" />
//   </xsd:choice>
// </xsd:group>

/**
 * Union type for document command group elements.
 *
 * @remarks
 * Defines the comprehensive set of command elements that can appear within
 * document content according to the Doxygen XML schema. This union encompasses
 * formatting elements (bold, underline, emphasis), structural elements
 * (lists, tables, sections), interactive elements (links, references),
 * specialized documentation elements (parameter lists, cross-references),
 * and special character markup.
 *
 * The type supports the full richness of Doxygen documentation markup,
 * enabling complex document structures with proper type safety for
 * content parsing and generation operations. This includes support for
 * code listings, mathematical formulae, images, and cross-references.
 *
 * @public
 */
export type DocCmdGroup =
  | BoldDataModel
  | SimpleSectDataModel
  | UnderlineDataModel
  | EmphasisDataModel
  | ParameterListDataModel
  | ComputerOutputDataModel
  | RefDataModel
  | ItemizedListDataModel
  | LineBreakDataModel
  | UlinkDataModel
  | AnchorDataModel
  | XrefSectDataModel
  | VariableListDataModel
  | SubstringDocMarkupType
  | DocTableDataModel

/**
 * Parser function for processing document command group elements.
 *
 * @param xml - The Doxygen XML parser instance for processing XML content
 * @param element - The XML element object containing the command data
 * @param elementName - The name of the XML element being processed
 * @returns Array of parsed DocCmdGroup elements
 *
 * @remarks
 * This function processes XML elements that contain document command groups,
 * parsing various markup and structural elements such as formatting (bold,
 * emphasis), interactive elements (links, references), lists, tables,
 * sections, and special character entities. The parser recognises the
 * different element types and creates appropriate data model instances.
 *
 * The function handles the comprehensive variety of documentation elements
 * supported by Doxygen, ensuring proper representation of complex document
 * structures and rich content formatting throughout the documentation system.
 *
 * @public
 */
function parseDocCmdGroup(
  xml: DoxygenXmlParser,
  element: object,
  elementName: string
): DocCmdGroup[] {
  const children: DocCmdGroup[] = []

  // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

  if (xml.hasInnerElement(element, 'ulink')) {
    children.push(new UlinkDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'bold')) {
    children.push(new BoldDataModel(xml, element))
    // s
    // strike
  } else if (xml.hasInnerElement(element, 'underline')) {
    children.push(new UnderlineDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'emphasis')) {
    children.push(new EmphasisDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'computeroutput')) {
    children.push(new ComputerOutputDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'subscript')) {
    children.push(new SubscriptDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'superscript')) {
    children.push(new SuperscriptDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'center')) {
    children.push(new CenterDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'small')) {
    children.push(new SmallDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cite')) {
    children.push(new CiteDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'del')) {
    children.push(new DelDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ins')) {
    children.push(new InsDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'htmlonly')) {
    children.push(new HtmlOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'manonly')) {
    // Skipped, no Man output.
    // children.push(new ManOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'xmlonly')) {
    // children.push(new XmlOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rtfonly')) {
    // Skipped, no RTF output.
    // children.push(new RtfOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'latexonly')) {
    // Skipped, no LaTeX output.
    // children.push(new LatexOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'docbookonly')) {
    // Skipped, no DocBook output.
    children.push(new DocBookOnlyDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'image')) {
    children.push(new ImageDataModel(xml, element))
    // dot
    // msc
    // plantuml
  } else if (xml.hasInnerElement(element, 'anchor')) {
    children.push(new AnchorDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'formula')) {
    children.push(new FormulaDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ref')) {
    children.push(new RefDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'emoji')) {
    children.push(new EmojiDataModel(xml, element))
    // ----
    // Substring elements.
  } else if (xml.hasInnerElement(element, 'linebreak')) {
    children.push(new LineBreakDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'nonbreakablespace')) {
    children.push(new NonBreakableSpaceDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'nzwj')) {
    children.push(new NzwjDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'zwj')) {
    children.push(new ZwjDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ndash')) {
    children.push(new NdashDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'mdash')) {
    children.push(new MdashDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lsquo')) {
    children.push(new LsquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rsquo')) {
    children.push(new RsquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'copy')) {
    children.push(new CopyDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'iexcl')) {
    children.push(new IexclDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cent')) {
    children.push(new CentDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'pound')) {
    children.push(new PoundDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'curren')) {
    children.push(new CurrenDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'yen')) {
    children.push(new YenDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'brvbar')) {
    children.push(new BrvbarDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sect')) {
    children.push(new SectDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'umlaut')) {
    children.push(new UmlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ordf')) {
    children.push(new OrdfDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'laquo')) {
    children.push(new LaquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'not')) {
    children.push(new NotDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'shy')) {
    children.push(new ShyDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'registered')) {
    children.push(new RegisteredDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'macr')) {
    children.push(new MacrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'deg')) {
    children.push(new DegDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'plusmn')) {
    children.push(new PlusmnDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sup2')) {
    children.push(new Sup2DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sup3')) {
    children.push(new Sup3DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'acute')) {
    children.push(new AcuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'micro')) {
    children.push(new MicroDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'para')) {
    children.push(new ParaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'middot')) {
    children.push(new MiddotDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cedil')) {
    children.push(new CedilDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sup1')) {
    children.push(new Sup1DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ordm')) {
    children.push(new OrdmDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'raquo')) {
    children.push(new RaquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'frac14')) {
    children.push(new Frac14DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'frac12')) {
    children.push(new Frac12DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'frac34')) {
    children.push(new Frac34DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'iquest')) {
    children.push(new IquestDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Agrave')) {
    children.push(new AgraveDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Aacute')) {
    children.push(new AacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Acirc')) {
    children.push(new AcircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Atilde')) {
    children.push(new AtildeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Aumlaut')) {
    children.push(new AumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Aring')) {
    children.push(new AringDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'AElig')) {
    children.push(new AEligDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ccedil')) {
    children.push(new CcedilDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Egrave')) {
    children.push(new EgraveDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Eacute')) {
    children.push(new EacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ecirc')) {
    children.push(new EcircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Eumlaut')) {
    children.push(new EumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Igrave')) {
    children.push(new IgraveDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Iacute')) {
    children.push(new IacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Icirc')) {
    children.push(new IcircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Iumlaut')) {
    children.push(new IumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ETH')) {
    children.push(new ETHDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ntilde')) {
    children.push(new NtildeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ograve')) {
    children.push(new OgraveDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Oacute')) {
    children.push(new OacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ocirc')) {
    children.push(new OcircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Otilde')) {
    children.push(new OtildeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Oumlaut')) {
    children.push(new OumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'times')) {
    children.push(new TimesDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Oslash')) {
    children.push(new OslashDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ugrave')) {
    children.push(new UgraveDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Uacute')) {
    children.push(new UacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Ucirc')) {
    children.push(new UcircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Uumlaut')) {
    children.push(new UumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Yacute')) {
    children.push(new YacuteDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'THORN')) {
    children.push(new THORNDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'szlig')) {
    children.push(new SzligDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'agrave')) {
    children.push(new AgraveSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'aacute')) {
    children.push(new AacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'acirc')) {
    children.push(new AcircSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'atilde')) {
    children.push(new AtildeSmallDocMarkupType(xml, element))
  } else if (xml.hasInnerElement(element, 'aumlaut')) {
    children.push(new AumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'aring')) {
    children.push(new AringSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'aelig')) {
    children.push(new AeligSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ccedil')) {
    children.push(new CcedilSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'egrave')) {
    children.push(new EgraveSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'eacute')) {
    children.push(new EacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ecirc')) {
    children.push(new EcircSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'eumlaut')) {
    children.push(new EumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'igrave')) {
    children.push(new IgraveSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'iacute')) {
    children.push(new IacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'icirc')) {
    children.push(new IcircSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'iumlaut')) {
    children.push(new IumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'eth')) {
    children.push(new EthSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ntilde')) {
    children.push(new NtildeSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ograve')) {
    children.push(new OgraveSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oacute')) {
    children.push(new OacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ocirc')) {
    children.push(new OcircSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'otilde')) {
    children.push(new OtildeSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oumlaut')) {
    children.push(new OumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oslash')) {
    children.push(new OslashSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ugrave')) {
    children.push(new UgraveSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'uacute')) {
    children.push(new UacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ucirc')) {
    children.push(new UcircSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'uumlaut')) {
    children.push(new UumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'yacute')) {
    children.push(new YacuteSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'thorn')) {
    children.push(new ThornSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'yumlaut')) {
    children.push(new YumlautSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'divide')) {
    children.push(new DivideDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'fnof')) {
    children.push(new FnofDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Alpha')) {
    children.push(new AlphaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Beta')) {
    children.push(new BetaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Gamma')) {
    children.push(new GammaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Delta')) {
    children.push(new DeltaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Epsilon')) {
    children.push(new EpsilonDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Zeta')) {
    children.push(new ZetaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Eta')) {
    children.push(new EtaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Theta')) {
    children.push(new ThetaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Iota')) {
    children.push(new IotaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Kappa')) {
    children.push(new KappaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Lambda')) {
    children.push(new LambdaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Mu')) {
    children.push(new MuDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Nu')) {
    children.push(new NuDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Xi')) {
    children.push(new XiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Omicron')) {
    children.push(new OmicronDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Pi')) {
    children.push(new PiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Rho')) {
    children.push(new RhoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Sigma')) {
    children.push(new SigmaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Tau')) {
    children.push(new TauDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Upsilon')) {
    children.push(new UpsilonDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Phi')) {
    children.push(new PhiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Chi')) {
    children.push(new ChiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Psi')) {
    children.push(new PsiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Omega')) {
    children.push(new OmegaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'alpha')) {
    children.push(new AlphaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'beta')) {
    children.push(new BetaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'gamma')) {
    children.push(new GammaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'delta')) {
    children.push(new DeltaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'epsilon')) {
    children.push(new EpsilonSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'zeta')) {
    children.push(new ZetaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'eta')) {
    children.push(new EtaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'theta')) {
    children.push(new ThetaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'iota')) {
    children.push(new IotaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'kappa')) {
    children.push(new KappaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lambda')) {
    children.push(new LambdaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'mu')) {
    children.push(new MuSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'nu')) {
    children.push(new NuSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'xi')) {
    children.push(new XiSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'omicron')) {
    children.push(new OmicronSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'pi')) {
    children.push(new PiSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rho')) {
    children.push(new RhoSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sigma')) {
    children.push(new SigmaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sigmaf')) {
    children.push(new SigmafSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'tau')) {
    children.push(new TauSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'upsilon')) {
    children.push(new UpsilonSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'phi')) {
    children.push(new PhiSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'chi')) {
    children.push(new ChiSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'psi')) {
    children.push(new PsiSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'omega')) {
    children.push(new OmegaSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'thetasym')) {
    children.push(new ThetasymDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'upsih')) {
    children.push(new UpsihDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'piv')) {
    children.push(new PivDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'bull')) {
    children.push(new BullDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'hellip')) {
    children.push(new HellipDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'prime')) {
    children.push(new PrimeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Prime')) {
    children.push(new PrimeUpperDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oline')) {
    children.push(new OlineDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'frasl')) {
    children.push(new FraslDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'weierp')) {
    children.push(new WeierpDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'imaginary')) {
    children.push(new ImaginaryDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'real')) {
    children.push(new RealDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'trademark')) {
    children.push(new TrademarkDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'alefsym')) {
    children.push(new AlefsymDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'larr')) {
    children.push(new LarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'uarr')) {
    children.push(new UarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rarr')) {
    children.push(new RarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'darr')) {
    children.push(new DarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'harr')) {
    children.push(new HarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'crarr')) {
    children.push(new CrarrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lArr')) {
    children.push(new LArrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'uArr')) {
    children.push(new UArrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rArr')) {
    children.push(new RArrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'dArr')) {
    children.push(new DArrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'hArr')) {
    children.push(new HArrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'forall')) {
    children.push(new ForallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'part')) {
    children.push(new PartDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'exist')) {
    children.push(new ExistDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'empty')) {
    children.push(new EmptyDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'nabla')) {
    children.push(new NablaDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'isin')) {
    children.push(new IsinDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'notin')) {
    children.push(new NotinDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ni')) {
    children.push(new NiDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'prod')) {
    children.push(new ProdDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sum')) {
    children.push(new SumDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'minus')) {
    children.push(new MinusDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lowast')) {
    children.push(new LowastDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'radic')) {
    children.push(new RadicDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'prop')) {
    children.push(new PropDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'infin')) {
    children.push(new InfinDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ang')) {
    children.push(new AngDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'and')) {
    children.push(new AndDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'or')) {
    children.push(new OrDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cap')) {
    children.push(new CapDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cup')) {
    children.push(new CupDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'int')) {
    children.push(new IntDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'there4')) {
    children.push(new There4DocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sim')) {
    children.push(new SimDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'cong')) {
    children.push(new CongDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'asymp')) {
    children.push(new AsympDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ne')) {
    children.push(new NeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'equiv')) {
    children.push(new EquivDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'le')) {
    children.push(new LeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ge')) {
    children.push(new GeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sub')) {
    children.push(new SubDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sup')) {
    children.push(new SupDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'nsub')) {
    children.push(new NsubDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sube')) {
    children.push(new SubeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'supe')) {
    children.push(new SupeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oplus')) {
    children.push(new OplusDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'otimes')) {
    children.push(new OtimesDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'perp')) {
    children.push(new PerpDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sdot')) {
    children.push(new SdotDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lceil')) {
    children.push(new LceilDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rceil')) {
    children.push(new RceilDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lfloor')) {
    children.push(new LfloorDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rfloor')) {
    children.push(new RfloorDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lang')) {
    children.push(new LangDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rang')) {
    children.push(new RangDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'loz')) {
    children.push(new LozDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'spades')) {
    children.push(new SpadesDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'clubs')) {
    children.push(new ClubsDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'hearts')) {
    children.push(new HeartsDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'diams')) {
    children.push(new DiamsDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'OElig')) {
    children.push(new OEligDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'oelig')) {
    children.push(new OeligDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Scaron')) {
    children.push(new ScaronDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'scaron')) {
    children.push(new ScaronSmallDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Yumlaut')) {
    children.push(new YumlautDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'circ')) {
    children.push(new CircDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'tilde')) {
    children.push(new TildeDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ensp')) {
    children.push(new EnspDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'emsp')) {
    children.push(new EmspDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'thinsp')) {
    children.push(new ThinspDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'zwnj')) {
    children.push(new ZwnjDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lrm')) {
    children.push(new LrmDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rlm')) {
    children.push(new RlmDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'sbquo')) {
    children.push(new SbquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'ldquo')) {
    children.push(new LdquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rdquo')) {
    children.push(new RdquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'bdquo')) {
    children.push(new BdquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'dagger')) {
    children.push(new DaggerDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'Dagger')) {
    children.push(new DaggerUpperDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'permil')) {
    children.push(new PermilDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'lsaquo')) {
    children.push(new LsaquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'rsaquo')) {
    children.push(new RsaquoDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'euro')) {
    children.push(new EuroDocMarkupDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'tm')) {
    children.push(new TmDocMarkupDataModel(xml, element))

    // ----
  } else if (xml.hasInnerElement(element, 'hruler')) {
    children.push(new HrulerDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'preformatted')) {
    children.push(new PreformattedDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'programlisting')) {
    children.push(new ProgramListingDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'verbatim')) {
    children.push(new VerbatimDataModel(xml, element))
    // javadocliteral
    // javadoccode
  } else if (xml.hasInnerElement(element, 'indexentry')) {
    // Skipped, no index rendered.
    // children.push(new IndexEntryDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'orderedlist')) {
    children.push(new OrderedListDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'itemizedlist')) {
    children.push(new ItemizedListDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'simplesect')) {
    children.push(new SimpleSectDataModel(xml, element))
    // title
  } else if (xml.hasInnerElement(element, 'variablelist')) {
    children.push(new VariableListDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'table')) {
    children.push(new DocTableDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'heading')) {
    children.push(new HeadingDataModel(xml, element))
    // dotfile
    // mscfile
    // dialfile
    // plantumlfile
  } else if (xml.hasInnerElement(element, 'toclist')) {
    children.push(new TocListDataModel(xml, element))
    // language
  } else if (xml.hasInnerElement(element, 'parameterlist')) {
    children.push(new ParameterListDataModel(xml, element))
  } else if (xml.hasInnerElement(element, 'xrefsect')) {
    children.push(new XrefSectDataModel(xml, element))
    // copydoc
    // details
  } else if (xml.hasInnerElement(element, 'blockquote')) {
    children.push(new BlockquoteDataModel(xml, element))
    // parblock
  } else {
    console.error(util.inspect(element, { compact: false, depth: 999 }))
    console.error(
      `${elementName} element:`,
      Object.keys(element),
      'not implemented yet by parseDocCmdGroup()'
    )
  }
  return children
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docParaType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>

/**
 * Abstract base class for document paragraph elements containing mixed content.
 *
 * @remarks
 * Implements the XML Schema definition for docParaType elements, which
 * represent paragraphs within documentation containing mixed content including
 * text and various document command group elements. These paragraphs form
 * the fundamental content blocks within documentation structures, supporting
 * rich formatting, cross-references, and embedded elements.
 *
 * The implementation processes both textual content and structured markup
 * elements using the document command group parser, maintaining the original
 * order of content elements to preserve the intended layout and presentation
 * of paragraph content.
 *
 * @public
 */
export abstract class AbstractDocParaType extends AbstractDataModelBase {
  /**
   * Constructs an AbstractDocParaType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the paragraph data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes paragraph elements by extracting both textual
   * content and structured command group elements. The parser delegates
   * structured element processing to the parseDocCmdGroup function to handle
   * the full range of document markup elements whilst maintaining the
   * original content order for proper paragraph presentation.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    // May be empty. Do not check children.length.

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(...parseDocCmdGroup(xml, innerElement, elementName))
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docMarkupType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>

/**
 * Base class for document markup elements containing mixed content.
 *
 * @remarks
 * Implements the XML Schema definition for docMarkupType elements, which
 * represent markup containers that support mixed content including text
 * and various document command group elements. These markup elements form
 * the foundation for formatted content within documentation such as bold
 * text, emphasis, and other inline formatting constructs.
 *
 * The implementation processes both textual content and structured markup
 * elements, maintaining their original order to preserve the intended
 * formatting and presentation of the documentation content.
 *
 * @public
 */
export class AbstractDocMarkupType extends AbstractDataModelBase {
  /**
   * Constructs an AbstractDocMarkupType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the markup data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes markup elements by extracting both textual
   * content and structured command group elements. The parser maintains
   * the original order of content elements whilst delegating structured
   * element processing to the parseDocCmdGroup function for comprehensive
   * markup support.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    // SubstringDocMarkupType has no inner elments
    // assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(...parseDocCmdGroup(xml, innerElement, elementName))
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

/**
 * Specialised markup type for substring-based special character elements.
 *
 * @remarks
 * Extends the base markup functionality to include a substring property
 * that stores the actual character or character sequence represented by
 * the markup element. This class is particularly useful for handling
 * special character entities and symbols that need both structural
 * representation and their corresponding textual output.
 *
 * The substring property enables proper rendering of special characters
 * whilst maintaining the XML structure and metadata associated with
 * the markup element.
 *
 * @public
 */
export class SubstringDocMarkupType extends AbstractDocMarkupType {
  /**
   * The character or character sequence represented by this markup element.
   *
   * @remarks
   * Contains the actual textual representation of the special character
   * or symbol that this markup element represents. This property enables
   * proper text generation whilst preserving the structured markup
   * information for documentation processing.
   */
  substring: string

  /**
   * Constructs a SubstringDocMarkupType with associated character data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the markup data
   * @param elementName - The name of the XML element being processed
   * @param substring - The character sequence this markup represents
   *
   * @remarks
   * This constructor extends the base markup processing to associate
   * specific character data with the markup element. This enables
   * special character entities to maintain both their XML structure
   * and their intended textual output for proper document generation.
   */
  constructor(
    xml: DoxygenXmlParser,
    element: object,
    elementName: string,
    substring: string
  ) {
    super(xml, element, elementName)
    this.substring = substring
  }
}

// <xsd:element name="mdash" type="docEmptyType" />
// <xsd:element name="lsquo" type="docEmptyType" />
// <xsd:element name="rsquo" type="docEmptyType" />

// copyright
export class CopyDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'copy', '\u00A9')
  }
}

// inverted exclamation mark
export class IexclDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'iexcl', '\u00A1')
  }
}

// cent
export class CentDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'cent', '\u00A2')
  }
}

// pound
export class PoundDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'pound', '\u00A3')
  }
}

// curren
export class CurrenDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'curren', '\u00A4')
  }
}

// yen
export class YenDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'yen', '\u00A5')
  }
}

// brvbar
export class BrvbarDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'brvbar', '\u00A6')
  }
}

// sect
export class SectDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sect', '\u00A7')
  }
}

// umlaut (diaeresis)
export class UmlautDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'umlaut', '\u00A8')
  }
}

// Zero Width Non-Joiner
export class NzwjDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'nzwj', '\u200C')
  }
}

// Zero Width Joiner.
export class ZwjDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'zwj', '\u200D')
  }
}

// en dash.
export class NdashDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ndash', '\u2013') // '–'
  }
}

// em dash.
export class MdashDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'mdash', '\u2014') // '—'
  }
}

// ordfeminine
export class OrdfDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ordf', '\u00AA')
  }
}

// left-pointing double angle quotation mark
export class LaquoDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'laquo', '\u00AB')
  }
}

// not sign
export class NotDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'not', '\u00AC')
  }
}

// soft hyphen
export class ShyDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'shy', '\u00AD')
  }
}

// registered sign
export class RegisteredDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'registered', '\u00AE')
  }
}

// macron
export class MacrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'macr', '\u00AF')
  }
}

// degree sign
export class DegDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'deg', '\u00B0')
  }
}

// plus-minus sign
export class PlusmnDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'plusmn', '\u00B1')
  }
}

// superscript two
export class Sup2DocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sup2', '\u00B2')
  }
}

// superscript three
export class Sup3DocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sup3', '\u00B3')
  }
}

// acute accent
export class AcuteDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'acute', '\u00B4')
  }
}

// micro sign
export class MicroDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'micro', '\u00B5')
  }
}

// pilcrow/paragraph sign
export class ParaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'para', '\u00B6')
  }
}

// middle dot
export class MiddotDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'middot', '\u00B7')
  }
}

// cedilla
export class CedilDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'cedil', '\u00B8')
  }
}

// superscript one
export class Sup1DocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sup1', '\u00B9')
  }
}

// masculine ordinal indicator
export class OrdmDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ordm', '\u00BA')
  }
}

// right-pointing double angle quotation mark
export class RaquoDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'raquo', '\u00BB')
  }
}

// fraction one quarter
export class Frac14DocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'frac14', '\u00BC')
  }
}

// fraction one half
export class Frac12DocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'frac12', '\u00BD')
  }
}

// fraction three quarters
export class Frac34DocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'frac34', '\u00BE')
  }
}

// inverted question mark
export class IquestDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'iquest', '\u00BF')
  }
}

// Latin capital letter A with grave
export class AgraveDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Agrave', '\u00C0')
  }
}

// Latin capital letter A with acute
export class AacuteDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Aacute', '\u00C1')
  }
}

// Latin capital letter A with circumflex
export class AcircDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Acirc', '\u00C2')
  }
}

// Latin capital letter A with tilde
export class AtildeDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Atilde', '\u00C3')
  }
}

// Latin capital letter A with diaeresis (umlaut)
export class AumlautDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Aumlaut', '\u00C4')
  }
}

// Latin capital letter A with ring above
export class AringDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Aring', '\u00C5')
  }
}

// Latin capital letter AE
export class AEligDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'AElig', '\u00C6')
  }
}

// Latin capital letter C with cedilla
export class CcedilDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Ccedil', '\u00C7')
  }
}

// Latin capital letter E with grave
export class EgraveDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Egrave', '\u00C8')
  }
}

// Latin capital letter E with acute
export class EacuteDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Eacute', '\u00C9')
  }
}

// Latin capital letter E with circumflex
export class EcircDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Ecirc', '\u00CA')
  }
}

// Latin capital letter E with diaeresis (umlaut)
export class EumlautDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Eumlaut', '\u00CB')
  }
}

// Latin capital letter I with grave
export class IgraveDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Igrave', '\u00CC')
  }
}

// Latin capital letter I with acute
export class IacuteDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Iacute', '\u00CD')
  }
}

// Latin capital letter I with circumflex
export class IcircDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Icirc', '\u00CE')
  }
}

// Latin capital letter I with diaeresis (umlaut)
export class IumlautDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Iumlaut', '\u00CF')
  }
}

// Latin capital letter ETH
export class ETHDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ETH', '\u00D0')
  }
}

// Latin capital letter N with tilde
export class NtildeDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Ntilde', '\u00D1')
  }
}

// Latin capital letter O with grave
export class OgraveDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Ograve', '\u00D2')
  }
}

// Latin capital letter O with acute
export class OacuteDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Oacute', '\u00D3')
  }
}

// Latin capital letter O with circumflex
export class OcircDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Ocirc', '\u00D4')
  }
}

// Latin capital letter O with tilde
export class OtildeDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Otilde', '\u00D5')
  }
}

// Latin capital letter O with diaeresis (umlaut)
export class OumlautDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Oumlaut', '\u00D6')
  }
}

// multiplication sign
export class TimesDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'times', '\u00D7')
  }
}

// Latin capital letter O with stroke
export class OslashDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Oslash', '\u00D8')
  }
}

// Latin capital letter U with grave
export class UgraveDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Ugrave', '\u00D9')
  }
}

// Latin capital letter U with acute
export class UacuteDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Uacute', '\u00DA')
  }
}

// Latin capital letter U with circumflex
export class UcircDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Ucirc', '\u00DB')
  }
}

// Latin capital letter U with diaeresis (umlaut)
export class UumlautDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Uumlaut', '\u00DC')
  }
}

// Latin capital letter Y with acute
export class YacuteDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Yacute', '\u00DD')
  }
}

// Latin capital letter Thorn
export class THORNDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'THORN', '\u00DE')
  }
}

// Latin small letter sharp s (eszett)
export class SzligDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'szlig', '\u00DF')
  }
}

// Latin small letter a with grave
export class AgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'agrave', '\u00E0')
  }
}

// Latin small letter a with acute
export class AacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'aacute', '\u00E1')
  }
}

// Latin small letter a with circumflex
export class AcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'acirc', '\u00E2')
  }
}

// Latin small letter a with tilde
export class AtildeSmallDocMarkupType extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'atilde', '\u00E3')
  }
}

// Latin small letter a with diaeresis (umlaut)
export class AumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'aumlaut', '\u00E4')
  }
}

// Latin small letter a with ring above
export class AringSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'aring', '\u00E5')
  }
}

// Latin small letter ae
export class AeligSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'aelig', '\u00E6')
  }
}

// Latin small letter c with cedilla
export class CcedilSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ccedil', '\u00E7')
  }
}

// Latin small letter e with grave
export class EgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'egrave', '\u00E8')
  }
}

// Latin small letter e with acute
export class EacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'eacute', '\u00E9')
  }
}

// Latin small letter e with circumflex
export class EcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ecirc', '\u00EA')
  }
}

// Latin small letter e with diaeresis (umlaut)
export class EumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'eumlaut', '\u00EB')
  }
}

// Latin small letter i with grave
export class IgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'igrave', '\u00EC')
  }
}

// Latin small letter i with acute
export class IacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'iacute', '\u00ED')
  }
}

// Latin small letter i with circumflex
export class IcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'icirc', '\u00EE')
  }
}

// Latin small letter i with diaeresis (umlaut)
export class IumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'iumlaut', '\u00EF')
  }
}

// Latin small letter eth
export class EthSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'eth', '\u00F0')
  }
}

// Latin small letter n with tilde
export class NtildeSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ntilde', '\u00F1')
  }
}

// Latin small letter o with grave
export class OgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ograve', '\u00F2')
  }
}

// Latin small letter o with acute
export class OacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'oacute', '\u00F3')
  }
}

// Latin small letter o with circumflex
export class OcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ocirc', '\u00F4')
  }
}

// Latin small letter o with tilde
export class OtildeSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'otilde', '\u00F5')
  }
}

// Latin small letter o with diaeresis (umlaut)
export class OumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'oumlaut', '\u00F6')
  }
}

// division sign
export class DivideDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'divide', '\u00F7')
  }
}

// Latin small letter o with stroke
export class OslashSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'oslash', '\u00F8')
  }
}

// Latin small letter u with grave
export class UgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ugrave', '\u00F9')
  }
}

// Latin small letter u with acute
export class UacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'uacute', '\u00FA')
  }
}

// Latin small letter u with circumflex
export class UcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ucirc', '\u00FB')
  }
}

// Latin small letter u with diaeresis (umlaut)
export class UumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'uumlaut', '\u00FC')
  }
}

// Latin small letter y with acute
export class YacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'yacute', '\u00FD')
  }
}

// Latin small letter thorn
export class ThornSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'thorn', '\u00FE')
  }
}

// Latin small letter y with diaeresis (umlaut)
export class YumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'yumlaut', '\u00FF')
  }
}

// Latin small letter f with hook (function)
export class FnofDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'fnof', '\u0192')
  }
}

// Greek capital letter Alpha
export class AlphaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Alpha', '\u0391')
  }
}

// Greek capital letter Beta
export class BetaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Beta', '\u0392')
  }
}

// Greek capital letter Gamma
export class GammaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Gamma', '\u0393')
  }
}

// Greek capital letter Delta
export class DeltaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Delta', '\u0394')
  }
}

// Greek capital letter Epsilon
export class EpsilonDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Epsilon', '\u0395')
  }
}

// Greek capital letter Zeta
export class ZetaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Zeta', '\u0396')
  }
}

// Greek capital letter Eta
export class EtaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Eta', '\u0397')
  }
}

// Greek capital letter Theta
export class ThetaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Theta', '\u0398')
  }
}

// Greek capital letter Iota
export class IotaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Iota', '\u0399')
  }
}

// Greek capital letter Kappa
export class KappaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Kappa', '\u039A')
  }
}

// Greek capital letter Lambda
export class LambdaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Lambda', '\u039B')
  }
}

// Greek capital letter Mu
export class MuDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Mu', '\u039C')
  }
}

// Greek capital letter Nu
export class NuDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Nu', '\u039D')
  }
}

// Greek capital letter Xi
export class XiDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Xi', '\u039E')
  }
}

// Greek capital letter Omicron
export class OmicronDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Omicron', '\u039F')
  }
}

// Greek capital letter Pi
export class PiDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Pi', '\u03A0')
  }
}

// Greek capital letter Rho
export class RhoDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Rho', '\u03A1')
  }
}

// Greek capital letter Sigma
export class SigmaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Sigma', '\u03A3')
  }
}

// Greek capital letter Tau
export class TauDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Tau', '\u03A4')
  }
}

// Greek capital letter Upsilon
export class UpsilonDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Upsilon', '\u03A5')
  }
}

// Greek capital letter Phi
export class PhiDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Phi', '\u03A6')
  }
}

// Greek capital letter Chi
export class ChiDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Chi', '\u03A7')
  }
}

// Greek capital letter Psi
export class PsiDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Psi', '\u03A8')
  }
}

// Greek capital letter Omega
export class OmegaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Omega', '\u03A9')
  }
}

// Greek small letter alpha
export class AlphaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'alpha', '\u03B1')
  }
}

// Greek small letter beta
export class BetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'beta', '\u03B2')
  }
}

// Greek small letter gamma
export class GammaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'gamma', '\u03B3')
  }
}

// Greek small letter delta
export class DeltaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'delta', '\u03B4')
  }
}

// Greek small letter epsilon
export class EpsilonSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'epsilon', '\u03B5')
  }
}

// Greek small letter zeta
export class ZetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'zeta', '\u03B6')
  }
}

// Greek small letter eta
export class EtaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'eta', '\u03B7')
  }
}

// Greek small letter theta
export class ThetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'theta', '\u03B8')
  }
}

// Greek small letter iota
export class IotaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'iota', '\u03B9')
  }
}

// Greek small letter kappa
export class KappaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'kappa', '\u03BA')
  }
}

// Greek small letter lambda
export class LambdaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'lambda', '\u03BB')
  }
}

// Greek small letter mu
export class MuSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'mu', '\u03BC')
  }
}

// Greek small letter nu
export class NuSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'nu', '\u03BD')
  }
}

// Greek small letter xi
export class XiSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'xi', '\u03BE')
  }
}

// Greek small letter omicron
export class OmicronSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'omicron', '\u03BF')
  }
}

// Greek small letter pi
export class PiSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'pi', '\u03C0')
  }
}

// Greek small letter rho
export class RhoSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'rho', '\u03C1')
  }
}

// Greek small letter sigma
export class SigmaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sigma', '\u03C3')
  }
}

// Greek small letter sigmaf
export class SigmafSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sigmaf', '\u03C2')
  }
}

// Greek small letter tau
export class TauSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'tau', '\u03C4')
  }
}

// Greek small letter upsilon
export class UpsilonSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'upsilon', '\u03C5')
  }
}

// Greek small letter phi
export class PhiSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'phi', '\u03C6')
  }
}

// Greek small letter chi
export class ChiSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'chi', '\u03C7')
  }
}

// Greek small letter psi
export class PsiSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'psi', '\u03C8')
  }
}

// Greek small letter omega
export class OmegaSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'omega', '\u03C9')
  }
}

// Greek small letter theta symbol
export class ThetasymDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'thetasym', '\u03D1')
  }
}

// Greek upsilon with hook symbol
export class UpsihDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'upsih', '\u03D2')
  }
}

// Greek pi symbol (variant)
export class PivDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'piv', '\u03D6')
  }
}

// Bullet
export class BullDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'bull', '\u2022')
  }
}

// Horizontal ellipsis
export class HellipDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'hellip', '\u2026')
  }
}

// Prime (minutes, feet)
export class PrimeDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'prime', '\u2032')
  }
}

// Double prime (seconds, inches)
export class PrimeUpperDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Prime', '\u2033')
  }
}

// Overline
export class OlineDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'oline', '\u203E')
  }
}

// Fraction slash
export class FraslDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'frasl', '\u2044')
  }
}

// Script capital P (Weierstrass p)
export class WeierpDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'weierp', '\u2118')
  }
}

// Imaginary part
export class ImaginaryDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'imaginary', '\u2111')
  }
}

// Real part
export class RealDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'real', '\u211C')
  }
}

// Trademark
export class TrademarkDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'trademark', '\u2122')
  }
}

// Alef symbol
export class AlefsymDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'alefsym', '\u2135')
  }
}

// Leftwards arrow
export class LarrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'larr', '\u2190')
  }
}

// Upwards arrow
export class UarrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'uarr', '\u2191')
  }
}

// Rightwards arrow
export class RarrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'rarr', '\u2192')
  }
}

// Downwards arrow
export class DarrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'darr', '\u2193')
  }
}

// Left right arrow
export class HarrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'harr', '\u2194')
  }
}

// Downwards arrow with corner leftwards (carriage return)
export class CrarrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'crarr', '\u21B5')
  }
}

// Leftwards double arrow
export class LArrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'lArr', '\u21D0')
  }
}

// Upwards double arrow
export class UArrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'uArr', '\u21D1')
  }
}

// Rightwards double arrow
export class RArrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'rArr', '\u21D2')
  }
}

// Downwards double arrow
export class DArrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'dArr', '\u21D3')
  }
}

// Left right double arrow
export class HArrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'hArr', '\u21D4')
  }
}

// For all
export class ForallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'forall', '\u2200')
  }
}

// Partial differential
export class PartDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'part', '\u2202')
  }
}

// There exists
export class ExistDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'exist', '\u2203')
  }
}

// Empty set
export class EmptyDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'empty', '\u2205')
  }
}

// Nabla
export class NablaDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'nabla', '\u2207')
  }
}

// Element of
export class IsinDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'isin', '\u2208')
  }
}

// Not an element of
export class NotinDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'notin', '\u2209')
  }
}

// Contains as member
export class NiDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ni', '\u220B')
  }
}

// N-ary product
export class ProdDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'prod', '\u220F')
  }
}

// N-ary summation
export class SumDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sum', '\u2211')
  }
}

// Minus sign
export class MinusDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'minus', '\u2212')
  }
}

// Asterisk operator
export class LowastDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'lowast', '\u2217')
  }
}

// Square root
export class RadicDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'radic', '\u221A')
  }
}

// Proportional to
export class PropDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'prop', '\u221D')
  }
}

// Infinity
export class InfinDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'infin', '\u221E')
  }
}

// Angle
export class AngDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ang', '\u2220')
  }
}

// Logical and
export class AndDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'and', '\u2227')
  }
}

// Logical or
export class OrDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'or', '\u2228')
  }
}

// Intersection
export class CapDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'cap', '\u2229')
  }
}

// Union
export class CupDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'cup', '\u222A')
  }
}

// Integral
export class IntDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'int', '\u222B')
  }
}

// Therefore
export class There4DocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'there4', '\u2234')
  }
}

// Tilde operator
export class SimDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sim', '\u223C')
  }
}

// Approximately equal to
export class CongDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'cong', '\u2245')
  }
}

// Almost equal to
export class AsympDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'asymp', '\u2248')
  }
}

// Not equal to
export class NeDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ne', '\u2260')
  }
}

// Identical to
export class EquivDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'equiv', '\u2261')
  }
}

// Less-than or equal to
export class LeDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'le', '\u2264')
  }
}

// Greater-than or equal to
export class GeDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ge', '\u2265')
  }
}

// Subset of
export class SubDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sub', '\u2282')
  }
}

// Superset of
export class SupDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sup', '\u2283')
  }
}

// Not a subset of
export class NsubDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'nsub', '\u2284')
  }
}

// Subset of or equal to
export class SubeDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sube', '\u2286')
  }
}

// Superset of or equal to
export class SupeDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'supe', '\u2287')
  }
}

// Circled plus
export class OplusDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'oplus', '\u2295')
  }
}

// Circled times
export class OtimesDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'otimes', '\u2297')
  }
}

// Perpendicular
export class PerpDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'perp', '\u22A5')
  }
}

// Dot operator
export class SdotDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sdot', '\u22C5')
  }
}

// Left ceiling
export class LceilDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'lceil', '\u2308')
  }
}

// Right ceiling
export class RceilDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'rceil', '\u2309')
  }
}

// Left floor
export class LfloorDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'lfloor', '\u230A')
  }
}

// Right floor
export class RfloorDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'rfloor', '\u230B')
  }
}

// Left-pointing angle bracket
export class LangDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'lang', '\u2329')
  }
}

// Right-pointing angle bracket
export class RangDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'rang', '\u232A')
  }
}

// Lozenge
export class LozDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'loz', '\u25CA')
  }
}

// Black spade suit
export class SpadesDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'spades', '\u2660')
  }
}

// Black club suit
export class ClubsDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'clubs', '\u2663')
  }
}

// Black heart suit
export class HeartsDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'hearts', '\u2665')
  }
}

// Black diamond suit
export class DiamsDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'diams', '\u2666')
  }
}

// Latin capital ligature OE
export class OEligDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'OElig', '\u0152')
  }
}

// Latin small ligature oe
export class OeligDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'oelig', '\u0153')
  }
}

// Latin capital letter S with caron
export class ScaronDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Scaron', '\u0160')
  }
}

// Latin small letter s with caron
export class ScaronSmallDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'scaron', '\u0161')
  }
}

// Latin capital letter Y with diaeresis (umlaut)
export class YumlautDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Yumlaut', '\u0178')
  }
}

// Modifier letter circumflex accent
export class CircDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'circ', '\u02C6')
  }
}

// Small tilde
export class TildeDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'tilde', '\u02DC')
  }
}

// En space
export class EnspDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ensp', '\u2002')
  }
}

// Em space
export class EmspDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'emsp', '\u2003')
  }
}

// Thin space
export class ThinspDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'thinsp', '\u2009')
  }
}

// Zero width non-joiner
export class ZwnjDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'zwnj', '\u200C')
  }
}

// Left-to-right mark
export class LrmDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'lrm', '\u200E')
  }
}

// Right-to-left mark
export class RlmDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'rlm', '\u200F')
  }
}

// Single low-9 quotation mark
export class SbquoDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sbquo', '\u201A')
  }
}

// Left double quotation mark
export class LdquoDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ldquo', '\u201C')
  }
}

// Right double quotation mark
export class RdquoDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'rdquo', '\u201D')
  }
}

// Double low-9 quotation mark
export class BdquoDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'bdquo', '\u201E')
  }
}

// Dagger
export class DaggerDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'dagger', '\u2020')
  }
}

// Double dagger
export class DaggerUpperDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'Dagger', '\u2021')
  }
}

// Per mille sign
export class PermilDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'permil', '\u2030')
  }
}

// Single left-pointing angle quotation mark
export class LsaquoDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'lsaquo', '\u2039')
  }
}

// Single right-pointing angle quotation mark
export class RsaquoDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'rsaquo', '\u203A')
  }
}

// Euro sign
export class EuroDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'euro', '\u20AC')
  }
}

// Trade mark sign
export class TmDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'tm', '\u2122')
  }
}

// Left single quote.
export class LsquoDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'lsquo', '\u2018') // '‘'
  }
}

// Right single quote.
export class RsquoDocMarkupDataModel extends SubstringDocMarkupType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'rsquo', '\u0060') // '`'
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docURLLink" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="url" type="xsd:string" />
// </xsd:complexType>

/**
 * Abstract base class for URL link elements within documentation content.
 *
 * @remarks
 * Represents hyperlink elements that reference external URLs or web resources
 * within documentation descriptions. This implementation processes Doxygen's
 * URL link elements, which support mixed content including text and formatting
 * commands within the link text, providing comprehensive support for rich
 * hyperlink content.
 *
 * URL links contain a mandatory URL attribute and support child elements
 * for formatted link text, enabling complex link presentations with styling
 * and embedded markup whilst maintaining proper link functionality.
 *
 * @public
 */
export class AbstractDocURLLink extends AbstractDataModelBase {
  // children: Array<string | DocTitleCmdGroup> = []

  /**
   * Target URL for the hyperlink.
   *
   * @remarks
   * Contains the destination URL that the hyperlink should navigate to.
   * This can be an absolute URL to external resources or a relative URL
   * for internal navigation within the documentation structure.
   */
  url = ''

  /**
   * Constructs an AbstractDocURLLink instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the URL link data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes URL link elements by extracting the mandatory
   * URL attribute and processing any mixed content including text and
   * formatting commands within the link. The implementation ensures that
   * a valid URL is present and organises child elements for proper link
   * text rendering.
   *
   * The URL attribute is validated to ensure proper link functionality
   * within the generated documentation output.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(
          ...parseDocTitleCmdGroup(xml, innerElement, elementName)
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_url') {
        this.url = xml.getAttributeStringValue(element, '@_url')
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

    assert(this.url.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="ulink" type="docURLLink" />

/**
 * Data model for URL link elements within documentation content.
 *
 * @remarks
 * Represents hyperlink elements that reference external URLs or web resources
 * within documentation descriptions. This implementation processes Doxygen's
 * ulink elements, providing support for external linking with formatted
 * link text and proper URL handling.
 *
 * URL links enable documentation to reference external resources, websites,
 * specifications, and related materials whilst maintaining proper hyperlink
 * functionality within the generated documentation output.
 *
 * @public
 */
export class UlinkDataModel extends AbstractDocURLLink {
  /**
   * Constructs a UlinkDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the URL link data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocURLLink whilst
   * identifying the element as 'ulink' for proper URL link processing
   * and hyperlink functionality within documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ulink')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docAnchorType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

/**
 * Abstract base class for anchor elements within documentation content.
 *
 * @remarks
 * Represents anchor elements that provide navigation targets within
 * documentation descriptions. This implementation processes Doxygen's
 * anchor elements, which create bookmarks or jump targets that can be
 * referenced by cross-references and hyperlinks within the documentation.
 *
 * Anchor elements contain a mandatory ID attribute that serves as the
 * target identifier for navigation purposes. Whilst the schema allows
 * mixed content, anchor elements are typically empty in practice and
 * serve purely as navigation markers.
 *
 * @public
 */
export class AbstractDocAnchorType extends AbstractDataModelBase {
  // children: string[] = []

  /**
   * Unique identifier for the anchor target.
   *
   * @remarks
   * Contains the unique identifier that serves as the navigation target
   * for cross-references and hyperlinks. This ID is used to generate
   * HTML anchor elements and enable deep linking within documentation.
   */
  id = ''

  /**
   * Constructs an AbstractDocAnchorType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the anchor data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes anchor elements by extracting the mandatory
   * ID attribute whilst handling any unexpected content. Anchor elements
   * are typically empty but the implementation provides error reporting
   * for unexpected text content to ensure proper anchor functionality.
   *
   * The ID attribute is validated to ensure proper anchor target creation
   * within the generated documentation output.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    // Usually empty `<anchor id="deprecated_1_deprecated000014"/>`
    const innerElements = xml.getInnerElements(element, elementName)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
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

    if (this.children.length > 0) {
      console.error(
        'Unexpected <anchor> text content in',
        this.constructor.name
      )
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_id') {
        this.id = xml.getAttributeStringValue(element, '@_id')
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

    assert(this.id.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="anchor" type="docAnchorType" />

/**
 * Data model for anchor elements within documentation content.
 *
 * @remarks
 * Represents anchor elements that provide navigation targets within
 * documentation descriptions. This implementation processes Doxygen's
 * anchor elements, creating bookmarks or jump targets for cross-references
 * and deep linking functionality within the documentation structure.
 *
 * Anchor elements enable precise navigation within documentation pages,
 * allowing users to link directly to specific content sections and
 * providing enhanced usability for complex documentation structures.
 *
 * @public
 */
export class AnchorDataModel extends AbstractDocAnchorType {
  /**
   * Constructs an AnchorDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the anchor data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocAnchorType whilst
   * identifying the element as 'anchor' for proper navigation target
   * creation and cross-reference functionality within documentation
   * generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'anchor')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docFormulaType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

/**
 * Abstract base class for mathematical formula elements within documentation.
 *
 * @remarks
 * Represents mathematical formula elements that contain LaTeX expressions
 * or mathematical notation within documentation descriptions. This
 * implementation processes Doxygen's formula elements, which typically
 * contain LaTeX code for mathematical expressions and equations.
 *
 * Formula elements include both an ID attribute for cross-referencing
 * and text content containing the mathematical expression. The text
 * content is usually LaTeX code that can be processed by mathematical
 * rendering systems in the documentation output.
 *
 * @public
 */
export abstract class AbstractDocFormulaType extends AbstractDataModelBase {
  /**
   * Mathematical expression or formula content.
   *
   * @remarks
   * Contains the mathematical expression, typically in LaTeX format,
   * that represents the formula. This text is processed by mathematical
   * rendering systems to display properly formatted equations and
   * expressions within the documentation output.
   */
  text = '' // The name of the reference, passed as element text.

  /**
   * Unique identifier for the formula element.
   *
   * @remarks
   * Contains the unique identifier for the formula that can be used for
   * cross-referencing and linking within the documentation. This enables
   * references to specific mathematical expressions from other parts of
   * the documentation.
   */
  id = ''

  /**
   * Constructs an AbstractDocFormulaType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the formula data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes formula elements by extracting the text
   * content containing the mathematical expression and the mandatory ID
   * attribute for cross-referencing. The implementation validates that
   * both the formula text and ID are present to ensure proper mathematical
   * content representation.
   *
   * The formula text is typically LaTeX code that requires appropriate
   * rendering support in the documentation output system.
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
      if (attributeName === '@_id') {
        this.id = xml.getAttributeStringValue(element, '@_id')
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

    assert(this.id.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="formula" type="docFormulaType" />

/**
 * Data model for mathematical formula elements within documentation content.
 *
 * @remarks
 * Represents mathematical formula elements that contain LaTeX expressions
 * or mathematical notation within documentation descriptions. This
 * implementation processes Doxygen's formula elements, providing support
 * for mathematical content including equations, expressions, and notation
 * that enhance technical documentation.
 *
 * Formula elements enable the inclusion of properly formatted mathematical
 * content within documentation, supporting complex technical documentation
 * requirements for mathematical and scientific applications.
 *
 * @public
 */
export class FormulaDataModel extends AbstractDocFormulaType {
  /**
   * Constructs a FormulaDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the formula data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocFormulaType whilst
   * identifying the element as 'formula' for proper mathematical content
   * processing and rendering within documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'formula')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docIndexEntryType">
//   <xsd:sequence>
//     <xsd:element name="primaryie" type="xsd:string" />
//     <xsd:element name="secondaryie" type="xsd:string" />
//   </xsd:sequence>
// </xsd:complexType>

/**
 * Abstract base class for index entry elements within documentation.
 *
 * @remarks
 * Represents index entry elements that define entries for documentation
 * indices and keyword lists. This implementation processes Doxygen's
 * index entry elements, which consist of primary and secondary index
 * terms that enable comprehensive documentation indexing and search
 * functionality.
 *
 * Index entries support hierarchical indexing with primary and secondary
 * terms, allowing for detailed organisation of documentation content
 * according to topics, concepts, and keywords for enhanced discoverability.
 *
 * @public
 */
export abstract class AbstractDocIndexEntryType extends AbstractDataModelBase {
  /**
   * Primary index term or keyword.
   *
   * @remarks
   * Contains the main index term that serves as the primary classification
   * for the index entry. This term appears as the top-level entry in
   * generated indices and search systems, providing the primary access
   * point for content discovery.
   */
  primaryie = ''

  /**
   * Secondary index term or sub-keyword.
   *
   * @remarks
   * Contains the secondary index term that provides additional classification
   * beneath the primary term. This enables hierarchical index organisation
   * where related concepts can be grouped under broader categories for
   * more precise content classification.
   */
  secondaryie = ''

  /**
   * Constructs an AbstractDocIndexEntryType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the index entry data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes index entry elements by extracting the
   * primary and secondary index terms from the XML content. The
   * implementation handles both terms as optional to accommodate various
   * indexing scenarios whilst providing comprehensive index functionality.
   *
   * The index terms are used to generate searchable indices and keyword
   * lists that enhance documentation navigation and content discovery.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.isInnerElementText(innerElement, 'primaryie')) {
        this.primaryie = xml.getInnerElementText(innerElement, 'primaryie')
      } else if (xml.isInnerElementText(innerElement, 'secondaryie')) {
        this.secondaryie = xml.getInnerElementText(innerElement, 'secondaryie')
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

    // May be empty.
    // assert(this.primaryie.length > 0)
    // assert(this.secondaryie.length > 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="indexentry" type="docIndexEntryType" />

/**
 * Data model for index entry elements within documentation content.
 *
 * @remarks
 * Represents index entry elements that define entries for documentation
 * indices and keyword lists. This implementation processes Doxygen's
 * indexentry elements, providing support for hierarchical indexing with
 * primary and secondary terms that enhance content organisation and
 * discoverability.
 *
 * Index entries enable comprehensive documentation indexing that supports
 * search functionality and content navigation, helping users locate
 * specific topics and concepts within large documentation sets.
 *
 * @public
 */
export class IndexEntryDataModel extends AbstractDocIndexEntryType {
  /**
   * Constructs an IndexEntryDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the index entry data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocIndexEntryType whilst
   * identifying the element as 'indexentry' for proper index term processing
   * and search functionality within documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'indexentry')
  }
}

// ----------------------------------------------------------------------------

// WARNING: start & type are optionsl.

// <xsd:complexType name="docListType">
//   <xsd:sequence>
//     <xsd:element name="listitem" type="docListItemType" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="type" type="DoxOlType" />
//   <xsd:attribute name="start" type="xsd:integer" />
// </xsd:complexType>

// <xsd:simpleType name="DoxOlType">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="1" />
//     <xsd:enumeration value="a" />
//     <xsd:enumeration value="A" />
//     <xsd:enumeration value="i" />
//     <xsd:enumeration value="I" />
//   </xsd:restriction>
// </xsd:simpleType>

/**
 * Abstract base class for documentation list elements within content.
 *
 * @remarks
 * Provides foundational structure for ordered and unordered list elements
 * that organise content hierarchically within documentation. This abstract
 * class manages list items and common attributes such as type and starting
 * values, enabling consistent processing of various list formats including
 * bullet points, numbered lists, and custom enumeration styles.
 *
 * Lists enhance content organisation by enabling clear presentation of
 * structured information, supporting both simple and complex hierarchical
 * arrangements that improve documentation readability and user comprehension.
 *
 * @public
 */
export abstract class AbstractDocListType extends AbstractDataModelBase {
  /**
   * Array of list items contained within this list element.
   *
   * @remarks
   * Contains all individual list items that constitute the list content,
   * maintaining order and hierarchy for proper list rendering within
   * documentation output.
   */
  listItems: ListItemDataModel[] = []

  /**
   * The list type identifier for formatting purposes.
   *
   * @remarks
   * Specifies the list type such as 'bullet', 'number', or custom
   * enumeration styles that determine the visual presentation of list items
   * within the rendered documentation.
   */
  type = ''

  /**
   * Optional starting value for ordered lists.
   *
   * @remarks
   * Defines the initial value for numbered lists when custom starting
   * points are required, allowing documentation to continue numbering from
   * specific values or restart sequences as needed.
   */
  start: number | undefined

  /**
   * Constructs an AbstractDocListType from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the list data
   * @param elementName - The XML element name for identification purposes
   *
   * @remarks
   * This constructor processes XML list elements by extracting list items
   * and attributes that define list behaviour and appearance, enabling
   * proper list structure within documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'listitem')) {
        this.listItems.push(new ListItemDataModel(xml, innerElement))
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_type') {
          this.type = xml.getAttributeStringValue(element, '@_type')
        } else if (attributeName === '@_start') {
          assert(this.start === undefined)
          this.start = Number(xml.getAttributeNumberValue(element, '@_start'))
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// WARNING: override is optional.

// <xsd:complexType name="docListItemType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="override" type="DoxCheck" />
//   <xsd:attribute name="value" type="xsd:integer" use="optional"/>
// </xsd:complexType>

/**
 * Abstract base class for individual list item elements.
 *
 * @remarks
 * Represents individual items within ordered and unordered lists, providing
 * structure for list content including paragraphs and optional attributes
 * that control list item presentation. This abstract class enables flexible
 * list item processing whilst maintaining consistency across different list
 * types and documentation contexts.
 *
 * List items support complex content including multiple paragraphs and
 * custom numbering, allowing for rich documentation structures that enhance
 * content organisation and readability within generated documentation.
 *
 * @public
 */
export abstract class AbstractDocListItemType extends AbstractDataModelBase {
  /**
   * Optional array of paragraph elements within this list item.
   *
   * @remarks
   * Contains paragraph content that constitutes the list item body,
   * supporting rich content including text, formatting, and nested
   * elements that enhance list item presentation.
   */
  paras?: ParaDataModel[] | undefined

  /**
   * Optional override attribute for list item customisation.
   *
   * @remarks
   * Provides mechanism for overriding default list item presentation or
   * behaviour, enabling custom formatting or special handling of specific
   * list items within documentation generation.
   */
  override: string | undefined

  /**
   * Optional numeric value for ordered list items.
   *
   * @remarks
   * Specifies custom numbering for ordered list items when default
   * sequential numbering is insufficient, allowing for custom values and
   * non-sequential list numbering in documentation output.
   */
  value: number | undefined

  /**
   * Constructs an AbstractDocListItemType from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the list item data
   * @param elementName - The XML element name for identification purposes
   *
   * @remarks
   * This constructor processes XML list item elements by extracting paragraph
   * content and optional attributes that define list item behaviour and
   * presentation within documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    // May be empty.
    // assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.paras ??= []
        this.paras.push(new ParaDataModel(xml, innerElement))
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_override') {
          this.override = xml.getAttributeStringValue(element, '@_override')
        } else if (attributeName === '@_value') {
          assert(this.value === undefined)
          this.value = Number(xml.getAttributeNumberValue(element, '@_value'))
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="listitem" type="docListItemType" maxOccurs="unbounded" />

export class ListItemDataModel extends AbstractDocListItemType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'listitem')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docSimpleSectType">
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:sequence minOccurs="0" maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="1" maxOccurs="unbounded" />
//     </xsd:sequence>
//   </xsd:sequence>
//   <xsd:attribute name="kind" type="DoxSimpleSectKind" />
// </xsd:complexType>

/**
 * Abstract base class for simple section elements with typed content.
 *
 * @remarks
 * Implements the XML Schema definition for docSimpleSectType elements, which
 * represent structured sections with specific semantic types such as 'note',
 * 'warning', 'see', 'return', 'since', and others. These sections provide
 * standardised content blocks for common documentation patterns and help
 * organise information according to its purpose and meaning.
 *
 * Simple sections contain an optional title and a sequence of paragraphs,
 * along with a mandatory kind attribute that specifies the semantic type
 * of the section content.
 *
 * @public
 */
export abstract class AbstractDocSimpleSectType extends AbstractDataModelBase {
  /**
   * Optional title for the simple section.
   *
   * @remarks
   * Contains the title text for the simple section when present. Simple
   * sections may have descriptive titles that provide additional context
   * beyond the semantic type indicated by the kind attribute.
   */
  title?: string | undefined

  /**
   * Mandatory kind attribute specifying the section type.
   *
   * @remarks
   * Specifies the semantic type of the simple section such as 'note',
   * 'warning', 'see', 'return', 'since', 'version', 'author', or other
   * predefined section types. This attribute determines how the section
   * content should be interpreted and potentially styled in the output.
   */
  kind = ''

  /**
   * Constructs an AbstractDocSimpleSectType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the simple section data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes simple section elements by extracting the
   * title, paragraph content, and mandatory kind attribute. The implementation
   * validates the presence of the kind attribute and organises content
   * elements whilst maintaining their original order for proper presentation.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = xml.getInnerElementText(innerElement, 'title')
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
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
    for (const attributeName of attributesNames) {
      if (attributeName === '@_kind') {
        this.kind = xml.getAttributeStringValue(element, '@_kind')
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

// <xsd:complexType name="docVarListEntryType">
//   <xsd:sequence>
//     <xsd:element name="term" type="docTitleType" />
//   </xsd:sequence>
// </xsd:complexType>

// <xsd:group name="docVariableListGroup">
//   <xsd:sequence>
//     <xsd:element name="varlistentry" type="docVarListEntryType" />
//     <xsd:element name="listitem" type="docListItemType" />
//   </xsd:sequence>
// </xsd:group>

// <xsd:complexType name="docVariableListType">
//   <xsd:sequence>
//     <xsd:group ref="docVariableListGroup" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

// <xsd:complexType name="docRefTextType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="refid" type="xsd:string" />
//   <xsd:attribute name="kindref" type="DoxRefKind" />
//   <xsd:attribute name="external" type="xsd:string" />
// </xsd:complexType>

/**
 * Abstract base class for reference text elements with links.
 *
 * @remarks
 * Represents textual references that link to other documentation elements,
 * providing cross-reference functionality within documentation content.
 * This abstract class handles mixed content including text and formatting
 * elements alongside reference attributes that specify the target and type
 * of the reference link.
 *
 * Reference text elements enable navigation between related documentation
 * sections, supporting both internal references within the documentation
 * set and external references to other documentation sources or websites.
 *
 * @public
 */
export abstract class AbstractDocRefTextType extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | DocTitleCmdGroup> = []

  /**
   * Mandatory reference identifier for the linked element.
   *
   * @remarks
   * Specifies the unique identifier of the referenced documentation element,
   * enabling precise linking to specific functions, classes, or other
   * documented entities within the documentation set.
   */
  refid = ''

  /**
   * Mandatory reference kind specifying the type of referenced element.
   *
   * @remarks
   * Indicates the type of element being referenced such as 'compound',
   * 'member', or other entity types, helping the documentation system
   * resolve and format the reference appropriately.
   */
  kindref = '' // DoxRefKind

  /**
   * Optional external reference attribute for external links.
   *
   * @remarks
   * Specifies external documentation sources when the reference points to
   * elements outside the current documentation set, enabling links to
   * external APIs, libraries, or documentation websites.
   */
  external?: string | undefined

  /**
   * Constructs an AbstractDocRefTextType from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the reference data
   * @param elementName - The XML element name for identification purposes
   *
   * @remarks
   * This constructor processes reference text elements by extracting mixed
   * content and reference attributes, enabling proper cross-reference
   * functionality within documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(
          ...parseDocTitleCmdGroup(xml, innerElement, elementName)
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_refid') {
        this.refid = xml.getAttributeStringValue(element, '@_refid')
      } else if (attributeName === '@_kindref') {
        this.kindref = xml.getAttributeStringValue(element, '@_kindref')
      } else if (attributeName === '@_external') {
        this.external = xml.getAttributeStringValue(element, '@_external')
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

    // WARNING may be empty
    // assert(this.refid.length > 0)

    assert(this.kindref.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="ref" type="docRefTextType" />

export class RefDataModel extends AbstractDocRefTextType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ref')
  }
}

// <xsd:complexType name="docTableType">
//   <xsd:sequence>
//     <xsd:element name="caption" type="docCaptionType" minOccurs="0" maxOccurs="1" />
//     <xsd:element name="row" type="docRowType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="rows" type="xsd:integer" />
//   <xsd:attribute name="cols" type="xsd:integer" />
//   <xsd:attribute name="width" type="xsd:string" /> // WARNING: optional
// </xsd:complexType>

/**
 * Abstract base class for table elements within documentation content.
 *
 * @remarks
 * Represents tabular data structures that organise content into rows and
 * columns, providing structured presentation of information within
 * documentation. This abstract class manages table structure including
 * optional captions, table rows, and sizing attributes that control table
 * appearance and layout within generated documentation.
 *
 * Tables support complex content organisation enabling clear presentation
 * of structured data, comparison information, and technical specifications
 * that enhance documentation readability and user comprehension.
 *
 * @public
 */
export abstract class AbstractDocTableType extends AbstractDataModelBase {
  /**
   * Optional caption element for the table.
   *
   * @remarks
   * Contains descriptive text that provides context or explanation for the
   * table content, typically displayed above or below the table in the
   * rendered documentation output.
   */
  caption?: DocCaptionDataModel = undefined

  /**
   * Optional array of table rows containing table data.
   *
   * @remarks
   * Contains all row elements that constitute the table content, maintaining
   * order and structure for proper table rendering within documentation
   * generation workflows.
   */
  rows?: DocRowDataModel[] = undefined

  /**
   * Mandatory number of rows in the table.
   *
   * @remarks
   * Specifies the total number of rows that the table should contain,
   * enabling proper table structure validation and layout calculation
   * during documentation generation.
   */
  rowsCount = NaN

  /**
   * Mandatory number of columns in the table.
   *
   * @remarks
   * Specifies the total number of columns that the table should contain,
   * enabling proper table structure validation and layout calculation
   * during documentation generation.
   */
  colsCount = NaN

  /**
   * Optional width specification for the table.
   *
   * @remarks
   * Defines the table width using CSS-style values such as percentages,
   * pixels, or other units, allowing control over table presentation and
   * layout within the documentation output.
   */
  width: string | undefined

  /**
   * Constructs an AbstractDocTableType from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the table data
   * @param elementName - The XML element name for identification purposes
   *
   * @remarks
   * This constructor processes table elements by extracting caption, rows,
   * and sizing attributes that define table structure and appearance within
   * documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'caption')) {
        assert(this.caption === undefined)
        this.caption = new DocCaptionDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'row')) {
        this.rows ??= []
        const docRow = new DocRowDataModel(xml, innerElement)
        this.rows.push(docRow)
        this.children.push(docRow)
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
    for (const attributeName of attributesNames) {
      if (attributeName === '@_rows') {
        assert(isNaN(this.rowsCount))
        this.rowsCount = xml.getAttributeNumberValue(element, '@_rows')
      } else if (attributeName === '@_cols') {
        assert(isNaN(this.colsCount))
        this.colsCount = xml.getAttributeNumberValue(element, '@_cols')
      } else if (attributeName === '@_width') {
        assert(this.width === undefined)
        this.width = xml.getAttributeStringValue(element, '@_width')
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

    assert(this.rowsCount > 0)
    assert(this.colsCount > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="table" type="docTableType" />

export class DocTableDataModel extends AbstractDocTableType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'table')
  }
}

// <xsd:complexType name="docRowType">
//   <xsd:sequence>
//     <xsd:element name="entry" type="docEntryType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

/**
 * Abstract base class for table row elements within table structures.
 *
 * @remarks
 * Represents individual rows within table elements, containing a sequence
 * of entry elements that constitute the row's cell content. This abstract
 * class provides structure for table row processing whilst maintaining
 * flexibility for different row types and table configurations within
 * documentation content.
 *
 * Table rows organise content horizontally across table columns, enabling
 * structured data presentation that supports complex information layouts
 * and enhances documentation readability through clear data organisation.
 *
 * @public
 */
export abstract class AbstractDocRowType extends AbstractDataModelBase {
  /**
   * Optional array of entry elements constituting the row content.
   *
   * @remarks
   * Contains the individual cell entries that make up this table row,
   * maintaining order and structure for proper table rendering within
   * documentation generation workflows.
   */
  entries?: DocEntryDataModel[] | undefined

  /**
   * Constructs an AbstractDocRowType from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the row data
   * @param elementName - The XML element name for identification purposes
   *
   * @remarks
   * This constructor processes table row elements by extracting entry
   * elements that define the row's cell content within documentation
   * generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'entry')) {
        this.entries ??= []
        const docEntry = new DocEntryDataModel(xml, innerElement)
        this.entries.push(docEntry)
        this.children.push(docEntry)
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="row" type="docRowType" minOccurs="0" maxOccurs="unbounded" />

export class DocRowDataModel extends AbstractDocRowType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'row')
  }
}

// <xsd:complexType name="docEntryType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="thead" type="DoxBool" />
//   <xsd:attribute name="colspan" type="xsd:integer" /> // WARNING: optional
//   <xsd:attribute name="rowspan" type="xsd:integer" /> // WARNING: optional
//   <xsd:attribute name="align" type="DoxAlign" /> // WARNING: optional
//   <xsd:attribute name="valign" type="DoxVerticalAlign" /> // WARNING: optional
//   <xsd:attribute name="width" type="xsd:string" /> // WARNING: optional
//   <xsd:attribute name="class" type="xsd:string" /> // WARNING: optional
//   <xsd:anyAttribute processContents="skip"/>
// </xsd:complexType>

/**
 * Abstract base class for table entry (cell) elements within table rows.
 *
 * @remarks
 * Represents individual cells within table rows, containing paragraph
 * content and various attributes that control cell presentation and layout.
 * This abstract class provides comprehensive support for table cell
 * functionality including header designation, spanning, alignment, and
 * styling attributes that enable rich table formatting within documentation.
 *
 * Table entries support complex content organisation through paragraph
 * elements and flexible presentation through layout attributes, enabling
 * professional table design that enhances documentation clarity and
 * visual appeal.
 *
 * @public
 */
export abstract class AbstractDocEntryType extends AbstractDataModelBase {
  /**
   * Optional array of paragraph elements within this table entry.
   *
   * @remarks
   * Contains the paragraph content that constitutes the cell content,
   * supporting rich text formatting and nested elements within table
   * cells for comprehensive documentation presentation.
   */
  paras?: ParaDataModel[] | undefined

  /**
   * Boolean flag indicating whether this entry is a table header.
   *
   * @remarks
   * Determines whether this cell should be treated as a header cell,
   * affecting its visual presentation and semantic meaning within the
   * table structure for improved accessibility and styling.
   */
  thead = false

  /**
   * Optional column span value for cell spanning.
   *
   * @remarks
   * Specifies the number of columns this cell should span horizontally,
   * enabling complex table layouts with merged cells that improve data
   * organisation and presentation clarity.
   */
  colspan?: number | undefined

  /**
   * Optional row span value for cell spanning.
   *
   * @remarks
   * Specifies the number of rows this cell should span vertically,
   * enabling complex table layouts with merged cells that improve data
   * organisation and presentation clarity.
   */
  rowspan?: number | undefined

  /**
   * Optional horizontal alignment specification for cell content.
   *
   * @remarks
   * Controls the horizontal alignment of content within the cell such as
   * 'left', 'center', 'right', or 'justify', enabling precise content
   * positioning for improved table presentation.
   */
  align?: string | undefined

  /**
   * Optional vertical alignment specification for cell content.
   *
   * @remarks
   * Controls the vertical alignment of content within the cell such as
   * 'top', 'middle', or 'bottom', enabling precise content positioning
   * for improved table presentation.
   */
  valign?: string | undefined

  /**
   * Optional width specification for the table entry.
   *
   * @remarks
   * Defines the cell width using CSS-style values such as percentages,
   * pixels, or other units, allowing precise control over table column
   * sizing and layout appearance.
   */
  width?: string | undefined

  /**
   * Optional CSS class specification for styling purposes.
   *
   * @remarks
   * Provides CSS class names for custom styling of table cells, enabling
   * enhanced visual presentation and consistent styling across
   * documentation output.
   */
  classs?: string | undefined

  /**
   * Constructs an AbstractDocEntryType from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the entry data
   * @param elementName - The XML element name for identification purposes
   *
   * @remarks
   * This constructor processes table entry elements by extracting paragraph
   * content and layout attributes that define cell structure and appearance
   * within documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.paras ??= []
        const para = new ParaDataModel(xml, innerElement)
        this.paras.push(para)
        this.children.push(para)
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_thead') {
          this.thead = xml.getAttributeBooleanValue(element, '@_thead')
        } else if (attributeName === '@_colspan') {
          assert(this.colspan === undefined)
          this.colspan = Number(
            xml.getAttributeNumberValue(element, '@_colspan')
          )
        } else if (attributeName === '@_rowspan') {
          assert(this.rowspan === undefined)
          this.rowspan = Number(
            xml.getAttributeNumberValue(element, '@_rowspan')
          )
        } else if (attributeName === '@_align') {
          assert(this.align === undefined)
          this.align = xml.getAttributeStringValue(element, '@_align')
        } else if (attributeName === '@_valign') {
          assert(this.valign === undefined)
          this.valign = xml.getAttributeStringValue(element, '@_valign')
        } else if (attributeName === '@_width') {
          assert(this.width === undefined)
          this.width = xml.getAttributeStringValue(element, '@_width')
        } else if (attributeName === '@_class') {
          assert(this.classs === undefined)
          this.classs = xml.getAttributeStringValue(element, '@_class')
        } else {
          console.error(
            `${elementName} attribute:`,
            attributeName,
            'not in DTD, skipped',
            this.constructor.name
          )
        }
      }
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="entry" type="docEntryType" minOccurs="0" maxOccurs="unbounded" />

export class DocEntryDataModel extends AbstractDocEntryType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'entry')
  }
}

// <xsd:complexType name="docCaptionType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

/**
 * Abstract base class for caption elements within documentation content.
 *
 * @remarks
 * Represents caption elements that provide descriptive text for tables,
 * figures, images, and other content elements within documentation.
 * This abstract class handles mixed content including text and formatting
 * commands alongside an identifier attribute for cross-referencing and
 * linking purposes.
 *
 * Captions enhance content accessibility and understanding by providing
 * descriptive context for visual and structured elements, supporting
 * comprehensive documentation that improves user comprehension and
 * content navigation.
 *
 * @public
 */
export abstract class AbstractDocCaptionType extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | DocTitleCmdGroup> = []

  /**
   * Mandatory identifier for the caption element.
   *
   * @remarks
   * Specifies the unique identifier for this caption element, enabling
   * cross-referencing and linking within documentation generation
   * workflows and supporting proper caption association with content.
   */
  id = ''

  /**
   * Constructs an AbstractDocCaptionType from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the caption data
   * @param elementName - The XML element name for identification purposes
   *
   * @remarks
   * This constructor processes caption elements by extracting mixed content
   * including text and formatting commands alongside the mandatory identifier
   * attribute within documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(
          ...parseDocTitleCmdGroup(xml, innerElement, elementName)
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_id') {
        assert(this.id.length === 0)
        this.id = xml.getAttributeStringValue(element, '@_id')
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

    assert(this.id.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="row" type="docRowType" minOccurs="0" maxOccurs="unbounded" />

export class DocCaptionDataModel extends AbstractDocCaptionType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'caption')
  }
}

// <xsd:simpleType name="range_1_6">
//   <xsd:restriction base="xsd:integer">
//     <xsd:minInclusive value="1"/>
//     <xsd:maxInclusive value="6"/>
//   </xsd:restriction>
// </xsd:simpleType>

// ----------------------------------------------------------------------------

// <xsd:complexType name="docHeadingType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="level" type="range_1_6" />
// </xsd:complexType>

export class AbstractDocHeadingType extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | DocTitleCmdGroup> = []

  // Mandatory attributes.
  level = NaN

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(
          ...parseDocTitleCmdGroup(xml, innerElement, elementName)
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_level') {
          this.level = xml.getAttributeNumberValue(element, '@_level')
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="heading" type="docHeadingType" />

export class HeadingDataModel extends AbstractDocHeadingType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'heading')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docImageType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="type" type="DoxImageKind" use="optional"/>
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="alt" type="xsd:string" use="optional"/>
//   <xsd:attribute name="inline" type="DoxBool" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
// </xsd:complexType>

// <xsd:simpleType name="DoxImageKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="html" />
//     <xsd:enumeration value="latex" />
//     <xsd:enumeration value="docbook" />
//     <xsd:enumeration value="rtf" />
//     <xsd:enumeration value="xml" />
//   </xsd:restriction>
// </xsd:simpleType>

/**
 * Abstract base class for image elements within documentation content.
 *
 * @remarks
 * Represents image elements that can be embedded within documentation
 * descriptions and content blocks. This implementation processes Doxygen's
 * image elements, which support multiple output formats (HTML, LaTeX,
 * DocBook, RTF, XML) and provide comprehensive image metadata including
 * dimensions, captions, alternative text, and inline positioning.
 *
 * Image elements support mixed content with text and formatting commands,
 * allowing for rich image descriptions and captions. The class tracks HTML
 * images specifically for asset copying during documentation generation.
 *
 * @public
 */
export abstract class AbstractDocImageType extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | DocTitleCmdGroup> = []

  /**
   * Output format type for the image.
   *
   * @remarks
   * Specifies the target output format for the image, such as 'html',
   * 'latex', 'docbook', 'rtf', or 'xml'. This determines how the image
   * should be processed and rendered in different documentation outputs.
   */
  type?: string | undefined

  /**
   * Name or path of the image file.
   *
   * @remarks
   * Contains the filename or path to the image resource. For HTML images,
   * this typically references files that need to be copied to the output
   * folder during documentation generation.
   */
  name?: string | undefined

  /**
   * Width specification for the image.
   *
   * @remarks
   * Specifies the desired width for the image rendering. The format and
   * units depend on the target output format and may include CSS-style
   * dimensions or format-specific measurements.
   */
  width?: string | undefined

  /**
   * Height specification for the image.
   *
   * @remarks
   * Specifies the desired height for the image rendering. The format and
   * units depend on the target output format and may include CSS-style
   * dimensions or format-specific measurements.
   */
  height?: string | undefined

  /**
   * Alternative text for accessibility and fallback purposes.
   *
   * @remarks
   * Provides descriptive text for the image that can be used by screen
   * readers and displayed when the image cannot be loaded. This supports
   * accessibility requirements and fallback presentation.
   */
  alt?: string | undefined

  /**
   * Inline positioning flag for the image.
   *
   * @remarks
   * Determines whether the image should be rendered inline with text
   * content or as a block-level element. Inline images flow with text
   * whilst block images create separate content sections.
   */
  inline?: boolean | undefined

  /**
   * Caption text for the image.
   *
   * @remarks
   * Provides descriptive caption text that accompanies the image display.
   * Captions typically appear below or adjacent to the image and provide
   * additional context or explanation for the visual content.
   */
  caption?: string | undefined

  /**
   * Constructs an AbstractDocImageType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the image data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes image elements by extracting all optional
   * attributes including type, name, dimensions, alternative text, inline
   * positioning, and caption information. For HTML images with local file
   * references, the image is registered with the parser for asset tracking
   * during documentation generation.
   *
   * The implementation also processes any mixed content within the image
   * element, including text and formatting commands that may be part of
   * the image description or caption.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(
          ...parseDocTitleCmdGroup(xml, innerElement, elementName)
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_type') {
        this.type = xml.getAttributeStringValue(element, '@_type')
      } else if (attributeName === '@_name') {
        this.name = xml.getAttributeStringValue(element, '@_name')
      } else if (attributeName === '@_width') {
        this.width = xml.getAttributeStringValue(element, '@_width')
      } else if (attributeName === '@_height') {
        this.height = xml.getAttributeStringValue(element, '@_height')
      } else if (attributeName === '@_alt') {
        this.alt = xml.getAttributeStringValue(element, '@_alt')
      } else if (attributeName === '@_inline') {
        this.inline = Boolean(xml.getAttributeBooleanValue(element, '@_inline'))
      } else if (attributeName === '@_caption') {
        this.caption = xml.getAttributeStringValue(element, '@_caption')
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

    // Keep track of html images, to copy them to the output.
    if (this.type === 'html' && this.name !== undefined && !isUrl(this.name)) {
      xml.images.push(this)
    }

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="image" type="docImageType" />

/**
 * Data model for image elements within documentation content.
 *
 * @remarks
 * Represents image elements that embed visual content within documentation
 * descriptions and content blocks. This implementation processes Doxygen's
 * image elements, providing support for multiple output formats and
 * comprehensive image metadata management.
 *
 * Images can include formatting content, captions, and metadata attributes
 * that control their presentation across different documentation outputs.
 * The class ensures proper asset tracking for HTML images during the
 * documentation generation process.
 *
 * @public
 */
export class ImageDataModel extends AbstractDocImageType {
  /**
   * Constructs an ImageDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the image data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocImageType whilst
   * identifying the element as 'image' for proper image processing and
   * asset management within documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'image')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docDotMscType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
// </xsd:complexType>

// <xsd:complexType name="docImageFileType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="name" type="xsd:string" use="optional">
//     <xsd:annotation>
//       <xsd:documentation>The mentioned file will be located in the directory as specified by XML_OUTPUT</xsd:documentation>
//     </xsd:annotation>
//   </xsd:attribute>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
// </xsd:complexType>

// <xsd:complexType name="docPlantumlType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
//   <xsd:attribute name="engine" type="DoxPlantumlEngine" use="optional"/>
// </xsd:complexType>

// <xsd:complexType name="docTocItemType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

// <xsd:complexType name="docTocListType">
//   <xsd:sequence>
//     <xsd:element name="tocitem" type="docTocItemType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

// <xsd:complexType name="docLanguageType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="langid" type="xsd:string" />
// </xsd:complexType>

// <xsd:complexType name="docParamListType">
//   <xsd:sequence>
//     <xsd:element name="parameteritem" type="docParamListItem" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="kind" type="DoxParamListKind" />
// </xsd:complexType>

/**
 * Abstract base class for parameter list elements within documentation.
 *
 * @remarks
 * Represents parameter lists that document function and method parameters,
 * return values, exceptions, and other parameter-related information.
 * This abstract class manages collections of parameter items and their
 * associated metadata, providing structured documentation for function
 * signatures and parameter descriptions.
 *
 * Parameter lists support various parameter documentation types including
 * input parameters, output parameters, return values, and exceptions,
 * enabling comprehensive function documentation that enhances API
 * understanding and usage.
 *
 * @public
 */
export abstract class AbstractDocParamListType extends AbstractDataModelBase {
  /**
   * Optional array of parameter items within this parameter list.
   *
   * @remarks
   * Contains individual parameter item elements that document specific
   * parameters, return values, or exceptions associated with functions
   * and methods within the documentation.
   */
  parameterItems?: ParameterItemDataModel[] | undefined

  /**
   * Mandatory kind attribute specifying the parameter list type.
   *
   * @remarks
   * Specifies the type of parameter list such as 'param', 'retval',
   * 'exception', 'templateparam', or other parameter documentation
   * types that determine how the parameter list should be interpreted
   * and formatted in documentation output.
   */
  kind = ''

  /**
   * Constructs an AbstractDocParamListType from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the parameter list data
   * @param elementName - The XML element name for identification purposes
   *
   * @remarks
   * This constructor processes parameter list elements by extracting
   * parameter items and the mandatory kind attribute that defines the
   * parameter list type within documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'parameteritem')) {
        this.parameterItems ??= []
        this.parameterItems.push(new ParameterItemDataModel(xml, innerElement))
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
    for (const attributeName of attributesNames) {
      if (attributeName === '@_kind') {
        this.kind = xml.getAttributeStringValue(element, '@_kind')
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

// <xsd:element name="parameterlist" type="docParamListType" />

export class ParameterListDataModel extends AbstractDocParamListType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'parameterlist')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docParamListItem">
//   <xsd:sequence>
//     <xsd:element name="parameternamelist" type="docParamNameList" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="parameterdescription" type="descriptionType" />
//   </xsd:sequence>
// </xsd:complexType>

export class AbstractDocParamListItem extends AbstractDataModelBase {
  // Mandatory elements.
  parameterDescription: ParameterDescriptionDataModel | undefined

  // Optional elements.
  parameterNameList?: ParameterNamelistDataModel[] | undefined

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'parameternamelist')) {
        this.parameterNameList ??= []
        this.parameterNameList.push(
          new ParameterNamelistDataModel(xml, innerElement)
        )
      } else if (xml.hasInnerElement(innerElement, 'parameterdescription')) {
        this.parameterDescription = new ParameterDescriptionDataModel(
          xml,
          innerElement
        )
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

    assert(this.parameterDescription !== undefined)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

//  <xsd:element name="parameteritem" type="docParamListItem" minOccurs="0" maxOccurs="unbounded" />

export class ParameterItemDataModel extends AbstractDocParamListItem {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'parameteritem')
  }
}

// WARNING: must be pairs of type/name.
// <xsd:complexType name="docParamNameList">
//   <xsd:sequence>
//     <xsd:element name="parametertype" type="docParamType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="parametername" type="docParamName" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export class AbstractDocParamNameList extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<ParameterTypeDataModel | ParameterNameDataModel> = []

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'parametertype')) {
        this.children.push(new ParameterTypeDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'parametername')) {
        this.children.push(new ParameterNameDataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="parameternamelist" type="docParamNameList" minOccurs="0" maxOccurs="unbounded" />

export class ParameterNamelistDataModel extends AbstractDocParamNameList {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'parameternamelist')
  }
}

// <xsd:complexType name="docParamType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="ref" type="refTextType" minOccurs="0" maxOccurs="1" />
//   </xsd:sequence>
// </xsd:complexType>

export class AbstractDocParamType extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | RefTextDataModel> = []

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'ref')) {
        this.children.push(new RefTextDataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

//  <xsd:element name="parametertype" type="docParamType" minOccurs="0" maxOccurs="unbounded" />

export class ParameterTypeDataModel extends AbstractDocParamType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'parametertype')
  }
}

// <xsd:complexType name="docParamName" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="ref" type="refTextType" minOccurs="0" maxOccurs="1" />
//   </xsd:sequence>
//   <xsd:attribute name="direction" type="DoxParamDir" use="optional" />
// </xsd:complexType>

export class AbstractDocParamName extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | RefTextDataModel> = []

  // Optional attributes.
  direction: string | undefined

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'ref')) {
        this.children.push(new RefTextDataModel(xml, innerElement))
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

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_direction') {
          this.direction = xml.getAttributeStringValue(element, '@_direction')
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
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

//  <xsd:element name="parametername" type="docParamName" minOccurs="0" maxOccurs="unbounded" />

export class ParameterNameDataModel extends AbstractDocParamName {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'parametername')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docXRefSectType">
//   <xsd:sequence>
//     <xsd:element name="xreftitle" type="xsd:string" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="xrefdescription" type="descriptionType" />
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

/**
 * Abstract base class for cross-reference section elements.
 *
 * @remarks
 * Represents cross-reference sections that provide links and references to
 * related documentation elements, enabling navigation between connected
 * content areas. This abstract class manages cross-reference sections
 * including optional titles and mandatory descriptions that provide context
 * and detail for the referenced content.
 *
 * Cross-reference sections enhance documentation usability by establishing
 * clear relationships between related topics, supporting comprehensive
 * navigation and content discovery within large documentation sets.
 *
 * @public
 */
export abstract class AbstractDocXRefSectType extends AbstractDataModelBase {
  /**
   * Optional title for the cross-reference section.
   *
   * @remarks
   * Contains the title text for the cross-reference section when present,
   * providing descriptive context for the referenced content and improving
   * section identification within documentation output.
   */
  xreftitle: string | undefined

  /**
   * Mandatory description for the cross-reference section.
   *
   * @remarks
   * Contains detailed descriptive content for the cross-reference section,
   * providing comprehensive information about the referenced content and
   * its relationship to the current documentation context.
   */
  xrefdescription: XrefDescriptionDataModel | undefined

  /**
   * Mandatory identifier for the cross-reference section.
   *
   * @remarks
   * Specifies the unique identifier for this cross-reference section,
   * enabling precise linking and referencing within documentation
   * generation workflows and cross-reference resolution.
   */
  id = ''

  /**
   * Constructs an AbstractDocXRefSectType from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the cross-reference data
   * @param elementName - The XML element name for identification purposes
   *
   * @remarks
   * This constructor processes cross-reference section elements by extracting
   * title, description, and identifier information that defines cross-reference
   * relationships within documentation generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element,
    //   { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.isInnerElementText(innerElement, 'xreftitle')) {
        this.xreftitle = xml.getInnerElementText(innerElement, 'xreftitle')
      } else if (xml.hasInnerElement(innerElement, 'xrefdescription')) {
        this.xrefdescription = new XrefDescriptionDataModel(xml, innerElement)
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

    assert(this.xrefdescription !== undefined)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_id') {
        this.id = xml.getAttributeStringValue(element, '@_id')
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

    assert(this.id.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

//     <xsd:element name="xrefsect" type="docXRefSectType" />

export class XrefSectDataModel extends AbstractDocXRefSectType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'xrefsect')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docCopyType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="internal" type="docInternalType" minOccurs="0" />
//   </xsd:sequence>
//   <xsd:attribute name="link" type="xsd:string" />
// </xsd:complexType>

// <xsd:complexType name="docDetailsType">
//   <xsd:sequence>
//     <xsd:element name="summary" type="docSummaryType" minOccurs="0" maxOccurs="1" />
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

// ----------------------------------------------------------------------------

// <xsd:complexType name="docBlockQuoteType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export class AbstractDocBlockQuoteType extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | ParaDataModel> = []

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    // SubstringDocMarkupType has no inner elments
    // assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

export class BlockquoteDataModel extends AbstractDocBlockQuoteType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'blockquote')
  }
}
// ----------------------------------------------------------------------------

// <xsd:complexType name="docParBlockType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

// ----------------------------------------------------------------------------

// <xsd:complexType name="docEmptyType"/>

export class AbstractDocEmptyType extends AbstractDataModelBase {
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // Empty.
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docEmojiType">
//   <xsd:attribute name="name" type="xsd:string"/>
//   <xsd:attribute name="unicode" type="xsd:string"/>
// </xsd:complexType>

/**
 * Abstract base class for emoji elements within documentation content.
 *
 * @remarks
 * Represents emoji elements that can be embedded within documentation
 * content to enhance visual communication and expression. This abstract
 * class manages emoji data including both human-readable names and
 * Unicode representations that enable consistent emoji rendering across
 * different documentation output formats and platforms.
 *
 * Emoji elements support modern documentation practices by enabling
 * expressive visual communication that can improve user engagement and
 * content accessibility in appropriate documentation contexts.
 *
 * @public
 */
export abstract class AbstractEmojiType extends AbstractDataModelBase {
  /**
   * The human-readable name identifier for the emoji.
   *
   * @remarks
   * Specifies the emoji name using standard emoji naming conventions,
   * enabling consistent emoji identification and providing fallback
   * representation when Unicode rendering is not available.
   */
  name = ''

  /**
   * The Unicode code point representation for the emoji.
   *
   * @remarks
   * Contains the Unicode code point or sequence that defines the emoji
   * character, enabling proper emoji rendering in Unicode-capable
   * documentation output formats and systems.
   */
  unicode = ''

  /**
   * Constructs an AbstractEmojiType from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the emoji data
   * @param elementName - The XML element name for identification purposes
   *
   * @remarks
   * This constructor processes emoji elements by extracting name and Unicode
   * attributes that define emoji representation within documentation
   * generation workflows.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length === 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_name') {
        this.name = xml.getAttributeStringValue(element, '@_name')
      } else if (attributeName === '@_unicode') {
        this.unicode = xml.getAttributeStringValue(element, '@_unicode')
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

// <xsd:element name="emoji" type="docEmojiType" />

export class EmojiDataModel extends AbstractEmojiType {
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'emoji')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="briefdescription" type="descriptionType" minOccurs="0" />
// <xsd:element name="detaileddescription" type="descriptionType" minOccurs="0" />

// <xsd:element name="description" type="descriptionType" minOccurs="0" />

// <xsd:element name="inbodydescription" type="descriptionType" minOccurs="0" />
// <xsd:element name="parameterdescription" type="descriptionType" />
// <xsd:element name="xrefdescription" type="descriptionType" />

// <xsd:element name="parameterdescription" type="descriptionType" />

/**
 * Data model for brief description elements within documentation.
 *
 * @remarks
 * Represents brief description elements that provide concise summary
 * content for entities. This implementation processes Doxygen's
 * briefdescription elements, which contain short descriptive content
 * used for entity summaries, overviews, and quick reference information
 * within documentation structures.
 *
 * Brief descriptions are typically displayed in listings, summaries,
 * and overview sections to provide immediate context about documented
 * entities without requiring full detailed descriptions.
 *
 * @public
 */
export class BriefDescriptionDataModel extends AbstractDescriptionType {
  /**
   * Constructs a BriefDescriptionDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the brief description
   *   data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDescriptionType whilst
   * identifying the element as 'briefdescription' for concise summary
   * content processing and documentation organisation.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'briefdescription')
  }
}

/**
 * @public
 */
/**
 * Data model for detailed description elements within documentation.
 *
 * @remarks
 * Represents detailed description elements that provide comprehensive
 * documentation content for entities. This implementation processes
 * Doxygen's detaileddescription elements, which contain extensive
 * descriptive content including paragraphs, sections, lists, and
 * other rich documentation structures.
 *
 * @public
 */
export class DetailedDescriptionDataModel extends AbstractDescriptionType {
  /**
   * Constructs a DetailedDescriptionDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the detailed
   *   description data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDescriptionType whilst
   * identifying the element as 'detaileddescription' for comprehensive
   * content processing and documentation organisation.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'detaileddescription')
  }
}

/**
 * Data model for in-body description elements within documentation.
 *
 * @remarks
 * Represents in-body description elements that provide documentation
 * content embedded within source code bodies. This implementation
 * processes Doxygen's inbodydescription elements for documentation
 * that appears inline within code implementations.
 *
 * @public
 */
export class InbodyDescriptionDataModel extends AbstractDescriptionType {
  /**
   * Constructs an InbodyDescriptionDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the in-body
   *   description data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDescriptionType whilst
   * identifying the element as 'inbodydescription' for inline documentation
   * content processing within code implementations.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'inbodydescription')
  }
}

/**
 * Data model for general description elements within documentation.
 *
 * @remarks
 * Represents general description elements that provide standard documentation
 * content for entities. This implementation processes Doxygen's description
 * elements, which contain descriptive content including paragraphs and
 * other documentation structures for general-purpose descriptions.
 *
 * @public
 */
export class DescriptionDataModel extends AbstractDescriptionType {
  /**
   * Constructs a DescriptionDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the description data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDescriptionType whilst
   * identifying the element as 'description' for general-purpose description
   * content processing and documentation organisation.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'description')
  }
}

/**
 * Data model for cross-reference description elements within documentation.
 *
 * @remarks
 * Represents cross-reference description elements that provide descriptive
 * content for cross-references and related sections. This implementation
 * processes Doxygen's xrefdescription elements for documentation content
 * associated with cross-reference sections and related material.
 *
 * @public
 */
export class XrefDescriptionDataModel extends AbstractDescriptionType {
  /**
   * Constructs an XrefDescriptionDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the cross-reference
   *   description data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDescriptionType whilst
   * identifying the element as 'xrefdescription' for cross-reference section
   * content processing and related documentation organisation.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'xrefdescription')
  }
}

/**
 * Data model for parameter description elements within documentation.
 *
 * @remarks
 * Represents parameter description elements that provide descriptive content
 * for function and method parameters. This implementation processes Doxygen's
 * parameterdescription elements for parameter documentation within parameter
 * lists and function descriptions.
 *
 * @public
 */
export class ParameterDescriptionDataModel extends AbstractDescriptionType {
  /**
   * Constructs a ParameterDescriptionDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the parameter
   *   description data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDescriptionType whilst
   * identifying the element as 'parameterdescription' for parameter-specific
   * documentation content processing within function documentation.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'parameterdescription')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="internal" type="docInternalType" minOccurs="0" maxOccurs="unbounded"/>
// <xsd:element name="internal" type="docInternalS1Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="internal" type="docInternalS2Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS3Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS4Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS5Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS6Type" minOccurs="0" />
// <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect2" type="docSect2Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect3" type="docSect3Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect4" type="docSect4Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect5" type="docSect5Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect6" type="docSect6Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="title" type="docTitleType" minOccurs="0" />
// <xsd:element name="term" type="docTitleType" />

/**
 * Data model for internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections that contain content marked
 * as internal or implementation-specific within documentation. This
 * implementation processes Doxygen's internal elements for organising
 * content that is typically hidden from public documentation views
 * but retained for developer reference.
 *
 * @public
 */
export class InternalDataModel extends AbstractDocInternalType {
  /**
   * Constructs an InternalDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the internal section
   *   data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocInternalType to
   * handle internal section processing whilst identifying the element as
   * 'internal' for proper content organisation and visibility control.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'internal')
  }
}

/**
 * Data model for first-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the first hierarchical level
 * within section structures. This implementation processes Doxygen's internal
 * elements that appear within first-level sections, providing organised
 * internal content that is typically excluded from public documentation.
 *
 * @public
 */
export class InternalS1DataModel extends AbstractDocInternalS1Type {
  /**
   * Constructs an InternalS1DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the internal S1
   *   section data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocInternalS1Type whilst
   * identifying the element as 'internal' for first-level internal content.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'internal')
  }
}

/**
 * Data model for second-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the second hierarchical level
 * within section structures. This implementation processes internal content
 * that appears within second-level sections for detailed internal documentation
 * organisation.
 *
 * @public
 */
export class InternalS2DataModel extends AbstractDocInternalS2Type {
  /**
   * Constructs an InternalS2DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the internal S2
   *   section data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocInternalS2Type whilst
   * identifying the element as 'internal' for second-level internal content.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'internal')
  }
}

/**
 * Data model for third-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the third hierarchical level
 * for detailed internal content organisation within deeply nested section
 * structures.
 *
 * @public
 */
export class InternalS3DataModel extends AbstractDocInternalS3Type {
  /**
   * Constructs an InternalS3DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the internal S3
   *   section data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocInternalS3Type whilst
   * identifying the element as 'internal' for third-level internal content.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'internal')
  }
}

/**
 * Data model for fourth-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the fourth hierarchical level
 * for very detailed internal content organisation within deeply nested
 * documentation structures.
 *
 * @public
 */
export class InternalS4DataModel extends AbstractDocInternalS4Type {
  /**
   * Constructs an InternalS4DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the internal S4
   *   section data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocInternalS4Type whilst
   * identifying the element as 'internal' for fourth-level internal content.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'internal')
  }
}

/**
 * Data model for fifth-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the fifth hierarchical level
 * for extremely detailed internal content organisation within complex
 * documentation hierarchies.
 *
 * @public
 */
export class InternalS5DataModel extends AbstractDocInternalS5Type {
  /**
   * Constructs an InternalS5DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the internal S5
   *   section data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocInternalS5Type whilst
   * identifying the element as 'internal' for fifth-level internal content.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'internal')
  }
}

/**
 * Data model for sixth-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the deepest hierarchical level
 * supported by the schema for comprehensive internal content organisation
 * within complex documentation structures.
 *
 * @public
 */
export class InternalS6DataModel extends AbstractDocInternalS6Type {
  /**
   * Constructs an InternalS6DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the internal S6
   *   section data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocInternalS6Type whilst
   * identifying the element as 'internal' for sixth-level internal content.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'internal')
  }
}

/**
 * Data model for first-level section elements within documentation.
 *
 * @remarks
 * Represents level-1 sections that form the primary organisational structure
 * within documentation descriptions. This implementation processes Doxygen's
 * sect1 elements, which contain titles, paragraphs, internal sections, and
 * nested level-2 sections, providing the foundation for hierarchical
 * documentation organisation.
 *
 * @public
 */
export class Sect1DataModel extends AbstractDocSect1Type {
  /**
   * Constructs a Sect1DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the sect1 data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocSect1Type to handle
   * the standard first-level section processing whilst specifically
   * identifying the element as a 'sect1' type for proper XML schema compliance.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sect1')
  }
}

/**
 * Data model for second-level section elements within documentation.
 *
 * @remarks
 * Represents level-2 sections that provide additional organisational depth
 * within first-level sections. This implementation processes Doxygen's
 * sect2 elements, which contain titles, paragraphs, internal sections, and
 * nested level-3 sections, enabling detailed content structuring within
 * the documentation hierarchy.
 *
 * @public
 */
export class Sect2DataModel extends AbstractDocSect2Type {
  /**
   * Constructs a Sect2DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the sect2 data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocSect2Type to handle
   * the standard second-level section processing whilst specifically
   * identifying the element as a 'sect2' type for proper XML schema compliance.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sect2')
  }
}

/**
 * Data model for third-level section elements within documentation.
 *
 * @remarks
 * Represents level-3 sections that provide detailed subsection organisation
 * within second-level sections. This implementation processes Doxygen's
 * sect3 elements for granular content structuring.
 *
 * @public
 */
export class Sect3DataModel extends AbstractDocSect3Type {
  /**
   * Constructs a Sect3DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the sect3 data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocSect3Type to handle
   * third-level section processing whilst identifying the element as 'sect3'.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sect3')
  }
}

/**
 * Data model for fourth-level section elements within documentation.
 *
 * @remarks
 * Represents level-4 sections for deep hierarchical content organisation.
 * This implementation processes Doxygen's sect4 elements within the
 * documentation structure hierarchy.
 *
 * @public
 */
export class Sect4DataModel extends AbstractDocSect4Type {
  /**
   * Constructs a Sect4DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the sect4 data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocSect4Type whilst
   * identifying the element as 'sect4' for schema compliance.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sect4')
  }
}

/**
 * Data model for fifth-level section elements within documentation.
 *
 * @remarks
 * Represents level-5 sections for very detailed content organisation.
 * This implementation processes Doxygen's sect5 elements within deeply
 * nested documentation structures.
 *
 * @public
 */
export class Sect5DataModel extends AbstractDocSect5Type {
  /**
   * Constructs a Sect5DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the sect5 data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocSect5Type whilst
   * identifying the element as 'sect5' for schema compliance.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sect5')
  }
}

/**
 * Data model for sixth-level section elements within documentation.
 *
 * @remarks
 * Represents the deepest level of section organisation supported by the
 * Doxygen schema. This implementation processes Doxygen's sect6 elements
 * for maximum hierarchical depth in documentation structures.
 *
 * @public
 */
export class Sect6DataModel extends AbstractDocSect6Type {
  /**
   * Constructs a Sect6DataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the sect6 data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocSect6Type whilst
   * identifying the element as 'sect6' for schema compliance.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'sect6')
  }
}

/**
 * Data model for title elements within documentation structures.
 *
 * @remarks
 * Represents title elements that provide descriptive headings for sections,
 * tables, figures, and other documentation components. This implementation
 * processes Doxygen's title elements, which support rich formatting and
 * mixed content to create informative and properly styled headings.
 *
 * @public
 */
export class TitleDataModel extends AbstractDocTitleType {
  /**
   * Constructs a TitleDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the title data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocTitleType to handle
   * title processing whilst identifying the element as 'title' for proper
   * XML schema compliance.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'title')
  }
}

/**
 * Data model for term elements within definition lists.
 *
 * @remarks
 * Represents term elements that provide the definition term within variable
 * lists and definition structures. This implementation processes Doxygen's
 * term elements, which support formatted content for creating clear and
 * descriptive definition terms.
 *
 * @public
 */
export class TermDataModel extends AbstractDocTitleType {
  /**
   * Constructs a TermDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the term data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocTitleType to handle
   * term processing whilst identifying the element as 'term' for proper
   * XML schema compliance and definition list semantics.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'term')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />

/**
 * Data model for paragraph elements within documentation content.
 *
 * @remarks
 * Represents paragraph elements that form the fundamental content blocks
 * within documentation structures. This implementation processes Doxygen's
 * para elements, which contain rich mixed content including text, formatting,
 * cross-references, lists, tables, and other documentation elements.
 *
 * Paragraphs serve as the primary containers for narrative content within
 * descriptions, sections, and other documentation components.
 *
 * @public
 */
export class ParaDataModel extends AbstractDocParaType {
  /**
   * Constructs a ParaDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the paragraph data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocParaType to handle
   * comprehensive paragraph content processing whilst identifying the element
   * as 'para' for proper XML schema compliance and content organisation.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'para')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="bold" type="docMarkupType" />
// <xsd:element name="underline" type="docMarkupType" />
// <xsd:element name="emphasis" type="docMarkupType" />
// <xsd:element name="computeroutput" type="docMarkupType" />

/**
 * Data model for bold text formatting within documentation content.
 *
 * @remarks
 * Represents bold markup elements that provide emphasis formatting for
 * text content within documentation. This implementation processes Doxygen's
 * bold elements, which can contain mixed content including text and other
 * inline formatting elements to create properly emphasised content.
 *
 * @public
 */
export class BoldDataModel extends AbstractDocMarkupType {
  /**
   * Constructs a BoldDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the bold markup data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType to handle
   * markup processing whilst identifying the element as 'bold' for proper
   * XML schema compliance and text formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'bold')
  }
}

/**
 * Data model for strikethrough text formatting within documentation content.
 *
 * @remarks
 * Represents strikethrough markup elements that provide strike-through
 * formatting for text content. This implementation processes Doxygen's
 * 's' elements for creating struck-through text within documentation.
 *
 * @public
 */
export class SDataModel extends AbstractDocMarkupType {
  /**
   * Constructs an SDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the strikethrough
   *   markup data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 's' for proper strikethrough formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 's')
  }
}

/**
 * Data model for strike-through text formatting within documentation content.
 *
 * @remarks
 * Represents strike markup elements that provide explicit strike-through
 * formatting for text content. This implementation processes Doxygen's
 * strike elements for deprecated or crossed-out text within documentation.
 *
 * @public
 */
export class StrikeDataModel extends AbstractDocMarkupType {
  /**
   * Constructs a StrikeDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the strike markup data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 'strike' for explicit strike-through formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'strike')
  }
}

/**
 * Data model for underlined text formatting within documentation content.
 *
 * @remarks
 * Represents underline markup elements that provide underline formatting
 * for text content within documentation. This implementation processes
 * Doxygen's underline elements for creating underlined text emphasis.
 *
 * @public
 */
export class UnderlineDataModel extends AbstractDocMarkupType {
  /**
   * Constructs an UnderlineDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the underline markup
   *   data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 'underline' for proper underline formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'underline')
  }
}

/**
 * Data model for emphasised text formatting within documentation content.
 *
 * @remarks
 * Represents emphasis markup elements that provide italicised formatting
 * for text content within documentation. This implementation processes
 * Doxygen's emphasis elements for creating emphasised text, typically
 * rendered in italics to provide subtle content highlighting.
 *
 * @public
 */
export class EmphasisDataModel extends AbstractDocMarkupType {
  /**
   * Constructs an EmphasisDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the emphasis markup data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 'emphasis' for proper italicised formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'emphasis')
  }
}

/**
 * Data model for computer output text formatting within documentation content.
 *
 * @remarks
 * Represents computer output markup elements that provide monospace formatting
 * for code, filenames, and computer-generated text within documentation.
 * This implementation processes Doxygen's computeroutput elements for
 * displaying code fragments and technical terms in monospace font.
 *
 * @public
 */
export class ComputerOutputDataModel extends AbstractDocMarkupType {
  /**
   * Constructs a ComputerOutputDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the computer output
   *   markup data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 'computeroutput' for monospace formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'computeroutput')
  }
}

/**
 * Data model for subscript text formatting within documentation content.
 *
 * @remarks
 * Represents subscript markup elements that provide subscript formatting
 * for mathematical expressions and chemical formulae within documentation.
 * This implementation processes Doxygen's subscript elements for proper
 * scientific notation display.
 *
 * @public
 */
export class SubscriptDataModel extends AbstractDocMarkupType {
  /**
   * Constructs a SubscriptDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the subscript markup
   *   data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 'subscript' for proper subscript formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'subscript')
  }
}

/**
 * Data model for superscript text formatting within documentation content.
 *
 * @remarks
 * Represents superscript markup elements that provide superscript formatting
 * for mathematical expressions, footnotes, and ordinal numbers within
 * documentation. This implementation processes Doxygen's superscript elements
 * for proper scientific and mathematical notation display.
 *
 * @public
 */
export class SuperscriptDataModel extends AbstractDocMarkupType {
  /**
   * Constructs a SuperscriptDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the superscript
   *   markup data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 'superscript' for proper superscript formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'superscript')
  }
}

/**
 * Data model for centred text formatting within documentation content.
 *
 * @remarks
 * Represents centre alignment markup elements that provide centred formatting
 * for text content within documentation. This implementation processes
 * Doxygen's center elements for creating centred text blocks and headings.
 *
 * @public
 */
export class CenterDataModel extends AbstractDocMarkupType {
  /**
   * Constructs a CenterDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the centre markup data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 'center' for proper centred alignment.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'center')
  }
}

/**
 * Data model for small text formatting within documentation content.
 *
 * @remarks
 * Represents small text markup elements that provide reduced font size
 * formatting for fine print, footnotes, and secondary information within
 * documentation. This implementation processes Doxygen's small elements
 * for creating properly sized text content.
 *
 * @public
 */
export class SmallDataModel extends AbstractDocMarkupType {
  /**
   * Constructs a SmallDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the small text
   *   markup data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 'small' for reduced font size formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'small')
  }
}

/**
 * Data model for citation text formatting within documentation content.
 *
 * @remarks
 * Represents citation markup elements that provide proper formatting for
 * bibliographic references and citations within documentation. This
 * implementation processes Doxygen's cite elements for creating properly
 * formatted citation references.
 *
 * @public
 */
export class CiteDataModel extends AbstractDocMarkupType {
  /**
   * Constructs a CiteDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the citation markup data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 'cite' for proper citation formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'cite')
  }
}

/**
 * Data model for deleted text formatting within documentation content.
 *
 * @remarks
 * Represents deleted text markup elements that indicate content removal
 * or deprecation within documentation. This implementation processes
 * Doxygen's del elements for marking text as deleted or removed.
 *
 * @public
 */
export class DelDataModel extends AbstractDocMarkupType {
  /**
   * Constructs a DelDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the deleted text
   *   markup data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 'del' for deleted text formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'del')
  }
}

/**
 * Data model for inserted text formatting within documentation content.
 *
 * @remarks
 * Represents inserted text markup elements that indicate content addition
 * or new material within documentation. This implementation processes
 * Doxygen's ins elements for marking text as newly inserted or added.
 *
 * @public
 */
export class InsDataModel extends AbstractDocMarkupType {
  /**
   * Constructs an InsDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the inserted text
   *   markup data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocMarkupType whilst
   * identifying the element as 'ins' for inserted text formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'ins')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="simplesect" type="docSimpleSectType" />

/**
 * Data model for simple section elements within documentation.
 *
 * @remarks
 * Represents simple sections that provide structured content organisation
 * with specific section types such as 'note', 'warning', 'see', 'return',
 * and others. This implementation processes Doxygen's simplesect elements,
 * which contain typed content blocks for common documentation patterns
 * like notes, warnings, and cross-references.
 *
 * @public
 */
export class SimpleSectDataModel extends AbstractDocSimpleSectType {
  /**
   * Constructs a SimpleSectDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the simplesect data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocSimpleSectType to
   * handle simple section processing whilst identifying the element as
   * 'simplesect' for proper XML schema compliance and section type handling.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'simplesect')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="itemizedlist" type="docListType" />

/**
 * Data model for itemised list elements within documentation content.
 *
 * @remarks
 * Represents itemised (bulleted) list elements that provide unordered list
 * structures within documentation. This implementation processes Doxygen's
 * itemizedlist elements, which contain list items for creating bulleted
 * lists with various marker styles and nested list support.
 *
 * @public
 */
export class ItemizedListDataModel extends AbstractDocListType {
  /**
   * Constructs an ItemizedListDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the itemised list data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocListType to handle
   * list processing whilst identifying the element as 'itemizedlist' for
   * proper bulleted list formatting and structure.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'itemizedlist')
  }
}

// <xsd:element name="orderedlist" type="docListType" />

/**
 * Data model for ordered list elements within documentation content.
 *
 * @remarks
 * Represents ordered (numbered) list elements that provide sequential list
 * structures within documentation. This implementation processes Doxygen's
 * orderedlist elements, which contain list items for creating numbered
 * lists with various numbering styles and nested list support.
 *
 * @public
 */
export class OrderedListDataModel extends AbstractDocListType {
  /**
   * Constructs an OrderedListDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the ordered list data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocListType to handle
   * list processing whilst identifying the element as 'orderedlist' for
   * proper numbered list formatting and structure.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'orderedlist')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="linebreak" type="docEmptyType" />
// <xsd:element name="hruler" type="docEmptyType" />

/**
 * Data model for line break elements within documentation content.
 *
 * @remarks
 * Represents line break elements that provide explicit line breaks within
 * documentation text. This implementation processes Doxygen's linebreak
 * elements for controlling line spacing and text flow within content blocks.
 *
 * @public
 */
export class LineBreakDataModel extends AbstractDocEmptyType {
  /**
   * Constructs a LineBreakDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the line break data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocEmptyType whilst
   * identifying the element as 'linebreak' for proper line break handling.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'linebreak')
  }
}

/**
 * Data model for horizontal ruler elements within documentation content.
 *
 * @remarks
 * Represents horizontal ruler elements that provide visual separation
 * between content sections. This implementation processes Doxygen's
 * hruler elements for creating horizontal dividing lines within documentation.
 *
 * @public
 */
export class HrulerDataModel extends AbstractDocEmptyType {
  /**
   * Constructs an HrulerDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the horizontal ruler
   *   data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocEmptyType whilst
   * identifying the element as 'hruler' for proper horizontal line formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'hruler')
  }
}

/**
 * Data model for non-breakable space elements within documentation content.
 *
 * @remarks
 * Represents non-breakable space elements that provide control over text
 * wrapping and spacing within documentation. This implementation processes
 * Doxygen's nonbreakablespace elements for maintaining text cohesion
 * across line breaks.
 *
 * @public
 */
export class NonBreakableSpaceDataModel extends AbstractDocEmptyType {
  /**
   * Constructs a NonBreakableSpaceDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the non-breakable
   *   space data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocEmptyType whilst
   * identifying the element as 'nonbreakablespace' for proper space handling.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'nonbreakablespace')
  }
}

// Not yet used, present just to remind its presence.
// <xsd:element name="para" type="docEmptyType" />

/**
 * Data model for empty paragraph elements within documentation content.
 *
 * @remarks
 * Represents empty paragraph elements used as placeholders or structural
 * markers within documentation. This implementation processes Doxygen's
 * empty para elements, which serve as document structure indicators
 * without containing content.
 *
 * @public
 */
export class ParaEmptyDataModel extends AbstractDocEmptyType {
  /**
   * Constructs a ParaEmptyDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the empty paragraph data
   *
   * @remarks
   * This constructor delegates to the parent AbstractDocEmptyType whilst
   * identifying the element as 'para' for empty paragraph structure handling.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'para')
  }
}

// ----------------------------------------------------------------------------

/**
 * Abstract base class for verbatim text elements within documentation content.
 *
 * @remarks
 * Implements processing for verbatim content elements that preserve exact
 * formatting and whitespace within documentation. This class handles
 * elements that contain literal text content, such as code blocks and
 * preformatted text, whilst maintaining their original formatting and
 * character sequences.
 *
 * The implementation processes both textual content and structured markup
 * elements that may appear within verbatim contexts, ensuring proper
 * preservation of the intended display format.
 *
 * @public
 */
export abstract class AbstractVerbatimType extends AbstractDataModelBase {
  /**
   * Constructs an AbstractVerbatimType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the verbatim data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes verbatim elements by extracting both textual
   * content and any embedded markup elements. The parser maintains proper
   * content order whilst preserving the original formatting and whitespace
   * characteristics of the verbatim content.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    // WARNING: not text only, ref encountered in Doxygen reference site.
    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(
          ...parseDocTitleCmdGroup(xml, innerElement, elementName)
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// WARNING: not text only, ref encountered in Doxygen reference site.
// <xsd:element name="verbatim" type="xsd:string" />

/**
 * Data model for verbatim text elements within documentation content.
 *
 * @remarks
 * Represents verbatim text elements that preserve exact formatting and
 * whitespace for code blocks, examples, and literal text within documentation.
 * This implementation processes Doxygen's verbatim elements, which maintain
 * precise character sequences and formatting whilst potentially containing
 * cross-references and other markup elements.
 *
 * @public
 */
export class VerbatimDataModel extends AbstractVerbatimType {
  /**
   * Constructs a VerbatimDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the verbatim data
   *
   * @remarks
   * This constructor delegates to the parent AbstractVerbatimType to handle
   * verbatim content processing whilst identifying the element as 'verbatim'
   * for proper literal text preservation and formatting.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'verbatim')
  }
}

// ----------------------------------------------------------------------------

/**
 * Abstract base class for preformatted content elements within documentation.
 *
 * @remarks
 * Implements processing for preformatted content elements that maintain
 * specific formatting while supporting embedded markup elements. This class
 * handles elements that preserve whitespace and formatting whilst allowing
 * for structured content including cross-references and formatting markup.
 *
 * The implementation processes both textual content and document command
 * group elements that may appear within preformatted contexts, ensuring
 * proper content organisation and formatting preservation.
 *
 * @public
 */
export abstract class AbstractPreformattedType extends AbstractDataModelBase {
  /**
   * Constructs an AbstractPreformattedType instance from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the preformatted data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * This constructor processes preformatted elements by extracting both
   * textual content and structured command group elements. The parser
   * maintains proper content order whilst preserving formatting characteristics
   * and enabling embedded markup within preformatted contexts.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(
          ...parseDocTitleCmdGroup(xml, innerElement, elementName)
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="preformatted" type="docMarkupType" />

/**
 * Data model for preformatted content elements within documentation.
 *
 * @remarks
 * Represents preformatted content elements that preserve formatting while
 * supporting embedded markup elements. This implementation processes
 * Doxygen's preformatted elements, which maintain whitespace and formatting
 * whilst allowing for structured content including cross-references and
 * other documentation markup.
 *
 * @public
 */
export class PreformattedDataModel extends AbstractPreformattedType {
  /**
   * Constructs a PreformattedDataModel from XML element data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML content
   * @param element - The XML element object containing the preformatted data
   *
   * @remarks
   * This constructor delegates to the parent AbstractPreformattedType to
   * handle preformatted content processing whilst identifying the element
   * as 'preformatted' for proper formatting preservation and markup support.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    super(xml, element, 'preformatted')
  }
}

// ----------------------------------------------------------------------------
