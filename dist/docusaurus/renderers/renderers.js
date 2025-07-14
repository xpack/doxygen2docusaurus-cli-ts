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
/* eslint-disable max-lines */
import * as util from 'node:util';
import assert from 'node:assert';
import { BlockquoteLinesRenderer, ComputerOutputDataModelStringRenderer, DescriptionTypeLinesRenderer, DocAnchorTypeLinesRenderer, DocEmptyTypeStringRenderer, DocMarkupTypeStringRenderer, DocParamListTypeLinesRenderer, DocParaTypeLinesRenderer, DocRefTextTypeStringRenderer, DocSimpleSectTypeLinesRenderer, DocURLLinkStringRenderer, EmojiStringRenderer, FormulaStringRenderer, HeadingLinesRenderer, HtmlOnlyStringRenderer, ImageStringRenderer, PreformattedStringRenderer, SpTypeStringRenderer, VerbatimStringRenderer, } from './descriptiontype.js';
import { ListingTypeLinesRenderer, HighlightTypeLinesRenderer, } from './listingtype.js';
import { DocListTypeLinesRenderer } from './doclisttype.js';
import { DocS1TypeLinesRenderer, DocS2TypeLinesRenderer, DocS3TypeLinesRenderer, DocS4TypeLinesRenderer, DocS5TypeLinesRenderer, DocS6TypeLinesRenderer, } from './docinternalstype.js';
import { DocTitleTypeLinesRenderer } from './doctitletype.js';
import { DocVariableListTypeLinesRenderer, VariableListPairLinesRenderer, } from './docvariablelisttype.js';
import { DocXRefSectLinesRenderer as DocXRefSectStringRenderer } from './docxrefsecttype.js';
import { IncTypeLinesRenderer } from './inctype.js';
import { LinkedTextTypeStringRenderer } from './linkedtexttype.js';
import { ParamTypeLinesRenderer } from './paramtype.js';
import { RefTextTypeStringRenderer } from './reftexttype.js';
import { RefTypeLinesRenderer } from './reftype.js';
import { SubstringDocMarkupTypeRenderer } from './substringtype.js';
import { DocCaptionLinesRenderer, DocEntryTypeStringRenderer, DocRowTypeLinesRenderer, DocTableTypeLinesRenderer, } from './doctabletype.js';
import { TocListLinesRenderer } from './tableofcontentstype.js';
import { ReferenceTypeStringRenderer } from './referencetype.js';
// ----------------------------------------------------------------------------
export class Renderers {
    elementLinesRenderers = new Map();
    elementStringRenderers = new Map();
    registerRenderers(workspace) {
        // Add renderers for the parsed xml elements (in alphabetical order).
        this.elementLinesRenderers.set('VariableListPairDataModel', new VariableListPairLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDescriptionType', new DescriptionTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocAnchorType', new DocAnchorTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocBlockQuoteType', new BlockquoteLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocCaptionType', new DocCaptionLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocHeadingType', new HeadingLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocListType', new DocListTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocParamListType', new DocParamListTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocParaType', new DocParaTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocRowType', new DocRowTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect1Type', new DocS1TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect2Type', new DocS2TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect3Type', new DocS3TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect4Type', new DocS4TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect5Type', new DocS5TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect6Type', new DocS6TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSimpleSectType', new DocSimpleSectTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocTableType', new DocTableTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocTitleType', new DocTitleTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocTocListType', new TocListLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocVariableListType', new DocVariableListTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocXRefSectType', new DocXRefSectStringRenderer(workspace));
        this.elementLinesRenderers.set('AbstractHighlightType', new HighlightTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractIncType', new IncTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractListingTypeBase', new ListingTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractParamType', new ParamTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractProgramListingType', new ListingTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractRefType', new RefTypeLinesRenderer(workspace));
        // console.log(this.elementGenerators.size, 'element generators')
        this.elementStringRenderers.set('ComputerOutputDataModel', new ComputerOutputDataModelStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocEmptyType', new DocEmptyTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocEntryType', new DocEntryTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractEmojiType', new EmojiStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocFormulaType', new FormulaStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocHtmlOnlyType', new HtmlOnlyStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocImageType', new ImageStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocMarkupType', new DocMarkupTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocRefTextType', new DocRefTextTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocURLLink', new DocURLLinkStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractLinkedTextType', new LinkedTextTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractPreformattedType', new PreformattedStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractReferenceType', new ReferenceTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractRefTextType', new RefTextTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractSpType', new SpTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractVerbatimType', new VerbatimStringRenderer(workspace));
        this.elementStringRenderers.set('SubstringDocMarkupType', new SubstringDocMarkupTypeRenderer(workspace));
    }
    getElementLinesRenderer(element) {
        // eslint-disable-next-line @typescript-eslint/prefer-destructuring
        let elementClass = element.constructor;
        while (elementClass.name !== '') {
            // console.log(elementClass.name)
            // console.log(this.elementGenerators)
            const elementGenerator = this.elementLinesRenderers.get(elementClass.name);
            if (elementGenerator !== undefined) {
                return elementGenerator;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            elementClass = Object.getPrototypeOf(elementClass);
        }
        return undefined;
    }
    getElementTextRenderer(element) {
        // eslint-disable-next-line @typescript-eslint/prefer-destructuring
        let elementClass = element.constructor;
        while (elementClass.name !== '') {
            // console.log(elementClass.name)
            // console.log(this.elementGenerators)
            const elementGenerator = this.elementStringRenderers.get(elementClass.name);
            if (elementGenerator !== undefined) {
                return elementGenerator;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            elementClass = Object.getPrototypeOf(elementClass);
        }
        return undefined;
    }
    // --------------------------------------------------------------------------
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    renderString(element, type) {
        if (type === 'text') {
            return element;
        }
        else if (type === 'markdown') {
            return element
                .replaceAll(/&/g, '&amp;')
                .replaceAll(/</g, '&lt;')
                .replaceAll(/>/g, '&gt;')
                .replaceAll(/\\/g, '\\\\') // Must be placed before \[ \]
                .replaceAll(/\[/g, '\\[')
                .replaceAll(/\]/g, '\\]')
                .replaceAll(/\*/g, '\\*') // Markdown for bold
                .replaceAll(/_/g, '\\_') // Markdown for italics
                .replaceAll(/~/g, '\\~'); // Markdown for strikethrough in GFM
        }
        else if (type === 'html') {
            return element
                .replaceAll(/&/g, '&amp;')
                .replaceAll(/</g, '&lt;')
                .replaceAll(/>/g, '&gt;');
        }
        else {
            console.error('Unsupported type', type, 'in renderString');
            return element;
        }
    }
    renderElementsArrayToLines(elements, type) {
        if (!Array.isArray(elements)) {
            return [];
        }
        const lines = [];
        for (const element of elements) {
            lines.push(...this.renderElementToLines(element, type));
        }
        return lines;
    }
    renderElementToLines(element, type) {
        if (element === undefined) {
            return [];
        }
        if (typeof element === 'string') {
            if (element.startsWith('\n')) {
                return [];
            }
            else {
                return [this.renderString(element, type)];
            }
        }
        if (Array.isArray(element)) {
            const lines = [];
            for (const elementOfArray of element) {
                lines.push(...this.renderElementToLines(elementOfArray, type));
            }
            return lines;
        }
        const linesRenderer = this.getElementLinesRenderer(element);
        if (linesRenderer !== undefined) {
            return linesRenderer.renderToLines(element, type);
        }
        const textRenderer = this.getElementTextRenderer(element);
        if (textRenderer !== undefined) {
            return textRenderer.renderToString(element, type).split('\n');
        }
        console.error(util.inspect(element, { compact: false, depth: 999 }));
        console.error('no element lines renderer for', element.constructor.name, 'in', this.constructor.name, 'renderElementToLines');
        assert(false);
    }
    renderElementsArrayToString(elements, type) {
        if (elements === undefined) {
            return '';
        }
        let text = '';
        for (const element of elements) {
            text += this.renderElementToString(element, type);
        }
        return text;
    }
    renderElementToString(element, type) {
        if (element === undefined) {
            return '';
        }
        if (typeof element === 'string') {
            return this.renderString(element, type);
        }
        if (Array.isArray(element)) {
            let text = '';
            for (const elementOfArray of element) {
                text += this.renderElementToString(elementOfArray, type);
            }
            return text;
        }
        const textRenderer = this.getElementTextRenderer(element);
        if (textRenderer !== undefined) {
            return textRenderer.renderToString(element, type);
        }
        // console.warn(
        //   'trying element lines renderer for',
        //   element.constructor.name,
        //   'in',
        //   this.constructor.name,
        //   'renderElementToString'
        // )
        const linesRenderer = this.getElementLinesRenderer(element);
        if (linesRenderer !== undefined) {
            return linesRenderer.renderToLines(element, type).join('\n');
        }
        console.error(util.inspect(element, { compact: false, depth: 999 }));
        console.error('no element text renderer for', element.constructor.name, 'in', this.constructor.name, 'renderElementToString');
        return '';
    }
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    renderMembersIndexItemToHtmlLines({ template, type, name, childrenLines, }) {
        const lines = [];
        if (template !== undefined && template.length > 0) {
            lines.push('<tr class="doxyMemberIndexTemplate">');
            lines.push(`<td class="doxyMemberIndexTemplate" colspan="2">` +
                `<div>${template}</div></td>`);
            lines.push('</tr>');
            lines.push('<tr class="doxyMemberIndexItem">');
            if (type !== undefined && type.length > 0) {
                lines.push(`<td class="doxyMemberIndexItemTypeTemplate" align="left" ` +
                    `valign="top">${type}</td>`);
                lines.push(`<td class="doxyMemberIndexItemNameTemplate" align="left" ` +
                    `valign="top">${name}</td>`);
            }
            else {
                lines.push(`<td class="doxyMemberIndexItemNoTypeNameTemplate" colspan="2"` +
                    ` align="left" valign="top">${name}</td>`);
            }
            lines.push('</tr>');
        }
        else {
            lines.push('<tr class="doxyMemberIndexItem">');
            lines.push(`<td class="doxyMemberIndexItemType" align="left" valign="top">` +
                `${type}</td>`);
            lines.push(`<td class="doxyMemberIndexItemName" align="left" valign="top">` +
                `${name}</td>`);
            lines.push('</tr>');
        }
        if (childrenLines !== undefined) {
            lines.push('<tr class="doxyMemberIndexDescription">');
            lines.push('<td class="doxyMemberIndexDescriptionLeft"></td>');
            lines.push('<td class="doxyMemberIndexDescriptionRight">');
            lines.push(...childrenLines);
            lines.push('</td>');
            lines.push('</tr>');
        }
        lines.push('<tr class="doxyMemberIndexSeparator">');
        lines.push('<td class="doxyMemberIndexSeparator" colspan="2"></td>');
        lines.push('</tr>');
        return lines;
    }
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    renderTreeTableToHtmlLines({ contentLines, }) {
        const lines = [];
        lines.push('');
        lines.push('<table class="doxyTreeTable">');
        lines.push('<colgroup><col style="width:40%"><col></colgroup>');
        lines.push(...contentLines);
        lines.push('');
        lines.push('</table>');
        return lines;
    }
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    renderTreeTableRowToHtmlLines({ itemIconLetter, itemIconClass, itemLabel, itemLink, depth, description, }) {
        const lines = [];
        lines.push('<tr class="doxyTreeItem">');
        lines.push('<td class="doxyTreeItemLeft" align="left" valign="top">');
        lines.push(`<span style="width: ${depth * 12}px; display: inline-block;"></span>`);
        if (itemIconLetter !== undefined && itemIconLetter.length > 0) {
            lines.push(`<span class="doxyTreeIconBox">` +
                `<span class="doxyTreeIcon">${itemIconLetter}</span>` +
                `</span>`);
        }
        if (itemIconClass !== undefined && itemIconClass.length > 0) {
            lines.push(`<a href="${itemLink}">` +
                `<span class="${itemIconClass}">${itemLabel}</span>` +
                `</a>`);
        }
        else {
            lines.push(`<a href="${itemLink}">${itemLabel}</a>`);
        }
        lines.push('</td>');
        lines.push('<td class="doxyTreeItemRight" align="left" valign="top">');
        lines.push(description);
        lines.push('</td>');
        lines.push('</tr>');
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=renderers.js.map