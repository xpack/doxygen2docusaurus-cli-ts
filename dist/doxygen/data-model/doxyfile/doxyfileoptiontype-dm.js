import assert from 'node:assert';
import * as util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
export class AbstractDoxygenFileOptionType extends AbstractDataModelBase {
    values;
    id = '';
    default = '';
    type = '';
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.isInnerElementText(innerElement, 'value')) {
                if (this.values === undefined) {
                    this.values = [];
                }
                this.values.push(xml.getInnerElementText(innerElement, 'value'));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`doxyfile ${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else if (attributeName === '@_default') {
                this.default = xml.getAttributeStringValue(element, '@_default');
            }
            else if (attributeName === '@_type') {
                this.type = xml.getAttributeStringValue(element, '@_type');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`doxyfile ${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
        assert(this.default.length > 0);
        assert(this.type.length > 0);
    }
}
export class DoxygenFileOptionDataModel extends AbstractDoxygenFileOptionType {
    constructor(xml, element) {
        super(xml, element, 'option');
    }
}
//# sourceMappingURL=doxyfileoptiontype-dm.js.map