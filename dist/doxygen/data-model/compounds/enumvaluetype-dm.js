import assert from 'node:assert';
import * as util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
import { BriefDescriptionDataModel, DetailedDescriptionDataModel, } from './descriptiontype-dm.js';
import { InitializerDataModel } from './linkedtexttype-dm.js';
export class AbstractEnumValueType extends AbstractDataModelBase {
    name = '';
    initializer;
    briefDescription;
    detailedDescription;
    id = '';
    prot = '';
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
            else if (xml.hasInnerElement(innerElement, 'initializer')) {
                this.initializer = new InitializerDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
                this.briefDescription = new BriefDescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
                this.detailedDescription = new DetailedDescriptionDataModel(xml, innerElement);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.name.length > 0);
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else if (attributeName === '@_prot') {
                this.prot = xml.getAttributeStringValue(element, '@_prot');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
        assert(this.prot.length > 0);
    }
}
export class EnumValueDataModel extends AbstractEnumValueType {
    constructor(xml, element) {
        super(xml, element, 'enumvalue');
    }
}
//# sourceMappingURL=enumvaluetype-dm.js.map