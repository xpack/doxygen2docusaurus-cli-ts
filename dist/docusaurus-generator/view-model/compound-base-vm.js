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
import { Sect1DataModel } from '../../data-model/compounds/descriptiontype-dm.js';
import { escapeMdx } from '../utils.js';
import { RefTextDataModel } from '../../data-model/compounds/reftexttype-dm.js';
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
        /** Relative path to the output folder, starts with plural kind. */
        this.docusaurusId = '';
        /** Short name, to fit the limited space in the sidebar. */
        this.sidebarLabel = '';
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
            this.locationFilePath = compoundDef?.location?.file;
        }
    }
    initializeLate() {
        const workspace = this.collection.workspace;
        const compoundDef = this._private._compoundDef;
        assert(compoundDef !== undefined);
        if (compoundDef.briefDescription !== undefined) {
            this.briefDescriptionMdxText = workspace.renderElementToMdxText(compoundDef.briefDescription);
        }
        if (compoundDef.detailedDescription !== undefined) {
            this.detailedDescriptionMdxText = workspace.renderElementToMdxText(compoundDef.detailedDescription);
            for (const child of compoundDef.detailedDescription.children) {
                if (child instanceof Sect1DataModel) {
                    this.hasSect1InDescription = true;
                    break;
                }
            }
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
    // --------------------------------------------------------------------------
    renderBriefDescriptionToMdxText({ briefDescriptionMdxText = this.briefDescriptionMdxText, todo = '', morePermalink } = {}) {
        let text = '';
        // console.log(this
        if (briefDescriptionMdxText === undefined && todo.length === 0) {
            return '';
        }
        if (briefDescriptionMdxText !== undefined && briefDescriptionMdxText.length > 0) {
            text += briefDescriptionMdxText;
            if (morePermalink !== undefined && morePermalink.length > 0) {
                text += ` <Link to="${morePermalink}">`;
                text += 'More...';
                text += '</Link>';
            }
        }
        else if (todo.length > 0) {
            text += `TODO: add <code>@brief</code> to <code>${todo}</code>`;
        }
        return text;
    }
    renderDetailedDescriptionToMdxLines({ detailedDescriptionMdxText = this.detailedDescriptionMdxText, todo = '', showHeader = true, showBrief = false }) {
        const lines = [];
        // const workspace = this.collection.workspace
        if (showHeader) {
            if ((detailedDescriptionMdxText !== undefined && detailedDescriptionMdxText.length > 0) ||
                todo.length > 0 ||
                (showBrief && this.briefDescriptionMdxText !== undefined && this.briefDescriptionMdxText.length > 0)) {
                lines.push('');
                lines.push('## Description {#details}');
            }
        }
        if (showBrief) {
            lines.push('');
            lines.push(this.renderBriefDescriptionToMdxText());
        }
        // Do not repeat the brief in the detailed section. (configurable for Doxygen)
        // console.log(util.inspect(compoundDef.detailedDescription, { compact: false, depth: 999 }))
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
                lines.push('<MembersIndex>');
                for (const innerObject of innerObjects) {
                    // console.log(util.inspect(innerObject, { compact: false, depth: 999 }))
                    const innerDataObject = workspace.compoundsById.get(innerObject.refid);
                    assert(innerDataObject !== undefined);
                    const permalink = workspace.getPagePermalink(innerObject.refid);
                    const kind = innerDataObject.kind;
                    const itemType = kind === 'dir' ? 'folder' : (kind === 'group' ? '&nbsp;' : kind);
                    const itemName = `<Link to="${permalink}">${escapeMdx(innerDataObject.indexName)}</Link>`;
                    lines.push('');
                    lines.push('<MembersIndexItem');
                    lines.push(`  type="${itemType}"`);
                    lines.push(`  name={${itemName}}>`);
                    const morePermalink = innerDataObject.renderDetailedDescriptionToMdxLines !== undefined ? `${permalink}/#details` : undefined;
                    if (innerDataObject.briefDescriptionMdxText !== undefined && innerDataObject.briefDescriptionMdxText.length > 0) {
                        lines.push(this.renderBriefDescriptionToMdxText({
                            briefDescriptionMdxText: innerDataObject.briefDescriptionMdxText,
                            morePermalink
                        }));
                    }
                    lines.push('</MembersIndexItem>');
                }
                lines.push('');
                lines.push('</MembersIndex>');
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
            lines.push('<IncludesList>');
            for (const include of this.includes) {
                lines.push(workspace.renderElementToMdxText(include));
            }
            lines.push('</IncludesList>');
        }
        return lines;
    }
    // --------------------------------------------------------------------------
    renderSectionsToMdxLines() {
        const lines = [];
        if (this.sections !== undefined) {
            for (const section of this.sections) {
                lines.push(...section.renderToMdxLines());
            }
        }
        return lines;
    }
    renderLocationToMdxText(location) {
        let text = '';
        const workspace = this.collection.workspace;
        if (location !== undefined) {
            // console.log(location.file)
            const files = workspace.viewModel.get('files');
            assert(files !== undefined);
            // console.log('renderLocationToMdxText', this.kind, this.compoundName)
            const file = files.filesByPath.get(location.file);
            assert(file !== undefined);
            const permalink = workspace.getPagePermalink(file.id);
            text += '\n';
            if (location.bodyfile !== undefined && location.file !== location.bodyfile) {
                text += 'Declaration at line ';
                const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`;
                text += `<Link to="${permalink}/#${lineAttribute}">${escapeMdx(location.line?.toString() ?? '?')}</Link>`;
                text += ' of file ';
                text += `<Link to="${permalink}">${escapeMdx(path.basename(location.file))}</Link>`;
                const definitionFile = files.filesByPath.get(location.bodyfile);
                assert(definitionFile !== undefined);
                const definitionPermalink = workspace.getPagePermalink(definitionFile.id);
                text += ', definition at line ';
                const lineStart = `l${location.bodystart?.toString().padStart(5, '0')}`;
                text += `<Link to="${definitionPermalink}/#${lineStart}">${escapeMdx(location.bodystart?.toString() ?? '?')}</Link>`;
                text += ' of file ';
                text += `<Link to="${definitionPermalink}">${escapeMdx(path.basename(location.bodyfile))}</Link>`;
                text += '.';
            }
            else {
                text += 'Definition at line ';
                const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`;
                text += `<Link to="${permalink}/#${lineAttribute}">${escapeMdx(location.line?.toString() ?? '?')}</Link>`;
                text += ' of file ';
                text += `<Link to="${permalink}">${escapeMdx(path.basename(location.file))}</Link>`;
                text += '.';
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
            const sortedFiles = [...this.locationSet].sort();
            for (const fileName of sortedFiles) {
                const file = files.filesByPath.get(fileName);
                assert(file !== undefined);
                const permalink = workspace.getPagePermalink(file.id);
                lines.push(`<li><Link to="${permalink}">${path.basename(fileName)}</Link></li>`);
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
                if (param.declname !== undefined) {
                    paramString += ` ${param.declname}`;
                }
                if (withDefaults) {
                    if (param.defval !== undefined) {
                        const defval = param.defval;
                        assert(defval.children.length === 1);
                        if (typeof defval.children[0] === 'string') {
                            paramString += ` = ${defval.children[0]}`;
                        }
                        else if (defval.children[0] instanceof RefTextDataModel) {
                            paramString += ` = ${defval.children[0].text}`;
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
            assert(param.type.children.length === 1);
            assert(typeof param.type.children[0] === 'string');
            let paramName = '';
            let paramString = '';
            // declname or defname?
            if (param.declname !== undefined) {
                paramString = param.declname;
            }
            else if (typeof param.type.children[0] === 'string') {
                // Extract the parameter name, passed as `class T`.
                paramString = param.type.children[0];
            }
            else if (param.type.children[0] instanceof RefTextDataModel) {
                paramString = param.type.children[0].text;
            }
            paramName = paramString.replace(/class /, '');
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
