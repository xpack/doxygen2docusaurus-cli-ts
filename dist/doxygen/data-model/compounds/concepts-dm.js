import assert from 'node:assert';
import * as util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
import { AbstractDescriptionType, ProgramListingDataModel, } from './descriptiontype-dm.js';
export class AbstractConceptParts extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'codepart')) {
                this.children.push(new ConceptCodePartDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'docpart')) {
                this.children.push(new ConceptDocPartDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
    }
}
export class ConceptPartsDataModel extends AbstractConceptParts {
    constructor(xml, element) {
        super(xml, element, 'conceptparts');
    }
}
export class AbstractConceptCodePart extends AbstractDataModelBase {
    programListing;
    line;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'programlisting')) {
                this.programListing = new ProgramListingDataModel(xml, innerElement);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_line') {
                this.line = xml.getAttributeNumberValue(element, '@_line');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.line !== undefined);
        assert(this.line > 0);
    }
}
export class ConceptCodePartDataModel extends AbstractConceptCodePart {
    constructor(xml, element) {
        super(xml, element, 'codepart');
    }
}
export class ConceptDocPartDataModel extends AbstractDescriptionType {
    line;
    col;
    constructor(xml, element) {
        super(xml, element, 'docpart');
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_line') {
                this.line = xml.getAttributeNumberValue(element, '@_line');
            }
            else if (attributeName === '@_col') {
                this.col = xml.getAttributeNumberValue(element, '@_col');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`docpart attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.line !== undefined);
        assert(this.line > 0);
        assert(this.col !== undefined);
        assert(this.col > 0);
    }
}
//# sourceMappingURL=concepts-dm.js.map