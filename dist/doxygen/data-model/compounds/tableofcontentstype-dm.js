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
import assert from 'node:assert';
import * as util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
import { parseDocTitleCmdGroup } from './descriptiontype-dm.js';
// ----------------------------------------------------------------------------
// <xsd:complexType name="tableofcontentsType">
//   <xsd:sequence>
//     <xsd:choice>
//       <xsd:element name="tocsect" type="tableofcontentsKindType" minOccurs="1" maxOccurs="unbounded" />
//       <xsd:element name="tableofcontents" type="tableofcontentsType" minOccurs="0" maxOccurs="unbounded" />
//     </xsd:choice>
//   </xsd:sequence>
// </xsd:complexType>
/**
 * Abstract base class for table of contents type data models.
 *
 * @remarks
 * Represents table of contents elements within Doxygen XML structures,
 * corresponding to the tableofcontentsType complex type in the XML schema.
 * This class handles the parsing of table of contents structures with
 * mutually exclusive content choices: either table of contents sections
 * or nested table of contents elements. All concrete table of contents
 * data model classes should extend this abstract base to ensure consistent
 * parsing and data representation.
 *
 * @public
 */
// eslint-disable-next-line max-len
export class AbstractTableOfContentsType extends AbstractDataModelBase {
    /**
     * Collection of table of contents section data models.
     *
     * @remarks
     * Optional array containing table of contents section elements, part
     * of an exclusive choice with tableOfContents. Each section represents
     * a specific part of the documentation structure with its own name,
     * reference, and potentially nested content.
     */
    tocSect;
    /**
     * Collection of nested table of contents data models.
     *
     * @remarks
     * Optional array containing nested table of contents elements, part
     * of an exclusive choice with tocSect. This allows for recursive
     * table of contents structures to represent complex documentation
     * hierarchies.
     */
    tableOfContents;
    /**
     * Constructs a new AbstractTableOfContentsType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the table of contents data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract table of contents information
     * following the exclusive choice pattern defined in the XML schema. The
     * constructor processes either table of contents sections or nested table
     * of contents elements, but not both, maintaining the mutually exclusive
     * relationship. This element type has no attributes as per the schema.
     */
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'tocsect')) {
                // console.log(util.inspect(item))
                this.tocSect ??= [];
                this.tocSect.push(new TocSectDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'tableofcontents')) {
                // console.log(util.inspect(item))
                this.tableOfContents ??= [];
                this.tableOfContents.push(new TableOfContentsDataModel(xml, innerElement));
            }
            else {
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="tableofcontents" type="tableofcontentsType" minOccurs="0" maxOccurs="1" />
/**
 * Concrete data model class for table of contents elements.
 *
 * @remarks
 * Represents individual table of contents elements found within Doxygen
 * compound XML structures. This class extends the abstract base to provide
 * specific handling for 'tableofcontents' elements, which define the
 * structural navigation and organisation of documentation content. Each
 * table of contents provides hierarchical access to documentation sections
 * and subsections.
 *
 * @public
 */
export class TableOfContentsDataModel extends AbstractTableOfContentsType {
    /**
     * Constructs a new TableOfContentsDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the table of contents data
     *
     * @remarks
     * Initialises the table of contents data model by parsing the provided
     * XML element as a 'tableofcontents' element type. The constructor
     * delegates to the parent class for common table of contents processing
     * whilst specifying the element name for proper XML structure handling.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'tableofcontents');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="tableofcontentsKindType">
//   <xsd:sequence>
//     <xsd:element name="name" type="xsd:string" minOccurs="1" maxOccurs="1"/>
//     <xsd:element name="reference" type="xsd:string" minOccurs="1" maxOccurs="1"/>
//     <xsd:element name="tableofcontents" type="tableofcontentsType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
/**
 * Abstract base class for table of contents kind type data models.
 *
 * @remarks
 * Represents table of contents kind elements within Doxygen XML structures,
 * corresponding to the tableofcontentsKindType complex type in the XML
 * schema. This class handles the parsing of named table of contents sections
 * with references and optional nested table of contents structures. All
 * concrete table of contents kind data model classes should extend this
 * abstract base to ensure consistent parsing and data representation.
 *
 * @public
 */
// eslint-disable-next-line max-len
export class AbstractTableOfContentsKindType extends AbstractDataModelBase {
    /**
     * The name of the table of contents section.
     *
     * @remarks
     * Mandatory element extracted from the XML structure that provides
     * the display name or title for this table of contents section.
     * This name is used for navigation and presentation purposes.
     */
    name = '';
    /**
     * The reference identifier for this table of contents section.
     *
     * @remarks
     * Mandatory element that provides a reference or link target for
     * this table of contents section. This reference is used to create
     * navigation links and cross-references within the documentation.
     */
    reference = '';
    /**
     * Collection of nested table of contents data models.
     *
     * @remarks
     * Optional array containing nested table of contents elements that
     * create hierarchical documentation structures. This allows for
     * multi-level table of contents organisation with subsections and
     * sub-subsections as needed.
     */
    tableOfContents;
    /**
     * Constructs a new AbstractTableOfContentsKindType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the table of contents kind data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract table of contents kind
     * information including mandatory name and reference elements, along with
     * optional nested table of contents structures. The constructor handles
     * unknown 'docs' elements that may appear but are not defined in the DTD.
     * This element type has no attributes as per the XML schema.
     */
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.isInnerElementText(innerElement, 'name')) {
                this.name = xml.getInnerElementText(innerElement, 'name');
            }
            else if (xml.isInnerElementText(innerElement, 'reference')) {
                this.reference = xml.getInnerElementText(innerElement, 'reference');
            }
            else if (xml.hasInnerElement(innerElement, 'docs')) {
                // WARNING not in dtd, type unknown.
            }
            else if (xml.hasInnerElement(innerElement, 'tableofcontents')) {
                // console.log(util.inspect(item))
                this.tableOfContents ??= [];
                this.tableOfContents.push(new TableOfContentsDataModel(xml, innerElement));
            }
            else {
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="tocsect" type="tableofcontentsKindType" minOccurs="1" maxOccurs="unbounded" />
/**
 * Concrete data model class for table of contents section elements.
 *
 * @remarks
 * Represents individual table of contents section elements found within
 * Doxygen XML structures. This class extends the abstract base to provide
 * specific handling for 'tocsect' elements, which define named sections
 * within the table of contents hierarchy. Each section includes a name,
 * reference, and potentially nested subsections for comprehensive
 * documentation navigation.
 *
 * @public
 */
export class TocSectDataModel extends AbstractTableOfContentsKindType {
    /**
     * Constructs a new TocSectDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the table of contents section
     * data
     *
     * @remarks
     * Initialises the table of contents section data model by parsing the
     * provided XML element as a 'tocsect' element type. The constructor
     * delegates to the parent class for common section processing whilst
     * specifying the element name for proper XML structure handling.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'tocsect');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docTocItemType" mixed="true">
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
/**
 * Abstract base class for document table of contents item type data models.
 *
 * @remarks
 * Represents table of contents item elements within Doxygen XML structures,
 * corresponding to the docTocItemType complex type in the XML schema. This
 * class handles the parsing of mixed content including text and document
 * title command groups, along with mandatory identifier attributes. All
 * concrete table of contents item data model classes should extend this
 * abstract base to ensure consistent parsing and data representation.
 *
 * @public
 */
export class AbstractTocDocItemType extends AbstractDataModelBase {
    /**
     * The unique identifier for this table of contents item.
     *
     * @remarks
     * Mandatory attribute that provides a unique identifier for referencing
     * this table of contents item within the documentation structure. This
     * identifier is used for cross-referencing and navigation purposes.
     */
    id = '';
    /**
     * Constructs a new AbstractTocDocItemType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the table of contents item data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract table of contents item
     * information including mixed content (text and document title command
     * groups) and the mandatory identifier attribute. The constructor processes
     * the mixed content model defined in the XML schema, handling both text
     * nodes and structured command groups.
     */
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                assert(this.id.length === 0);
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="tocitem" type="docTocItemType" minOccurs="0" maxOccurs="unbounded" />
/**
 * Concrete data model class for table of contents item elements.
 *
 * @remarks
 * Represents individual table of contents item elements found within
 * Doxygen XML structures. This class extends the abstract base to provide
 * specific handling for 'tocitem' elements, which define individual entries
 * within table of contents lists. Each item includes mixed content and
 * a unique identifier for navigation and cross-referencing purposes.
 *
 * @public
 */
export class TocItemDataModel extends AbstractTocDocItemType {
    /**
     * Constructs a new TocItemDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the table of contents item data
     *
     * @remarks
     * Initialises the table of contents item data model by parsing the provided
     * XML element as a 'tocitem' element type. The constructor delegates to
     * the parent class for common item processing whilst specifying the element
     * name for proper XML structure handling.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'tocitem');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docTocListType">
//   <xsd:sequence>
//     <xsd:element name="tocitem" type="docTocItemType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
/**
 * Abstract base class for document table of contents list type data models.
 *
 * @remarks
 * Represents table of contents list elements within Doxygen XML structures,
 * corresponding to the docTocListType complex type in the XML schema. This
 * class handles the parsing of collections of table of contents items that
 * form structured lists for documentation navigation. All concrete table
 * of contents list data model classes should extend this abstract base to
 * ensure consistent parsing and data representation.
 *
 * @public
 */
export class AbstractDocTocListType extends AbstractDataModelBase {
    /**
     * Collection of table of contents item data models.
     *
     * @remarks
     * Optional array containing table of contents item elements that comprise
     * the list structure. Each item represents an individual entry within the
     * table of contents with its own content and identifier. The array supports
     * zero to many items as per the XML schema.
     */
    tocItems;
    /**
     * Constructs a new AbstractDocTocListType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the table of contents list data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract table of contents list
     * information including collections of table of contents items. The
     * constructor processes item elements into TocItemDataModel instances
     * when present. This element type has no attributes as per the XML schema.
     */
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'tocitem')) {
                // console.log(util.inspect(item))
                this.tocItems ??= [];
                this.tocItems.push(new TocItemDataModel(xml, innerElement));
            }
            else {
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        // If the object has no attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="toclist" type="docTocListType" />
/**
 * Concrete data model class for table of contents list elements.
 *
 * @remarks
 * Represents individual table of contents list elements found within
 * Doxygen XML structures. This class extends the abstract base to provide
 * specific handling for 'toclist' elements, which define structured lists
 * of table of contents items for documentation navigation. Each list
 * contains multiple items that collectively form a navigational structure.
 *
 * @public
 */
export class TocListDataModel extends AbstractDocTocListType {
    /**
     * Constructs a new TocListDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the table of contents list data
     *
     * @remarks
     * Initialises the table of contents list data model by parsing the provided
     * XML element as a 'toclist' element type. The constructor delegates to
     * the parent class for common list processing whilst specifying the element
     * name for proper XML structure handling.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'toclist');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=tableofcontentstype-dm.js.map