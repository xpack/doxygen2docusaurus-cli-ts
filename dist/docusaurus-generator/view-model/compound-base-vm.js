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
import assert from 'node:assert';
import path from 'node:path';
import { ParaDataModel } from '../../data-model/compounds/descriptiontype-dm.js';
import { InnerClassDataModel } from '../../data-model/compounds/reftype-dm.js';
import { escapeHtml, escapeMdx } from '../utils.js';
import { Section } from './members-vm.js';
import { RefTextDataModel } from '../../data-model/compounds/reftexttype-dm.js';
import { SectionDefByKindDataModel } from '../../data-model/compounds/sectiondeftype-dm.js';
// ----------------------------------------------------------------------------
export class CompoundBase {
    // --------------------------------------------------------------------------
    constructor(collection, compoundDef) {
        this.kind = '';
        this.compoundName = '';
        this.id = '';
        // Set in 2 steps, first the Ids and then, when all objects are in, the references.
        // Folder objects use separate arrays for files and folders children.
        this.childrenIds = [];
        this.children = [];
        /** The name shown in the index section. */
        this.indexName = '';
        /** The name shown in the page title. */
        this.pageTitle = '';
        this.hasSect1InDescription = false;
        // detailedDescriptionMdxLines: string[] | undefined
        this.sections = [];
        this.locationSet = new Set();
        this._private = {};
        this._private._compoundDef = compoundDef;
        this.collection = collection;
        this.kind = compoundDef.kind;
        this.compoundName = compoundDef.compoundName;
        this.id = compoundDef.id;
        if (compoundDef.title !== undefined) {
            this.titleMdxText = escapeMdx(compoundDef.title);
        }
        if (compoundDef?.location?.file !== undefined) {
            this.locationFilePath = compoundDef.location.file;
        }
    }
    createSections(classUnqualifiedName) {
        const reorderedSectionDefs = this.reorderSectionDefs(classUnqualifiedName);
        if (reorderedSectionDefs !== undefined) {
            const sections = [];
            for (const sectionDef of reorderedSectionDefs) {
                sections.push(new Section(this, sectionDef));
            }
            this.sections = sections.sort((a, b) => {
                return a.getSectionOrderByKind() - b.getSectionOrderByKind();
            });
        }
    }
    reorderSectionDefs(classUnqualifiedName) {
        const sectionDefs = this._private._compoundDef?.sectionDefs;
        if (sectionDefs === undefined) {
            return undefined;
        }
        const resultSectionDefs = [];
        const sectionDefsByKind = new Map();
        for (const sectionDef of sectionDefs) {
            if (sectionDef.kind === 'user-defined' && sectionDef.header !== undefined) {
                resultSectionDefs.push(sectionDef);
                continue;
            }
            if (sectionDef.memberDefs !== undefined) {
                for (const memberDef of sectionDef.memberDefs) {
                    const adjustedSectionKind = this.adjustSectionKind(sectionDef, memberDef, classUnqualifiedName);
                    let mapSectionDef = sectionDefsByKind.get(adjustedSectionKind);
                    if (mapSectionDef === undefined) {
                        mapSectionDef = new SectionDefByKindDataModel(adjustedSectionKind);
                        sectionDefsByKind.set(adjustedSectionKind, mapSectionDef);
                    }
                    if (mapSectionDef.memberDefs === undefined) {
                        mapSectionDef.memberDefs = [];
                    }
                    mapSectionDef.memberDefs.push(memberDef);
                }
            }
            if (sectionDef.members !== undefined) {
                for (const member of sectionDef.members) {
                    const adjustedSectionKind = this.adjustSectionKind(sectionDef, member, classUnqualifiedName);
                    let mapSectionDef = sectionDefsByKind.get(adjustedSectionKind);
                    if (mapSectionDef === undefined) {
                        mapSectionDef = new SectionDefByKindDataModel(adjustedSectionKind);
                        sectionDefsByKind.set(adjustedSectionKind, mapSectionDef);
                    }
                    if (mapSectionDef.members === undefined) {
                        mapSectionDef.members = [];
                    }
                    mapSectionDef.members.push(member);
                }
            }
        }
        resultSectionDefs.push(...sectionDefsByKind.values());
        return resultSectionDefs;
    }
    // <xsd:simpleType name="DoxMemberKind">
    //   <xsd:restriction base="xsd:string">
    //     <xsd:enumeration value="define" />
    //     <xsd:enumeration value="property" />
    //     <xsd:enumeration value="event" />
    //     <xsd:enumeration value="variable" />
    //     <xsd:enumeration value="typedef" />
    //     <xsd:enumeration value="enum" />
    //     <xsd:enumeration value="function" />
    //     <xsd:enumeration value="signal" />
    //     <xsd:enumeration value="prototype" />
    //     <xsd:enumeration value="friend" />
    //     <xsd:enumeration value="dcop" />
    //     <xsd:enumeration value="slot" />
    //     <xsd:enumeration value="interface" />
    //     <xsd:enumeration value="service" />
    //   </xsd:restriction>
    // </xsd:simpleType>
    adjustSectionKind(sectionDef, memberBase, classUnqualifiedName) {
        // In general, adjust to member kind.
        let adjustedSectionKind = memberBase.kind;
        switch (memberBase.kind) {
            case 'function':
                // If public/protected/private, preserve the prefix.
                if (this.isOperator(memberBase.name)) {
                    adjustedSectionKind = sectionDef.computeAdjustedKind('operator');
                }
                else if (classUnqualifiedName !== undefined) {
                    if (memberBase.name === classUnqualifiedName) {
                        adjustedSectionKind = sectionDef.computeAdjustedKind('constructorr');
                    }
                    else if (memberBase.name.replace('~', '') === classUnqualifiedName) {
                        adjustedSectionKind = sectionDef.computeAdjustedKind('destructor');
                    }
                    else {
                        adjustedSectionKind = sectionDef.computeAdjustedKind('func', 'function');
                    }
                }
                else {
                    adjustedSectionKind = sectionDef.computeAdjustedKind('func', 'function');
                }
                break;
            case 'variable':
                adjustedSectionKind = sectionDef.computeAdjustedKind('attrib', 'variable');
                break;
            case 'typedef':
                adjustedSectionKind = sectionDef.computeAdjustedKind('type', 'typedef');
                break;
            case 'slot':
                adjustedSectionKind = sectionDef.computeAdjustedKind('slot');
                break;
            // case 'define':
            // case 'property':
            // case 'event':
            // case 'enum':
            // case 'signal':
            // case 'prototype':
            // case 'friend':
            // case 'dcop':
            // case 'interface':
            // case 'service':
            default:
                // Adjust to member kind.
                adjustedSectionKind = memberBase.kind;
                break;
        }
        // console.log('adjustedSectionKind:', memberBase.kind, adjustedSectionKind)
        return adjustedSectionKind;
    }
    initializeLate() {
        const workspace = this.collection.workspace;
        const compoundDef = this._private._compoundDef;
        assert(compoundDef !== undefined);
        if (compoundDef.briefDescription !== undefined) {
            // console.log(compoundDef.briefDescription)
            if (compoundDef.briefDescription.children.length > 1) {
                assert(compoundDef.briefDescription.children[1] instanceof ParaDataModel);
                this.briefDescriptionMdxText = workspace.renderElementsArrayToString(compoundDef.briefDescription.children[1].children, 'mdx').trim();
            }
            else {
                this.briefDescriptionMdxText = workspace.renderElementToString(compoundDef.briefDescription, 'mdx').trim();
            }
        }
        if (compoundDef.detailedDescription !== undefined) {
            // console.log(compoundDef.detailedDescription)
            this.detailedDescriptionMdxText = workspace.renderElementToString(compoundDef.detailedDescription, 'mdx').trim();
            // for (const child of compoundDef.detailedDescription.children) {
            //   if (child instanceof Sect1DataModel) {
            //     this.hasSect1InDescription = true
            //     break
            //   }
            // }
        }
        if (this.kind === 'page') {
            // The location for pages is not usable.
        }
        else if (this.kind === 'dir') {
            // The location for folders is not used.
        }
        else {
            if (compoundDef.location !== undefined) {
                this.locationMdxText = this.renderLocationToMdxText(compoundDef.location);
            }
        }
        if (compoundDef.sectionDefs !== undefined) {
            for (const sectionDef of compoundDef.sectionDefs) {
                if (sectionDef.memberDefs !== undefined) {
                    for (const memberDef of sectionDef.memberDefs) {
                        if (memberDef.location !== undefined) {
                            const file = memberDef.location.file;
                            this.locationSet.add(file);
                            if (memberDef.location.bodyfile !== undefined) {
                                this.locationSet.add(memberDef.location.bodyfile);
                            }
                        }
                    }
                }
            }
        }
        if (compoundDef.includes !== undefined) {
            this.includes = compoundDef.includes;
        }
        for (const innerKey of Object.keys(compoundDef)) {
            if (innerKey.startsWith('inner')) {
                if (this.innerCompounds === undefined) {
                    this.innerCompounds = new Map();
                }
                this.innerCompounds.set(innerKey, compoundDef);
            }
        }
    }
    isOperator(name) {
        // Two word operators, like
        if (name.startsWith('operator') && ' =!<>+-*/%&|^~,"(['.includes(name.charAt(8))) {
            return true;
        }
        return false;
    }
    // --------------------------------------------------------------------------
    renderBriefDescriptionToMdxText({ briefDescriptionMdxText, todo = '', morePermalink }) {
        let text = '';
        if (!this.collection.workspace.pluginOptions.suggestToDoDescriptions) {
            todo = '';
        }
        if (briefDescriptionMdxText === undefined && todo.length === 0) {
            return '';
        }
        if (briefDescriptionMdxText !== undefined && briefDescriptionMdxText.length > 0) {
            text += '<p>';
            text += briefDescriptionMdxText;
            if (morePermalink !== undefined && morePermalink.length > 0) {
                text += ` <a href="${morePermalink}">`;
                text += 'More...';
                text += '</a>';
            }
            text += '</p>';
        }
        else if (todo.length > 0) {
            text += `TODO: add <code>@brief</code> to <code>${todo}</code>`;
        }
        return text;
    }
    renderDetailedDescriptionToMdxLines({ briefDescriptionMdxText, detailedDescriptionMdxText, todo = '', showHeader, showBrief = false }) {
        const lines = [];
        if (!this.collection.workspace.pluginOptions.suggestToDoDescriptions) {
            todo = '';
        }
        // const workspace = this.collection.workspace
        if (showHeader) {
            if ((detailedDescriptionMdxText !== undefined && detailedDescriptionMdxText.length > 0) ||
                todo.length > 0 ||
                (showBrief && briefDescriptionMdxText !== undefined && briefDescriptionMdxText.length > 0)) {
                lines.push('');
                lines.push('## Description {#details}');
            }
        }
        if (showBrief) {
            if (showHeader) {
                lines.push('');
            }
            if (briefDescriptionMdxText !== undefined && briefDescriptionMdxText.length > 0) {
                lines.push(`<p>${briefDescriptionMdxText}</p>`);
            }
            else if (todo.length > 0) {
                lines.push(`TODO: add <code>@brief</code> to <code>${todo}</code>`);
            }
        }
        // console.log(util.inspect(detailedDescriptionMdxText, { compact: false, depth: 999 }))
        if (detailedDescriptionMdxText !== undefined && detailedDescriptionMdxText.length > 0) {
            lines.push('');
            lines.push(detailedDescriptionMdxText);
        }
        else if (todo.length > 0) {
            lines.push('');
            lines.push(`TODO: add <code>@details</code> to <code>${todo}</code>`);
        }
        return lines;
    }
    // --------------------------------------------------------------------------
    hasInnerIndices() {
        return (this.innerCompounds !== undefined) && (this.innerCompounds.size > 0);
    }
    renderInnerIndicesToMdxLines({ suffixes = [] }) {
        const lines = [];
        if (this.innerCompounds !== undefined) {
            for (const innerKey of Object.keys(this.innerCompounds)) {
                if (innerKey.startsWith('inner')) {
                    const suffix = innerKey.substring(5);
                    if (!suffixes.includes(suffix)) {
                        console.warn(innerKey, 'not processed for', this.compoundName, 'in renderInnerIndicesMdx');
                        continue;
                    }
                }
            }
        }
        const workspace = this.collection.workspace;
        for (const suffix of suffixes) {
            const innerKey = `inner${suffix}`;
            const innerCompound = this.innerCompounds !== undefined ? (this.innerCompounds.get(innerKey)) : undefined;
            const innerObjects = innerCompound !== undefined ? innerCompound[innerKey] : undefined;
            if (innerObjects !== undefined && innerObjects.length > 0) {
                lines.push('');
                lines.push(`## ${suffix === 'Dirs' ? 'Folders' : (suffix === 'Groups' ? 'Topics' : suffix)} Index`);
                lines.push('');
                lines.push('<table class="doxyMembersIndex">');
                for (const innerObject of innerObjects) {
                    // console.log(util.inspect(innerObject, { compact: false, depth: 999 }))
                    const innerDataObject = workspace.compoundsById.get(innerObject.refid);
                    if (innerDataObject !== undefined) {
                        const kind = innerDataObject.kind;
                        const itemType = kind === 'dir' ? 'folder' : (kind === 'group' ? '&nbsp;' : kind);
                        const permalink = workspace.getPagePermalink(innerObject.refid);
                        const itemName = `<a href="${permalink}">${escapeHtml(innerDataObject.indexName)}</a>`;
                        lines.push('');
                        const childrenLines = [];
                        const morePermalink = innerDataObject.renderDetailedDescriptionToMdxLines !== undefined ? `${permalink}/#details` : undefined;
                        if (innerDataObject.briefDescriptionMdxText !== undefined && innerDataObject.briefDescriptionMdxText.length > 0) {
                            childrenLines.push(this.renderBriefDescriptionToMdxText({
                                briefDescriptionMdxText: innerDataObject.briefDescriptionMdxText,
                                morePermalink
                            }));
                        }
                        lines.push(...this.collection.workspace.renderMembersIndexItemToLines({
                            type: itemType,
                            name: itemName,
                            childrenLines
                        }));
                    }
                    else if (innerObject instanceof InnerClassDataModel) {
                        const itemType = 'class';
                        const itemName = escapeHtml(innerObject.text);
                        lines.push('');
                        lines.push(...this.collection.workspace.renderMembersIndexItemToLines({
                            type: itemType,
                            name: itemName
                        }));
                    }
                    else {
                        if (this.collection.workspace.pluginOptions.debug) {
                            console.warn(innerObject);
                        }
                        if (this.collection.workspace.pluginOptions.verbose) {
                            console.warn('Object not rendered in renderInnerIndicesToMdxLines()');
                        }
                    }
                }
                lines.push('');
                lines.push('</table>');
            }
        }
        return lines;
    }
    hasSections() {
        return (this.sections !== undefined) && (this.sections.length > 0);
    }
    renderSectionIndicesToMdxLines() {
        const lines = [];
        for (const section of this.sections) {
            // console.log(sectionDef)
            lines.push(...section.renderIndexToMdxLines());
        }
        return lines;
    }
    // --------------------------------------------------------------------------
    renderIncludesIndexToMdxLines() {
        const lines = [];
        const workspace = this.collection.workspace;
        if (this.includes !== undefined) {
            lines.push('');
            lines.push('## Included Headers');
            lines.push('');
            lines.push('<div class="doxyIncludesList">');
            for (const include of this.includes) {
                lines.push(workspace.renderElementToString(include, 'mdx'));
            }
            lines.push('</div>');
        }
        return lines;
    }
    // --------------------------------------------------------------------------
    renderSectionsToMdxLines() {
        const lines = [];
        if (this.sections !== undefined) {
            for (const section of this.sections) {
                lines.push(...section.renderToLines());
            }
        }
        return lines;
    }
    renderLocationToMdxText(location) {
        let text = '';
        const workspace = this.collection.workspace;
        if (location !== undefined) {
            // console.log('location.file:', location.file)
            if (location.file.includes('[')) {
                // Ignore cases like `[generated]`, encountered in llvm.
                return text;
            }
            const files = workspace.viewModel.get('files');
            assert(files !== undefined);
            // console.log('renderLocationToMdxText', this.kind, this.compoundName, this.id)
            const file = files.filesByPath.get(location.file);
            if (file !== undefined) {
                const permalink = workspace.getPagePermalink(file.id);
                text += '\n';
                if (location.bodyfile !== undefined && location.file !== location.bodyfile) {
                    text += 'Declaration ';
                    if (location.line !== undefined) {
                        text += 'at line ';
                        const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`;
                        if (!file.listingLineNumbers.has(location.line)) {
                            text += location.line?.toString();
                        }
                        else {
                            text += `<a href="${permalink}/#${lineAttribute}">${escapeMdx(location.line?.toString() ?? '?')}</a>`;
                        }
                        text += ' of file ';
                    }
                    else {
                        text += ' in file ';
                    }
                    text += `<a href="${permalink}">${escapeMdx(path.basename(location.file))}</a>`;
                    const definitionFile = files.filesByPath.get(location.bodyfile);
                    if (definitionFile !== undefined) {
                        const definitionPermalink = workspace.getPagePermalink(definitionFile.id);
                        text += ', definition ';
                        if (location.bodystart !== undefined) {
                            text += 'at line ';
                            const lineStart = `l${location.bodystart?.toString().padStart(5, '0')}`;
                            if (!definitionFile.listingLineNumbers.has(location.bodystart)) {
                                text += location.bodystart?.toString();
                            }
                            else {
                                text += `<a href="${definitionPermalink}/#${lineStart}">${escapeMdx(location.bodystart?.toString() ?? '?')}</a>`;
                            }
                            text += ' of file ';
                        }
                        else {
                            text += ' in file ';
                        }
                        text += `<a href="${definitionPermalink}">${escapeMdx(path.basename(location.bodyfile))}</a>`;
                    }
                    else {
                        if (this.collection.workspace.pluginOptions.verbose) {
                            console.warn('File', location.bodyfile, 'not a location.');
                        }
                    }
                    text += '.';
                }
                else {
                    text += 'Definition ';
                    if (location.line !== undefined) {
                        text += 'at line ';
                        const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`;
                        if (!file.listingLineNumbers.has(location.line)) {
                            text += location.line?.toString();
                        }
                        else {
                            text += `<a href="${permalink}/#${lineAttribute}">${escapeMdx(location.line?.toString() ?? '?')}</a>`;
                        }
                        text += ' of file ';
                    }
                    else {
                        text += ' in file ';
                    }
                    text += `<a href="${permalink}">${escapeMdx(path.basename(location.file))}</a>`;
                    text += '.';
                }
            }
            else {
                if (this.collection.workspace.pluginOptions.verbose) {
                    console.warn('File', location.file, 'not a known location.');
                }
            }
        }
        return text;
    }
    renderGeneratedFromToMdxLines() {
        const lines = [];
        if (this.locationSet.size > 0) {
            lines.push('');
            lines.push('<hr/>');
            lines.push('');
            lines.push(`The documentation for this ${this.kind} was generated from the following file${this.locationSet.size > 1 ? 's' : ''}:`);
            lines.push('');
            lines.push('<ul>');
            const workspace = this.collection.workspace;
            const files = workspace.viewModel.get('files');
            const sortedFiles = [...this.locationSet].sort((a, b) => a.localeCompare(b));
            for (const fileName of sortedFiles) {
                // console.log('search', fileName)
                const file = files.filesByPath.get(fileName);
                if (file !== undefined) {
                    const permalink = workspace.getPagePermalink(file.id);
                    if (permalink !== undefined && permalink.length > 0) {
                        lines.push(`<li><a href="${permalink}">${path.basename(fileName)}</a></li>`);
                    }
                    else {
                        lines.push(`<li>${path.basename(fileName)}</li>`);
                    }
                }
                else {
                    lines.push(`<li>${path.basename(fileName)}</li>`);
                }
            }
            lines.push('</ul>');
        }
        return lines;
    }
    // --------------------------------------------------------------------------
    /**
     * Return an array of types, like `class T`, or `class U = T`, or `N T::* MP`
     * @param templateParamList
     * @returns
     */
    collectTemplateParameters({ templateParamList, withDefaults = false }) {
        if (templateParamList?.params === undefined) {
            return [];
        }
        const templateParameters = [];
        for (const param of templateParamList.params) {
            // console.log(util.inspect(param, { compact: false, depth: 999 }))
            assert(param.type !== undefined);
            let paramString = '';
            for (const child of param.type.children) {
                if (typeof child === 'string') {
                    paramString += child;
                }
                else if (child instanceof RefTextDataModel) {
                    paramString += child.text;
                }
            }
            if (param.declname !== undefined) {
                paramString += ` ${param.declname}`;
            }
            if (withDefaults) {
                if (param.defval !== undefined) {
                    const defval = param.defval;
                    paramString += ' = ';
                    for (const child of defval.children) {
                        if (typeof child === 'string') {
                            paramString += child;
                        }
                        else if (child instanceof RefTextDataModel) {
                            paramString += child.text;
                        }
                    }
                }
            }
            templateParameters.push(paramString);
        }
        return templateParameters;
    }
    isTemplate(templateParamList) {
        return (templateParamList?.params ?? []).length > 0;
    }
    collectTemplateParameterNames(templateParamList) {
        if (templateParamList?.params === undefined) {
            return [];
        }
        const templateParameterNames = [];
        for (const param of templateParamList.params) {
            // console.log(util.inspect(param, { compact: false, depth: 999 }))
            assert(param.type !== undefined);
            let paramString = '';
            // declname? defname? order?
            if (param.declname !== undefined) {
                paramString += param.declname;
            }
            else {
                for (const child of param.type.children) {
                    if (typeof child === 'string') {
                        // Extract the parameter name, passed as `class T`.
                        paramString += child;
                    }
                    else if (child instanceof RefTextDataModel) {
                        paramString += child.text;
                    }
                }
            }
            const paramName = paramString.replaceAll(/class /g, '').replaceAll(/typename /g, '');
            templateParameterNames.push(paramName);
        }
        return templateParameterNames;
    }
    renderTemplateParametersToMdxText({ templateParamList, withDefaults = false }) {
        let text = '';
        if (templateParamList?.params !== undefined) {
            const templateParameters = this.collectTemplateParameters({
                templateParamList,
                withDefaults
            });
            if (templateParameters.length > 0) {
                text += `<${templateParameters.join(', ')}>`;
            }
        }
        return text;
    }
    renderTemplateParameterNamesToMdxText(templateParamList) {
        let text = '';
        if (templateParamList?.params !== undefined) {
            const templateParameterNames = this.collectTemplateParameterNames(templateParamList);
            if (templateParameterNames.length > 0) {
                text += `<${templateParameterNames.join(', ')}>`;
            }
        }
        return text;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=compound-base-vm.js.map