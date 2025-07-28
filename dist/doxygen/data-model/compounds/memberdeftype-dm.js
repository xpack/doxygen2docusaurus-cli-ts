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
import { BriefDescriptionDataModel, DetailedDescriptionDataModel, InbodyDescriptionDataModel, } from './descriptiontype-dm.js';
import { InitializerDataModel, TypeDataModel } from './linkedtexttype-dm.js';
import { LocationDataModel } from './locationtype-dm.js';
import { ParamDataModel } from './paramtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
import { TemplateParamListDataModel } from './templateparamlisttype-dm.js';
import { EnumValueDataModel } from './enumvaluetype-dm.js';
import { ReimplementDataModel, ReimplementedByDataModel, } from './reimplementtype-dm.js';
import { ReferenceDataModel, ReferencedByDataModel, } from './referencetype-dm.js';
/**
 * @public
 */
export class AbstractMemberBaseType extends AbstractDataModelBase {
    // Mandatory elements.
    name = '';
    kind = '';
}
/**
 * @public
 */
export class AbstractMemberDefType extends AbstractMemberBaseType {
    // Mandatory elements.
    // name: string = '' (in parent)
    location;
    // Mandatory attributes.
    // kind: DoxMemberKind | '' = '' (in parent)
    id = '';
    prot = '';
    staticc;
    // Optional elements.
    templateparamlist;
    type;
    definition;
    argsstring;
    qualifiedName;
    // read?: string | undefined
    // write?: string | undefined
    bitfield;
    reimplements;
    reimplementedBys;
    // qualifier?: string[] | undefined
    params;
    enumvalues;
    // requiresclause?: LinkedTextType | undefined
    initializer;
    // exceptions?: LinkedTextType | undefined
    briefDescription;
    detailedDescription;
    inbodyDescription;
    references;
    referencedBy;
    // Optional attributes.
    extern;
    strong;
    constt;
    explicit;
    inline;
    refqual;
    virt;
    volatile;
    mutable;
    noexcept;
    noexceptexpression;
    nodiscard;
    constexpr;
    consteval;
    constinit;
    final;
    // TODO: add more...
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
                this.name = xml.getInnerElementText(innerElement, 'name');
            }
            else if (xml.hasInnerElement(innerElement, 'location')) {
                this.location = new LocationDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'templateparamlist')) {
                this.templateparamlist = new TemplateParamListDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'type')) {
                this.type = new TypeDataModel(xml, innerElement);
            }
            else if (xml.isInnerElementText(innerElement, 'definition')) {
                this.definition = xml.getInnerElementText(innerElement, 'definition');
            }
            else if (xml.isInnerElementText(innerElement, 'argsstring')) {
                this.argsstring = xml.getInnerElementText(innerElement, 'argsstring');
            }
            else if (xml.isInnerElementText(innerElement, 'bitfield')) {
                this.bitfield = xml.getInnerElementText(innerElement, 'bitfield');
            }
            else if (xml.isInnerElementText(innerElement, 'qualifiedname')) {
                this.qualifiedName = xml.getInnerElementText(innerElement, 'qualifiedname');
            }
            else if (xml.hasInnerElement(innerElement, 'reimplements')) {
                this.reimplements ??= [];
                this.reimplements.push(new ReimplementDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'reimplementedby')) {
                this.reimplementedBys ??= [];
                this.reimplementedBys.push(new ReimplementedByDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'param')) {
                this.params ??= [];
                this.params.push(new ParamDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'enumvalue')) {
                this.enumvalues ??= [];
                this.enumvalues.push(new EnumValueDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'initializer')) {
                this.initializer = new InitializerDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
                this.briefDescription = new BriefDescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
                this.detailedDescription = new DetailedDescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'inbodydescription')) {
                this.inbodyDescription = new InbodyDescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'references')) {
                this.references ??= [];
                this.references.push(new ReferenceDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'referencedby')) {
                this.referencedBy ??= [];
                this.referencedBy.push(new ReferencedByDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // WARNING it may be empty.
        // assert(this.name.length > 0)
        assert(this.location !== undefined);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        // console.log(attributesNames)
        for (const attributeName of attributesNames) {
            // console.log(attributeName)
            if (attributeName === '@_kind') {
                this.kind = xml.getAttributeStringValue(element, '@_kind');
            }
            else if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else if (attributeName === '@_prot') {
                this.prot = xml.getAttributeStringValue(element, '@_prot');
            }
            else if (attributeName === '@_static') {
                this.staticc = xml.getAttributeBooleanValue(element, '@_static');
            }
            else if (attributeName === '@_extern') {
                this.extern = Boolean(xml.getAttributeBooleanValue(element, '@_extern'));
            }
            else if (attributeName === '@_strong') {
                this.strong = Boolean(xml.getAttributeBooleanValue(element, '@_strong'));
            }
            else if (attributeName === '@_const') {
                this.constt = Boolean(xml.getAttributeBooleanValue(element, '@_const'));
            }
            else if (attributeName === '@_explicit') {
                this.explicit = Boolean(xml.getAttributeBooleanValue(element, '@_explicit'));
            }
            else if (attributeName === '@_inline') {
                this.inline = Boolean(xml.getAttributeBooleanValue(element, '@_inline'));
            }
            else if (attributeName === '@_refqual') {
                this.refqual = Boolean(xml.getAttributeBooleanValue(element, '@_refqual'));
            }
            else if (attributeName === '@_virt') {
                this.virt = xml.getAttributeStringValue(element, '@_virt');
            }
            else if (attributeName === '@_volatile') {
                this.volatile = xml.getAttributeBooleanValue(element, '@_volatile');
            }
            else if (attributeName === '@_mutable') {
                this.mutable = Boolean(xml.getAttributeBooleanValue(element, '@_mutable'));
            }
            else if (attributeName === '@_noexcept') {
                this.noexcept = Boolean(xml.getAttributeBooleanValue(element, '@_noexcept'));
            }
            else if (attributeName === '@_noexceptexpression') {
                this.noexceptexpression = Boolean(xml.getAttributeBooleanValue(element, '@_noexceptexpression'));
            }
            else if (attributeName === '@_nodiscard') {
                this.nodiscard = Boolean(xml.getAttributeBooleanValue(element, '@_nodiscard'));
            }
            else if (attributeName === '@_constexpr') {
                this.constexpr = Boolean(xml.getAttributeBooleanValue(element, '@_constexpr'));
            }
            else if (attributeName === '@_consteval') {
                this.consteval = Boolean(xml.getAttributeBooleanValue(element, '@_consteval'));
            }
            else if (attributeName === '@_constinit') {
                this.constinit = Boolean(xml.getAttributeBooleanValue(element, '@_constinit'));
            }
            else if (attributeName === '@_final') {
                this.final = Boolean(xml.getAttributeBooleanValue(element, '@_final'));
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.kind);
        assert(this.id);
        assert(this.prot);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="memberdef" type="memberdefType" minOccurs="0" maxOccurs="unbounded" />
/**
 * @public
 */
export class MemberDefDataModel extends AbstractMemberDefType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'memberdef');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=memberdeftype-dm.js.map