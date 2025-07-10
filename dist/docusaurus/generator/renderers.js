import assert from 'node:assert';
import * as util from 'node:util';
export class RenderersBase {
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
        const linesRenderer = this.elementRenderers.getElementLinesRenderer(element);
        if (linesRenderer !== undefined) {
            return linesRenderer.renderToLines(element, type);
        }
        const textRenderer = this.elementRenderers.getElementTextRenderer(element);
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
        const textRenderer = this.elementRenderers.getElementTextRenderer(element);
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
        const linesRenderer = this.elementRenderers.getElementLinesRenderer(element);
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
//# sourceMappingURL=renderers.js.map