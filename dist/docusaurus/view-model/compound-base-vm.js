import assert from 'node:assert';
import path from 'node:path';
import { ParaDataModel } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
import { joinWithLast, sanitizeAnonymousNamespace } from '../utils.js';
import { Section } from './members-vm.js';
import { RefTextDataModel } from '../../doxygen/data-model/compounds/reftexttype-dm.js';
import { SectionDefByKindDataModel, } from '../../doxygen/data-model/compounds/sectiondeftype-dm.js';
export class CompoundBase {
    kind = '';
    compoundName = '';
    id = '';
    collection;
    titleHtmlString;
    locationFilePath;
    parent;
    childrenIds = [];
    children = [];
    docusaurusId;
    sidebarLabel;
    relativePermalink;
    indexName = '';
    treeEntryName = '';
    pageTitle = '';
    briefDescriptionHtmlString;
    detailedDescriptionHtmlLines;
    hasSect1InDescription = false;
    locationLines;
    sections = [];
    locationSet = new Set();
    includes;
    innerCompounds;
    _private = {};
    constructor(collection, compoundDef) {
        this._private._compoundDef = compoundDef;
        this.collection = collection;
        const { kind, compoundName, id } = compoundDef;
        this.kind = kind;
        this.compoundName = sanitizeAnonymousNamespace(compoundName);
        this.id = id;
        if (compoundDef.title !== undefined) {
            this.titleHtmlString = this.collection.workspace.renderString(compoundDef.title, 'html');
        }
        if (compoundDef.location?.file !== undefined) {
            const { file } = compoundDef.location;
            this.locationFilePath = file;
        }
    }
    createSections(classUnqualifiedName) {
        const reorderedSectionDefs = this.reorderSectionDefs(classUnqualifiedName);
        if (reorderedSectionDefs !== undefined) {
            const sections = [];
            for (const sectionDef of reorderedSectionDefs) {
                sections.push(new Section(this, sectionDef));
            }
            this.sections = sections.sort((a, b) => a.getSectionOrderByKind() - b.getSectionOrderByKind());
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
            if (sectionDef.kind === 'user-defined' &&
                sectionDef.header !== undefined) {
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
                    mapSectionDef.memberDefs ??= [];
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
                    mapSectionDef.members ??= [];
                    mapSectionDef.members.push(member);
                }
            }
        }
        resultSectionDefs.push(...sectionDefsByKind.values());
        return resultSectionDefs;
    }
    adjustSectionKind(sectionDef, memberBase, classUnqualifiedName) {
        let adjustedSectionKind = memberBase.kind;
        switch (memberBase.kind) {
            case 'function':
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
            default: {
                const { kind } = memberBase;
                adjustedSectionKind = kind;
                break;
            }
        }
        return adjustedSectionKind;
    }
    initializeLate() {
        const { workspace } = this.collection;
        const compoundDef = this._private._compoundDef;
        assert(compoundDef !== undefined);
        if (compoundDef.briefDescription !== undefined) {
            assert(compoundDef.briefDescription.children !== undefined);
            if (compoundDef.briefDescription.children.length > 1) {
                assert(compoundDef.briefDescription.children[1] instanceof ParaDataModel);
                this.briefDescriptionHtmlString = workspace
                    .renderElementsArrayToString(compoundDef.briefDescription.children[1].children, 'html')
                    .trim();
            }
            else {
                this.briefDescriptionHtmlString = workspace
                    .renderElementToString(compoundDef.briefDescription, 'html')
                    .trim();
            }
        }
        if (compoundDef.detailedDescription !== undefined) {
            this.detailedDescriptionHtmlLines = workspace.renderElementToLines(compoundDef.detailedDescription, 'html');
        }
        if (this.kind === 'page') {
        }
        else if (this.kind === 'dir') {
        }
        else {
            if (compoundDef.location !== undefined) {
                this.locationLines = this.renderLocationToLines(compoundDef.location);
            }
        }
        if (compoundDef.sectionDefs !== undefined) {
            for (const sectionDef of compoundDef.sectionDefs) {
                if (sectionDef.memberDefs !== undefined) {
                    for (const memberDef of sectionDef.memberDefs) {
                        if (memberDef.location !== undefined) {
                            const { file } = memberDef.location;
                            this.locationSet.add(file);
                            if (memberDef.location.bodyfile !== undefined) {
                                this.locationSet.add(memberDef.location.bodyfile);
                            }
                        }
                    }
                }
            }
        }
        const { includes } = compoundDef;
        if (includes !== undefined) {
            this.includes = includes;
        }
        for (const innerKey of Object.keys(compoundDef)) {
            if (innerKey.startsWith('inner') &&
                compoundDef[innerKey] !== undefined) {
                this.innerCompounds ??= new Map();
                this.innerCompounds.set(innerKey, compoundDef);
            }
        }
    }
    isOperator(name) {
        if (name.startsWith('operator') &&
            ' =!<>+-*/%&|^~,"(['.includes(name.charAt(8))) {
            return true;
        }
        return false;
    }
    renderBriefDescriptionToHtmlString({ briefDescriptionHtmlString, todo = '', morePermalink, }) {
        let text = '';
        if (!this.collection.workspace.options.suggestToDoDescriptions) {
            todo = '';
        }
        if (briefDescriptionHtmlString === undefined && todo.length === 0) {
            return '';
        }
        if (briefDescriptionHtmlString !== undefined &&
            briefDescriptionHtmlString.length > 0) {
            text += '<p>';
            text += briefDescriptionHtmlString;
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
    renderDetailedDescriptionToHtmlLines({ briefDescriptionHtmlString, detailedDescriptionHtmlLines, todo = '', showHeader, showBrief = false, }) {
        const lines = [];
        if (!this.collection.workspace.options.suggestToDoDescriptions) {
            todo = '';
        }
        if (showHeader) {
            if ((detailedDescriptionHtmlLines !== undefined &&
                detailedDescriptionHtmlLines.length > 0) ||
                todo.length > 0 ||
                (showBrief &&
                    briefDescriptionHtmlString !== undefined &&
                    briefDescriptionHtmlString.length > 0)) {
                lines.push('');
                lines.push('## Description {#details}');
            }
        }
        if (showBrief) {
            if (showHeader) {
                lines.push('');
            }
            if (briefDescriptionHtmlString !== undefined &&
                briefDescriptionHtmlString.length > 0) {
                lines.push(`<p>${briefDescriptionHtmlString}</p>`);
            }
            else if (todo.length > 0) {
                lines.push(`TODO: add <code>@brief</code> to <code>${todo}</code>`);
            }
        }
        if (detailedDescriptionHtmlLines !== undefined &&
            detailedDescriptionHtmlLines.length > 0) {
            lines.push('');
            lines.push(...detailedDescriptionHtmlLines);
        }
        else if (todo.length > 0) {
            lines.push('');
            lines.push(`TODO: add <code>@details</code> to <code>${todo}</code>`);
        }
        return lines;
    }
    hasInnerIndices() {
        return this.innerCompounds !== undefined && this.innerCompounds.size > 0;
    }
    renderInnerIndicesToLines({ suffixes = [], }) {
        const lines = [];
        if (this.innerCompounds === undefined) {
            return [];
        }
        for (const innerKey of Object.keys(this.innerCompounds)) {
            if (innerKey.startsWith('inner')) {
                const suffix = innerKey.substring(5);
                if (!suffixes.includes(suffix)) {
                    console.warn(innerKey, 'not processed for', this.compoundName, 'in renderInnerIndicesToLines');
                    continue;
                }
            }
        }
        const { workspace } = this.collection;
        for (const suffix of suffixes) {
            const innerKey = `inner${suffix}`;
            const innerCompound = this.innerCompounds.get(innerKey);
            if (innerCompound === undefined) {
                continue;
            }
            const innerObjects = innerCompound[innerKey];
            if (innerObjects === undefined || innerObjects.length === 0) {
                continue;
            }
            lines.push('');
            lines.push(`## ${suffix === 'Dirs'
                ? 'Folders'
                : suffix === 'Groups'
                    ? 'Topics'
                    : suffix} Index`);
            lines.push('');
            lines.push('<table class="doxyMembersIndex">');
            for (const innerObject of innerObjects) {
                const innerDataObject = workspace.compoundsById.get(innerObject.refid);
                if (innerDataObject !== undefined) {
                    const { kind } = innerDataObject;
                    const itemType = kind === 'dir' ? 'folder' : kind === 'group' ? '&nbsp;' : kind;
                    const permalink = workspace.getPagePermalink(innerObject.refid);
                    const name = this.collection.workspace.renderString(innerDataObject.indexName, 'html');
                    let itemName = '';
                    if (permalink !== undefined && permalink.length > 0) {
                        itemName = `<a href="${permalink}">${name}</a>`;
                    }
                    else {
                        itemName = name;
                    }
                    const childrenLines = [];
                    const morePermalink = innerDataObject.detailedDescriptionHtmlLines !== undefined
                        ? `${permalink}/#details`
                        : undefined;
                    if (innerDataObject.briefDescriptionHtmlString !== undefined &&
                        innerDataObject.briefDescriptionHtmlString.length > 0) {
                        childrenLines.push(this.renderBriefDescriptionToHtmlString({
                            briefDescriptionHtmlString: innerDataObject.briefDescriptionHtmlString,
                            morePermalink,
                        }));
                    }
                    lines.push('');
                    lines.push(...this.collection.workspace.renderMembersIndexItemToHtmlLines({
                        type: itemType,
                        name: itemName,
                        childrenLines,
                    }));
                }
                else {
                    lines.push('');
                    const itemType = 'class';
                    const { text: itemName } = innerObject;
                    lines.push(...this.collection.workspace.renderMembersIndexItemToHtmlLines({
                        type: itemType,
                        name: itemName,
                        childrenLines: [],
                    }));
                    if (this.collection.workspace.options.debug) {
                        console.warn(innerObject);
                    }
                    if (this.collection.workspace.options.verbose) {
                        console.warn('Object definition not found, rendered summarily in ' +
                            'renderInnerIndicesToLines()');
                    }
                }
            }
            lines.push('');
            lines.push('</table>');
        }
        return lines;
    }
    hasSections() {
        return this.sections.length > 0;
    }
    renderSectionIndicesToLines() {
        const lines = [];
        for (const section of this.sections) {
            lines.push(...section.renderIndexToLines());
        }
        return lines;
    }
    renderIncludesIndexToLines() {
        const lines = [];
        const { workspace } = this.collection;
        if (this.includes !== undefined) {
            const includeLines = workspace.renderElementsArrayToLines(this.includes, 'html');
            lines.push('');
            lines.push('## Included Headers');
            lines.push('');
            lines.push(`<div class="doxyIncludesList">${includeLines[0]}`);
            for (const includeLine of includeLines.slice(1)) {
                lines.push(includeLine);
            }
            lines.push('</div>');
        }
        return lines;
    }
    renderSectionsToLines() {
        const lines = [];
        for (const section of this.sections) {
            lines.push(...section.renderToLines());
        }
        return lines;
    }
    renderLocationToLines(location) {
        const lines = [];
        let text = '';
        const { workspace } = this.collection;
        if (location !== undefined) {
            if (location.file.includes('[')) {
                return lines;
            }
            const file = workspace.filesByPath.get(location.file);
            if (file !== undefined) {
                const permalink = workspace.getPagePermalink(file.id);
                if (location.bodyfile !== undefined &&
                    location.file !== location.bodyfile) {
                    text += '<p>';
                    text += 'Declaration ';
                    if (location.line !== undefined) {
                        text += 'at line ';
                        const paddedLine = location.line.toString().padStart(5, '0');
                        const lineAttribute = `l${paddedLine}`;
                        if (permalink !== undefined &&
                            permalink.length > 0 &&
                            file.listingLineNumbers.has(location.line.valueOf())) {
                            text +=
                                `<a href="${permalink}/#${lineAttribute}">` +
                                    workspace.renderString(location.line.toString(), 'html') +
                                    `</a>`;
                        }
                        else {
                            text += location.line.toString();
                        }
                        text += ' of file ';
                    }
                    else {
                        text += ' in file ';
                    }
                    const locationFile = workspace.renderString(path.basename(location.file), 'html');
                    if (permalink !== undefined && permalink.length > 0) {
                        text += `<a href="${permalink}">${locationFile}</a>`;
                    }
                    else {
                        text += locationFile;
                    }
                    const definitionFile = workspace.filesByPath.get(location.bodyfile);
                    if (definitionFile !== undefined) {
                        const definitionPermalink = workspace.getPagePermalink(definitionFile.id);
                        text += ', definition ';
                        if (location.bodystart !== undefined) {
                            text += 'at line ';
                            const lineStart = `l${location.bodystart
                                .toString()
                                .padStart(5, '0')}`;
                            if (definitionPermalink !== undefined &&
                                definitionPermalink.length > 0 &&
                                definitionFile.listingLineNumbers.has(location.bodystart.valueOf())) {
                                const bodyStart = workspace.renderString(location.bodystart.toString(), 'html');
                                text +=
                                    `<a href="${definitionPermalink}/#${lineStart}">` +
                                        bodyStart +
                                        '</a>';
                            }
                            else {
                                text += location.bodystart.toString();
                            }
                            text += ' of file ';
                        }
                        else {
                            text += ' in file ';
                        }
                        const locationBodyFile = workspace.renderString(path.basename(location.bodyfile), 'html');
                        if (definitionPermalink !== undefined &&
                            definitionPermalink.length > 0) {
                            text += `<a href="${definitionPermalink}">${locationBodyFile}</a>`;
                        }
                        else {
                            text += locationBodyFile;
                        }
                    }
                    else {
                        if (this.collection.workspace.options.verbose) {
                            console.warn('File', location.bodyfile, 'not a location.');
                        }
                    }
                    text += '.';
                    text += '</p>';
                    text += '\n';
                }
                else {
                    text += '<p>';
                    text += 'Definition ';
                    if (location.line !== undefined) {
                        text += 'at line ';
                        const paddedLine = location.line.toString().padStart(5, '0');
                        const lineAttribute = `l${paddedLine}`;
                        if (permalink !== undefined &&
                            permalink.length > 0 &&
                            file.listingLineNumbers.has(location.line.valueOf())) {
                            const lineStr = location.line.toString();
                            const lineHtml = workspace.renderString(lineStr, 'html');
                            text += `<a href="${permalink}/#${lineAttribute}">${lineHtml}</a>`;
                        }
                        else {
                            text += location.line.toString();
                        }
                        text += ' of file ';
                    }
                    else {
                        text += ' in file ';
                    }
                    const locationFile = workspace.renderString(path.basename(location.file), 'html');
                    if (permalink !== undefined && permalink.length > 0) {
                        text += `<a href="${permalink}">${locationFile}</a>`;
                    }
                    else {
                        text += locationFile;
                    }
                    text += '.';
                    text += '</p>';
                    text += '\n';
                }
            }
            else {
                if (this.collection.workspace.options.verbose) {
                    console.warn('File', location.file, 'not a known location.');
                }
            }
        }
        if (text.length > 0) {
            lines.push('');
            lines.push(text);
        }
        return lines;
    }
    renderGeneratedFromToLines() {
        const lines = [];
        if (this.locationSet.size > 0) {
            lines.push('');
            lines.push('<hr/>');
            lines.push('');
            lines.push(`The documentation for this ${this.kind} was generated from the ` +
                `following file${this.locationSet.size > 1 ? 's' : ''}:`);
            lines.push('');
            lines.push('<ul>');
            const { workspace } = this.collection;
            const sortedFiles = [...this.locationSet].sort((a, b) => a.localeCompare(b));
            for (const fileName of sortedFiles) {
                const fileNameEscaped = workspace.renderString(path.basename(fileName), 'html');
                const file = workspace.filesByPath.get(fileName);
                if (file !== undefined) {
                    const permalink = workspace.getPagePermalink(file.id);
                    if (permalink !== undefined && permalink.length > 0) {
                        lines.push(`<li><a href="${permalink}">${fileNameEscaped}</a></li>`);
                    }
                    else {
                        lines.push(`<li>${fileNameEscaped}</li>`);
                    }
                }
                else {
                    lines.push(`<li>${fileNameEscaped}</li>`);
                }
            }
            lines.push('</ul>');
        }
        return lines;
    }
    renderReferencesToHtmlString(references) {
        let text = '';
        if (references === undefined || references.length === 0) {
            return '';
        }
        const { workspace } = this.collection;
        const referenceLines = [];
        for (const reference of references) {
            referenceLines.push(workspace.renderElementToString(reference, 'html'));
        }
        text += '<p>';
        if (referenceLines.length === 1) {
            text += 'Reference ';
        }
        else {
            text += 'References ';
        }
        text += joinWithLast(referenceLines, ', ', ' and ');
        text += '.';
        text += '</p>';
        text += '\n';
        return text;
    }
    renderReferencedByToHtmlString(referencedBy) {
        let text = '';
        if (referencedBy === undefined || referencedBy.length === 0) {
            return '';
        }
        const { workspace } = this.collection;
        const referenceLines = [];
        for (const reference of referencedBy) {
            referenceLines.push(workspace.renderElementToString(reference, 'html'));
        }
        text += '<p>';
        text += 'Referenced by ';
        text += joinWithLast(referenceLines, ', ', ' and ');
        text += '.';
        text += '</p>';
        text += '\n';
        return text;
    }
    collectTemplateParameters({ templateParamList, withDefaults = false, }) {
        if (templateParamList?.params === undefined) {
            return [];
        }
        const templateParameters = [];
        for (const param of templateParamList.params) {
            assert(param.type !== undefined);
            let paramString = '';
            assert(param.type.children !== undefined);
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
                    assert(defval.children !== undefined);
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
        if (templateParamList.params === undefined) {
            return [];
        }
        const templateParameterNames = [];
        for (const param of templateParamList.params) {
            assert(param.type !== undefined);
            let paramString = '';
            if (param.declname !== undefined) {
                paramString += param.declname;
            }
            else {
                assert(param.type.children !== undefined);
                for (const child of param.type.children) {
                    if (typeof child === 'string') {
                        paramString += child;
                    }
                    else if (child instanceof RefTextDataModel) {
                        paramString += child.text;
                    }
                }
            }
            const paramName = paramString
                .replaceAll(/class /g, '')
                .replaceAll(/typename /g, '');
            templateParameterNames.push(paramName);
        }
        return templateParameterNames;
    }
    renderTemplateParametersToString({ templateParamList, withDefaults = false, }) {
        let text = '';
        if (templateParamList?.params !== undefined) {
            const templateParameters = this.collectTemplateParameters({
                templateParamList,
                withDefaults,
            });
            if (templateParameters.length > 0) {
                text += `<${templateParameters.join(', ')}>`;
            }
        }
        return text;
    }
    renderTemplateParameterNamesToString(templateParamList) {
        let text = '';
        if (templateParamList?.params !== undefined) {
            const templateParameterNames = this.collectTemplateParameterNames(templateParamList);
            if (templateParameterNames.length > 0) {
                text += `<${templateParameterNames.join(', ')}>`;
            }
        }
        return text;
    }
    hasAnyContent() {
        if (this.briefDescriptionHtmlString !== undefined &&
            this.briefDescriptionHtmlString.length > 0) {
            return true;
        }
        if (this.detailedDescriptionHtmlLines !== undefined &&
            this.detailedDescriptionHtmlLines.length > 0) {
            return true;
        }
        if (this.sections.length > 0) {
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=compound-base-vm.js.map