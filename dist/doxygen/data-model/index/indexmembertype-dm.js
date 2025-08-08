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
// ----------------------------------------------------------------------------
// <xsd:complexType name="MemberType">
//   <xsd:sequence>
//     <xsd:element name="name" type="xsd:string"/>
//   </xsd:sequence>
//   <xsd:attribute name="refid" type="xsd:string" use="required"/>
//   <xsd:attribute name="kind" type="MemberKind" use="required"/>
// </xsd:complexType>
/**
 * Abstract base class for index member type data models.
 *
 * @remarks
 * Represents member elements found within Doxygen index XML structures,
 * corresponding to the MemberType complex type in the XML schema. This
 * class handles the parsing of member names, reference identifiers, and
 * member kinds from the XML structure. All concrete member data model
 * classes should extend this abstract base to ensure consistent parsing
 * and data representation.
 *
 * @public
 */
export class AbstractIndexMemberType extends AbstractDataModelBase {
    /**
     * The name of the member element.
     *
     * @remarks
     * Extracted from the mandatory 'name' element within the member XML
     * structure. Represents the identifier or name of the documented member.
     */
    name = '';
    /**
     * The reference identifier for the member.
     *
     * @remarks
     * Mandatory attribute that provides a unique identifier for referencing
     * this member within the Doxygen documentation structure. Used to link
     * index entries to their detailed definitions.
     */
    refid = '';
    /**
     * The kind classification of the member.
     *
     * @remarks
     * Mandatory attribute specifying the type of member (e.g., function,
     * variable, typedef). Corresponds to the MemberKind enumeration in the
     * XML schema.
     */
    kind = ''; // MemberKind
    /**
     * Constructs a new AbstractIndexMemberType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the member data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract member information including
     * the name element and mandatory attributes (refid and kind). The constructor
     * validates that all required data is present and properly formatted
     * according to the XML schema specifications.
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
                assert(this.name.length === 0);
                this.name = xml.getInnerElementText(innerElement, 'name');
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`index ${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        // console.log(attributesNames)
        for (const attributeName of attributesNames) {
            // console.log(attributeName)
            if (attributeName === '@_refid') {
                this.refid = xml.getAttributeStringValue(element, '@_refid');
            }
            else if (attributeName === '@_kind') {
                this.kind = xml.getAttributeStringValue(element, '@_kind');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`index ${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.refid.length > 0);
        assert(this.kind.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// The name clashes with a similar definition in compound.xsd.
// <xsd:element name="member" type="MemberType" minOccurs="0" maxOccurs="unbounded" />
/**
 * Concrete data model class for index member elements.
 *
 * @remarks
 * Represents individual member elements found within Doxygen index XML
 * structures. This class extends the abstract base to provide specific
 * handling for 'member' elements, which reference documented members
 * such as functions, variables, and other programming constructs within
 * the indexed documentation.
 *
 * @public
 */
export class IndexMemberDataModel extends AbstractIndexMemberType {
    /**
     * Constructs a new IndexMemberDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the member data
     *
     * @remarks
     * Initialises the member data model by parsing the provided XML element
     * as a 'member' element type. The constructor delegates to the parent
     * class for common member processing whilst specifying the element name.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'member');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=indexmembertype-dm.js.map