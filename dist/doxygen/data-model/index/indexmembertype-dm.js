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
export class AbstractIndexMemberType extends AbstractDataModelBase {
    // Mandatory elements.
    name = '';
    // Mandatory attributes.
    refid = '';
    kind = ''; // MemberKind
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
export class IndexMemberDataModel extends AbstractIndexMemberType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'member');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=indexmembertype-dm.js.map