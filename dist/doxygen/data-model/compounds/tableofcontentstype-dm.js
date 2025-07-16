import assert from 'node:assert';
import * as util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
import { parseDocTitleCmdGroup, } from './descriptiontype-dm.js';
export class AbstractTableOfContentsType extends AbstractDataModelBase {
    tocSect;
    tableOfContents;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'tocsect')) {
                if (this.tocSect === undefined) {
                    this.tocSect = [];
                }
                this.tocSect.push(new TocSectDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'tableofcontents')) {
                if (this.tableOfContents === undefined) {
                    this.tableOfContents = [];
                }
                this.tableOfContents.push(new TableOfContentsDataModel(xml, innerElement));
            }
            else {
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class TableOfContentsDataModel extends AbstractTableOfContentsType {
    constructor(xml, element) {
        super(xml, element, 'tableofcontents');
    }
}
export class AbstractTableOfContentsKindType extends AbstractDataModelBase {
    name = '';
    reference = '';
    tableOfContents;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.isInnerElementText(innerElement, 'name')) {
                this.name = xml.getInnerElementText(innerElement, 'name');
            }
            else if (xml.isInnerElementText(innerElement, 'reference')) {
                this.reference = xml.getInnerElementText(innerElement, 'reference');
            }
            else if (xml.hasInnerElement(innerElement, 'docs')) {
            }
            else if (xml.hasInnerElement(innerElement, 'tableofcontents')) {
                if (this.tableOfContents === undefined) {
                    this.tableOfContents = [];
                }
                this.tableOfContents.push(new TableOfContentsDataModel(xml, innerElement));
            }
            else {
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class TocSectDataModel extends AbstractTableOfContentsKindType {
    constructor(xml, element) {
        super(xml, element, 'tocsect');
    }
}
export class AbstractTocDocItemType extends AbstractDataModelBase {
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
export class TocItemDataModel extends AbstractTocDocItemType {
    constructor(xml, element) {
        super(xml, element, 'tocitem');
    }
}
export class AbstractDocTocListType extends AbstractDataModelBase {
    tocItems;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'tocitem')) {
                if (this.tocItems === undefined) {
                    this.tocItems = [];
                }
                this.tocItems.push(new TocItemDataModel(xml, innerElement));
            }
            else {
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class TocListDataModel extends AbstractDocTocListType {
    constructor(xml, element) {
        super(xml, element, 'toclist');
    }
}
//# sourceMappingURL=tableofcontentstype-dm.js.map