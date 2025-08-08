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
import { IndexMemberDataModel } from './indexmembertype-dm.js';
import { AbstractDataModelBase } from '../types.js';
// ----------------------------------------------------------------------------
// <xsd:complexType name="CompoundType">
//   <xsd:sequence>
//     <xsd:element name="name" type="xsd:string"/>
//     <xsd:element name="member" type="MemberType" minOccurs="0" maxOccurs="unbounded"/>
//   </xsd:sequence>
//   <xsd:attribute name="refid" type="xsd:string" use="required"/>
//   <xsd:attribute name="kind" type="CompoundKind" use="required"/>
// </xsd:complexType>
/**
 * Abstract base class for index compound type data models.
 *
 * @remarks
 * Represents compound elements found within Doxygen index XML structures,
 * corresponding to the CompoundType complex type in the XML schema. This
 * class handles the parsing of compound names, member collections, and
 * mandatory attributes (refid and kind). All concrete compound data model
 * classes should extend this abstract base to ensure consistent parsing
 * and data representation.
 *
 * @public
 */
export class AbstractIndexCompoundType extends AbstractDataModelBase {
    /**
     * The name of the compound element.
     *
     * @remarks
     * Extracted from the mandatory 'name' element within the compound XML
     * structure. Represents the identifier or name of the documented compound
     * such as a class name, namespace, or filename.
     */
    name = '';
    /**
     * Collection of member data models associated with this compound.
     *
     * @remarks
     * Optional array containing member elements found within the compound
     * structure. Each member represents a documented entity that belongs
     * to this compound, such as functions, variables, or other nested
     * constructs. The array supports zero to many members as per the XML schema.
     */
    members; // [0-n]
    /**
     * The unique reference identifier for this compound.
     *
     * @remarks
     * Mandatory attribute that provides a unique identifier for referencing
     * this compound within the Doxygen documentation structure. Used to link
     * index entries to their detailed definitions in separate XML files.
     */
    refid = '';
    /**
     * The kind classification of this compound.
     *
     * @remarks
     * Mandatory attribute specifying the type of compound (e.g., class, struct,
     * namespace, file). Corresponds to the CompoundKind enumeration in the
     * XML schema, determining how the compound should be processed and presented.
     */
    kind = ''; // CompoundKind
    /**
     * Constructs a new AbstractIndexCompoundType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the compound data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract compound information including
     * the name element, member collections, and mandatory attributes (refid and
     * kind). The constructor validates that all required data is present and
     * properly formatted according to the XML schema specifications. Member
     * elements are processed into IndexMemberDataModel instances when present.
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
            else if (xml.hasInnerElement(innerElement, 'member')) {
                this.members ??= [];
                this.members.push(new IndexMemberDataModel(xml, innerElement));
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
        // console.log('compound: ', this.refid)
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="compound" type="CompoundType" minOccurs="0" maxOccurs="unbounded"/>
/**
 * Concrete data model class for index compound elements.
 *
 * @remarks
 * Represents individual compound elements found within Doxygen index XML
 * structures. This class extends the abstract base to provide specific
 * handling for 'compound' elements, which reference documented entities
 * such as classes, namespaces, files, and other structural components
 * within the indexed documentation. Each compound serves as an entry
 * point for accessing detailed documentation in separate XML files.
 *
 * @public
 */
export class IndexCompoundDataModel extends AbstractIndexCompoundType {
    /**
     * Constructs a new IndexCompoundDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the compound data
     *
     * @remarks
     * Initialises the compound data model by parsing the provided XML element
     * as a 'compound' element type. The constructor delegates to the parent
     * class for common compound processing whilst specifying the element name
     * for proper XML structure handling.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'compound');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=indexcompoundtype-dm.js.map