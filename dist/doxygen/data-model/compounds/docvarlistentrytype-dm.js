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
import { ListItemDataModel, TermDataModel } from './descriptiontype-dm.js';
// ----------------------------------------------------------------------------
// <xsd:complexType name="docVarListEntryType">
//   <xsd:sequence>
//     <xsd:element name="term" type="docTitleType" />
//   </xsd:sequence>
// </xsd:complexType>
/**
 * Abstract base class for variable list entry elements within documentation.
 *
 * @remarks
 * Implements processing for variable list entry elements that contain terms
 * within definition lists and variable list structures. This class handles
 * the XML Schema definition for docVarListEntryType elements, which consist
 * of a mandatory term element that provides the definition term for variable
 * list items.
 *
 * The implementation processes term elements using the TermDataModel to
 * maintain proper structure for definition lists and glossary entries within
 * the documentation system.
 *
 * @public
 */
// eslint-disable-next-line max-len
export class AbstractDocVarListEntryType extends AbstractDataModelBase {
    /**
     * The term element that defines the term for this variable list entry.
     *
     * @remarks
     * Contains the term data model that represents the definition term within
     * variable lists. This mandatory element provides the term portion of
     * term-definition pairs within definition lists and glossary structures.
     */
    // Mandatory elements.
    term;
    /**
     * Constructs an AbstractDocVarListEntryType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the list entry data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes variable list entry elements by extracting
     * the mandatory term element. The parser ensures proper validation of
     * the term element and maintains compliance with the XML Schema definition
     * for variable list entry structures within documentation systems.
     */
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element,
        //   { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        // console.log(util.inspect(element, { compact: false, depth: 999 })
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'term')) {
                assert(this.term === undefined);
                this.term = new TermDataModel(xml, innerElement);
            }
            else {
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.term !== undefined);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="varlistentry" type="docVarListEntryType" />
/**
 * Data model for variable list entry elements within documentation content.
 *
 * @remarks
 * Represents variable list entry elements that provide the term portion
 * of definition lists and variable list structures. This implementation
 * processes Doxygen's varlistentry elements, which contain terms that
 * are paired with list items to form complete definition entries within
 * variable list documentation structures.
 *
 * @public
 */
export class VarListEntryDataModel extends AbstractDocVarListEntryType {
    /**
     * Constructs a VarListEntryDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the varlistentry data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocVarListEntryType to
     * handle variable list entry processing whilst identifying the element as
     * 'varlistentry' for proper XML schema compliance and term extraction.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'varlistentry');
    }
}
// ----------------------------------------------------------------------------
// WARNING: the DTD does not define an explicit pair.
// <xsd:group name="docVariableListGroup">
//   <xsd:sequence>
//     <xsd:element name="varlistentry" type="docVarListEntryType" />
//     <xsd:element name="listitem" type="docListItemType" />
//   </xsd:sequence>
// </xsd:group>
/**
 * Data model for variable list pair elements within documentation content.
 *
 * @remarks
 * Represents the pairing of variable list entries with their corresponding
 * list items to form complete definition pairs within variable lists. This
 * class encapsulates the relationship between terms and their definitions,
 * as the XML Schema defines variable lists as sequences of varlistentry
 * and listitem pairs but does not provide an explicit container element.
 *
 * This implementation creates a logical pairing structure to maintain the
 * association between terms and their corresponding definitions within
 * variable list documentation structures.
 *
 * @public
 */
export class VariableListPairDataModel extends AbstractDataModelBase {
    /**
     * The variable list entry containing the term for this definition pair.
     *
     * @remarks
     * Contains the term portion of the definition pair, representing the
     * item being defined within the variable list structure.
     */
    varlistentry;
    /**
     * The list item containing the definition for this definition pair.
     *
     * @remarks
     * Contains the definition portion of the definition pair, providing
     * the explanatory content for the associated term within the variable
     * list structure.
     */
    listitem;
    /**
     * Constructs a VariableListPairDataModel from entry and item components.
     *
     * @param varlistentry - The variable list entry containing the term
     * @param listitem - The list item containing the definition content
     *
     * @remarks
     * This constructor creates a logical pairing between a variable list
     * entry and its corresponding list item to form a complete definition
     * pair. This maintains the semantic relationship between terms and
     * definitions within variable list structures.
     */
    constructor(varlistentry, listitem) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super('variablelistpair');
        this.varlistentry = varlistentry;
        this.listitem = listitem;
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docVariableListType">
//   <xsd:sequence>
//     <xsd:group ref="docVariableListGroup" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
/**
 * Abstract base class for variable list elements within documentation content.
 *
 * @remarks
 * Implements processing for variable list elements that contain sequences
 * of term-definition pairs within documentation structures. This class
 * handles the XML Schema definition for docVariableListType elements,
 * which consist of repeated variable list groups containing varlistentry
 * and listitem pairs.
 *
 * The implementation processes these pairs sequentially, creating
 * VariableListPairDataModel instances to maintain the logical relationship
 * between terms and their corresponding definitions. The parser expects
 * alternating varlistentry and listitem elements in the correct order
 * to form proper definition pairs.
 *
 * @public
 */
// eslint-disable-next-line max-len
export class AbstractDocVariableListType extends AbstractDataModelBase {
    /**
     * Constructs an AbstractDocVariableListType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the variable list data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes variable list elements by extracting pairs
     * of varlistentry and listitem elements in the expected sequence order.
     * The parser creates VariableListPairDataModel instances to maintain
     * the semantic relationship between terms and their definitions whilst
     * ensuring proper XML schema compliance for variable list structures.
     *
     * The implementation expects alternating varlistentry and listitem
     * elements and validates this sequence to ensure proper definition
     * pair formation within the variable list documentation structure.
     */
    // children: VariableListPairDataModel[] = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        let varlistentry;
        for (const innerElement of innerElements) {
            // console.log('innerElement:', innerElement)
            // WARNING: this is not ok, since it depends on the order, it expects
            // pairs of varlistentry and listitem, in this order.
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'varlistentry')) {
                varlistentry = new VarListEntryDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'listitem')) {
                const listitem = new ListItemDataModel(xml, innerElement);
                assert(varlistentry !== undefined);
                this.children.push(new VariableListPairDataModel(varlistentry, listitem));
                varlistentry = undefined;
            }
            else {
                console.error(util.inspect(innerElement, { compact: false, depth: 999 }));
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
//  <xsd:element name="variablelist" type="docVariableListType" />
/**
 * Data model for variable list elements within documentation content.
 *
 * @remarks
 * Represents variable list elements that provide definition list structures
 * within documentation. This implementation processes Doxygen's variablelist
 * elements, which contain sequences of term-definition pairs for creating
 * glossaries, definition lists, and other structured reference content.
 *
 * The variable list maintains proper pairing between terms and their
 * corresponding definitions through VariableListPairDataModel instances.
 *
 * @public
 */
export class VariableListDataModel extends AbstractDocVariableListType {
    /**
     * Constructs a VariableListDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the variablelist data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocVariableListType to
     * handle variable list processing whilst identifying the element as
     * 'variablelist' for proper XML schema compliance and definition pair
     * extraction within documentation structures.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'variablelist');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=docvarlistentrytype-dm.js.map