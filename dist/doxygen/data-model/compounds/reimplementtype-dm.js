import assert from 'node:assert';
import util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
export class AbstractReimplementType extends AbstractDataModelBase {
    text = '';
    refId = '';
    constructor(xml, element, elementName) {
        super(elementName);
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        assert(this.text.length > 0);
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_refid') {
                this.refId = xml.getAttributeStringValue(element, '@_refid');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.refId.length > 0);
    }
}
export class ReimplementDataModel extends AbstractReimplementType {
    constructor(xml, element) {
        super(xml, element, 'reimplements');
    }
}
export class ReimplementedByDataModel extends AbstractReimplementType {
    constructor(xml, element) {
        super(xml, element, 'reimplementedby');
    }
}
//# sourceMappingURL=reimplementtype-dm.js.map