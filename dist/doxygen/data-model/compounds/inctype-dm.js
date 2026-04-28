import assert from 'node:assert';
import util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
export class AbstractIncType extends AbstractDataModelBase {
    text = '';
    local = false;
    refId;
    constructor(xml, element, elementName) {
        super(elementName);
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        assert(this.text.length > 0);
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_local') {
                this.local = xml.getAttributeBooleanValue(element, '@_local');
            }
            else if (attributeName === '@_refid') {
                this.refId = xml.getAttributeStringValue(element, '@_refid');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
    }
}
export class IncludesDataModel extends AbstractIncType {
    constructor(xml, element) {
        super(xml, element, 'includes');
    }
}
export class IncludedByDataModel extends AbstractIncType {
    constructor(xml, element) {
        super(xml, element, 'includedby');
    }
}
//# sourceMappingURL=inctype-dm.js.map