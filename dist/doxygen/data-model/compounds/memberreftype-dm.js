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
// <xsd:complexType name="memberRefType">
//   <xsd:sequence>
//     <xsd:element name="scope" type="xsd:string" />
//     <xsd:element name="name" type="xsd:string" />
//   </xsd:sequence>
//   <xsd:attribute name="refid" type="xsd:string" />
//   <xsd:attribute name="prot" type="DoxProtectionKind" />
//   <xsd:attribute name="virt" type="DoxVirtualKind" />
//   <xsd:attribute name="ambiguityscope" type="xsd:string" />
// </xsd:complexType>
/**
 * Abstract base class for member reference data models within documentation.
 *
 * @remarks
 * Represents comprehensive references to class or namespace members as
 * parsed from Doxygen XML elements. This class processes memberRefType
 * schema definitions which contain scope information, member names, and
 * essential attributes required for cross-referencing and link generation
 * within the documentation system.
 *
 * The implementation handles the complete set of member reference metadata
 * including qualified scope identification, protection levels, virtual
 * inheritance characteristics, and ambiguity resolution information.
 * This enables accurate cross-reference generation and navigation between
 * different parts of the documentation.
 *
 * @public
 */
export class AbstractMemberRefType extends AbstractDataModelBase {
    /**
     * The containing scope for the referenced member element.
     *
     * @remarks
     * Specifies the namespace, class, or other containing context that
     * houses the referenced member. This scope information provides the
     * qualified context necessary for proper member identification and
     * disambiguation within the documentation hierarchy.
     *
     * @public
     */
    scope = '';
    /**
     * The identifier name of the referenced member element.
     *
     * @remarks
     * Contains the simple identifier name for the member being referenced,
     * which serves as the primary display name and is used for link
     * generation within the documentation system. This name is used in
     * conjunction with the scope to provide complete member identification.
     *
     * @public
     */
    name = '';
    /**
     * The unique reference identifier for cross-referencing the member.
     *
     * @remarks
     * Contains the Doxygen-generated unique identifier used for creating
     * precise cross-references and hyperlinks to the member documentation.
     * This identifier ensures unambiguous linking between documentation
     * elements and enables accurate navigation within the generated
     * documentation system.
     *
     * @public
     */
    refid = '';
    /**
     * The protection level classification of the referenced member.
     *
     * @remarks
     * Specifies the access protection level such as 'public', 'private',
     * or 'protected' based on Doxygen's DoxProtectionKind enumeration.
     * This information determines the member's visibility and accessibility
     * within its containing scope and affects documentation presentation.
     *
     * @public
     */
    prot = '';
    /**
     * The virtual inheritance classification of the referenced member.
     *
     * @remarks
     * Indicates the virtual nature such as 'virtual', 'pure-virtual',
     * or 'non-virtual' based on Doxygen's DoxVirtualKind enumeration.
     * This classification is essential for understanding inheritance
     * relationships and member override behaviour within class hierarchies.
     *
     * @public
     */
    virt = '';
    /**
     * The ambiguity resolution scope for member reference disambiguation.
     *
     * @remarks
     * Provides optional scope information used to resolve ambiguous member
     * references when multiple members with identical names exist within
     * the documentation context. This field assists in ensuring accurate
     * member identification when name conflicts occur.
     *
     * Note that this deviates from the XML Schema definition where it is
     * marked as required, but in practice may be undefined for certain
     * member references.
     *
     * @public
     */
    ambiguityscope;
    /**
     * Constructs a new member reference data model from XML element data.
     *
     * @param xml - The XML parser instance for processing element data
     * @param element - The XML element containing member reference information
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Processes the XML element representing member reference information
     * and extracts scope identification, member names, and reference
     * attributes required for cross-referencing functionality. The
     * constructor validates mandatory elements and attributes whilst
     * gracefully handling optional ambiguity scope information.
     *
     * The implementation ensures that essential reference data (scope, name,
     * refid, protection, virtual kind) is properly extracted and validated
     * according to the memberRefType schema requirements.
     *
     * @public
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
            else if (xml.isInnerElementText(innerElement, 'scope')) {
                this.scope = xml.getInnerElementText(innerElement, 'scope');
            }
            else if (xml.isInnerElementText(innerElement, 'name')) {
                this.name = xml.getInnerElementText(innerElement, 'name');
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.scope.length > 0);
        assert(this.name.length > 0);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_refid') {
                this.refid = xml.getAttributeStringValue(element, '@_refid');
            }
            else if (attributeName === '@_prot') {
                this.prot = xml.getAttributeStringValue(element, '@_prot');
            }
            else if (attributeName === '@_virt') {
                this.virt = xml.getAttributeStringValue(element, '@_virt');
            }
            else if (attributeName === '@_ambiguityscope') {
                this.ambiguityscope = xml.getAttributeStringValue(element, '@_ambiguityscope');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.refid.length > 0);
        assert(this.prot.length > 0);
        assert(this.virt.length > 0);
        // assert(this.ambiguityscope)
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="member" type="memberRefType" minOccurs="0" maxOccurs="unbounded" />
/**
 * Concrete implementation for member reference elements within documentation.
 *
 * @remarks
 * Provides specific handling for member XML elements that contain
 * comprehensive member reference information within class and compound
 * documentation. This implementation extends the abstract base class
 * functionality to process member references with the specific element
 * name 'member'.
 *
 * The class ensures proper instantiation of member reference data models
 * whilst maintaining all the cross-referencing metadata required for
 * accurate documentation linking and navigation between related members
 * within the documentation system.
 *
 * @public
 */
export class MemberRefDataModel extends AbstractMemberRefType {
    /**
     * Constructs a new member reference data model instance.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The source XML element containing member reference data
     *
     * @remarks
     * Initialises the data model with the specific element name 'member'
     * and delegates processing to the abstract base class implementation.
     * This ensures consistent handling of member reference information
     * whilst maintaining proper element identification for cross-referencing
     * functionality.
     *
     * @public
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'member');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=memberreftype-dm.js.map