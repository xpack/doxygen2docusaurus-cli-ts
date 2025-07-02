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
import { getPermalinkAnchor } from '../utils.js';
import { MemberProgramListingDataModel, ParaDataModel } from '../../data-model/compounds/descriptiontype-dm.js';
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
    define: ['Macro Definitions', 810], // DoxMemberKind too
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
        // Original order.
        this.indexMembers = members;
        const definitionMembers = [];
        for (const member of this.indexMembers) {
            if (member instanceof Member) {
                definitionMembers.push(member);
            }
        }
        // Sorted.
        this.definitionMembers = definitionMembers.sort((a, b) => a.name.localeCompare(b.name));
    }
    initializeLate() {
        const workspace = this.compound.collection.workspace;
        assert(this._private._sectionDef !== undefined);
        const sectionDef = this._private._sectionDef;
        if (sectionDef.description !== undefined) {
            this.descriptionLines = workspace.renderElementToLines(sectionDef.description, 'markdown');
            // console.log(this.indexMembers, this.descriptionLines)
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
    renderIndexToLines() {
        const lines = [];
        // console.log(sectionDef)
        if (this.indexMembers.length > 0) {
            lines.push('');
            lines.push(`## ${this.headerName} Index`);
            lines.push('');
            lines.push('<table class="doxyMembersIndex">');
            for (const member of this.indexMembers) {
                if (member instanceof Member) {
                    lines.push(...member.renderIndexToLines());
                }
                else if (member instanceof MemberRef) {
                    const referredMember = this.compound.collection.workspace.membersById.get(member.refid);
                    assert(referredMember !== undefined);
                    lines.push(...referredMember.renderIndexToLines());
                }
            }
            lines.push('');
            lines.push('</table>');
        }
        return lines;
    }
    // --------------------------------------------------------------------------
    renderToLines() {
        const lines = [];
        if (!this.hasDefinitionMembers()) {
            return lines;
        }
        // TODO: filter out members defined in other compounds.
        lines.push('');
        lines.push('<div class="doxySectionDef">');
        lines.push('');
        lines.push(`## ${this.headerName}`);
        if (this.descriptionLines !== undefined) {
            lines.push('');
            lines.push(...this.compound.renderDetailedDescriptionToLines({
                detailedDescriptionMarkdownLines: this.descriptionLines,
                showHeader: false
            }));
        }
        for (const member of this.definitionMembers) {
            lines.push(...member.renderToLines());
        }
        lines.push('');
        lines.push('</div>');
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
        this.isStatic = false;
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
            // console.log(memberDef.briefDescription)
            if (memberDef.briefDescription !== undefined) {
                assert(memberDef.briefDescription.children !== undefined);
                for (const child of memberDef.briefDescription.children) {
                    if (child instanceof ParaDataModel) {
                        child.skipPara = true;
                    }
                }
            }
            this.briefDescriptionMarkdownString = workspace.renderElementToString(memberDef.briefDescription, 'markdown').trim();
        }
        if (memberDef.detailedDescription !== undefined) {
            this.detailedDescriptionMarkdownLines = workspace.renderElementToLines(memberDef.detailedDescription, 'markdown');
        }
        this.argsstring = memberDef.argsstring;
        if (memberDef.type !== undefined) {
            this.type = workspace.renderElementToString(memberDef.type, 'html').trim();
        }
        if (memberDef.initializer !== undefined) {
            this.initializerHtmlLines = workspace.renderElementToLines(memberDef.initializer, 'html');
        }
        if (memberDef.location !== undefined) {
            this.locationMarkdownLines = this.section.compound.renderLocationToLines(memberDef.location);
            if (workspace.pluginOptions.renderProgramListingInline) {
                this.programListing = this.filterProgramListingForLocation(memberDef.location);
            }
        }
        if (memberDef.references !== undefined) {
            this.referencesMarkdownString = this.section.compound.renderReferencesToString(memberDef.references);
        }
        if (memberDef.referencedBy !== undefined) {
            this.referencedByMarkdownString = this.section.compound.renderReferencedByToString(memberDef.referencedBy);
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
            this.isStatic = true;
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
        const type = this.type ?? '';
        const templateParamList = memberDef.templateparamlist ?? this.section.compound.templateParamList;
        if ((this.section.compound.isTemplate(templateParamList) &&
            (type.includes('decltype(') ||
                (type.includes('&lt;') && type.includes('&gt;'))))) {
            this.isTrailingType = true;
        }
        if (templateParamList?.params !== undefined) {
            this.templateParameters = this.section.compound.renderTemplateParametersToString({ templateParamList, withDefaults: true });
        }
        if (memberDef.params !== undefined) {
            const parameters = [];
            for (const param of memberDef.params) {
                parameters.push(workspace.renderElementToString(param, 'html').trim());
            }
            if (parameters.length > 0) {
                this.parametersHtmlString = parameters.join(', ');
            }
        }
        if (this.kind === 'enum') {
            this.enumHtmlLines = this.renderEnumToLines(memberDef);
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
    filterProgramListingForLocation(location) {
        // console.log(location)
        const workspace = this.section.compound.collection.workspace;
        if (location === undefined) {
            return undefined;
        }
        let programListing;
        let definitionFile;
        let startLine = -1;
        let endLine = -1;
        if (location.bodyfile !== undefined) {
            definitionFile = workspace.filesByPath.get(location.bodyfile);
            if (definitionFile === undefined) {
                console.log('no definition');
                return undefined;
            }
            if (definitionFile.programListing === undefined) {
                console.log('no listing');
                return undefined;
            }
            if (location.bodystart !== undefined) {
                startLine = location.bodystart.valueOf();
                if (location.bodyend !== undefined) {
                    endLine = location.bodyend.valueOf();
                }
                if (endLine === -1) {
                    endLine = startLine;
                }
            }
            else {
                return undefined;
            }
            // console.log(definitionFile.indexName, startLine, endLine)
            programListing = new MemberProgramListingDataModel(definitionFile.programListing, startLine, endLine);
            // } else if (location.file !== undefined) {
            //   definitionFile = workspace.filesByPath.get(location.file)
            //   if (definitionFile === undefined) {
            //     console.log('no definition')
            //     return undefined
            //   }
            //   if (definitionFile.programListing === undefined) {
            //     console.log('no listing')
            //     return undefined
            //   }
            //   if (location.line !== undefined) {
            //     startLine = location.line.valueOf()
            //     endLine = startLine
            //   } else {
            //     return undefined
            //   }
        }
        if (definitionFile?.programListing !== undefined) {
            // console.log(definitionFile.indexName, startLine, endLine)
            programListing = new MemberProgramListingDataModel(definitionFile.programListing, startLine, endLine);
        }
        // console.log(programListing)
        return programListing;
    }
    // --------------------------------------------------------------------------
    renderIndexToLines() {
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
        const lines = [];
        const workspace = this.section.compound.collection.workspace;
        const permalink = workspace.getPermalink({ refid: this.id, kindref: 'member' });
        assert(permalink !== undefined && permalink.length > 1);
        const name = workspace.renderString(this.name, 'html');
        let itemTemplate = '';
        let itemType = '';
        let itemName = `<a href="${permalink}">${name}</a>`;
        if (this.templateParameters !== undefined && this.templateParameters.length > 0) {
            if (this.templateParameters.length < 64) {
                itemTemplate = workspace.renderString(`template ${this.templateParameters}`, 'html');
            }
            else {
                itemTemplate = workspace.renderString('template < ... >', 'html');
            }
        }
        switch (this.kind) {
            case 'typedef':
                if (this.definition?.startsWith('typedef')) {
                    itemType = 'typedef';
                    itemName = `${this.type} ${itemName}${this.argsstring}`;
                }
                else if (this.definition?.startsWith('using')) {
                    itemType = 'using';
                    if (this.type !== undefined) {
                        itemName += ' = ';
                        itemName += this.type;
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
                    const type = this.type ?? '';
                    if (this.isStatic) {
                        itemType += 'static ';
                    }
                    if (this.isConstexpr) {
                        itemType += 'constexpr ';
                    }
                    if (this.argsstring !== undefined) {
                        itemName += ' ';
                        itemName += workspace.renderString(this.argsstring, 'html');
                    }
                    if (this.isTrailingType) {
                        if (!itemType.includes('auto')) {
                            itemType += 'auto ';
                        }
                        // WARNING: Doxygen shows this, but the resulting line is too long.
                        itemName += workspace.renderString(' -> ', 'html');
                        itemName += type;
                    }
                    else {
                        itemType += type;
                    }
                    if (this.initializerHtmlLines !== undefined) {
                        // Show only short initializers in the index.
                        itemName += ' ';
                        if (this.initializerHtmlLines.length === 1) {
                            itemName += this.initializerHtmlLines[0];
                        }
                        else {
                            itemName += '= ...';
                        }
                    }
                }
                break;
            case 'variable':
                if (this.isStatic) {
                    itemType += 'static ';
                }
                if (this.isConstexpr) {
                    itemType += 'constexpr ';
                }
                itemType += this.type;
                if (this.definition?.startsWith('struct ')) {
                    itemType = workspace.renderString('struct { ... }', 'html');
                }
                else if (this.definition?.startsWith('class ')) {
                    itemType = workspace.renderString('class { ... }', 'html');
                }
                if (this.argsstring !== undefined) {
                    itemName += this.argsstring;
                }
                if (this.initializerHtmlLines !== undefined) {
                    // Show only short initializers in the index.
                    itemName += ' ';
                    if (this.initializerHtmlLines.length === 1) {
                        itemName += this.initializerHtmlLines[0];
                    }
                    else {
                        itemName += '= ...';
                    }
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
                itemName = this.name;
                if (this.type !== undefined && this.type.length > 0) {
                    itemName += ` : ${this.type}`;
                }
                itemName += workspace.renderString(' { ', 'html');
                itemName += `<a href="${permalink}">...</a>`;
                itemName += workspace.renderString(' }', 'html');
                break;
            case 'friend':
                // console.log(this)
                itemType = this.type ?? 'class';
                break;
            case 'define':
                // console.log(this)
                itemType = '#define';
                if (this.parametersHtmlString !== undefined) {
                    itemName += `(${this.parametersHtmlString})`;
                }
                if (this.initializerHtmlLines !== undefined) {
                    itemName += '&nbsp;&nbsp;&nbsp;';
                    if (this.initializerHtmlLines.length === 1) {
                        itemName += this.initializerHtmlLines[0];
                    }
                    else {
                        itemName += '...';
                    }
                }
                break;
            default:
                console.error('member kind', this.kind, 'not implemented yet in', this.constructor.name, 'renderIndexToLines');
        }
        lines.push('');
        if (itemName.length === 0) {
            console.log(this);
            console.warn('empty name in', this.id);
        }
        const childrenLines = [];
        const briefDescriptionNoParaString = this.briefDescriptionMarkdownString;
        if (briefDescriptionNoParaString !== undefined && briefDescriptionNoParaString.length > 0) {
            childrenLines.push(this.section.compound.renderBriefDescriptionToString({
                briefDescriptionMarkdownString: briefDescriptionNoParaString,
                morePermalink: `${permalink}` // No #details, it is already an anchor.
            }));
        }
        lines.push(...workspace.renderMembersIndexItemToLines({
            template: itemTemplate,
            type: itemType,
            name: itemName,
            childrenLines
        }));
        return lines;
    }
    // --------------------------------------------------------------------------
    renderToLines() {
        const lines = [];
        const workspace = this.section.compound.collection.workspace;
        const isFunction = this.section.kind.startsWith('func') || this.section.kind.endsWith('func') || this.section.kind.endsWith('constructorr') || this.section.kind.endsWith('destructor') || this.section.kind.endsWith('operator');
        const id = getPermalinkAnchor(this.id);
        const name = this.name + (isFunction ? '()' : '');
        lines.push('');
        if (this.kind !== 'enum') {
            lines.push(`### ${workspace.renderString(name, 'markdown')} {#${id}}`);
        }
        let template;
        let prototype;
        const labels = this.labels;
        const childrenLines = [];
        // console.log(memberDef.kind)
        switch (this.kind) {
            case 'function':
            case 'typedef':
            case 'variable':
                // WARNING: the rule to decide which type is trailing is not in XMLs.
                // TODO: improve.
                assert(this.definition !== undefined);
                prototype = workspace.renderString(this.definition, 'html');
                if (this.isStatic) {
                    // The html pages show `static` only as a label; strip it.
                    prototype = prototype.replace(/^static /, '');
                }
                if (this.kind === 'function') {
                    prototype += ' (';
                    if (this.parametersHtmlString !== undefined) {
                        prototype += this.parametersHtmlString;
                    }
                    prototype += ')';
                }
                if (this.initializerHtmlLines !== undefined) {
                    if (this.initializerHtmlLines.length === 1) {
                        prototype += ` ${this.initializerHtmlLines[0]}`;
                    }
                }
                if (this.templateParameters !== undefined && this.templateParameters.length > 0) {
                    template = workspace.renderString(`template ${this.templateParameters}`, 'html');
                }
                if (this.briefDescriptionMarkdownString !== undefined) {
                    childrenLines.push(this.section.compound.renderBriefDescriptionToString({
                        briefDescriptionMarkdownString: this.briefDescriptionMarkdownString
                    }));
                }
                if (this.initializerHtmlLines !== undefined && this.initializerHtmlLines.length > 1) {
                    childrenLines.push('');
                    childrenLines.push('<dl class="doxySectionUser">');
                    childrenLines.push('<dt>Initialiser</dt>');
                    childrenLines.push('<dd>');
                    childrenLines.push(`<div class="doxyVerbatim">${this.initializerHtmlLines[0]}`);
                    for (const initializerLine of this.initializerHtmlLines.slice(1)) {
                        if (initializerLine.trim().length > 0) {
                            childrenLines.push(initializerLine);
                        }
                    }
                    childrenLines.push('</div>');
                    childrenLines.push('</dd>');
                    childrenLines.push('</dl>');
                }
                if (this.detailedDescriptionMarkdownLines !== undefined) {
                    childrenLines.push(...this.section.compound.renderDetailedDescriptionToLines({
                        briefDescriptionMarkdownString: this.briefDescriptionMarkdownString,
                        detailedDescriptionMarkdownLines: this.detailedDescriptionMarkdownLines,
                        showHeader: false,
                        showBrief: false
                    }));
                }
                break;
            case 'enum':
                prototype = '';
                if (this.name.length === 0) {
                    prototype += 'anonymous ';
                }
                prototype += 'enum ';
                if (this.isStrong) {
                    prototype += 'class ';
                }
                if (this.name.length > 0) {
                    lines.push(`### ${workspace.renderString(name, 'markdown')} {#${id}}`);
                }
                else {
                    lines.push(`### ${prototype} {#${id}}`);
                }
                if (this.briefDescriptionMarkdownString !== undefined && this.briefDescriptionMarkdownString.length > 0) {
                    childrenLines.push(this.section.compound.renderBriefDescriptionToString({
                        briefDescriptionMarkdownString: this.briefDescriptionMarkdownString
                    }));
                }
                assert(this.enumHtmlLines !== undefined);
                childrenLines.push(...this.enumHtmlLines);
                if (this.detailedDescriptionMarkdownLines !== undefined) {
                    childrenLines.push(...this.section.compound.renderDetailedDescriptionToLines({
                        detailedDescriptionMarkdownLines: this.detailedDescriptionMarkdownLines,
                        showHeader: false,
                        showBrief: false
                    }));
                }
                if (this.name.length > 0 && this.qualifiedName !== undefined) {
                    prototype += `${workspace.renderString(this.qualifiedName, 'html')} `;
                }
                else if (this.name.length > 0) {
                    prototype += `${workspace.renderString(this.name, 'html')} `;
                }
                if (this.type !== undefined && this.type.length > 0) {
                    prototype += `: ${this.type}`;
                }
                break;
            case 'friend':
                // console.log(this)
                prototype = `friend ${this.type} ${this.parametersHtmlString}`;
                if (this.detailedDescriptionMarkdownLines !== undefined) {
                    childrenLines.push(...this.section.compound.renderDetailedDescriptionToLines({
                        briefDescriptionMarkdownString: this.briefDescriptionMarkdownString,
                        detailedDescriptionMarkdownLines: this.detailedDescriptionMarkdownLines,
                        showHeader: false,
                        showBrief: true
                    }));
                }
                break;
            case 'define':
                // console.log(this)
                prototype = `#define ${name}`;
                if (this.parametersHtmlString !== undefined) {
                    prototype += `(${this.parametersHtmlString})`;
                }
                if (this.initializerHtmlLines !== undefined) {
                    prototype += '&nbsp;&nbsp;&nbsp;';
                    if (this.initializerHtmlLines.length === 1) {
                        prototype += this.initializerHtmlLines[0];
                    }
                    else {
                        prototype += '...';
                    }
                }
                if (this.briefDescriptionMarkdownString !== undefined) {
                    childrenLines.push(this.section.compound.renderBriefDescriptionToString({
                        briefDescriptionMarkdownString: this.briefDescriptionMarkdownString
                    }));
                }
                if (this.initializerHtmlLines !== undefined && this.initializerHtmlLines.length > 1) {
                    childrenLines.push('');
                    childrenLines.push('<dl class="doxySectionUser">');
                    childrenLines.push('<dt>Value</dt>');
                    childrenLines.push('<dd>');
                    // TODO make code
                    childrenLines.push(`<div class="doxyVerbatim">${this.initializerHtmlLines[0]}`);
                    for (const initializerLine of this.initializerHtmlLines.slice(1)) {
                        if (initializerLine.trim().length > 0) {
                            childrenLines.push(initializerLine);
                        }
                    }
                    childrenLines.push('</div>');
                    childrenLines.push('</dd>');
                    childrenLines.push('</dl>');
                }
                childrenLines.push(...this.section.compound.renderDetailedDescriptionToLines({
                    briefDescriptionMarkdownString: this.briefDescriptionMarkdownString,
                    detailedDescriptionMarkdownLines: this.detailedDescriptionMarkdownLines,
                    showHeader: false,
                    showBrief: false
                }));
                break;
            default:
                lines.push('');
                console.warn('memberDef', this.kind, this.name, 'not implemented yet in', this.constructor.name, 'renderToLines');
        }
        if (this.locationMarkdownLines !== undefined) {
            childrenLines.push(...this.locationMarkdownLines);
        }
        if (this.programListing !== undefined) {
            childrenLines.push(...this.section.compound.collection.workspace.renderElementToLines(this.programListing, 'html'));
        }
        if (this.referencesMarkdownString !== undefined) {
            childrenLines.push('');
            childrenLines.push(this.referencesMarkdownString);
        }
        if (this.referencedByMarkdownString !== undefined) {
            childrenLines.push('');
            childrenLines.push(this.referencedByMarkdownString);
        }
        lines.push('');
        if (prototype !== undefined) {
            lines.push(...this.renderMemberDefinitionToLines({
                template,
                prototype,
                labels,
                childrenLines
            }));
        }
        return lines;
    }
    renderMemberDefinitionToLines({ template, prototype, labels, childrenLines }) {
        const lines = [];
        lines.push('<div class="doxyMemberItem">');
        lines.push('<div class="doxyMemberProto">');
        if (template !== undefined && template.length > 0) {
            lines.push(`<div class="doxyMemberTemplate">${template}</div>`);
        }
        lines.push('<table class="doxyMemberLabels">');
        lines.push('<tr class="doxyMemberLabels">');
        lines.push('<td class="doxyMemberLabelsLeft">');
        lines.push('<table class="doxyMemberName">');
        lines.push('<tr>');
        lines.push(`<td class="doxyMemberName">${prototype}</td>`);
        lines.push('</tr>');
        lines.push('</table>');
        lines.push('</td>');
        if (labels.length > 0) {
            lines.push('<td class="doxyMemberLabelsRight">');
            lines.push('<span class="doxyMemberLabels">');
            for (const label of labels) {
                lines.push(`<span class="doxyMemberLabel ${label}">${label}</span>`);
            }
            lines.push('</span>');
            lines.push('</td>');
        }
        lines.push('</tr>');
        lines.push('</table>');
        lines.push('</div>');
        lines.push('<div class="doxyMemberDoc">');
        lines.push(''); // Required to make the first line a separate paragraph.
        lines.push(...childrenLines);
        lines.push('</div>');
        lines.push('</div>');
        return lines;
    }
    // --------------------------------------------------------------------------
    renderEnumToLines(memberDef) {
        const lines = [];
        const workspace = this.section.compound.collection.workspace;
        lines.push('');
        lines.push('<dl class="doxyEnumList">');
        lines.push('<dt class="doxyEnumTableTitle">Enumeration values</dt>');
        lines.push('<dd>');
        lines.push('<table class="doxyEnumTable">');
        if (memberDef.enumvalues !== undefined) {
            for (const enumValue of memberDef.enumvalues) {
                // console.log(enumValue.briefDescription)
                if (enumValue.briefDescription !== undefined) {
                    assert(enumValue.briefDescription.children);
                    for (const child of enumValue.briefDescription.children) {
                        if (child instanceof ParaDataModel) {
                            child.skipPara = true;
                        }
                    }
                }
                let enumBriefDescriptionHtmlString = workspace.renderElementToString(enumValue.briefDescription, 'html').trim().replace(/[.]$/, '');
                // console.log(`|${enumBriefDescription}|`)
                const anchor = getPermalinkAnchor(enumValue.id);
                const value = workspace.renderElementToString(enumValue.initializer, 'html');
                if (value.length > 0) {
                    enumBriefDescriptionHtmlString += ` (${value})`;
                }
                lines.push('');
                // lines.push(`<a id="${anchor}"></a>`)
                lines.push('<tr class="doxyEnumItem">');
                lines.push(`<td class="doxyEnumItemName">${enumValue.name.trim()}<a id="${anchor}"></a></td>`);
                // lines.push(`<td class="doxyEnumItemDescription"><p>${enumBriefDescription}</p></td>`)
                lines.push(`<td class="doxyEnumItemDescription">${enumBriefDescriptionHtmlString}</td>`);
                lines.push('</tr>');
            }
        }
        lines.push('');
        lines.push('</table>');
        lines.push('</dd>');
        lines.push('</dl>');
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