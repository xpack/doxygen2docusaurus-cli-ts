import assert from 'node:assert';
import * as util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
export class AbstractMemberRefType extends AbstractDataModelBase {
    scope = '';
    name = '';
    refid = '';
    prot = '';
    virt = '';
    ambiguityscope;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.isInnerElementText(innerElement, 'scope')) {
                this.scope = xml.getInnerElementText(innerElement, 'scope');
            }
            else if (xml.isInnerElementText(innerElement, 'name')) {
                this.name = xml.getInnerElementText(innerElement, 'name');
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.scope.length > 0);
        assert(this.name.length > 0);
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_refid') {
                this.refid = xml.getAttributeStringValue(element, '@_refid');
            }
            else if (attributeName === '@_prot') {
                this.prot = xml.getAttributeStringValue(element, '@_prot');
            }
            else if (attributeName === '@_virt') {
                this.virt = xml.getAttributeStringValue(element, '@_virt');
            }
            else if (attributeName === '@_ambiguityscope') {
                this.ambiguityscope = xml.getAttributeStringValue(element, '@_ambiguityscope');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.refid.length > 0);
        assert(this.prot.length > 0);
        assert(this.virt.length > 0);
    }
}
export class MemberRefDataModel extends AbstractMemberRefType {
    constructor(xml, element) {
        super(xml, element, 'member');
    }
}
//# sourceMappingURL=memberreftype-dm.js.map