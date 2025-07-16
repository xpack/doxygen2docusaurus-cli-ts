import assert from 'node:assert';
import * as util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
export class AbstractIndexMemberType extends AbstractDataModelBase {
    name = '';
    refid = '';
    kind = '';
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.isInnerElementText(innerElement, 'name')) {
                assert(this.name.length === 0);
                this.name = xml.getInnerElementText(innerElement, 'name');
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`index ${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_refid') {
                this.refid = xml.getAttributeStringValue(element, '@_refid');
            }
            else if (attributeName === '@_kind') {
                this.kind = xml.getAttributeStringValue(element, '@_kind');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`index ${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.refid.length > 0);
        assert(this.kind.length > 0);
    }
}
export class IndexMemberDataModel extends AbstractIndexMemberType {
    constructor(xml, element) {
        super(xml, element, 'member');
    }
}
//# sourceMappingURL=indexmembertype-dm.js.map