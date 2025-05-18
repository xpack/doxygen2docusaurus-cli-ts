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
import { AbstractDataModelBase } from '../types.js';
import { RefTextDataModel } from './reftexttype-dm.js';
import { VariableListDataModel } from './docvarlistentrytype-dm.js';
// ----------------------------------------------------------------------------
// <xsd:complexType name="descriptionType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="xsd:string" minOccurs="0"/>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="internal" type="docInternalType" minOccurs="0" maxOccurs="unbounded"/>
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDescriptionType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = xml.getInnerElementText(innerElement, 'title');
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect1')) {
                this.children.push(new Sect1DataModel(xml, innerElement));
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
// <xsd:complexType name="listingType">
// <xsd:sequence>
//   <xsd:element name="codeline" type="codelineType" minOccurs="0" maxOccurs="unbounded" />
// </xsd:sequence>
// <xsd:attribute name="filename" type="xsd:string" use="optional"/>
// </xsd:complexType>
export class AbstractListingType extends AbstractDataModelBase {
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
            else if (xml.hasInnerElement(innerElement, 'codeline')) {
                if (this.codelines === undefined) {
                    this.codelines = [];
                }
                this.codelines.push(new CodeLineDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_filename') {
                    this.filename = xml.getAttributeStringValue(element, '@_filename');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
//  <xsd:element name="programlisting" type="listingType" />
export class ProgramListingDataModel extends AbstractListingType {
    constructor(xml, element) {
        super(xml, element, 'programlisting');
    }
}
// WARNING: attributes are all optional
// <xsd:complexType name="codelineType">
// <xsd:sequence>
//   <xsd:element name="highlight" type="highlightType" minOccurs="0" maxOccurs="unbounded" />
// </xsd:sequence>
// <xsd:attribute name="lineno" type="xsd:integer" />
// <xsd:attribute name="refid" type="xsd:string" />
// <xsd:attribute name="refkind" type="DoxRefKind" />
// <xsd:attribute name="external" type="DoxBool" />
// </xsd:complexType>
export class AbstractCodeLineType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        // May be empty, like `<codeline></codeline>`
        const innerElements = xml.getInnerElements(element, elementName);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'highlight')) {
                if (this.highlights === undefined) {
                    this.highlights = [];
                }
                this.highlights.push(new HighlightDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_lineno') {
                    this.lineno = Number(xml.getAttributeNumberValue(element, '@_lineno'));
                }
                else if (attributeName === '@_refid') {
                    this.refid = xml.getAttributeStringValue(element, '@_refid');
                }
                else if (attributeName === '@_refkind') {
                    this.refkind = xml.getAttributeStringValue(element, '@_refkind');
                }
                else if (attributeName === '@_external') {
                    this.external = Boolean(xml.getAttributeBooleanValue(element, '@_external'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="codeline" type="codelineType" minOccurs="0" maxOccurs="unbounded" />
export class CodeLineDataModel extends AbstractCodeLineType {
    constructor(xml, element) {
        super(xml, element, 'codeline');
    }
}
export class AbstractHighlightType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // Mandatory attributes.
        this.classs = '';
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        if (innerElements.length > 0) {
            for (const innerElement of innerElements) {
                if (xml.hasInnerText(innerElement)) {
                    this.children.push(xml.getInnerText(innerElement));
                }
                else if (xml.isInnerElementText(innerElement, 'sp')) {
                    this.children.push(new SpDataModel(xml, innerElement));
                }
                else if (xml.hasInnerElement(innerElement, 'ref')) {
                    this.children.push(new RefTextDataModel(xml, innerElement));
                }
                else {
                    console.error(util.inspect(innerElement));
                    console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_class') {
                this.classs = xml.getAttributeStringValue(element, '@_class');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.classs.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="highlight" type="highlightType" minOccurs="0" maxOccurs="unbounded" />
export class HighlightDataModel extends AbstractHighlightType {
    constructor(xml, element) {
        super(xml, element, 'highlight');
    }
}
// <xsd:complexType name="spType" mixed="true">   <-- Character data is allowed to appear between the child elements!
// <xsd:attribute name="value" type="xsd:integer" use="optional"/>
// </xsd:complexType>
export class AbstractSpType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length === 0);
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_value') {
                    this.value = Number(xml.getAttributeNumberValue(element, '@_value'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="sp" type="spType" />
export class SpDataModel extends AbstractSpType {
    constructor(xml, element) {
        super(xml, element, 'sp');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docSect1Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS1Type" minOccurs="0"  maxOccurs="unbounded" />
//       <xsd:element name="sect2" type="docSect2Type" minOccurs="0" maxOccurs="unbounded" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocSect1Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS1DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect2')) {
                this.children.push(new Sect2DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docSect2Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect3" type="docSect3Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS2Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocSect2Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS2DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect3')) {
                this.children.push(new Sect3DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docSect3Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect4" type="docSect4Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS3Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocSect3Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS3DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect4')) {
                this.children.push(new Sect4DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docSect4Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect5" type="docSect5Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS4Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocSect4Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS4DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect5')) {
                this.children.push(new Sect5DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docSect5Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect6" type="docSect6Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS5Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocSect5Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS5DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect6')) {
                this.children.push(new Sect6DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docSect6Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS6Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocSect6Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS6DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docInternalType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocInternalType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect1')) {
                this.children.push(new Sect1DataModel(xml, innerElement));
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
// <xsd:complexType name="docInternalS1Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect2" type="docSect2Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocInternalS1Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect2')) {
                this.children.push(new Sect2DataModel(xml, innerElement));
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
// <xsd:complexType name="docInternalS2Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect3" type="docSect3Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocInternalS2Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect3')) {
                this.children.push(new Sect3DataModel(xml, innerElement));
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
// <xsd:complexType name="docInternalS3Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect4" type="docSect4Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocInternalS3Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect4')) {
                this.children.push(new Sect4DataModel(xml, innerElement));
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
// <xsd:complexType name="docInternalS4Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect5" type="docSect5Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocInternalS4Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect5')) {
                this.children.push(new Sect5DataModel(xml, innerElement));
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
// WARNING: should be "sect6"
// <xsd:complexType name="docInternalS5Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect5" type="docSect6Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocInternalS5Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect6')) {
                this.children.push(new Sect6DataModel(xml, innerElement));
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
// <xsd:complexType name="docInternalS6Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocInternalS6Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
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
function parseDocTitleCmdGroup(xml, element, elementName) {
    const children = [];
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    if (xml.hasInnerElement(element, 'bold')) {
        children.push(new BoldDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emphasis')) {
        children.push(new EmphasisDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'computeroutput')) {
        children.push(new ComputerOutputDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ref')) {
        children.push(new RefDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'linebreak')) {
        children.push(new LineBreakDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ulink')) {
        children.push(new UlinkDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'anchor')) {
        children.push(new AnchorDataModel(xml, element));
        // Substring elements.
    }
    else if (xml.hasInnerElement(element, 'lsquo')) {
        children.push(new LsquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rsquo')) {
        children.push(new RsquoDocMarkupDataModel(xml, element));
    }
    else {
        console.error(util.inspect(element, { compact: false, depth: 999 }));
        console.error(`${elementName} element:`, Object.keys(element), 'not implemented yet by parseDocTitleCmdGroup()');
    }
    return children;
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docTitleType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>
export class AbstractDocTitleType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
function parseDocCmdGroup(xml, element, elementName) {
    const children = [];
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    if (xml.hasInnerElement(element, 'ulink')) {
        children.push(new UlinkDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bold')) {
        children.push(new BoldDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emphasis')) {
        children.push(new EmphasisDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'computeroutput')) {
        children.push(new ComputerOutputDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'anchor')) {
        children.push(new AnchorDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ref')) {
        children.push(new RefDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'linebreak')) {
        children.push(new LineBreakDataModel(xml, element));
        // ----
    }
    else if (xml.hasInnerElement(element, 'hruler')) {
        children.push(new HrulerDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'programlisting')) {
        children.push(new ProgramListingDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'itemizedlist')) {
        children.push(new ItemizedListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'simplesect')) {
        children.push(new SimpleSectDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'variablelist')) {
        children.push(new VariableListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'parameterlist')) {
        children.push(new ParameterListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'xrefsect')) {
        children.push(new XrefSectDataModel(xml, element));
        // Substring elements.
    }
    else if (xml.hasInnerElement(element, 'lsquo')) {
        children.push(new LsquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rsquo')) {
        children.push(new RsquoDocMarkupDataModel(xml, element));
    }
    else {
        console.error(util.inspect(element, { compact: false, depth: 999 }));
        console.error(`${elementName} element:`, Object.keys(element), 'not implemented yet by parseDocCmdGroup()');
    }
    return children;
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docParaType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>
export class AbstractDocParaType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        // May be empty. Do not check children.length.
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocCmdGroup(xml, innerElement, elementName));
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
// <xsd:complexType name="docMarkupType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>
export class AbstractDocMarkupType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        // SubstringDocMarkupType has no inner elments
        // assert(innerElements.length > 0)
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
export class SubstringDocMarkupType extends AbstractDocMarkupType {
    constructor(xml, element, elementName, substring) {
        super(xml, element, elementName);
        this.substring = substring;
    }
}
// <xsd:element name="lsquo" type="docEmptyType" />
// <xsd:element name="rsquo" type="docEmptyType" />
export class LsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lsquo', '‘');
    }
}
export class RsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rsquo', '`');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docURLLink" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="url" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocURLLink extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        this.children = [];
        // Mandatory attributes.
        this.url = '';
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_url') {
                this.url = xml.getAttributeStringValue(element, '@_url');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.url.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="ulink" type="docURLLink" />
export class UlinkDataModel extends AbstractDocURLLink {
    constructor(xml, element) {
        super(xml, element, 'ulink');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docAnchorType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocAnchorType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        this.children = [];
        // Mandatory attributes.
        this.id = '';
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        // Usually empty `<anchor id="deprecated_1_deprecated000014"/>`
        const innerElements = xml.getInnerElements(element, elementName);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (this.children.length > 0) {
            console.error('Unexpected <anchor> text content in', this.constructor.name);
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="anchor" type="docAnchorType" />
export class AnchorDataModel extends AbstractDocAnchorType {
    constructor(xml, element) {
        super(xml, element, 'anchor');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docFormulaType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
// <xsd:complexType name="docIndexEntryType">
//   <xsd:sequence>
//     <xsd:element name="primaryie" type="xsd:string" />
//     <xsd:element name="secondaryie" type="xsd:string" />
//   </xsd:sequence>
// </xsd:complexType>
// ----------------------------------------------------------------------------
// WARNING: start & type are optionsl.
// <xsd:complexType name="docListType">
//   <xsd:sequence>
//     <xsd:element name="listitem" type="docListItemType" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="type" type="DoxOlType" />
//   <xsd:attribute name="start" type="xsd:integer" />
// </xsd:complexType>
export class AbstractDocListType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Mandatory elements.
        this.listItems = [];
        // Optional attributes.
        this.type = '';
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'listitem')) {
                this.listItems.push(new ListItemDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_type') {
                    this.type = xml.getAttributeStringValue(element, '@_type');
                }
                else if (attributeName === '@_start') {
                    assert(this.start === undefined);
                    this.start = Number(xml.getAttributeNumberValue(element, '@_start'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// WARNING: override is optional.
// <xsd:complexType name="docListItemType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="override" type="DoxCheck" />
//   <xsd:attribute name="value" type="xsd:integer" use="optional"/>
// </xsd:complexType>
export class AbstractDocListItemType extends AbstractDataModelBase {
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
            else if (xml.hasInnerElement(innerElement, 'para')) {
                if (this.paras === undefined) {
                    this.paras = [];
                }
                this.paras.push(new ParaDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_override') {
                    this.override = xml.getAttributeStringValue(element, '@_override');
                }
                else if (attributeName === '@_value') {
                    assert(this.value === undefined);
                    this.value = Number(xml.getAttributeNumberValue(element, '@_value'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="listitem" type="docListItemType" maxOccurs="unbounded" />
export class ListItemDataModel extends AbstractDocListItemType {
    constructor(xml, element) {
        super(xml, element, 'listitem');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docSimpleSectType">
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:sequence minOccurs="0" maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="1" maxOccurs="unbounded" />
//     </xsd:sequence>
//   </xsd:sequence>
//   <xsd:attribute name="kind" type="DoxSimpleSectKind" />
// </xsd:complexType>
export class AbstractDocSimpleSectType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // Mandatory attributes.
        this.kind = '';
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = xml.getInnerElementText(innerElement, 'title');
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
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
        for (const attributeName of attributesNames) {
            if (attributeName === '@_kind') {
                this.kind = xml.getAttributeStringValue(element, '@_kind');
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
// <xsd:complexType name="docVarListEntryType">
//   <xsd:sequence>
//     <xsd:element name="term" type="docTitleType" />
//   </xsd:sequence>
// </xsd:complexType>
// <xsd:group name="docVariableListGroup">
//   <xsd:sequence>
//     <xsd:element name="varlistentry" type="docVarListEntryType" />
//     <xsd:element name="listitem" type="docListItemType" />
//   </xsd:sequence>
// </xsd:group>
// <xsd:complexType name="docVariableListType">
//   <xsd:sequence>
//     <xsd:group ref="docVariableListGroup" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
// <xsd:complexType name="docRefTextType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="refid" type="xsd:string" />
//   <xsd:attribute name="kindref" type="DoxRefKind" />
//   <xsd:attribute name="external" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocRefTextType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // Mandatory attributes.
        this.refid = '';
        this.kindref = ''; // DoxRefKind
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_refid') {
                this.refid = xml.getAttributeStringValue(element, '@_refid');
            }
            else if (attributeName === '@_kindref') {
                this.kindref = xml.getAttributeStringValue(element, '@_kindref');
            }
            else if (attributeName === '@_external') {
                this.external = xml.getAttributeStringValue(element, '@_external');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.refid.length > 0);
        assert(this.kindref.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="ref" type="docRefTextType" />
export class RefDataModel extends AbstractDocRefTextType {
    constructor(xml, element) {
        super(xml, element, 'ref');
    }
}
// <xsd:complexType name="docTableType">
//   <xsd:sequence>
//     <xsd:element name="caption" type="docCaptionType" minOccurs="0" maxOccurs="1" />
//     <xsd:element name="row" type="docRowType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="rows" type="xsd:integer" />
//   <xsd:attribute name="cols" type="xsd:integer" />
//   <xsd:attribute name="width" type="xsd:string" />
// </xsd:complexType>
// <xsd:complexType name="docRowType">
//   <xsd:sequence>
//     <xsd:element name="entry" type="docEntryType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
// <xsd:complexType name="docEntryType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="thead" type="DoxBool" />
//   <xsd:attribute name="colspan" type="xsd:integer" />
//   <xsd:attribute name="rowspan" type="xsd:integer" />
//   <xsd:attribute name="align" type="DoxAlign" />
//   <xsd:attribute name="valign" type="DoxVerticalAlign" />
//   <xsd:attribute name="width" type="xsd:string" />
//   <xsd:attribute name="class" type="xsd:string" />
//   <xsd:anyAttribute processContents="skip"/>
// </xsd:complexType>
// <xsd:complexType name="docCaptionType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
// <xsd:simpleType name="range_1_6">
//   <xsd:restriction base="xsd:integer">
//     <xsd:minInclusive value="1"/>
//     <xsd:maxInclusive value="6"/>
//   </xsd:restriction>
// </xsd:simpleType>
// <xsd:complexType name="docHeadingType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="level" type="range_1_6" />
// </xsd:complexType>
// <xsd:complexType name="docImageType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="type" type="DoxImageKind" use="optional"/>
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="alt" type="xsd:string" use="optional"/>
//   <xsd:attribute name="inline" type="DoxBool" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
// </xsd:complexType>
// <xsd:complexType name="docDotMscType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
// </xsd:complexType>
// <xsd:complexType name="docImageFileType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="name" type="xsd:string" use="optional">
//     <xsd:annotation>
//       <xsd:documentation>The mentioned file will be located in the directory as specified by XML_OUTPUT</xsd:documentation>
//     </xsd:annotation>
//   </xsd:attribute>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
// </xsd:complexType>
// <xsd:complexType name="docPlantumlType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
//   <xsd:attribute name="engine" type="DoxPlantumlEngine" use="optional"/>
// </xsd:complexType>
// <xsd:complexType name="docTocItemType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
// <xsd:complexType name="docTocListType">
//   <xsd:sequence>
//     <xsd:element name="tocitem" type="docTocItemType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
// <xsd:complexType name="docLanguageType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="langid" type="xsd:string" />
// </xsd:complexType>
// <xsd:complexType name="docParamListType">
//   <xsd:sequence>
//     <xsd:element name="parameteritem" type="docParamListItem" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="kind" type="DoxParamListKind" />
// </xsd:complexType>
export class AbstractDocParamListType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Mandatory attributes.
        this.kind = '';
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'parameteritem')) {
                if (this.parameterItems === undefined) {
                    this.parameterItems = [];
                }
                this.parameterItems.push(new ParameterItemDataModel(xml, innerElement));
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
        for (const attributeName of attributesNames) {
            if (attributeName === '@_kind') {
                this.kind = xml.getAttributeStringValue(element, '@_kind');
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
// <xsd:element name="parameterlist" type="docParamListType" />
export class ParameterListDataModel extends AbstractDocParamListType {
    constructor(xml, element) {
        super(xml, element, 'parameterlist');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docParamListItem">
//   <xsd:sequence>
//     <xsd:element name="parameternamelist" type="docParamNameList" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="parameterdescription" type="descriptionType" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocParamListItem extends AbstractDataModelBase {
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
            else if (xml.hasInnerElement(innerElement, 'parameternamelist')) {
                if (this.parameterNameList === undefined) {
                    this.parameterNameList = [];
                }
                this.parameterNameList.push(new ParameterNamelistDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'parameterdescription')) {
                this.parameterDescription = new ParameterDescriptionDataModel(xml, innerElement);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.parameterDescription !== undefined);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
//  <xsd:element name="parameteritem" type="docParamListItem" minOccurs="0" maxOccurs="unbounded" />
export class ParameterItemDataModel extends AbstractDocParamListItem {
    constructor(xml, element) {
        super(xml, element, 'parameteritem');
    }
}
// WARNING: must be pairs of type/name.
// <xsd:complexType name="docParamNameList">
//   <xsd:sequence>
//     <xsd:element name="parametertype" type="docParamType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="parametername" type="docParamName" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocParamNameList extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'parametertype')) {
                this.children.push(new ParameterTypeDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'parametername')) {
                this.children.push(new ParameterNameDataModel(xml, innerElement));
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
// <xsd:element name="parameternamelist" type="docParamNameList" minOccurs="0" maxOccurs="unbounded" />
export class ParameterNamelistDataModel extends AbstractDocParamNameList {
    constructor(xml, element) {
        super(xml, element, 'parameternamelist');
    }
}
// <xsd:complexType name="docParamType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="ref" type="refTextType" minOccurs="0" maxOccurs="1" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocParamType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
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
//  <xsd:element name="parametertype" type="docParamType" minOccurs="0" maxOccurs="unbounded" />
export class ParameterTypeDataModel extends AbstractDocParamType {
    constructor(xml, element) {
        super(xml, element, 'parametertype');
    }
}
// <xsd:complexType name="docParamName" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="ref" type="refTextType" minOccurs="0" maxOccurs="1" />
//   </xsd:sequence>
//   <xsd:attribute name="direction" type="DoxParamDir" use="optional" />
// </xsd:complexType>
export class AbstractDocParamName extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Any sequence of them.
        this.children = [];
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
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
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_direction') {
                    this.direction = xml.getAttributeStringValue(element, '@_direction');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
//  <xsd:element name="parametername" type="docParamName" minOccurs="0" maxOccurs="unbounded" />
export class ParameterNameDataModel extends AbstractDocParamName {
    constructor(xml, element) {
        super(xml, element, 'parametername');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docXRefSectType">
//   <xsd:sequence>
//     <xsd:element name="xreftitle" type="xsd:string" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="xrefdescription" type="descriptionType" />
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocXRefSectType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Mandatory attributes.
        this.id = '';
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))ect(element))ect(element))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.isInnerElementText(innerElement, 'xreftitle')) {
                this.xreftitle = xml.getInnerElementText(innerElement, 'xreftitle');
            }
            else if (xml.hasInnerElement(innerElement, 'xrefdescription')) {
                this.xrefdescription = new XrefDescriptionDataModel(xml, innerElement);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.xrefdescription !== undefined);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
//     <xsd:element name="xrefsect" type="docXRefSectType" />
export class XrefSectDataModel extends AbstractDocXRefSectType {
    constructor(xml, element) {
        super(xml, element, 'xrefsect');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docCopyType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="internal" type="docInternalType" minOccurs="0" />
//   </xsd:sequence>
//   <xsd:attribute name="link" type="xsd:string" />
// </xsd:complexType>
// <xsd:complexType name="docDetailsType">
//   <xsd:sequence>
//     <xsd:element name="summary" type="docSummaryType" minOccurs="0" maxOccurs="1" />
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
// <xsd:complexType name="docBlockQuoteType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
// <xsd:complexType name="docParBlockType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
// ----------------------------------------------------------------------------
// <xsd:complexType name="docEmptyType"/>
export class AbstractDocEmptyType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Empty.
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docEmojiType">
//   <xsd:attribute name="name" type="xsd:string"/>
//   <xsd:attribute name="unicode" type="xsd:string"/>
// </xsd:complexType>
// ----------------------------------------------------------------------------
// <xsd:element name="briefdescription" type="descriptionType" minOccurs="0" />
// <xsd:element name="detaileddescription" type="descriptionType" minOccurs="0" />
// <xsd:element name="description" type="descriptionType" minOccurs="0" />
// <xsd:element name="inbodydescription" type="descriptionType" minOccurs="0" />
// <xsd:element name="parameterdescription" type="descriptionType" />
// <xsd:element name="xrefdescription" type="descriptionType" />
// <xsd:element name="parameterdescription" type="descriptionType" />
export class BriefDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'briefdescription');
    }
}
export class DetailedDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'detaileddescription');
    }
}
export class InbodyDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'inbodydescription');
    }
}
export class DescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'description');
    }
}
export class XrefDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'xrefdescription');
    }
}
export class ParameterDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'parameterdescription');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="internal" type="docInternalType" minOccurs="0" maxOccurs="unbounded"/>
// <xsd:element name="internal" type="docInternalS1Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="internal" type="docInternalS2Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS3Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS4Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS5Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS6Type" minOccurs="0" />
// <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect2" type="docSect2Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect3" type="docSect3Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect4" type="docSect4Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect5" type="docSect5Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect6" type="docSect6Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="title" type="docTitleType" minOccurs="0" />
// <xsd:element name="term" type="docTitleType" />
export class InternalDataModel extends AbstractDocInternalType {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS1DataModel extends AbstractDocInternalS1Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS2DataModel extends AbstractDocInternalS2Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS3DataModel extends AbstractDocInternalS3Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS4DataModel extends AbstractDocInternalS4Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS5DataModel extends AbstractDocInternalS5Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS6DataModel extends AbstractDocInternalS6Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class Sect1DataModel extends AbstractDocSect1Type {
    constructor(xml, element) {
        super(xml, element, 'sect1');
    }
}
export class Sect2DataModel extends AbstractDocSect2Type {
    constructor(xml, element) {
        super(xml, element, 'sect2');
    }
}
export class Sect3DataModel extends AbstractDocSect3Type {
    constructor(xml, element) {
        super(xml, element, 'sect3');
    }
}
export class Sect4DataModel extends AbstractDocSect4Type {
    constructor(xml, element) {
        super(xml, element, 'sect4');
    }
}
export class Sect5DataModel extends AbstractDocSect5Type {
    constructor(xml, element) {
        super(xml, element, 'sect5');
    }
}
export class Sect6DataModel extends AbstractDocSect6Type {
    constructor(xml, element) {
        super(xml, element, 'sect6');
    }
}
export class TitleDataModel extends AbstractDocTitleType {
    constructor(xml, element) {
        super(xml, element, 'title');
    }
}
export class TermDataModel extends AbstractDocTitleType {
    constructor(xml, element) {
        super(xml, element, 'term');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
export class ParaDataModel extends AbstractDocParaType {
    constructor(xml, element) {
        super(xml, element, 'para');
    }
}
// Not yet used, present just to remind its presence.
// <xsd:element name="para" type="docEmptyType" />
export class ParaEmptyDataModel extends AbstractDocEmptyType {
    constructor(xml, element) {
        super(xml, element, 'para');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="bold" type="docMarkupType" />
// <xsd:element name="emphasis" type="docMarkupType" />
// <xsd:element name="computeroutput" type="docMarkupType" />
export class BoldDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'bold');
    }
}
export class EmphasisDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'emphasis');
    }
}
export class ComputerOutputDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'computeroutput');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="simplesect" type="docSimpleSectType" />
export class SimpleSectDataModel extends AbstractDocSimpleSectType {
    constructor(xml, element) {
        super(xml, element, 'simplesect');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="itemizedlist" type="docListType" />
export class ItemizedListDataModel extends AbstractDocListType {
    constructor(xml, element) {
        super(xml, element, 'itemizedlist');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="linebreak" type="docEmptyType" />
// <xsd:element name="hruler" type="docEmptyType" />
export class LineBreakDataModel extends AbstractDocEmptyType {
    constructor(xml, element) {
        super(xml, element, 'linebreak');
    }
}
export class HrulerDataModel extends AbstractDocEmptyType {
    constructor(xml, element) {
        super(xml, element, 'hruler');
    }
}
// ----------------------------------------------------------------------------
