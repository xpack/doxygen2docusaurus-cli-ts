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
import { CompoundDefDataModel } from './compounddef-dm.js';
import { AbstractDataModelBase } from '../types.js';
// ----------------------------------------------------------------------------
// <xsd:complexType name="DoxygenType">
//   <xsd:sequence maxOccurs="unbounded">
//     <xsd:element name="compounddef" type="compounddefType" minOccurs="0" />
//   </xsd:sequence>
//   <xsd:attribute name="version" type="DoxVersionNumber" use="required" />
//   <xsd:attribute ref="xml:lang" use="required"/>
// </xsd:complexType>
export class AbstractDoxygenType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Mandatory attributes.
        this.version = '';
        this.lang = '';
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))ect(element))ect(element))
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'compounddef')) {
                if (this.compoundDefs === undefined) {
                    this.compoundDefs = [];
                }
                this.compoundDefs.push(new CompoundDefDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        // console.log(attributesNames)
        for (const attributeName of attributesNames) {
            // console.log(attributeName)
            if (attributeName === '@_version') {
                this.version = xml.getAttributeStringValue(element, '@_version');
            }
            else if (attributeName === '@_lang') {
                this.lang = xml.getAttributeStringValue(element, '@_lang');
            }
            else if (attributeName === '@_noNamespaceSchemaLocation') {
                this.noNamespaceSchemaLocation = xml.getAttributeStringValue(element, '@_noNamespaceSchemaLocation');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.version.length > 0);
        assert(this.lang.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="doxygen" type="DoxygenType"/>
export class DoxygenDataModel extends AbstractDoxygenType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'doxygen');
    }
}
// ----------------------------------------------------------------------------
