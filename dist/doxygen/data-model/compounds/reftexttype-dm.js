import assert from 'node:assert';
import util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
export class AbstractRefTextType extends AbstractDataModelBase {
    text = '';
    refid = '';
    kindref = '';
    external;
    tooltip;
    constructor(xml, element, elementName) {
        super(elementName);
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        assert(this.text.length > 0);
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
            else if (attributeName === '@_tooltip') {
                this.tooltip = xml.getAttributeStringValue(element, '@_tooltip');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.refid.length > 0);
        assert(this.kindref.length > 0);
    }
}
export class RefTextDataModel extends AbstractRefTextType {
    constructor(xml, element) {
        super(xml, element, 'ref');
    }
}
//# sourceMappingURL=reftexttype-dm.js.map