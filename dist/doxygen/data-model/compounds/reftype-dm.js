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
// <xsd:complexType name="refType">
// <xsd:simpleContent>
//   <xsd:extension base="xsd:string">
//     <xsd:attribute name="refid" type="xsd:string" />
//     <xsd:attribute name="prot" type="DoxProtectionKind" use="optional"/>
//     <xsd:attribute name="inline" type="DoxBool" use="optional"/>
//   </xsd:extension>
// </xsd:simpleContent>
// </xsd:complexType>
// <xsd:simpleType name="DoxProtectionKind">
// <xsd:restriction base="xsd:string">
//   <xsd:enumeration value="public" />
//   <xsd:enumeration value="protected" />
//   <xsd:enumeration value="private" />
//   <xsd:enumeration value="package" />
// </xsd:restriction>
// </xsd:simpleType>
/**
 * @public
 */
export class AbstractRefType extends AbstractDataModelBase {
    // Mandatory elements.
    text = ''; // The name of the reference, passed as element text.
    // Mandatory attributes.
    refid = '';
    // Optional attributes.
    prot; // DoxProtectionKind
    inline; // DoxBool
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
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
                this.refid = xml.getAttributeStringValue(element, '@_refid');
            }
            else if (attributeName === '@_prot') {
                this.prot = xml.getAttributeStringValue(element, '@_prot');
            }
            else if (attributeName === '@_inline') {
                this.inline = Boolean(xml.getAttributeBooleanValue(element, '@_inline'));
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.refid.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="innermodule" type="refType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="innerdir" type="refType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="innerfile" type="refType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="innerclass" type="refType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="innerconcept" type="refType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="innernamespace" type="refType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="innerpage" type="refType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="innergroup" type="refType" minOccurs="0" maxOccurs="unbounded" />
export class InnerModuleDataModel extends AbstractRefType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'innermodule');
    }
}
/**
 * @public
 */
export class InnerDirDataModel extends AbstractRefType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'innerdir');
    }
}
/**
 * @public
 */
export class InnerFileDataModel extends AbstractRefType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'innerfile');
    }
}
/**
 * @public
 */
export class InnerClassDataModel extends AbstractRefType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'innerclass');
    }
}
export class InnerConceptDataModel extends AbstractRefType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'innerconcept');
    }
}
/**
 * @public
 */
export class InnerNamespaceDataModel extends AbstractRefType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'innernamespace');
    }
}
/**
 * @public
 */
export class InnerPageDataModel extends AbstractRefType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'innerpage');
    }
}
/**
 * @public
 */
export class InnerGroupDataModel extends AbstractRefType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'innergroup');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=reftype-dm.js.map