import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ParaDataModel } from '../doxygen/data-model/compounds/descriptiontype-dm.js';
import { Renderers } from './renderers/renderers.js';
import { DoxygenFileOptions } from './view-model/options.js';
import { stripPermalinkHexAnchor, getPermalinkAnchor, stripPermalinkTextAnchor, } from './utils.js';
import { ViewModel } from './view-model/view-model.js';
export class Workspace extends Renderers {
    options;
    dataModel;
    viewModel;
    projectPath;
    doxygenOptions;
    absoluteBaseUrl;
    pageBaseUrl;
    slugBaseUrl;
    menuBaseUrl;
    outputFolderPath;
    sidebarBaseId;
    mainPage;
    filesByPath = new Map();
    indicesMaps = new Map();
    writtenMdFilesCounter = 0;
    writtenHtmlFilesCounter = 0;
    collectionNamesByKind = {
        class: 'classes',
        struct: 'classes',
        union: 'classes',
        file: 'files',
        namespace: 'namespaces',
        group: 'groups',
        page: 'pages',
        dir: 'files',
        concept: 'concepts',
    };
    sidebarCollectionNames = [
        'groups',
        'namespaces',
        'concepts',
        'classes',
        'files',
        'pages',
    ];
    constructor(dataModel) {
        super();
        console.log();
        this.dataModel = dataModel;
        this.options = dataModel.options;
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        this.projectPath = path.dirname(path.dirname(__dirname));
        this.doxygenOptions = new DoxygenFileOptions(this.dataModel.doxyfile?.options);
        const docsFolderPath = this.options.docsFolderPath
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        const apiFolderPath = this.options.apiFolderPath
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        this.outputFolderPath = `${docsFolderPath}/${apiFolderPath}/`;
        this.sidebarBaseId = `${apiFolderPath}/`;
        const docsBaseUrl = this.options.docsBaseUrl
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        let apiBaseUrl = this.options.apiBaseUrl
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        if (apiBaseUrl.length > 0) {
            apiBaseUrl += '/';
        }
        const baseUrl = this.options.baseUrl;
        this.absoluteBaseUrl = `${baseUrl}${docsBaseUrl}/${apiBaseUrl}`;
        this.pageBaseUrl = `${baseUrl}${docsBaseUrl}/${apiBaseUrl}`;
        this.slugBaseUrl = `/${apiBaseUrl}`;
        this.menuBaseUrl = `/${docsBaseUrl}/${apiBaseUrl}`;
        this.registerRenderers(this);
        this.viewModel = new ViewModel(this);
        this.viewModel.create();
    }
    async writeOutputMdFile({ filePath, bodyLines, frontMatter, frontMatterCodeLines, title, pagePermalink, }) {
        const lines = [];
        lines.push('');
        lines.push('<div class="doxyPage">');
        if (frontMatter.title === undefined && title !== undefined) {
            lines.push('');
            lines.push(`# ${title}`);
        }
        lines.push('');
        lines.push(...bodyLines);
        lines.push('');
        lines.push('<hr/>');
        lines.push('');
        assert(this.dataModel.doxygenindex?.version !== undefined);
        assert(this.dataModel.projectVersion !== undefined);
        lines.push('<p class="doxyGeneratedBy">Generated via ' +
            '<a href="https://xpack.github.io/doxygen2docusaurus">' +
            'doxygen2docusaurus</a> ' +
            this.dataModel.projectVersion +
            ' by ' +
            '<a href="https://www.doxygen.nl">Doxygen</a> ' +
            this.dataModel.doxygenindex.version +
            '.' +
            '</p>');
        lines.push('');
        lines.push('</div>');
        lines.push('');
        let text = lines.join('\n');
        if (pagePermalink !== undefined && pagePermalink.length > 0) {
            text = text.replaceAll(`"${pagePermalink}/#`, '"#');
        }
        const frontMatterLines = [];
        frontMatterLines.push('---');
        frontMatterLines.push('');
        frontMatterLines.push('# DO NOT EDIT!');
        frontMatterLines.push('# Automatically generated via doxygen2docusaurus by Doxygen.');
        frontMatterLines.push('');
        for (const [key, value] of Object.entries(frontMatter)) {
            if (Array.isArray(value)) {
                frontMatterLines.push(`${key}:`);
                for (const arrayValue of value) {
                    frontMatterLines.push(`  - ${arrayValue}`);
                }
            }
            else if (typeof value === 'boolean') {
                frontMatterLines.push(`${key}: ${value ? 'true' : 'false'}`);
            }
            else if (value == null) {
                frontMatterLines.push(`${key}: null`);
            }
            else {
                frontMatterLines.push(`${key}: ${value.toString()}`);
            }
        }
        frontMatterLines.push('');
        frontMatterLines.push('---');
        frontMatterLines.push('');
        if (frontMatterCodeLines !== undefined && frontMatterCodeLines.length > 0) {
            frontMatterLines.push('');
            for (const line of frontMatterCodeLines) {
                frontMatterLines.push(line);
            }
        }
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        const fileHandle = await fs.open(filePath, 'ax');
        await fileHandle.write(frontMatterLines.join('\n'));
        await fileHandle.write(text);
        await fileHandle.close();
        this.writtenMdFilesCounter += 1;
    }
    skipElementsPara(elements) {
        if (elements === undefined) {
            return;
        }
        for (const child of elements) {
            if (child instanceof ParaDataModel) {
                child.skipPara = true;
            }
        }
    }
    getPermalink({ refid, kindref, }) {
        let permalink = undefined;
        if (refid == undefined || refid.length === 0) {
            return undefined;
        }
        if (kindref === 'compound') {
            permalink = this.getPagePermalink(refid);
        }
        else if (kindref === 'member') {
            const anchor = getPermalinkAnchor(refid);
            const compoundId = stripPermalinkHexAnchor(refid);
            permalink = this.getPagePermalink(compoundId, true);
            if (permalink !== undefined) {
                permalink += `/#${anchor}`;
            }
            else {
                const tocItem = this.viewModel.descriptionTocItemsById.get(refid);
                if (tocItem !== undefined) {
                    const { tocList } = tocItem;
                    permalink = this.getPagePermalink(tocList.compound.id);
                    if (permalink !== undefined) {
                        permalink += `/#${anchor}`;
                    }
                    else {
                        console.error('Unknown permalink of', tocList.compound.id, 'for', refid, 'in', this.constructor.name, 'getPermalink');
                    }
                }
                else {
                    const descriptionSection = this.viewModel.descriptionAnchorsById.get(refid);
                    if (descriptionSection !== undefined) {
                        permalink = this.getPagePermalink(descriptionSection.compound.id);
                        if (permalink !== undefined) {
                            permalink += `/#${anchor}`;
                        }
                        else {
                            console.error('Unknown permalink of', descriptionSection.compound.id, 'for', refid, 'in', this.constructor.name, 'getPermalink');
                        }
                    }
                    else {
                        console.error('Unknown permalink for', refid, 'in', this.constructor.name, 'getPermalink');
                    }
                }
            }
        }
        else if (kindref === 'xrefsect') {
            const anchor = getPermalinkAnchor(refid);
            const compoundId = stripPermalinkTextAnchor(refid);
            permalink = this.getPagePermalink(compoundId, true);
            if (permalink !== undefined) {
                permalink += `/#${anchor}`;
            }
            else {
                console.error('Unknown permalink for', refid, 'in', this.constructor.name, 'getPermalink');
            }
        }
        else {
            console.error('Unsupported kindref', kindref, 'for', refid, 'in', this.constructor.name, 'getPermalink');
        }
        return permalink;
    }
    getPagePermalink(refid, noWarn = false) {
        const dataObject = this.viewModel.compoundsById.get(refid);
        if (dataObject === undefined) {
            if (this.options.debug && !noWarn) {
                console.warn('refid', refid, 'is not a known compound, no permalink');
            }
            return undefined;
        }
        const pagePermalink = dataObject.relativePermalink;
        if (pagePermalink === undefined) {
            if (this.options.verbose && !noWarn) {
                console.warn('refid', refid, 'has no permalink');
            }
            return undefined;
        }
        return `${this.pageBaseUrl}${pagePermalink}`;
    }
    getXrefPermalink(id) {
        const pagePart = id.replace(/_1.*/, '');
        const anchorPart = id.replace(/.*_1/, '');
        return `${this.pageBaseUrl}pages/${pagePart}/#${anchorPart}`;
    }
}
//# sourceMappingURL=workspace.js.map