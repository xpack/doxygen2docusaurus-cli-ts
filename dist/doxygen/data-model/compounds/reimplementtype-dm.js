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
import util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
// ----------------------------------------------------------------------------
// <xsd:complexType name="reimplementType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//       <xsd:attribute name="refid" type="xsd:string" />
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>
/**
 * Abstract base class for reimplement type data models.
 *
 * @remarks
 * Represents the foundational structure for reimplement relationship elements
 * within Doxygen XML documentation, corresponding to the reimplementType
 * complex type in the XML schema. This class manages relationships between
 * methods, functions, or other documented entities that implement or override
 * behaviour from base classes or interfaces. The reimplement relationship
 * captures both the descriptive text and the reference identifier for the
 * related entity, enabling comprehensive documentation of inheritance and
 * polymorphic behaviours within the codebase.
 *
 * @public
 */
export class AbstractReimplementType extends AbstractDataModelBase {
    /**
     * The descriptive text content for this reimplement relationship.
     *
     * @remarks
     * Mandatory element containing the textual description of the reimplement
     * relationship. This text typically includes the signature or name of the
     * reimplemented entity, providing human-readable context about the
     * relationship between the current entity and the referenced implementation.
     */
    text = ''; // Passed as element text.
    /**
     * The reference identifier for the reimplemented entity.
     *
     * @remarks
     * Mandatory attribute that provides a unique identifier for the entity
     * being reimplemented. This reference enables linking and cross-referencing
     * between related documentation elements, allowing navigation between
     * implementations and their base declarations within the generated
     * documentation structure.
     */
    refId = '';
    /**
     * Constructs a new abstract reimplement type from XML data.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing reimplement relationship data
     * @param elementName - The expected XML element name
     *
     * @remarks
     * Parses the provided XML element to construct a complete reimplement
     * relationship data model. The parsing process extracts the textual content
     * from the element and processes the mandatory refid attribute. Validation
     * ensures that both the descriptive text and reference identifier are
     * present and non-empty, maintaining the integrity of the reimplement
     * relationship documentation.
     */
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element,
        //   { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        assert(this.text.length > 0);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_refid') {
                this.refId = xml.getAttributeStringValue(element, '@_refid');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.refId.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
//     <xsd:element name="reimplements" type="reimplementType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="reimplementedby" type="reimplementType" minOccurs="0" maxOccurs="unbounded" />
/**
 * Data model for reimplement relationship elements.
 *
 * @remarks
 * Represents a specific reimplement relationship within Doxygen XML
 * documentation, corresponding to the reimplements XML element. This class
 * manages relationships where the current entity reimplements or overrides
 * behaviour from a base class or interface. The relationship captures both
 * the descriptive information and the reference to the original implementation,
 * enabling comprehensive documentation of polymorphic behaviours and
 * inheritance patterns within object-oriented codebases.
 *
 * @public
 */
export class ReimplementDataModel extends AbstractReimplementType {
    /**
     * Constructs a new reimplement relationship data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing reimplement relationship data
     *
     * @remarks
     * Creates a complete reimplement relationship data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the reimplements element type,
     * establishing the relationship between the current entity and the
     * reimplemented base implementation.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'reimplements');
    }
}
/**
 * Data model for reimplemented-by relationship elements.
 *
 * @remarks
 * Represents the inverse reimplement relationship within Doxygen XML
 * documentation, corresponding to the reimplementedby XML element. This class
 * manages relationships where the current entity is reimplemented or overridden
 * by derived classes or implementing types. The relationship provides a
 * reverse-lookup capability, allowing documentation of which entities override
 * or reimplement the current method or function. This bidirectional
 * relationship documentation enables comprehensive understanding of inheritance
 * hierarchies and polymorphic implementations.
 *
 * @public
 */
export class ReimplementedByDataModel extends AbstractReimplementType {
    /**
     * Constructs a new reimplemented-by relationship data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing reimplemented-by relationship
     *   data
     *
     * @remarks
     * Creates a complete reimplemented-by relationship data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the reimplementedby element
     * type, establishing the reverse relationship between the current entity
     * and the implementing derived classes or types.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'reimplementedby');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=reimplementtype-dm.js.map