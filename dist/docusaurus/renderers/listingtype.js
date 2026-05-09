import assert from 'node:assert';
import util from 'node:util';
import { CodeLineDataModel, HighlightDataModel, MemberProgramListingDataModel, } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
import { ElementLinesRendererBase } from './element-renderer-base.js';
export class ListingTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        if (element.codelines === undefined) {
            return [];
        }
        let showAnchor = true;
        if (element instanceof MemberProgramListingDataModel) {
            showAnchor = false;
        }
        const lines = [];
        lines.push('');
        lines.push('<div class="doxyProgramListing">');
        lines.push('');
        for (const codeline of element.codelines) {
            lines.push(renderCodeLinesToString(this.workspace, codeline, 'html', showAnchor));
        }
        lines.push('');
        lines.push('</div>');
        lines.push('');
        return lines;
    }
}
function renderCodeLinesToString(workspace, element, type, showAnchor) {
    assert(element instanceof CodeLineDataModel);
    if (element.external !== undefined) {
        console.error('external ignored in', element.constructor.name);
    }
    let permalink = undefined;
    if (element.refid !== undefined && element.refkind !== undefined) {
        permalink = workspace.getPermalink({
            refid: element.refid,
            kindref: element.refkind,
        });
    }
    let text = '';
    text += '<div class="doxyCodeLine">';
    if (element.lineno !== undefined) {
        text += '<span class="doxyLineNumber">';
        const anchor = `l${element.lineno.toString().padStart(5, '0')}`;
        if (showAnchor) {
            text += `<a id="${anchor}"></a>`;
        }
        if (permalink !== undefined) {
            text += `<a href="${permalink}">${element.lineno.toString()}</a>`;
        }
        else {
            text += element.lineno.toString();
        }
        text += '</span>';
    }
    else {
        text += '<span class="doxyNoLineNumber">&nbsp;</span>';
    }
    const content = workspace.renderElementsArrayToString(element.highlights, type);
    if (content.length > 0) {
        text += `<span class="doxyLineContent">${content}</span>`;
    }
    text += '</div>';
    return text;
}
export class HighlightTypeLinesRenderer extends ElementLinesRendererBase {
    knownClasses = {
        normal: 'doxyHighlight',
        charliteral: 'doxyHighlightCharLiteral',
        comment: 'doxyHighlightComment',
        preprocessor: 'doxyHighlightPreprocessor',
        keyword: 'doxyHighlightKeyword',
        keywordtype: 'doxyHighlightKeywordType',
        keywordflow: 'doxyHighlightKeywordFlow',
        token: 'doxyHighlightToken',
        stringliteral: 'doxyHighlightStringLiteral',
        vhdlchar: 'doxyHighlightVhdlChar',
        vhdlkeyword: 'doxyHighlightVhdlKeyword',
        vhdllogic: 'doxyHighlightVhdlLogic',
    };
    renderToLines(element, type) {
        assert(element instanceof HighlightDataModel);
        let spanClass = this.knownClasses[element.classs];
        if (spanClass === undefined) {
            console.error(util.inspect(element, { compact: false, depth: 999 }));
            console.error(element.classs, 'not implemented yet in', this.constructor.name);
            spanClass = 'doxyHighlight';
        }
        let text = '';
        assert(element.children !== undefined);
        if (element.children.length > 0) {
            text += `<span class="${spanClass}">`;
            text += this.workspace.renderElementsArrayToString(element.children, type);
            text += '</span>';
        }
        return [text];
    }
}
//# sourceMappingURL=listingtype.js.map