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
import assert from 'assert';
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
export class AbstractIndexCompoundType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Mandatory elements.
        this.name = '';
        // Mandatory attributes.
        this.refid = '';
        this.kind = ''; // CompoundKind
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
                if (this.members === undefined) {
                    this.members = [];
                }
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
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="compound" type="CompoundType" minOccurs="0" maxOccurs="unbounded"/>
export class IndexCompoundDataModel extends AbstractIndexCompoundType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'compound');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=indexcompoundtype-dm.js.map