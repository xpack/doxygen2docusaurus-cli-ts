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
// <xsd:complexType name="incType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//       <xsd:attribute name="refid" type="xsd:string" use="optional" />
//       <xsd:attribute name="local" type="DoxBool" />
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>
export class AbstractIncType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Mandatory elements.
        this.text = ''; // Passed as element text.
        // Mandatory attributes.
        this.local = false; // It means to use "..." instead of <...>.
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))ect(element))ect(element))
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
            if (attributeName === '@_local') {
                this.local = xml.getAttributeBooleanValue(element, '@_local');
            }
            else if (attributeName === '@_refid') {
                this.refId = xml.getAttributeStringValue(element, '@_refid');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="includes" type="incType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="includedby" type="incType" minOccurs="0" maxOccurs="unbounded" />
export class IncludesDataModel extends AbstractIncType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'includes');
    }
}
export class IncludedByDataModel extends AbstractIncType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'includedby');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=inctype-dm.js.map