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
import * as util from 'node:util';
import assert from 'node:assert';
import { escapeHtml, escapeMdx, getPermalinkAnchor } from '../utils.js';
// ----------------------------------------------------------------------------
export const sectionHeaders = {
    typedef: ['Typedefs', 100], // DoxMemberKind too
    'public-type': ['Public Member Typedefs', 110],
    'protected-type': ['Protected Member Typedefs', 120],
    'private-type': ['Private Member Typedefs', 130],
    'package-type': ['Package Member Typedefs', 140],
    enum: ['Enumerations', 150], // DoxMemberKind too
    friend: ['Friends', 160], // DoxMemberKind too
    interface: ['Interfaces', 170], // DoxMemberKind only
    // Extra, not present in Doxygen.
    constructorr: ['Constructors', 200],
    'public-constructorr': ['Public Constructors', 200],
    'protected-constructorr': ['Protected Constructors', 210],
    'private-constructorr': ['Private Constructors', 220],
    // Extra, not present in Doxygen.
    'public-destructor': ['Public Destructor', 230],
    'protected-destructor': ['Protected Destructor', 240],
    'private-destructor': ['Private Destructor', 250],
    // Extra, not present in Doxygen.
    operator: ['Operators', 300],
    'public-operator': ['Public Operators', 310],
    'protected-operator': ['Protected Operators', 320],
    'private-operator': ['Private Operators', 330],
    'package-operator': ['Package Operators', 340],
    func: ['Functions', 350],
    function: ['Functions', 350], // DoxMemberKind only
    'public-func': ['Public Member Functions', 360],
    'protected-func': ['Protected Member Functions', 370],
    'private-func': ['Private Member Functions', 380],
    'package-func': ['Package Member Functions', 390],
    var: ['Variables', 400],
    variable: ['Variables', 400], // DoxMemberKind only
    'public-attrib': ['Public Member Attributes', 410],
    'protected-attrib': ['Protected Member Attributes', 420],
    'private-attrib': ['Private Member Attributes', 430],
    'package-attrib': ['Package Member Attributes', 440],
    'public-static-operator': ['Public Operators', 450],
    'protected-static-operator': ['Protected Operators', 460],
    'private-static-operator': ['Private Operators', 470],
    'package-static-operator': ['Package Operators', 480],
    'public-static-func': ['Public Static Functions', 500],
    'protected-static-func': ['Protected Static Functions', 510],
    'private-static-func': ['Private Static Functions', 520],
    'package-static-func': ['Package Static Functions', 530],
    'public-static-attrib': ['Public Static Attributes', 600],
    'protected-static-attrib': ['Protected Static Attributes', 610],
    'private-static-attrib': ['Private Static Attributes', 620],
    'package-static-attrib': ['Package Static Attributes', 630],
    slot: ['Slots', 700], // DoxMemberKind only
    'public-slot': ['Public Slots', 700],
    'protected-slot': ['Protected Slot', 710],
    'private-slot': ['Private Slot', 720],
    related: ['Related', 800],
    define: ['Defines', 810], // DoxMemberKind too
    prototype: ['Prototypes', 820], // DoxMemberKind too
    signal: ['Signals', 830], // DoxMemberKind too
    // 'dcop-func': ['DCOP Functions', 840],
    dcop: ['DCOP Functions', 840], // DoxMemberKind only
    property: ['Properties', 850], // DoxMemberKind too
    event: ['Events', 860], // DoxMemberKind too
    service: ['Services', 870], // DoxMemberKind only
    'user-defined': ['Definitions', 1000]
};
// ----------------------------------------------------------------------------
export class Section {
    constructor(compound, sectionDef) {
        // Both references and definitions.
        this.indexMembers = [];
        // Only definitions.
        this.definitionMembers = [];
        this._private = {};
        // console.log(compound.kind, compound.compoundName, sectionDef.kind)
        this._private._sectionDef = sectionDef;
        this.compound = compound;
        this.kind = sectionDef.kind;
        this.headerName = this.getHeaderNameByKind(sectionDef);
        assert(this.headerName !== undefined && this.headerName.length > 0);
        const members = [];
        if (sectionDef.memberDefs !== undefined) {
            for (const memberDefDataModel of sectionDef.memberDefs) {
                const member = new Member(this, memberDefDataModel);
                members.push(member);
                // Do not add it to the global map since additional checks are needed
                // therefore the procedure is done in the global generator.
            }
        }
        if (sectionDef.members !== undefined) {
            for (const memberRef of sectionDef.members) {
                members.push(new MemberRef(this, memberRef));
            }
        }
        this.indexMembers = members.sort((a, b) => a.name.localeCompare(b.name));
        // The array is already sorted.
        for (const member of this.indexMembers) {
            if (member instanceof Member) {
                this.definitionMembers.push(member);
            }
        }
    }
    initializeLate() {
        const workspace = this.compound.collection.workspace;
        assert(this._private._sectionDef !== undefined);
        const sectionDef = this._private._sectionDef;
        if (sectionDef.description !== undefined) {
            this.descriptionMdxText = workspace.renderElementToMdxText(sectionDef.description);
            // console.log(this.indexMembers, this.descriptionMdxText)
        }
    }
    hasDefinitionMembers() {
        return this.definitionMembers.length > 0;
    }
    // --------------------------------------------------------------------------
    // <xsd:simpleType name="DoxSectionKind">
    //   <xsd:restriction base="xsd:string">
    //     <xsd:enumeration value="user-defined" />
    //     <xsd:enumeration value="public-type" />
    //     <xsd:enumeration value="public-func" />
    //     <xsd:enumeration value="public-attrib" />
    //     <xsd:enumeration value="public-slot" />
    //     <xsd:enumeration value="signal" />
    //     <xsd:enumeration value="dcop-func" />
    //     <xsd:enumeration value="property" />
    //     <xsd:enumeration value="event" />
    //     <xsd:enumeration value="public-static-func" />
    //     <xsd:enumeration value="public-static-attrib" />
    //     <xsd:enumeration value="protected-type" />
    //     <xsd:enumeration value="protected-func" />
    //     <xsd:enumeration value="protected-attrib" />
    //     <xsd:enumeration value="protected-slot" />
    //     <xsd:enumeration value="protected-static-func" />
    //     <xsd:enumeration value="protected-static-attrib" />
    //     <xsd:enumeration value="package-type" />
    //     <xsd:enumeration value="package-func" />
    //     <xsd:enumeration value="package-attrib" />
    //     <xsd:enumeration value="package-static-func" />
    //     <xsd:enumeration value="package-static-attrib" />
    //     <xsd:enumeration value="private-type" />
    //     <xsd:enumeration value="private-func" />
    //     <xsd:enumeration value="private-attrib" />
    //     <xsd:enumeration value="private-slot" />
    //     <xsd:enumeration value="private-static-func" />
    //     <xsd:enumeration value="private-static-attrib" />
    //     <xsd:enumeration value="friend" />
    //     <xsd:enumeration value="related" />
    //     <xsd:enumeration value="define" />
    //     <xsd:enumeration value="prototype" />
    //     <xsd:enumeration value="typedef" />
    //     <xsd:enumeration value="enum" />
    //     <xsd:enumeration value="func" />
    //     <xsd:enumeration value="var" />
    //   </xsd:restriction>
    // </xsd:simpleType>
    getHeaderNameByKind(sectionDef) {
        // User defined sections have their own header.
        if (sectionDef.kind === 'user-defined') {
            if (sectionDef.header !== undefined) {
                return sectionDef.header.trim();
            }
            console.warn('sectionDef of kind user-defined');
            return 'User Defined';
        }
        if (sectionDef.header !== undefined) {
            console.warn('header', sectionDef.header, 'ignored in sectionDef of kind', sectionDef.kind);
        }
        // ------------------------------------------------------------------------
        const header = sectionHeaders[sectionDef.kind];
        if (header === undefined) {
            console.error(util.inspect(sectionDef, { compact: false, depth: 999 }));
            console.error(sectionDef.constructor.name, 'kind', sectionDef.kind, 'not yet rendered in', this.constructor.name, 'getHeaderNameByKind');
            return '';
        }
        return header[0].trim();
    }
    getSectionOrderByKind() {
        if (this.kind === 'user-defined') {
            return 1000; // At the end.
        }
        const header = sectionHeaders[this.kind];
        assert(header !== undefined);
        return header[1];
    }
    // --------------------------------------------------------------------------
    renderIndexToMdxLines() {
        const lines = [];
        // console.log(sectionDef)
        if (this.indexMembers.length > 0) {
            lines.push('');
            lines.push(`## ${escapeMdx(this.headerName)} Index`);
            lines.push('');
            lines.push('<MembersIndex>');
            for (const member of this.indexMembers) {
                if (member instanceof Member) {
                    lines.push(...member.renderIndexToMdxLines());
                }
                else if (member instanceof MemberRef) {
                    const referredMember = this.compound.collection.workspace.membersById.get(member.refid);
                    assert(referredMember !== undefined);
                    lines.push(...referredMember.renderIndexToMdxLines());
                }
            }
            lines.push('');
            lines.push('</MembersIndex>');
        }
        return lines;
    }
    // --------------------------------------------------------------------------
    renderToMdxLines() {
        const lines = [];
        if (!this.hasDefinitionMembers()) {
            return lines;
        }
        // TODO: filter out members defined in other compounds.
        lines.push('');
        lines.push('<SectionDefinition>');
        lines.push('');
        lines.push(`## ${escapeMdx(this.headerName)}`);
        if (this.descriptionMdxText !== undefined) {
            lines.push('');
            lines.push(...this.compound.renderDetailedDescriptionToMdxLines({
                detailedDescriptionMdxText: this.descriptionMdxText,
                showHeader: false
            }));
        }
        for (const member of this.definitionMembers) {
            lines.push(...member.renderToMdxLines());
        }
        lines.push('');
        lines.push('</SectionDefinition>');
        return lines;
    }
}
// ----------------------------------------------------------------------------
class MemberBase {
    constructor(section, name) {
        this.section = section;
        this.name = name;
    }
    initializeLate() {
    }
}
export class Member extends MemberBase {
    constructor(section, memberDef) {
        super(section, memberDef.name);
        this.labels = [];
        this.isTrailingType = false;
        this.isConstexpr = false;
        this.isStrong = false;
        this.isConst = false;
        this._private = {};
        this._private._memberDef = memberDef;
        this.id = memberDef.id;
        this.kind = memberDef.kind;
    }
    initializeLate() {
        super.initializeLate();
        const memberDef = this._private._memberDef;
        assert(memberDef !== undefined);
        const workspace = this.section.compound.collection.workspace;
        if (memberDef.briefDescription !== undefined) {
            this.briefDescriptionMdxText = workspace.renderElementToMdxText(memberDef.briefDescription);
        }
        if (memberDef.detailedDescription !== undefined) {
            this.detailedDescriptionMdxText = workspace.renderElementToMdxText(memberDef.detailedDescription);
        }
        this.argsstring = memberDef.argsstring;
        if (memberDef.type !== undefined) {
            this.typeMdxText = workspace.renderElementToMdxText(memberDef.type).trim();
        }
        if (memberDef.initializer !== undefined) {
            this.initializerMdxText = workspace.renderElementToMdxText(memberDef.initializer);
        }
        if (memberDef.location !== undefined) {
            this.locationMdxText = this.section.compound.renderLocationToMdxText(memberDef.location);
        }
        const labels = [];
        if (memberDef.inline?.valueOf()) {
            labels.push('inline');
        }
        if (memberDef.explicit?.valueOf()) {
            labels.push('explicit');
        }
        if (memberDef.nodiscard?.valueOf()) {
            labels.push('nodiscard');
        }
        if (memberDef.constexpr?.valueOf()) {
            labels.push('constexpr');
        }
        if (memberDef.noexcept?.valueOf()) {
            labels.push('noexcept');
        }
        if (memberDef.prot === 'protected') {
            labels.push('protected');
        }
        if (memberDef.staticc?.valueOf()) {
            labels.push('static');
        }
        if (memberDef.virt !== undefined && memberDef.virt === 'virtual') {
            labels.push('virtual');
        }
        // WARNING: there is no explicit attribute for 'delete'.
        if (memberDef.argsstring?.endsWith('=delete')) {
            labels.push('delete');
        }
        // WARNING: there is no explicit attribute for 'default'.
        if (memberDef.argsstring?.endsWith('=default')) {
            labels.push('default');
        }
        if (memberDef.strong?.valueOf()) {
            labels.push('strong');
        }
        if (memberDef.mutable?.valueOf()) {
            labels.push('mutable');
        }
        // WARNING: could not find how to generate 'inherited'.
        this.labels = labels;
        const type = this.typeMdxText ?? '';
        const templateParamList = memberDef.templateparamlist ?? this.section.compound.templateParamList;
        if ((this.section.compound.isTemplate(templateParamList) &&
            (type.includes('decltype(') ||
                (type.includes('&lt;') && type.includes('&gt;'))))) {
            this.isTrailingType = true;
        }
        this.templateParametersMdxText = this.section.compound.renderTemplateParametersToMdxText({ templateParamList, withDefaults: true });
        if (memberDef.params !== undefined) {
            const parameters = [];
            for (const param of memberDef.params) {
                parameters.push(workspace.renderElementToMdxText(param));
            }
            this.parameters = parameters.join(', ');
        }
        if (this.kind === 'enum') {
            this.enumMdxLines = this.renderEnumToMdxLines(memberDef);
        }
        if (memberDef.qualifiedName !== undefined) {
            this.qualifiedName = memberDef.qualifiedName;
        }
        if (memberDef.definition !== undefined) {
            this.definition = memberDef.definition;
        }
        if (memberDef.constexpr?.valueOf() && !type.includes('constexpr')) {
            this.isConstexpr = true;
        }
        this.isStrong = memberDef.strong?.valueOf() ?? false;
        this.isConst = memberDef.constt?.valueOf() ?? false;
        // Clear the reference, it is no longer needed.
        this._private._memberDef = undefined;
    }
    // --------------------------------------------------------------------------
    renderIndexToMdxLines() {
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
        const lines = [];
        const workspace = this.section.compound.collection.workspace;
        const permalink = workspace.getPermalink({ refid: this.id, kindref: 'member' });
        assert(permalink !== undefined && permalink.length > 1);
        const name = escapeMdx(this.name);
        let itemTemplate = '';
        let itemType = '';
        let itemName = `<a href="${permalink}">${name}</a>`;
        if (this.templateParametersMdxText !== undefined && this.templateParametersMdxText.length > 0) {
            if (this.templateParametersMdxText.length < 64) {
                itemTemplate = escapeMdx(`template ${this.templateParametersMdxText}`);
            }
            else {
                itemTemplate = escapeMdx('template < ... >');
            }
        }
        switch (this.kind) {
            case 'typedef':
                if (this.definition?.startsWith('typedef')) {
                    itemType = 'typedef';
                    itemName = `${this.typeMdxText} ${itemName}${this.argsstring}`;
                }
                else if (this.definition?.startsWith('using')) {
                    itemType = 'using';
                    if (this.typeMdxText !== undefined) {
                        itemName += ' = ';
                        itemName += this.typeMdxText;
                    }
                }
                else {
                    console.error('Unsupported typedef in member', this.definition);
                }
                break;
            case 'function':
                {
                    // WARNING: the rule to decide which type is trailing is not in the XMLs.
                    // https://github.com/doxygen/doxygen/discussions/11568
                    // TODO: improve.
                    const type = this.typeMdxText ?? '';
                    if (this.isConstexpr) {
                        itemType += 'constexpr ';
                    }
                    if (this.argsstring !== undefined) {
                        itemName += ' ';
                        itemName += escapeMdx(this.argsstring);
                    }
                    if (this.isTrailingType) {
                        if (!itemType.includes('auto')) {
                            itemType += 'auto ';
                        }
                        // WARNING: Doxygen shows this, but the resulting line is too long.
                        itemName += escapeMdx(' -> ');
                        itemName += type;
                    }
                    else {
                        itemType += type;
                    }
                    if (this.initializerMdxText !== undefined) {
                        itemName += ' ';
                        itemName += this.initializerMdxText;
                    }
                }
                break;
            case 'variable':
                itemType += this.typeMdxText;
                if (this.definition?.startsWith('struct ')) {
                    itemType = escapeMdx('struct { ... }');
                }
                else if (this.definition?.startsWith('class ')) {
                    itemType = escapeMdx('class { ... }');
                }
                if (this.initializerMdxText !== undefined) {
                    itemName += ' ';
                    itemName += this.initializerMdxText;
                }
                break;
            case 'enum':
                // console.log(this)
                itemType = '';
                if (this.name.length === 0) {
                    itemType += 'anonymous ';
                }
                itemType += 'enum';
                if (this.isStrong) {
                    itemType += ' class';
                }
                itemName = '';
                if (this.typeMdxText !== undefined) {
                    itemName += `: ${this.typeMdxText} `;
                }
                itemName += escapeHtml('{ ');
                itemName += `<a href="${permalink}">...</a>`;
                itemName += escapeHtml(' }');
                break;
            case 'friend':
                // console.log(this)
                itemType = this.typeMdxText ?? 'class';
                break;
            case 'define':
                // console.log(this)
                itemType = '#define';
                if (this.initializerMdxText !== undefined) {
                    itemName += '&nbsp;&nbsp;&nbsp;';
                    itemName += this.initializerMdxText;
                }
                break;
            default:
                console.error('member kind', this.kind, 'not implemented yet in', this.constructor.name, 'renderIndexToMdxLines');
        }
        lines.push('');
        lines.push('<MembersIndexItem');
        if (itemTemplate.length > 0) {
            if (itemTemplate.includes('<') || itemTemplate.includes('&')) {
                lines.push(`  template={<>${itemTemplate}</>}`);
            }
            else {
                lines.push(`  template="${itemTemplate}"`);
            }
        }
        if (itemType.length > 0) {
            if (itemType.includes('<') || itemType.includes('&')) {
                lines.push(`  type={<>${itemType}</>}`);
            }
            else {
                lines.push(`  type="${itemType}"`);
            }
        }
        if (itemName.length === 0) {
            console.log(this);
            console.warn('empty name in', this.id);
        }
        if (itemName.includes('<') || itemName.includes('&')) {
            lines.push(`  name={<>${itemName}</>}>`);
        }
        else {
            lines.push(`  name="${itemName}">`);
        }
        const briefDescriptionMdxText = this.briefDescriptionMdxText;
        if (briefDescriptionMdxText !== undefined && briefDescriptionMdxText.length > 0) {
            lines.push(this.section.compound.renderBriefDescriptionToMdxText({
                briefDescriptionMdxText,
                morePermalink: `${permalink}` // No #details, it is already an anchor.
            }));
        }
        lines.push('</MembersIndexItem>');
        return lines;
    }
    // --------------------------------------------------------------------------
    renderToMdxLines() {
        const lines = [];
        const isFunction = this.section.kind.startsWith('func') || this.section.kind.endsWith('func') || this.section.kind.endsWith('constructorr') || this.section.kind.endsWith('destructor') || this.section.kind.endsWith('operator');
        const id = getPermalinkAnchor(this.id);
        const name = this.name + (isFunction ? '()' : '');
        lines.push('');
        if (this.kind !== 'enum') {
            lines.push(`### ${escapeMdx(name)} {#${id}}`);
        }
        // console.log(memberDef.kind)
        switch (this.kind) {
            case 'function':
            case 'typedef':
            case 'variable':
                {
                    // WARNING: the rule to decide which type is trailing is not in XMLs.
                    // TODO: improve.
                    assert(this.definition !== undefined);
                    let prototype = escapeMdx(this.definition);
                    if (this.kind === 'function') {
                        prototype += ' (';
                        if (this.parameters !== undefined) {
                            prototype += this.parameters;
                        }
                        prototype += ')';
                    }
                    if (this.initializerMdxText !== undefined) {
                        prototype += ` ${this.initializerMdxText}`;
                    }
                    if (this.isConst) {
                        prototype += ' const';
                    }
                    lines.push('');
                    lines.push('<MemberDefinition');
                    if (this.templateParametersMdxText !== undefined && this.templateParametersMdxText.length > 0) {
                        const template = escapeMdx(`template ${this.templateParametersMdxText}`);
                        lines.push(`  template={<>${template}</>}`);
                    }
                    if (prototype.includes('<') || prototype.includes('&')) {
                        lines.push(`  prototype={<>${prototype}</>}${this.labels.length === 0 ? '>' : ''}`);
                    }
                    else {
                        lines.push(`  prototype="${prototype}"${this.labels.length === 0 ? '>' : ''}`);
                    }
                    if (this.labels.length > 0) {
                        lines.push(`  labels = {["${this.labels.join('", "')}"]}>`);
                    }
                    if (this.detailedDescriptionMdxText !== undefined) {
                        lines.push(...this.section.compound.renderDetailedDescriptionToMdxLines({
                            briefDescriptionMdxText: this.briefDescriptionMdxText,
                            detailedDescriptionMdxText: this.detailedDescriptionMdxText,
                            showHeader: false,
                            showBrief: true
                        }));
                    }
                    if (this.locationMdxText !== undefined) {
                        lines.push(this.locationMdxText);
                    }
                    lines.push('</MemberDefinition>');
                }
                break;
            case 'enum':
                {
                    let prototype = '';
                    if (this.name.length === 0) {
                        prototype += 'anonymous ';
                    }
                    prototype += 'enum ';
                    if (this.isStrong) {
                        prototype += 'class ';
                    }
                    lines.push(`### ${prototype} {#${id}}`);
                    if (this.name.length > 0 && this.qualifiedName !== undefined) {
                        prototype += `${escapeHtml(this.qualifiedName)} `;
                    }
                    else if (this.name.length > 0) {
                        prototype += `${escapeHtml(this.name)} `;
                    }
                    if (this.typeMdxText !== undefined && this.typeMdxText.length > 0) {
                        prototype += `: ${this.typeMdxText}`;
                    }
                    lines.push('');
                    lines.push('<MemberDefinition');
                    if (prototype.includes('<') || prototype.includes('&')) {
                        lines.push(`  prototype={<>${prototype}</>}${this.labels.length === 0 ? '>' : ''}`);
                    }
                    else {
                        lines.push(`  prototype="${prototype}"${this.labels.length === 0 ? '>' : ''}`);
                    }
                    if (this.labels.length > 0) {
                        lines.push(` labels = {["${this.labels.join('", "')}"]}>`);
                    }
                    if (this.briefDescriptionMdxText !== undefined && this.briefDescriptionMdxText.length > 0) {
                        lines.push(this.section.compound.renderBriefDescriptionToMdxText({
                            briefDescriptionMdxText: this.briefDescriptionMdxText
                        }));
                    }
                    assert(this.enumMdxLines !== undefined);
                    lines.push(...this.enumMdxLines);
                    if (this.detailedDescriptionMdxText !== undefined) {
                        lines.push(...this.section.compound.renderDetailedDescriptionToMdxLines({
                            detailedDescriptionMdxText: this.detailedDescriptionMdxText,
                            showHeader: false
                        }));
                    }
                    if (this.locationMdxText !== undefined) {
                        lines.push(this.locationMdxText);
                    }
                    lines.push('</MemberDefinition>');
                }
                break;
            case 'friend':
                {
                    // console.log(this)
                    const prototype = `friend ${this.typeMdxText} ${this.parameters}`;
                    lines.push('');
                    lines.push('<MemberDefinition');
                    if (prototype.includes('<') || prototype.includes('&')) {
                        lines.push(`  prototype={<>${prototype}</>}${this.labels.length === 0 ? '>' : ''}`);
                    }
                    else {
                        lines.push(`  prototype="${prototype}"${this.labels.length === 0 ? '>' : ''}`);
                    }
                    if (this.labels.length > 0) {
                        lines.push(`  labels = {["${this.labels.join('", "')}"]}>`);
                    }
                    if (this.detailedDescriptionMdxText !== undefined) {
                        lines.push(...this.section.compound.renderDetailedDescriptionToMdxLines({
                            briefDescriptionMdxText: this.briefDescriptionMdxText,
                            detailedDescriptionMdxText: this.detailedDescriptionMdxText,
                            showHeader: false,
                            showBrief: true
                        }));
                    }
                    if (this.locationMdxText !== undefined) {
                        lines.push(this.locationMdxText);
                    }
                    lines.push('</MemberDefinition>');
                }
                break;
            case 'define':
                {
                    // console.log(this)
                    let prototype = `#define ${escapeMdx(name)}`;
                    if (this.initializerMdxText !== undefined) {
                        prototype += '&nbsp;&nbsp;&nbsp;';
                        prototype += this.initializerMdxText;
                    }
                    lines.push('');
                    lines.push('<MemberDefinition');
                    if (prototype.includes('<') || prototype.includes('&')) {
                        lines.push(`  prototype={<>${prototype}</>}${this.labels.length === 0 ? '>' : ''}`);
                    }
                    else {
                        lines.push(`  prototype="${prototype}"${this.labels.length === 0 ? '>' : ''}`);
                    }
                    if (this.labels.length > 0) {
                        lines.push(`  labels = {["${this.labels.join('", "')}"]}>`);
                    }
                    lines.push(...this.section.compound.renderDetailedDescriptionToMdxLines({
                        briefDescriptionMdxText: this.briefDescriptionMdxText,
                        detailedDescriptionMdxText: this.detailedDescriptionMdxText,
                        showHeader: false,
                        showBrief: true
                    }));
                    if (this.locationMdxText !== undefined) {
                        lines.push(this.locationMdxText);
                    }
                    lines.push('</MemberDefinition>');
                }
                break;
            default:
                lines.push('');
                console.warn('memberDef', this.kind, this.name, 'not implemented yet in', this.constructor.name, 'renderToMdxLines');
        }
        return lines;
    }
    // --------------------------------------------------------------------------
    renderEnumToMdxLines(memberDef) {
        const lines = [];
        const workspace = this.section.compound.collection.workspace;
        lines.push('');
        lines.push('<EnumerationList title="Enumeration values">');
        if (memberDef.enumvalues !== undefined) {
            for (const enumValue of memberDef.enumvalues) {
                let enumBriefDescription = workspace.renderElementToMdxText(enumValue.briefDescription).replace(/[.]$/, '');
                const anchor = getPermalinkAnchor(enumValue.id);
                const value = workspace.renderElementToMdxText(enumValue.initializer);
                if (value.length > 0) {
                    enumBriefDescription += ` (${value})`;
                }
                lines.push('');
                lines.push(`<Link id="${anchor}" />`);
                lines.push(`<EnumerationListItem name="${enumValue.name.trim()}">`);
                lines.push(`${enumBriefDescription}`);
                lines.push('</EnumerationListItem>');
            }
        }
        lines.push('');
        lines.push('</EnumerationList>');
        return lines;
    }
}
// ----------------------------------------------------------------------------
export class MemberRef extends MemberBase {
    constructor(section, memberRef) {
        super(section, memberRef.name);
        // this.memberRef = memberRef
        this.refid = memberRef.refid;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=members-vm.js.map