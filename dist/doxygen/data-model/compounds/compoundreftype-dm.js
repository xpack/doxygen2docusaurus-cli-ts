import assert from 'node:assert';
import * as util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
export class AbstractCompoundRefType extends AbstractDataModelBase {
    text = '';
    prot = '';
    virt = '';
    refid;
    constructor(xml, element, elementName) {
        super(elementName);
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        assert(this.text.length > 0);
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_prot') {
                this.prot = xml.getAttributeStringValue(element, '@_prot');
            }
            else if (attributeName === '@_virt') {
                this.virt = xml.getAttributeStringValue(element, '@_virt');
            }
            else if (attributeName === '@_refid') {
                this.refid = xml.getAttributeStringValue(element, '@_refid');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.prot.length > 0);
        assert(this.virt.length > 0);
    }
}
export class BaseCompoundRefDataModel extends AbstractCompoundRefType {
    constructor(xml, element) {
        super(xml, element, 'basecompoundref');
    }
}
export class DerivedCompoundRefDataModel extends AbstractCompoundRefType {
    constructor(xml, element) {
        super(xml, element, 'derivedcompoundref');
    }
}
//# sourceMappingURL=compoundreftype-dm.js.map