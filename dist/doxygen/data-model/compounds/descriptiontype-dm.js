import assert from 'node:assert';
import * as util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
import { RefTextDataModel } from './reftexttype-dm.js';
import { VariableListDataModel } from './docvarlistentrytype-dm.js';
import { DocBookOnlyDataModel, HtmlOnlyDataModel } from './compounddef-dm.js';
import { TocListDataModel } from './tableofcontentstype-dm.js';
import { isUrl } from '../../../docusaurus/utils.js';
export class AbstractStringType extends AbstractDataModelBase {
    text = '';
    constructor(xml, element, elementName) {
        super(elementName);
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        assert(!xml.hasAttributes(element));
    }
}
export class AbstractDescriptionType extends AbstractDataModelBase {
    title;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = xml.getInnerElementText(innerElement, 'title');
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect1')) {
                this.children.push(new Sect1DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class AbstractListingTypeBase extends AbstractDataModelBase {
    codelines;
    filename;
}
export class AbstractListingType extends AbstractListingTypeBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'codeline')) {
                if (this.codelines === undefined) {
                    this.codelines = [];
                }
                this.codelines.push(new CodeLineDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_filename') {
                    this.filename = xml.getAttributeStringValue(element, '@_filename');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class ProgramListingDataModel extends AbstractListingType {
    constructor(xml, element) {
        super(xml, element, 'programlisting');
    }
}
export class MemberProgramListingDataModel extends AbstractListingTypeBase {
    constructor(programListing, startLine, endLine) {
        super(programListing.elementName);
        assert(startLine <= endLine);
        if (programListing.codelines !== undefined) {
            const filteredCodelines = [];
            for (const codeline of programListing.codelines) {
                if (codeline.lineno !== undefined) {
                    const lineno = codeline.lineno.valueOf();
                    if (startLine <= lineno && lineno <= endLine) {
                        filteredCodelines.push(codeline);
                    }
                }
            }
            if (filteredCodelines.length > 0) {
                this.codelines = filteredCodelines;
            }
        }
    }
}
export class AbstractCodeLineType extends AbstractDataModelBase {
    highlights;
    lineno;
    refid;
    refkind;
    external;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'highlight')) {
                if (this.highlights === undefined) {
                    this.highlights = [];
                }
                this.highlights.push(new HighlightDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_lineno') {
                    this.lineno = Number(xml.getAttributeNumberValue(element, '@_lineno'));
                }
                else if (attributeName === '@_refid') {
                    this.refid = xml.getAttributeStringValue(element, '@_refid');
                }
                else if (attributeName === '@_refkind') {
                    this.refkind = xml.getAttributeStringValue(element, '@_refkind');
                }
                else if (attributeName === '@_external') {
                    this.external = Boolean(xml.getAttributeBooleanValue(element, '@_external'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class CodeLineDataModel extends AbstractCodeLineType {
    constructor(xml, element) {
        super(xml, element, 'codeline');
    }
}
export class AbstractHighlightType extends AbstractDataModelBase {
    classs = '';
    constructor(xml, element, elementName) {
        super(elementName);
        this.children = [];
        const innerElements = xml.getInnerElements(element, elementName);
        if (innerElements.length > 0) {
            for (const innerElement of innerElements) {
                if (xml.hasInnerText(innerElement)) {
                    this.children.push(xml.getInnerText(innerElement));
                }
                else if (xml.isInnerElementText(innerElement, 'sp')) {
                    this.children.push(new SpDataModel(xml, innerElement));
                }
                else if (xml.hasInnerElement(innerElement, 'ref')) {
                    this.children.push(new RefTextDataModel(xml, innerElement));
                }
                else {
                    console.error(util.inspect(innerElement));
                    console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
                }
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_class') {
                this.classs = xml.getAttributeStringValue(element, '@_class');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.classs.length > 0);
    }
}
export class HighlightDataModel extends AbstractHighlightType {
    constructor(xml, element) {
        super(xml, element, 'highlight');
    }
}
export class AbstractSpType extends AbstractDataModelBase {
    text = '';
    value;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length === 0);
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_value') {
                    this.value = Number(xml.getAttributeNumberValue(element, '@_value'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class SpDataModel extends AbstractSpType {
    constructor(xml, element) {
        super(xml, element, 'sp');
    }
}
export class AbstractDocSectType extends AbstractDataModelBase {
    title;
    id;
}
export class AbstractDocSect1Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS1DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect2')) {
                this.children.push(new Sect2DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class AbstractDocSect2Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS2DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect3')) {
                this.children.push(new Sect3DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class AbstractDocSect3Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS3DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect4')) {
                this.children.push(new Sect4DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class AbstractDocSect4Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS4DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect5')) {
                this.children.push(new Sect5DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class AbstractDocSect5Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS5DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect6')) {
                this.children.push(new Sect6DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class AbstractDocSect6Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS6DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class AbstractDocInternalType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect1')) {
                this.children.push(new Sect1DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class AbstractDocInternalS1Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect2')) {
                this.children.push(new Sect2DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class AbstractDocInternalS2Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect3')) {
                this.children.push(new Sect3DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class AbstractDocInternalS3Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect4')) {
                this.children.push(new Sect4DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class AbstractDocInternalS4Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect5')) {
                this.children.push(new Sect5DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class AbstractDocInternalS5Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect6')) {
                this.children.push(new Sect6DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class AbstractDocInternalS6Type extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export function parseDocTitleCmdGroup(xml, element, elementName) {
    const children = [];
    if (xml.hasInnerElement(element, 'ulink')) {
        children.push(new UlinkDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bold')) {
        children.push(new BoldDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'underline')) {
        children.push(new UnderlineDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emphasis')) {
        children.push(new EmphasisDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'computeroutput')) {
        children.push(new ComputerOutputDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'subscript')) {
        children.push(new SubscriptDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'superscript')) {
        children.push(new SuperscriptDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'center')) {
        children.push(new CenterDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'center')) {
        children.push(new CenterDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'small')) {
        children.push(new SmallDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cite')) {
        children.push(new CiteDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'del')) {
        children.push(new DelDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ins')) {
        children.push(new InsDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'htmlonly')) {
        children.push(new HtmlOnlyDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'manonly')) {
    }
    else if (xml.hasInnerElement(element, 'xmlonly')) {
    }
    else if (xml.hasInnerElement(element, 'rtfonly')) {
    }
    else if (xml.hasInnerElement(element, 'latexonly')) {
    }
    else if (xml.hasInnerElement(element, 'docbookonly')) {
    }
    else if (xml.hasInnerElement(element, 'image')) {
        children.push(new ImageDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'anchor')) {
        children.push(new AnchorDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'formula')) {
        children.push(new FormulaDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ref')) {
        children.push(new RefDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emoji')) {
        children.push(new EmojiDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'linebreak')) {
        children.push(new LineBreakDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nonbreakablespace')) {
        children.push(new NonBreakableSpaceDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nzwj')) {
        children.push(new NzwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwj')) {
        children.push(new ZwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ndash')) {
        children.push(new NdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mdash')) {
        children.push(new MdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lsquo')) {
        children.push(new LsquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rsquo')) {
        children.push(new RsquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'copy')) {
        children.push(new CopyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iexcl')) {
        children.push(new IexclDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cent')) {
        children.push(new CentDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'pound')) {
        children.push(new PoundDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'curren')) {
        children.push(new CurrenDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yen')) {
        children.push(new YenDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'brvbar')) {
        children.push(new BrvbarDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sect')) {
        children.push(new SectDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'umlaut')) {
        children.push(new UmlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nzwj')) {
        children.push(new NzwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwj')) {
        children.push(new ZwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ndash')) {
        children.push(new NdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mdash')) {
        children.push(new MdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ordf')) {
        children.push(new OrdfDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'laquo')) {
        children.push(new LaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'not')) {
        children.push(new NotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'shy')) {
        children.push(new ShyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'registered')) {
        children.push(new RegisteredDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'macr')) {
        children.push(new MacrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'deg')) {
        children.push(new DegDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'plusmn')) {
        children.push(new PlusmnDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup2')) {
        children.push(new Sup2DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup3')) {
        children.push(new Sup3DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'acute')) {
        children.push(new AcuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'micro')) {
        children.push(new MicroDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'para')) {
        children.push(new ParaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'middot')) {
        children.push(new MiddotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cedil')) {
        children.push(new CedilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup1')) {
        children.push(new Sup1DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ordm')) {
        children.push(new OrdmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'raquo')) {
        children.push(new RaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac14')) {
        children.push(new Frac14DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac12')) {
        children.push(new Frac12DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac34')) {
        children.push(new Frac34DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iquest')) {
        children.push(new IquestDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Agrave')) {
        children.push(new AgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aacute')) {
        children.push(new AacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Acirc')) {
        children.push(new AcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Atilde')) {
        children.push(new AtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aumlaut')) {
        children.push(new AumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aring')) {
        children.push(new AringDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'AElig')) {
        children.push(new AEligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ccedil')) {
        children.push(new CcedilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Egrave')) {
        children.push(new EgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eacute')) {
        children.push(new EacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ecirc')) {
        children.push(new EcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eumlaut')) {
        children.push(new EumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Igrave')) {
        children.push(new IgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iacute')) {
        children.push(new IacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Icirc')) {
        children.push(new IcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iumlaut')) {
        children.push(new IumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ETH')) {
        children.push(new ETHDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ntilde')) {
        children.push(new NtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ograve')) {
        children.push(new OgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oacute')) {
        children.push(new OacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ocirc')) {
        children.push(new OcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Otilde')) {
        children.push(new OtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oumlaut')) {
        children.push(new OumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'times')) {
        children.push(new TimesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oslash')) {
        children.push(new OslashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ugrave')) {
        children.push(new UgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Uacute')) {
        children.push(new UacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ucirc')) {
        children.push(new UcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Uumlaut')) {
        children.push(new UumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Yacute')) {
        children.push(new YacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'THORN')) {
        children.push(new THORNDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'szlig')) {
        children.push(new SzligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'agrave')) {
        children.push(new AgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aacute')) {
        children.push(new AacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'acirc')) {
        children.push(new AcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'atilde')) {
        children.push(new AtildeSmallDocMarkupType(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aumlaut')) {
        children.push(new AumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aring')) {
        children.push(new AringSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aelig')) {
        children.push(new AeligSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ccedil')) {
        children.push(new CcedilSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'egrave')) {
        children.push(new EgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eacute')) {
        children.push(new EacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ecirc')) {
        children.push(new EcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eumlaut')) {
        children.push(new EumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'igrave')) {
        children.push(new IgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iacute')) {
        children.push(new IacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'icirc')) {
        children.push(new IcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iumlaut')) {
        children.push(new IumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eth')) {
        children.push(new EthSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ntilde')) {
        children.push(new NtildeSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ograve')) {
        children.push(new OgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oacute')) {
        children.push(new OacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ocirc')) {
        children.push(new OcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'otilde')) {
        children.push(new OtildeSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oumlaut')) {
        children.push(new OumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oslash')) {
        children.push(new OslashSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ugrave')) {
        children.push(new UgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uacute')) {
        children.push(new UacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ucirc')) {
        children.push(new UcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uumlaut')) {
        children.push(new UumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yacute')) {
        children.push(new YacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thorn')) {
        children.push(new ThornSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yumlaut')) {
        children.push(new YumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'divide')) {
        children.push(new DivideDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oslash')) {
        children.push(new OslashSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ugrave')) {
        children.push(new UgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uacute')) {
        children.push(new UacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ucirc')) {
        children.push(new UcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uumlaut')) {
        children.push(new UumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yacute')) {
        children.push(new YacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thorn')) {
        children.push(new ThornSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'fnof')) {
        children.push(new FnofDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Alpha')) {
        children.push(new AlphaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Beta')) {
        children.push(new BetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Gamma')) {
        children.push(new GammaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Delta')) {
        children.push(new DeltaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Epsilon')) {
        children.push(new EpsilonDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Zeta')) {
        children.push(new ZetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eta')) {
        children.push(new EtaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Theta')) {
        children.push(new ThetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iota')) {
        children.push(new IotaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Kappa')) {
        children.push(new KappaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Lambda')) {
        children.push(new LambdaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Mu')) {
        children.push(new MuDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Nu')) {
        children.push(new NuDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Xi')) {
        children.push(new XiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Omicron')) {
        children.push(new OmicronDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Pi')) {
        children.push(new PiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Rho')) {
        children.push(new RhoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Sigma')) {
        children.push(new SigmaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Tau')) {
        children.push(new TauDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Upsilon')) {
        children.push(new UpsilonDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Phi')) {
        children.push(new PhiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Chi')) {
        children.push(new ChiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Psi')) {
        children.push(new PsiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Omega')) {
        children.push(new OmegaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'alpha')) {
        children.push(new AlphaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'beta')) {
        children.push(new BetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'gamma')) {
        children.push(new GammaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'delta')) {
        children.push(new DeltaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'epsilon')) {
        children.push(new EpsilonSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zeta')) {
        children.push(new ZetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eta')) {
        children.push(new EtaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'theta')) {
        children.push(new ThetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iota')) {
        children.push(new IotaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'kappa')) {
        children.push(new KappaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lambda')) {
        children.push(new LambdaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mu')) {
        children.push(new MuSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nu')) {
        children.push(new NuSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'xi')) {
        children.push(new XiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'omicron')) {
        children.push(new OmicronSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'pi')) {
        children.push(new PiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rho')) {
        children.push(new RhoSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sigma')) {
        children.push(new SigmaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sigmaf')) {
        children.push(new SigmafSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tau')) {
        children.push(new TauSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'upsilon')) {
        children.push(new UpsilonSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'phi')) {
        children.push(new PhiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'chi')) {
        children.push(new ChiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'psi')) {
        children.push(new PsiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'omega')) {
        children.push(new OmegaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thetasym')) {
        children.push(new ThetasymDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'upsih')) {
        children.push(new UpsihDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'piv')) {
        children.push(new PivDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bull')) {
        children.push(new BullDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hellip')) {
        children.push(new HellipDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prime')) {
        children.push(new PrimeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Prime')) {
        children.push(new PrimeUpperDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oline')) {
        children.push(new OlineDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frasl')) {
        children.push(new FraslDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'weierp')) {
        children.push(new WeierpDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'imaginary')) {
        children.push(new ImaginaryDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'real')) {
        children.push(new RealDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'trademark')) {
        children.push(new TrademarkDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'alefsym')) {
        children.push(new AlefsymDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'larr')) {
        children.push(new LarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uarr')) {
        children.push(new UarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rarr')) {
        children.push(new RarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'darr')) {
        children.push(new DarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'harr')) {
        children.push(new HarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'crarr')) {
        children.push(new CrarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lArr')) {
        children.push(new LArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uArr')) {
        children.push(new UArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rArr')) {
        children.push(new RArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'dArr')) {
        children.push(new DArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hArr')) {
        children.push(new HArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'forall')) {
        children.push(new ForallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'part')) {
        children.push(new PartDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'exist')) {
        children.push(new ExistDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'empty')) {
        children.push(new EmptyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nabla')) {
        children.push(new NablaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'isin')) {
        children.push(new IsinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'notin')) {
        children.push(new NotinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ni')) {
        children.push(new NiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prod')) {
        children.push(new ProdDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sum')) {
        children.push(new SumDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'minus')) {
        children.push(new MinusDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lowast')) {
        children.push(new LowastDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'radic')) {
        children.push(new RadicDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prop')) {
        children.push(new PropDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'infin')) {
        children.push(new InfinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ang')) {
        children.push(new AngDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'and')) {
        children.push(new AndDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'or')) {
        children.push(new OrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cap')) {
        children.push(new CapDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cup')) {
        children.push(new CupDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'int')) {
        children.push(new IntDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'there4')) {
        children.push(new There4DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sim')) {
        children.push(new SimDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cong')) {
        children.push(new CongDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'asymp')) {
        children.push(new AsympDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ne')) {
        children.push(new NeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'equiv')) {
        children.push(new EquivDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'le')) {
        children.push(new LeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ge')) {
        children.push(new GeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sub')) {
        children.push(new SubDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup')) {
        children.push(new SupDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nsub')) {
        children.push(new NsubDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sube')) {
        children.push(new SubeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'supe')) {
        children.push(new SupeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oplus')) {
        children.push(new OplusDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'otimes')) {
        children.push(new OtimesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'perp')) {
        children.push(new PerpDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sdot')) {
        children.push(new SdotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lceil')) {
        children.push(new LceilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rceil')) {
        children.push(new RceilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lfloor')) {
        children.push(new LfloorDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rfloor')) {
        children.push(new RfloorDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lang')) {
        children.push(new LangDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rang')) {
        children.push(new RangDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'loz')) {
        children.push(new LozDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'spades')) {
        children.push(new SpadesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'clubs')) {
        children.push(new ClubsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hearts')) {
        children.push(new HeartsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'diams')) {
        children.push(new DiamsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'OElig')) {
        children.push(new OEligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oelig')) {
        children.push(new OeligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Scaron')) {
        children.push(new ScaronDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'scaron')) {
        children.push(new ScaronSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Yumlaut')) {
        children.push(new YumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'circ')) {
        children.push(new CircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tilde')) {
        children.push(new TildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ensp')) {
        children.push(new EnspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emsp')) {
        children.push(new EmspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thinsp')) {
        children.push(new ThinspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwnj')) {
        children.push(new ZwnjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lrm')) {
        children.push(new LrmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rlm')) {
        children.push(new RlmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sbquo')) {
        children.push(new SbquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ldquo')) {
        children.push(new LdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rdquo')) {
        children.push(new RdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bdquo')) {
        children.push(new BdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'dagger')) {
        children.push(new DaggerDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Dagger')) {
        children.push(new DaggerUpperDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'permil')) {
        children.push(new PermilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lsaquo')) {
        children.push(new LsaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rsaquo')) {
        children.push(new RsaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'euro')) {
        children.push(new EuroDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tm')) {
        children.push(new TmDocMarkupDataModel(xml, element));
    }
    else {
        console.error(util.inspect(element, { compact: false, depth: 999 }));
        console.error(`${elementName} element:`, Object.keys(element), 'not implemented yet by parseDocTitleCmdGroup()');
    }
    return children;
}
export class AbstractDocTitleType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
function parseDocCmdGroup(xml, element, elementName) {
    const children = [];
    if (xml.hasInnerElement(element, 'ulink')) {
        children.push(new UlinkDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bold')) {
        children.push(new BoldDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'underline')) {
        children.push(new UnderlineDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emphasis')) {
        children.push(new EmphasisDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'computeroutput')) {
        children.push(new ComputerOutputDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'subscript')) {
        children.push(new SubscriptDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'superscript')) {
        children.push(new SuperscriptDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'center')) {
        children.push(new CenterDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'center')) {
        children.push(new CenterDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'small')) {
        children.push(new SmallDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cite')) {
        children.push(new CiteDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'del')) {
        children.push(new DelDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ins')) {
        children.push(new InsDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'htmlonly')) {
        children.push(new HtmlOnlyDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'manonly')) {
    }
    else if (xml.hasInnerElement(element, 'xmlonly')) {
    }
    else if (xml.hasInnerElement(element, 'rtfonly')) {
    }
    else if (xml.hasInnerElement(element, 'latexonly')) {
    }
    else if (xml.hasInnerElement(element, 'docbookonly')) {
        children.push(new DocBookOnlyDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'image')) {
        children.push(new ImageDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'anchor')) {
        children.push(new AnchorDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'formula')) {
        children.push(new FormulaDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ref')) {
        children.push(new RefDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emoji')) {
        children.push(new EmojiDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'linebreak')) {
        children.push(new LineBreakDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nonbreakablespace')) {
        children.push(new NonBreakableSpaceDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nzwj')) {
        children.push(new NzwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwj')) {
        children.push(new ZwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ndash')) {
        children.push(new NdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mdash')) {
        children.push(new MdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lsquo')) {
        children.push(new LsquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rsquo')) {
        children.push(new RsquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'copy')) {
        children.push(new CopyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iexcl')) {
        children.push(new IexclDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cent')) {
        children.push(new CentDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'pound')) {
        children.push(new PoundDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'curren')) {
        children.push(new CurrenDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yen')) {
        children.push(new YenDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'brvbar')) {
        children.push(new BrvbarDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sect')) {
        children.push(new SectDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'umlaut')) {
        children.push(new UmlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nzwj')) {
        children.push(new NzwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwj')) {
        children.push(new ZwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ndash')) {
        children.push(new NdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mdash')) {
        children.push(new MdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ordf')) {
        children.push(new OrdfDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'laquo')) {
        children.push(new LaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'not')) {
        children.push(new NotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'shy')) {
        children.push(new ShyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'registered')) {
        children.push(new RegisteredDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'macr')) {
        children.push(new MacrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'deg')) {
        children.push(new DegDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'plusmn')) {
        children.push(new PlusmnDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup2')) {
        children.push(new Sup2DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup3')) {
        children.push(new Sup3DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'acute')) {
        children.push(new AcuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'micro')) {
        children.push(new MicroDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'para')) {
        children.push(new ParaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'middot')) {
        children.push(new MiddotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cedil')) {
        children.push(new CedilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup1')) {
        children.push(new Sup1DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ordm')) {
        children.push(new OrdmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'raquo')) {
        children.push(new RaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac14')) {
        children.push(new Frac14DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac12')) {
        children.push(new Frac12DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac34')) {
        children.push(new Frac34DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iquest')) {
        children.push(new IquestDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Agrave')) {
        children.push(new AgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aacute')) {
        children.push(new AacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Acirc')) {
        children.push(new AcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Atilde')) {
        children.push(new AtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aumlaut')) {
        children.push(new AumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aring')) {
        children.push(new AringDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'AElig')) {
        children.push(new AEligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ccedil')) {
        children.push(new CcedilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Egrave')) {
        children.push(new EgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eacute')) {
        children.push(new EacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ecirc')) {
        children.push(new EcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eumlaut')) {
        children.push(new EumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Igrave')) {
        children.push(new IgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iacute')) {
        children.push(new IacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Icirc')) {
        children.push(new IcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iumlaut')) {
        children.push(new IumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ETH')) {
        children.push(new ETHDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ntilde')) {
        children.push(new NtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ograve')) {
        children.push(new OgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oacute')) {
        children.push(new OacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ocirc')) {
        children.push(new OcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Otilde')) {
        children.push(new OtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oumlaut')) {
        children.push(new OumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'times')) {
        children.push(new TimesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oslash')) {
        children.push(new OslashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ugrave')) {
        children.push(new UgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Uacute')) {
        children.push(new UacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ucirc')) {
        children.push(new UcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Uumlaut')) {
        children.push(new UumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Yacute')) {
        children.push(new YacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'THORN')) {
        children.push(new THORNDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'szlig')) {
        children.push(new SzligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'agrave')) {
        children.push(new AgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aacute')) {
        children.push(new AacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'acirc')) {
        children.push(new AcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'atilde')) {
        children.push(new AtildeSmallDocMarkupType(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aumlaut')) {
        children.push(new AumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aring')) {
        children.push(new AringSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aelig')) {
        children.push(new AeligSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ccedil')) {
        children.push(new CcedilSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'egrave')) {
        children.push(new EgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eacute')) {
        children.push(new EacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ecirc')) {
        children.push(new EcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eumlaut')) {
        children.push(new EumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'igrave')) {
        children.push(new IgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iacute')) {
        children.push(new IacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'icirc')) {
        children.push(new IcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iumlaut')) {
        children.push(new IumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eth')) {
        children.push(new EthSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ntilde')) {
        children.push(new NtildeSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ograve')) {
        children.push(new OgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oacute')) {
        children.push(new OacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ocirc')) {
        children.push(new OcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'otilde')) {
        children.push(new OtildeSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oumlaut')) {
        children.push(new OumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oslash')) {
        children.push(new OslashSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ugrave')) {
        children.push(new UgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uacute')) {
        children.push(new UacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ucirc')) {
        children.push(new UcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uumlaut')) {
        children.push(new UumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yacute')) {
        children.push(new YacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thorn')) {
        children.push(new ThornSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yumlaut')) {
        children.push(new YumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'divide')) {
        children.push(new DivideDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oslash')) {
        children.push(new OslashSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ugrave')) {
        children.push(new UgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uacute')) {
        children.push(new UacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ucirc')) {
        children.push(new UcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uumlaut')) {
        children.push(new UumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yacute')) {
        children.push(new YacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thorn')) {
        children.push(new ThornSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'fnof')) {
        children.push(new FnofDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Alpha')) {
        children.push(new AlphaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Beta')) {
        children.push(new BetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Gamma')) {
        children.push(new GammaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Delta')) {
        children.push(new DeltaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Epsilon')) {
        children.push(new EpsilonDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Zeta')) {
        children.push(new ZetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eta')) {
        children.push(new EtaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Theta')) {
        children.push(new ThetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iota')) {
        children.push(new IotaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Kappa')) {
        children.push(new KappaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Lambda')) {
        children.push(new LambdaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Mu')) {
        children.push(new MuDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Nu')) {
        children.push(new NuDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Xi')) {
        children.push(new XiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Omicron')) {
        children.push(new OmicronDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Pi')) {
        children.push(new PiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Rho')) {
        children.push(new RhoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Sigma')) {
        children.push(new SigmaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Tau')) {
        children.push(new TauDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Upsilon')) {
        children.push(new UpsilonDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Phi')) {
        children.push(new PhiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Chi')) {
        children.push(new ChiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Psi')) {
        children.push(new PsiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Omega')) {
        children.push(new OmegaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'alpha')) {
        children.push(new AlphaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'beta')) {
        children.push(new BetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'gamma')) {
        children.push(new GammaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'delta')) {
        children.push(new DeltaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'epsilon')) {
        children.push(new EpsilonSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zeta')) {
        children.push(new ZetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eta')) {
        children.push(new EtaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'theta')) {
        children.push(new ThetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iota')) {
        children.push(new IotaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'kappa')) {
        children.push(new KappaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lambda')) {
        children.push(new LambdaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mu')) {
        children.push(new MuSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nu')) {
        children.push(new NuSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'xi')) {
        children.push(new XiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'omicron')) {
        children.push(new OmicronSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'pi')) {
        children.push(new PiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rho')) {
        children.push(new RhoSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sigma')) {
        children.push(new SigmaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sigmaf')) {
        children.push(new SigmafSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tau')) {
        children.push(new TauSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'upsilon')) {
        children.push(new UpsilonSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'phi')) {
        children.push(new PhiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'chi')) {
        children.push(new ChiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'psi')) {
        children.push(new PsiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'omega')) {
        children.push(new OmegaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thetasym')) {
        children.push(new ThetasymDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'upsih')) {
        children.push(new UpsihDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'piv')) {
        children.push(new PivDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bull')) {
        children.push(new BullDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hellip')) {
        children.push(new HellipDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prime')) {
        children.push(new PrimeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Prime')) {
        children.push(new PrimeUpperDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oline')) {
        children.push(new OlineDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frasl')) {
        children.push(new FraslDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'weierp')) {
        children.push(new WeierpDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'imaginary')) {
        children.push(new ImaginaryDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'real')) {
        children.push(new RealDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'trademark')) {
        children.push(new TrademarkDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'alefsym')) {
        children.push(new AlefsymDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'larr')) {
        children.push(new LarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uarr')) {
        children.push(new UarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rarr')) {
        children.push(new RarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'darr')) {
        children.push(new DarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'harr')) {
        children.push(new HarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'crarr')) {
        children.push(new CrarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lArr')) {
        children.push(new LArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uArr')) {
        children.push(new UArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rArr')) {
        children.push(new RArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'dArr')) {
        children.push(new DArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hArr')) {
        children.push(new HArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'forall')) {
        children.push(new ForallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'part')) {
        children.push(new PartDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'exist')) {
        children.push(new ExistDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'empty')) {
        children.push(new EmptyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nabla')) {
        children.push(new NablaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'isin')) {
        children.push(new IsinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'notin')) {
        children.push(new NotinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ni')) {
        children.push(new NiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prod')) {
        children.push(new ProdDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sum')) {
        children.push(new SumDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'minus')) {
        children.push(new MinusDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lowast')) {
        children.push(new LowastDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'radic')) {
        children.push(new RadicDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prop')) {
        children.push(new PropDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'infin')) {
        children.push(new InfinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ang')) {
        children.push(new AngDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'and')) {
        children.push(new AndDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'or')) {
        children.push(new OrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cap')) {
        children.push(new CapDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cup')) {
        children.push(new CupDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'int')) {
        children.push(new IntDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'there4')) {
        children.push(new There4DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sim')) {
        children.push(new SimDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cong')) {
        children.push(new CongDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'asymp')) {
        children.push(new AsympDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ne')) {
        children.push(new NeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'equiv')) {
        children.push(new EquivDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'le')) {
        children.push(new LeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ge')) {
        children.push(new GeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sub')) {
        children.push(new SubDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup')) {
        children.push(new SupDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nsub')) {
        children.push(new NsubDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sube')) {
        children.push(new SubeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'supe')) {
        children.push(new SupeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oplus')) {
        children.push(new OplusDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'otimes')) {
        children.push(new OtimesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'perp')) {
        children.push(new PerpDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sdot')) {
        children.push(new SdotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lceil')) {
        children.push(new LceilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rceil')) {
        children.push(new RceilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lfloor')) {
        children.push(new LfloorDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rfloor')) {
        children.push(new RfloorDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lang')) {
        children.push(new LangDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rang')) {
        children.push(new RangDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'loz')) {
        children.push(new LozDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'spades')) {
        children.push(new SpadesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'clubs')) {
        children.push(new ClubsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hearts')) {
        children.push(new HeartsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'diams')) {
        children.push(new DiamsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'OElig')) {
        children.push(new OEligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oelig')) {
        children.push(new OeligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Scaron')) {
        children.push(new ScaronDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'scaron')) {
        children.push(new ScaronSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Yumlaut')) {
        children.push(new YumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'circ')) {
        children.push(new CircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tilde')) {
        children.push(new TildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ensp')) {
        children.push(new EnspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emsp')) {
        children.push(new EmspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thinsp')) {
        children.push(new ThinspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwnj')) {
        children.push(new ZwnjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lrm')) {
        children.push(new LrmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rlm')) {
        children.push(new RlmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sbquo')) {
        children.push(new SbquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ldquo')) {
        children.push(new LdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rdquo')) {
        children.push(new RdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bdquo')) {
        children.push(new BdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'dagger')) {
        children.push(new DaggerDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Dagger')) {
        children.push(new DaggerUpperDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'permil')) {
        children.push(new PermilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lsaquo')) {
        children.push(new LsaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rsaquo')) {
        children.push(new RsaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'euro')) {
        children.push(new EuroDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tm')) {
        children.push(new TmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hruler')) {
        children.push(new HrulerDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'preformatted')) {
        children.push(new PreformattedDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'programlisting')) {
        children.push(new ProgramListingDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'verbatim')) {
        children.push(new VerbatimDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'indexentry')) {
    }
    else if (xml.hasInnerElement(element, 'orderedlist')) {
        children.push(new OrderedListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'itemizedlist')) {
        children.push(new ItemizedListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'simplesect')) {
        children.push(new SimpleSectDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'variablelist')) {
        children.push(new VariableListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'table')) {
        children.push(new DocTableDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'heading')) {
        children.push(new HeadingDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'toclist')) {
        children.push(new TocListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'parameterlist')) {
        children.push(new ParameterListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'xrefsect')) {
        children.push(new XrefSectDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'blockquote')) {
        children.push(new BlockquoteDataModel(xml, element));
    }
    else {
        console.error(util.inspect(element, { compact: false, depth: 999 }));
        console.error(`${elementName} element:`, Object.keys(element), 'not implemented yet by parseDocCmdGroup()');
    }
    return children;
}
export class AbstractDocParaType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocCmdGroup(xml, innerElement, elementName));
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class AbstractDocMarkupType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocCmdGroup(xml, innerElement, elementName));
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class SubstringDocMarkupType extends AbstractDocMarkupType {
    substring;
    constructor(xml, element, elementName, substring) {
        super(xml, element, elementName);
        this.substring = substring;
    }
}
export class CopyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'copy', '\u00A9');
    }
}
export class IexclDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'iexcl', '\u00A1');
    }
}
export class CentDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cent', '\u00A2');
    }
}
export class PoundDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'pound', '\u00A3');
    }
}
export class CurrenDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'curren', '\u00A4');
    }
}
export class YenDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'yen', '\u00A5');
    }
}
export class BrvbarDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'brvbar', '\u00A6');
    }
}
export class SectDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sect', '\u00A7');
    }
}
export class UmlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'umlaut', '\u00A8');
    }
}
export class NzwjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'nzwj', '\u200C');
    }
}
export class ZwjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'zwj', '\u200D');
    }
}
export class NdashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ndash', '\u2013');
    }
}
export class MdashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'mdash', '\u2014');
    }
}
export class OrdfDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ordf', '\u00AA');
    }
}
export class LaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'laquo', '\u00AB');
    }
}
export class NotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'not', '\u00AC');
    }
}
export class ShyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'shy', '\u00AD');
    }
}
export class RegisteredDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'registered', '\u00AE');
    }
}
export class MacrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'macr', '\u00AF');
    }
}
export class DegDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'deg', '\u00B0');
    }
}
export class PlusmnDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'plusmn', '\u00B1');
    }
}
export class Sup2DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sup2', '\u00B2');
    }
}
export class Sup3DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sup3', '\u00B3');
    }
}
export class AcuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'acute', '\u00B4');
    }
}
export class MicroDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'micro', '\u00B5');
    }
}
export class ParaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'para', '\u00B6');
    }
}
export class MiddotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'middot', '\u00B7');
    }
}
export class CedilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cedil', '\u00B8');
    }
}
export class Sup1DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sup1', '\u00B9');
    }
}
export class OrdmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ordm', '\u00BA');
    }
}
export class RaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'raquo', '\u00BB');
    }
}
export class Frac14DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'frac14', '\u00BC');
    }
}
export class Frac12DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'frac12', '\u00BD');
    }
}
export class Frac34DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'frac34', '\u00BE');
    }
}
export class IquestDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'iquest', '\u00BF');
    }
}
export class AgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Agrave', '\u00C0');
    }
}
export class AacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Aacute', '\u00C1');
    }
}
export class AcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Acirc', '\u00C2');
    }
}
export class AtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Atilde', '\u00C3');
    }
}
export class AumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Aumlaut', '\u00C4');
    }
}
export class AringDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Aring', '\u00C5');
    }
}
export class AEligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'AElig', '\u00C6');
    }
}
export class CcedilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ccedil', '\u00C7');
    }
}
export class EgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Egrave', '\u00C8');
    }
}
export class EacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Eacute', '\u00C9');
    }
}
export class EcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ecirc', '\u00CA');
    }
}
export class EumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Eumlaut', '\u00CB');
    }
}
export class IgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Igrave', '\u00CC');
    }
}
export class IacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Iacute', '\u00CD');
    }
}
export class IcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Icirc', '\u00CE');
    }
}
export class IumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Iumlaut', '\u00CF');
    }
}
export class ETHDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ETH', '\u00D0');
    }
}
export class NtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ntilde', '\u00D1');
    }
}
export class OgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ograve', '\u00D2');
    }
}
export class OacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Oacute', '\u00D3');
    }
}
export class OcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ocirc', '\u00D4');
    }
}
export class OtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Otilde', '\u00D5');
    }
}
export class OumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Oumlaut', '\u00D6');
    }
}
export class TimesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'times', '\u00D7');
    }
}
export class OslashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Oslash', '\u00D8');
    }
}
export class UgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ugrave', '\u00D9');
    }
}
export class UacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Uacute', '\u00DA');
    }
}
export class UcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ucirc', '\u00DB');
    }
}
export class UumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Uumlaut', '\u00DC');
    }
}
export class YacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Yacute', '\u00DD');
    }
}
export class THORNDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'THORN', '\u00DE');
    }
}
export class SzligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'szlig', '\u00DF');
    }
}
export class AgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'agrave', '\u00E0');
    }
}
export class AacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'aacute', '\u00E1');
    }
}
export class AcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'acirc', '\u00E2');
    }
}
export class AtildeSmallDocMarkupType extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'atilde', '\u00E3');
    }
}
export class AumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'aumlaut', '\u00E4');
    }
}
export class AringSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'aring', '\u00E5');
    }
}
export class AeligSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'aelig', '\u00E6');
    }
}
export class CcedilSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ccedil', '\u00E7');
    }
}
export class EgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'egrave', '\u00E8');
    }
}
export class EacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'eacute', '\u00E9');
    }
}
export class EcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ecirc', '\u00EA');
    }
}
export class EumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'eumlaut', '\u00EB');
    }
}
export class IgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'igrave', '\u00EC');
    }
}
export class IacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'iacute', '\u00ED');
    }
}
export class IcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'icirc', '\u00EE');
    }
}
export class IumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'iumlaut', '\u00EF');
    }
}
export class EthSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'eth', '\u00F0');
    }
}
export class NtildeSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ntilde', '\u00F1');
    }
}
export class OgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ograve', '\u00F2');
    }
}
export class OacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oacute', '\u00F3');
    }
}
export class OcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ocirc', '\u00F4');
    }
}
export class OtildeSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'otilde', '\u00F5');
    }
}
export class OumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oumlaut', '\u00F6');
    }
}
export class DivideDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'divide', '\u00F7');
    }
}
export class OslashSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oslash', '\u00F8');
    }
}
export class UgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ugrave', '\u00F9');
    }
}
export class UacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'uacute', '\u00FA');
    }
}
export class UcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ucirc', '\u00FB');
    }
}
export class UumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'uumlaut', '\u00FC');
    }
}
export class YacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'yacute', '\u00FD');
    }
}
export class ThornSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'thorn', '\u00FE');
    }
}
export class YumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'yumlaut', '\u00FF');
    }
}
export class FnofDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'fnof', '\u0192');
    }
}
export class AlphaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Alpha', '\u0391');
    }
}
export class BetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Beta', '\u0392');
    }
}
export class GammaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Gamma', '\u0393');
    }
}
export class DeltaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Delta', '\u0394');
    }
}
export class EpsilonDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Epsilon', '\u0395');
    }
}
export class ZetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Zeta', '\u0396');
    }
}
export class EtaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Eta', '\u0397');
    }
}
export class ThetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Theta', '\u0398');
    }
}
export class IotaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Iota', '\u0399');
    }
}
export class KappaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Kappa', '\u039A');
    }
}
export class LambdaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Lambda', '\u039B');
    }
}
export class MuDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Mu', '\u039C');
    }
}
export class NuDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Nu', '\u039D');
    }
}
export class XiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Xi', '\u039E');
    }
}
export class OmicronDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Omicron', '\u039F');
    }
}
export class PiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Pi', '\u03A0');
    }
}
export class RhoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Rho', '\u03A1');
    }
}
export class SigmaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Sigma', '\u03A3');
    }
}
export class TauDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Tau', '\u03A4');
    }
}
export class UpsilonDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Upsilon', '\u03A5');
    }
}
export class PhiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Phi', '\u03A6');
    }
}
export class ChiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Chi', '\u03A7');
    }
}
export class PsiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Psi', '\u03A8');
    }
}
export class OmegaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Omega', '\u03A9');
    }
}
export class AlphaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'alpha', '\u03B1');
    }
}
export class BetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'beta', '\u03B2');
    }
}
export class GammaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'gamma', '\u03B3');
    }
}
export class DeltaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'delta', '\u03B4');
    }
}
export class EpsilonSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'epsilon', '\u03B5');
    }
}
export class ZetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'zeta', '\u03B6');
    }
}
export class EtaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'eta', '\u03B7');
    }
}
export class ThetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'theta', '\u03B8');
    }
}
export class IotaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'iota', '\u03B9');
    }
}
export class KappaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'kappa', '\u03BA');
    }
}
export class LambdaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lambda', '\u03BB');
    }
}
export class MuSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'mu', '\u03BC');
    }
}
export class NuSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'nu', '\u03BD');
    }
}
export class XiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'xi', '\u03BE');
    }
}
export class OmicronSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'omicron', '\u03BF');
    }
}
export class PiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'pi', '\u03C0');
    }
}
export class RhoSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rho', '\u03C1');
    }
}
export class SigmaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sigma', '\u03C3');
    }
}
export class SigmafSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sigmaf', '\u03C2');
    }
}
export class TauSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'tau', '\u03C4');
    }
}
export class UpsilonSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'upsilon', '\u03C5');
    }
}
export class PhiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'phi', '\u03C6');
    }
}
export class ChiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'chi', '\u03C7');
    }
}
export class PsiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'psi', '\u03C8');
    }
}
export class OmegaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'omega', '\u03C9');
    }
}
export class ThetasymDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'thetasym', '\u03D1');
    }
}
export class UpsihDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'upsih', '\u03D2');
    }
}
export class PivDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'piv', '\u03D6');
    }
}
export class BullDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'bull', '\u2022');
    }
}
export class HellipDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'hellip', '\u2026');
    }
}
export class PrimeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'prime', '\u2032');
    }
}
export class PrimeUpperDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Prime', '\u2033');
    }
}
export class OlineDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oline', '\u203E');
    }
}
export class FraslDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'frasl', '\u2044');
    }
}
export class WeierpDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'weierp', '\u2118');
    }
}
export class ImaginaryDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'imaginary', '\u2111');
    }
}
export class RealDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'real', '\u211C');
    }
}
export class TrademarkDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'trademark', '\u2122');
    }
}
export class AlefsymDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'alefsym', '\u2135');
    }
}
export class LarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'larr', '\u2190');
    }
}
export class UarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'uarr', '\u2191');
    }
}
export class RarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rarr', '\u2192');
    }
}
export class DarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'darr', '\u2193');
    }
}
export class HarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'harr', '\u2194');
    }
}
export class CrarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'crarr', '\u21B5');
    }
}
export class LArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lArr', '\u21D0');
    }
}
export class UArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'uArr', '\u21D1');
    }
}
export class RArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rArr', '\u21D2');
    }
}
export class DArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'dArr', '\u21D3');
    }
}
export class HArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'hArr', '\u21D4');
    }
}
export class ForallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'forall', '\u2200');
    }
}
export class PartDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'part', '\u2202');
    }
}
export class ExistDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'exist', '\u2203');
    }
}
export class EmptyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'empty', '\u2205');
    }
}
export class NablaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'nabla', '\u2207');
    }
}
export class IsinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'isin', '\u2208');
    }
}
export class NotinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'notin', '\u2209');
    }
}
export class NiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ni', '\u220B');
    }
}
export class ProdDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'prod', '\u220F');
    }
}
export class SumDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sum', '\u2211');
    }
}
export class MinusDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'minus', '\u2212');
    }
}
export class LowastDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lowast', '\u2217');
    }
}
export class RadicDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'radic', '\u221A');
    }
}
export class PropDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'prop', '\u221D');
    }
}
export class InfinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'infin', '\u221E');
    }
}
export class AngDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ang', '\u2220');
    }
}
export class AndDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'and', '\u2227');
    }
}
export class OrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'or', '\u2228');
    }
}
export class CapDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cap', '\u2229');
    }
}
export class CupDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cup', '\u222A');
    }
}
export class IntDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'int', '\u222B');
    }
}
export class There4DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'there4', '\u2234');
    }
}
export class SimDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sim', '\u223C');
    }
}
export class CongDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cong', '\u2245');
    }
}
export class AsympDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'asymp', '\u2248');
    }
}
export class NeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ne', '\u2260');
    }
}
export class EquivDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'equiv', '\u2261');
    }
}
export class LeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'le', '\u2264');
    }
}
export class GeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ge', '\u2265');
    }
}
export class SubDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sub', '\u2282');
    }
}
export class SupDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sup', '\u2283');
    }
}
export class NsubDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'nsub', '\u2284');
    }
}
export class SubeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sube', '\u2286');
    }
}
export class SupeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'supe', '\u2287');
    }
}
export class OplusDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oplus', '\u2295');
    }
}
export class OtimesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'otimes', '\u2297');
    }
}
export class PerpDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'perp', '\u22A5');
    }
}
export class SdotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sdot', '\u22C5');
    }
}
export class LceilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lceil', '\u2308');
    }
}
export class RceilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rceil', '\u2309');
    }
}
export class LfloorDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lfloor', '\u230A');
    }
}
export class RfloorDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rfloor', '\u230B');
    }
}
export class LangDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lang', '\u2329');
    }
}
export class RangDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rang', '\u232A');
    }
}
export class LozDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'loz', '\u25CA');
    }
}
export class SpadesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'spades', '\u2660');
    }
}
export class ClubsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'clubs', '\u2663');
    }
}
export class HeartsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'hearts', '\u2665');
    }
}
export class DiamsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'diams', '\u2666');
    }
}
export class OEligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'OElig', '\u0152');
    }
}
export class OeligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oelig', '\u0153');
    }
}
export class ScaronDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Scaron', '\u0160');
    }
}
export class ScaronSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'scaron', '\u0161');
    }
}
export class YumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Yumlaut', '\u0178');
    }
}
export class CircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'circ', '\u02C6');
    }
}
export class TildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'tilde', '\u02DC');
    }
}
export class EnspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ensp', '\u2002');
    }
}
export class EmspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'emsp', '\u2003');
    }
}
export class ThinspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'thinsp', '\u2009');
    }
}
export class ZwnjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'zwnj', '\u200C');
    }
}
export class LrmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lrm', '\u200E');
    }
}
export class RlmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rlm', '\u200F');
    }
}
export class SbquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sbquo', '\u201A');
    }
}
export class LdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ldquo', '\u201C');
    }
}
export class RdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rdquo', '\u201D');
    }
}
export class BdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'bdquo', '\u201E');
    }
}
export class DaggerDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'dagger', '\u2020');
    }
}
export class DaggerUpperDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Dagger', '\u2021');
    }
}
export class PermilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'permil', '\u2030');
    }
}
export class LsaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lsaquo', '\u2039');
    }
}
export class RsaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rsaquo', '\u203A');
    }
}
export class EuroDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'euro', '\u20AC');
    }
}
export class TmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'tm', '\u2122');
    }
}
export class LsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lsquo', '\u2018');
    }
}
export class RsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rsquo', '\u0060');
    }
}
export class AbstractDocURLLink extends AbstractDataModelBase {
    url = '';
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_url') {
                this.url = xml.getAttributeStringValue(element, '@_url');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.url.length > 0);
    }
}
export class UlinkDataModel extends AbstractDocURLLink {
    constructor(xml, element) {
        super(xml, element, 'ulink');
    }
}
export class AbstractDocAnchorType extends AbstractDataModelBase {
    id = '';
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (this.children.length > 0) {
            console.error('Unexpected <anchor> text content in', this.constructor.name);
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
    }
}
export class AnchorDataModel extends AbstractDocAnchorType {
    constructor(xml, element) {
        super(xml, element, 'anchor');
    }
}
export class AbstractDocFormulaType extends AbstractDataModelBase {
    text = '';
    id = '';
    constructor(xml, element, elementName) {
        super(elementName);
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        assert(this.text.length > 0);
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
    }
}
export class FormulaDataModel extends AbstractDocFormulaType {
    constructor(xml, element) {
        super(xml, element, 'formula');
    }
}
export class AbstractDocIndexEntryType extends AbstractDataModelBase {
    primaryie = '';
    secondaryie = '';
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.isInnerElementText(innerElement, 'primaryie')) {
                this.primaryie = xml.getInnerElementText(innerElement, 'primaryie');
            }
            else if (xml.isInnerElementText(innerElement, 'secondaryie')) {
                this.secondaryie = xml.getInnerElementText(innerElement, 'secondaryie');
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class IndexEntryDataModel extends AbstractDocIndexEntryType {
    constructor(xml, element) {
        super(xml, element, 'indexentry');
    }
}
export class AbstractDocListType extends AbstractDataModelBase {
    listItems = [];
    type = '';
    start;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'listitem')) {
                this.listItems.push(new ListItemDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_type') {
                    this.type = xml.getAttributeStringValue(element, '@_type');
                }
                else if (attributeName === '@_start') {
                    assert(this.start === undefined);
                    this.start = Number(xml.getAttributeNumberValue(element, '@_start'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class AbstractDocListItemType extends AbstractDataModelBase {
    paras;
    override;
    value;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                if (this.paras === undefined) {
                    this.paras = [];
                }
                this.paras.push(new ParaDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_override') {
                    this.override = xml.getAttributeStringValue(element, '@_override');
                }
                else if (attributeName === '@_value') {
                    assert(this.value === undefined);
                    this.value = Number(xml.getAttributeNumberValue(element, '@_value'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class ListItemDataModel extends AbstractDocListItemType {
    constructor(xml, element) {
        super(xml, element, 'listitem');
    }
}
export class AbstractDocSimpleSectType extends AbstractDataModelBase {
    title;
    kind = '';
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = xml.getInnerElementText(innerElement, 'title');
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_kind') {
                this.kind = xml.getAttributeStringValue(element, '@_kind');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
    }
}
export class AbstractDocRefTextType extends AbstractDataModelBase {
    refid = '';
    kindref = '';
    external;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_refid') {
                this.refid = xml.getAttributeStringValue(element, '@_refid');
            }
            else if (attributeName === '@_kindref') {
                this.kindref = xml.getAttributeStringValue(element, '@_kindref');
            }
            else if (attributeName === '@_external') {
                this.external = xml.getAttributeStringValue(element, '@_external');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.kindref.length > 0);
    }
}
export class RefDataModel extends AbstractDocRefTextType {
    constructor(xml, element) {
        super(xml, element, 'ref');
    }
}
export class AbstractDocTableType extends AbstractDataModelBase {
    caption = undefined;
    rows = undefined;
    rowsCount = NaN;
    colsCount = NaN;
    width;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'caption')) {
                assert(this.caption === undefined);
                this.caption = new DocCaptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'row')) {
                if (this.rows === undefined) {
                    this.rows = [];
                }
                const docRow = new DocRowDataModel(xml, innerElement);
                this.rows.push(docRow);
                this.children.push(docRow);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_rows') {
                assert(isNaN(this.rowsCount));
                this.rowsCount = xml.getAttributeNumberValue(element, '@_rows');
            }
            else if (attributeName === '@_cols') {
                assert(isNaN(this.colsCount));
                this.colsCount = xml.getAttributeNumberValue(element, '@_cols');
            }
            else if (attributeName === '@_width') {
                assert(this.width === undefined);
                this.width = xml.getAttributeStringValue(element, '@_width');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.rowsCount > 0);
        assert(this.colsCount > 0);
    }
}
export class DocTableDataModel extends AbstractDocTableType {
    constructor(xml, element) {
        super(xml, element, 'table');
    }
}
export class AbstractDocRowType extends AbstractDataModelBase {
    entries;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'entry')) {
                if (this.entries === undefined) {
                    this.entries = [];
                }
                const docEntry = new DocEntryDataModel(xml, innerElement);
                this.entries.push(docEntry);
                this.children.push(docEntry);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class DocRowDataModel extends AbstractDocRowType {
    constructor(xml, element) {
        super(xml, element, 'row');
    }
}
export class AbstractDocEntryType extends AbstractDataModelBase {
    paras;
    thead = false;
    colspan;
    rowspan;
    align;
    valign;
    width;
    classs;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                if (this.paras === undefined) {
                    this.paras = [];
                }
                const para = new ParaDataModel(xml, innerElement);
                this.paras.push(para);
                this.children.push(para);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_thead') {
                    this.thead = xml.getAttributeBooleanValue(element, '@_thead');
                }
                else if (attributeName === '@_colspan') {
                    assert(this.colspan === undefined);
                    this.colspan = Number(xml.getAttributeNumberValue(element, '@_colspan'));
                }
                else if (attributeName === '@_rowspan') {
                    assert(this.rowspan === undefined);
                    this.rowspan = Number(xml.getAttributeNumberValue(element, '@_rowspan'));
                }
                else if (attributeName === '@_align') {
                    assert(this.align === undefined);
                    this.align = xml.getAttributeStringValue(element, '@_align');
                }
                else if (attributeName === '@_valign') {
                    assert(this.valign === undefined);
                    this.valign = xml.getAttributeStringValue(element, '@_valign');
                }
                else if (attributeName === '@_width') {
                    assert(this.width === undefined);
                    this.width = xml.getAttributeStringValue(element, '@_width');
                }
                else if (attributeName === '@_class') {
                    assert(this.classs === undefined);
                    this.classs = xml.getAttributeStringValue(element, '@_class');
                }
                else {
                    console.error(`${elementName} attribute:`, attributeName, 'not in DTD, skipped', this.constructor.name);
                }
            }
        }
    }
}
export class DocEntryDataModel extends AbstractDocEntryType {
    constructor(xml, element) {
        super(xml, element, 'entry');
    }
}
export class AbstractDocCaptionType extends AbstractDataModelBase {
    id = '';
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                assert(this.id.length === 0);
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
    }
}
export class DocCaptionDataModel extends AbstractDocCaptionType {
    constructor(xml, element) {
        super(xml, element, 'caption');
    }
}
export class AbstractDocHeadingType extends AbstractDataModelBase {
    level = NaN;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_level') {
                    this.level = xml.getAttributeNumberValue(element, '@_level');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class HeadingDataModel extends AbstractDocHeadingType {
    constructor(xml, element) {
        super(xml, element, 'heading');
    }
}
export class AbstractDocImageType extends AbstractDataModelBase {
    type;
    name;
    width;
    height;
    alt;
    inline;
    caption;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_type') {
                this.type = xml.getAttributeStringValue(element, '@_type');
            }
            else if (attributeName === '@_name') {
                this.name = xml.getAttributeStringValue(element, '@_name');
            }
            else if (attributeName === '@_width') {
                this.width = xml.getAttributeStringValue(element, '@_width');
            }
            else if (attributeName === '@_height') {
                this.height = xml.getAttributeStringValue(element, '@_height');
            }
            else if (attributeName === '@_alt') {
                this.alt = xml.getAttributeStringValue(element, '@_alt');
            }
            else if (attributeName === '@_inline') {
                this.inline = Boolean(xml.getAttributeBooleanValue(element, '@_inline'));
            }
            else if (attributeName === '@_caption') {
                this.caption = xml.getAttributeStringValue(element, '@_caption');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        if (this.type === 'html' && this.name !== undefined && !isUrl(this.name)) {
            if (xml.dataModel.images === undefined) {
                xml.dataModel.images = [];
            }
            xml.dataModel.images.push(this);
        }
    }
}
export class ImageDataModel extends AbstractDocImageType {
    constructor(xml, element) {
        super(xml, element, 'image');
    }
}
export class AbstractDocParamListType extends AbstractDataModelBase {
    parameterItems;
    kind = '';
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'parameteritem')) {
                if (this.parameterItems === undefined) {
                    this.parameterItems = [];
                }
                this.parameterItems.push(new ParameterItemDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_kind') {
                this.kind = xml.getAttributeStringValue(element, '@_kind');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
    }
}
export class ParameterListDataModel extends AbstractDocParamListType {
    constructor(xml, element) {
        super(xml, element, 'parameterlist');
    }
}
export class AbstractDocParamListItem extends AbstractDataModelBase {
    parameterDescription;
    parameterNameList;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'parameternamelist')) {
                if (this.parameterNameList === undefined) {
                    this.parameterNameList = [];
                }
                this.parameterNameList.push(new ParameterNamelistDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'parameterdescription')) {
                this.parameterDescription = new ParameterDescriptionDataModel(xml, innerElement);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.parameterDescription !== undefined);
        assert(!xml.hasAttributes(element));
    }
}
export class ParameterItemDataModel extends AbstractDocParamListItem {
    constructor(xml, element) {
        super(xml, element, 'parameteritem');
    }
}
export class AbstractDocParamNameList extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'parametertype')) {
                this.children.push(new ParameterTypeDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'parametername')) {
                this.children.push(new ParameterNameDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class ParameterNamelistDataModel extends AbstractDocParamNameList {
    constructor(xml, element) {
        super(xml, element, 'parameternamelist');
    }
}
export class AbstractDocParamType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'ref')) {
                this.children.push(new RefTextDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class ParameterTypeDataModel extends AbstractDocParamType {
    constructor(xml, element) {
        super(xml, element, 'parametertype');
    }
}
export class AbstractDocParamName extends AbstractDataModelBase {
    direction;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'ref')) {
                this.children.push(new RefTextDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_direction') {
                    this.direction = xml.getAttributeStringValue(element, '@_direction');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class ParameterNameDataModel extends AbstractDocParamName {
    constructor(xml, element) {
        super(xml, element, 'parametername');
    }
}
export class AbstractDocXRefSectType extends AbstractDataModelBase {
    xreftitle;
    xrefdescription;
    id = '';
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.isInnerElementText(innerElement, 'xreftitle')) {
                this.xreftitle = xml.getInnerElementText(innerElement, 'xreftitle');
            }
            else if (xml.hasInnerElement(innerElement, 'xrefdescription')) {
                this.xrefdescription = new XrefDescriptionDataModel(xml, innerElement);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.xrefdescription !== undefined);
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
    }
}
export class XrefSectDataModel extends AbstractDocXRefSectType {
    constructor(xml, element) {
        super(xml, element, 'xrefsect');
    }
}
export class AbstractDocBlockQuoteType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class BlockquoteDataModel extends AbstractDocBlockQuoteType {
    constructor(xml, element) {
        super(xml, element, 'blockquote');
    }
}
export class AbstractDocEmptyType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
    }
}
export class AbstractEmojiType extends AbstractDataModelBase {
    name = '';
    unicode = '';
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length === 0);
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_name') {
                this.name = xml.getAttributeStringValue(element, '@_name');
            }
            else if (attributeName === '@_unicode') {
                this.unicode = xml.getAttributeStringValue(element, '@_unicode');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
    }
}
export class EmojiDataModel extends AbstractEmojiType {
    constructor(xml, element) {
        super(xml, element, 'emoji');
    }
}
export class BriefDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'briefdescription');
    }
}
export class DetailedDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'detaileddescription');
    }
}
export class InbodyDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'inbodydescription');
    }
}
export class DescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'description');
    }
}
export class XrefDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'xrefdescription');
    }
}
export class ParameterDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'parameterdescription');
    }
}
export class InternalDataModel extends AbstractDocInternalType {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS1DataModel extends AbstractDocInternalS1Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS2DataModel extends AbstractDocInternalS2Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS3DataModel extends AbstractDocInternalS3Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS4DataModel extends AbstractDocInternalS4Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS5DataModel extends AbstractDocInternalS5Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS6DataModel extends AbstractDocInternalS6Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class Sect1DataModel extends AbstractDocSect1Type {
    constructor(xml, element) {
        super(xml, element, 'sect1');
    }
}
export class Sect2DataModel extends AbstractDocSect2Type {
    constructor(xml, element) {
        super(xml, element, 'sect2');
    }
}
export class Sect3DataModel extends AbstractDocSect3Type {
    constructor(xml, element) {
        super(xml, element, 'sect3');
    }
}
export class Sect4DataModel extends AbstractDocSect4Type {
    constructor(xml, element) {
        super(xml, element, 'sect4');
    }
}
export class Sect5DataModel extends AbstractDocSect5Type {
    constructor(xml, element) {
        super(xml, element, 'sect5');
    }
}
export class Sect6DataModel extends AbstractDocSect6Type {
    constructor(xml, element) {
        super(xml, element, 'sect6');
    }
}
export class TitleDataModel extends AbstractDocTitleType {
    constructor(xml, element) {
        super(xml, element, 'title');
    }
}
export class TermDataModel extends AbstractDocTitleType {
    constructor(xml, element) {
        super(xml, element, 'term');
    }
}
export class ParaDataModel extends AbstractDocParaType {
    constructor(xml, element) {
        super(xml, element, 'para');
    }
}
export class BoldDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'bold');
    }
}
export class SDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 's');
    }
}
export class StrikeDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'strike');
    }
}
export class UnderlineDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'underline');
    }
}
export class EmphasisDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'emphasis');
    }
}
export class ComputerOutputDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'computeroutput');
    }
}
export class SubscriptDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'subscript');
    }
}
export class SuperscriptDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'superscript');
    }
}
export class CenterDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'center');
    }
}
export class SmallDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'small');
    }
}
export class CiteDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cite');
    }
}
export class DelDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'del');
    }
}
export class InsDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ins');
    }
}
export class SimpleSectDataModel extends AbstractDocSimpleSectType {
    constructor(xml, element) {
        super(xml, element, 'simplesect');
    }
}
export class ItemizedListDataModel extends AbstractDocListType {
    constructor(xml, element) {
        super(xml, element, 'itemizedlist');
    }
}
export class OrderedListDataModel extends AbstractDocListType {
    constructor(xml, element) {
        super(xml, element, 'orderedlist');
    }
}
export class LineBreakDataModel extends AbstractDocEmptyType {
    constructor(xml, element) {
        super(xml, element, 'linebreak');
    }
}
export class HrulerDataModel extends AbstractDocEmptyType {
    constructor(xml, element) {
        super(xml, element, 'hruler');
    }
}
export class NonBreakableSpaceDataModel extends AbstractDocEmptyType {
    constructor(xml, element) {
        super(xml, element, 'nonbreakablespace');
    }
}
export class ParaEmptyDataModel extends AbstractDocEmptyType {
    constructor(xml, element) {
        super(xml, element, 'para');
    }
}
export class AbstractVerbatimType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class VerbatimDataModel extends AbstractVerbatimType {
    constructor(xml, element) {
        super(xml, element, 'verbatim');
    }
}
export class AbstractPreformattedType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class PreformattedDataModel extends AbstractPreformattedType {
    constructor(xml, element) {
        super(xml, element, 'preformatted');
    }
}
//# sourceMappingURL=descriptiontype-dm.js.map