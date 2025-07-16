import assert from 'node:assert';
import util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
export class AbstractReferenceType extends AbstractDataModelBase {
    text = '';
    refid = '';
    startline;
    endline;
    compoundref;
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
            else if (attributeName === '@_startline') {
                this.startline = Number(xml.getAttributeNumberValue(element, '@_startline'));
            }
            else if (attributeName === '@_endline') {
                this.endline = Number(xml.getAttributeNumberValue(element, '@_endline'));
            }
            else if (attributeName === '@_compoundref') {
                this.compoundref = xml.getAttributeStringValue(element, '@_compoundref');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.refid.length > 0);
    }
}
export class ReferenceDataModel extends AbstractReferenceType {
    constructor(xml, element) {
        super(xml, element, 'references');
    }
}
export class ReferencedByDataModel extends AbstractReferenceType {
    constructor(xml, element) {
        super(xml, element, 'referencedby');
    }
}
//# sourceMappingURL=referencetype-dm.js.map