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
import { RefTextDataModel } from './reftexttype-dm.js';
import { AbstractDataModelBase } from '../types.js';
// ----------------------------------------------------------------------------
// <xsd:complexType name="linkedTextType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//   <xsd:element name="ref" type="refTextType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
/**
 * Abstract base class for linked text elements within documentation content.
 *
 * @remarks
 * Implements processing for linked text elements that contain mixed content
 * including both textual content and reference elements. This class handles
 * the XML Schema definition for linkedTextType elements, which support
 * character data interspersed with reference elements that provide
 * cross-linking capabilities within documentation structures.
 *
 * The implementation processes sequences of text strings and RefTextDataModel
 * instances, maintaining their original order to preserve the intended
 * content flow whilst enabling interactive cross-references within the
 * generated documentation.
 *
 * @public
 */
export class AbstractLinkedTextType extends AbstractDataModelBase {
    /**
     * Constructs an AbstractLinkedTextType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the linked text data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes linked text elements by extracting both
     * textual content and reference elements in their original order. The
     * parser maintains the mixed content structure whilst creating appropriate
     * RefTextDataModel instances for cross-reference elements, ensuring
     * proper content flow and interactive linking capabilities within the
     * documentation system.
     */
    // Any sequence of them.
    // children: Array<string | AbstractRefTextType> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'ref')) {
                this.children.push(new RefTextDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
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
// <xsd:element name="requiresclause" type="linkedTextType" minOccurs="0" />
// <xsd:element name="initializer" type="linkedTextType" minOccurs="0" />
// <xsd:element name="type" type="linkedTextType" minOccurs="0" />
// <xsd:element name="requiresclause" type="linkedTextType" minOccurs="0" />
// <xsd:element name="initializer" type="linkedTextType" minOccurs="0" />
// <xsd:element name="exceptions" type="linkedTextType" minOccurs="0" />
// <xsd:element name="initializer" type="linkedTextType" minOccurs="0" />
// <xsd:element name="type" type="linkedTextType" minOccurs="0" />
// <xsd:element name="defval" type="linkedTextType" minOccurs="0" />
// <xsd:element name="typeconstraint" type="linkedTextType" minOccurs="0" />
/**
 * Data model for initializer elements within documentation content.
 *
 * @remarks
 * Represents initializer elements that contain variable or member
 * initialization expressions within source code documentation. This
 * implementation processes Doxygen's initializer elements, which contain
 * mixed text and reference content describing the initial values assigned
 * to variables, constants, or class members.
 *
 * The linked text structure enables cross-references to types and symbols
 * used within initialization expressions.
 *
 * @public
 */
export class InitializerDataModel extends AbstractLinkedTextType {
    /**
     * Constructs an InitializerDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the initializer data
     *
     * @remarks
     * This constructor delegates to the parent AbstractLinkedTextType to
     * handle linked text processing whilst identifying the element as
     * 'initializer' for proper XML schema compliance and initialization
     * expression content processing.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'initializer');
    }
}
/**
 * Data model for type elements within documentation content.
 *
 * @remarks
 * Represents type elements that contain type information and declarations
 * within source code documentation. This implementation processes Doxygen's
 * type elements, which contain mixed text and reference content describing
 * data types, including primitive types, class names, template parameters,
 * and complex type expressions.
 *
 * The linked text structure enables cross-references to type definitions
 * and related documentation within the type expressions.
 *
 * @public
 */
export class TypeDataModel extends AbstractLinkedTextType {
    /**
     * Constructs a TypeDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the type data
     *
     * @remarks
     * This constructor delegates to the parent AbstractLinkedTextType to
     * handle linked text processing whilst identifying the element as 'type'
     * for proper XML schema compliance and type information content processing.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'type');
    }
}
/**
 * Data model for default value elements within documentation content.
 *
 * @remarks
 * Represents default value elements that contain parameter default values
 * within function and method documentation. This implementation processes
 * Doxygen's defval elements, which contain mixed text and reference content
 * describing the default values assigned to function parameters when no
 * explicit value is provided during function calls.
 *
 * The linked text structure enables cross-references to constants, enums,
 * and other symbols used within default value expressions.
 *
 * @public
 */
export class DefValDataModel extends AbstractLinkedTextType {
    /**
     * Constructs a DefValDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the default value data
     *
     * @remarks
     * This constructor delegates to the parent AbstractLinkedTextType to
     * handle linked text processing whilst identifying the element as 'defval'
     * for proper XML schema compliance and default value content processing.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'defval');
    }
}
/**
 * Data model for type constraint elements within documentation content.
 *
 * @remarks
 * Represents type constraint elements that contain template and generic
 * type constraint information within source code documentation. This
 * implementation processes Doxygen's typeconstraint elements, which contain
 * mixed text and reference content describing constraints applied to
 * template parameters and generic types.
 *
 * The linked text structure enables cross-references to constraint types,
 * concepts, and related template documentation within constraint expressions.
 *
 * @public
 */
export class TypeConstraintDataModel extends AbstractLinkedTextType {
    /**
     * Constructs a TypeConstraintDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the type constraint data
     *
     * @remarks
     * This constructor delegates to the parent AbstractLinkedTextType to
     * handle linked text processing whilst identifying the element as
     * 'typeconstraint' for proper XML schema compliance and type constraint
     * content processing.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'typeconstraint');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=linkedtexttype-dm.js.map