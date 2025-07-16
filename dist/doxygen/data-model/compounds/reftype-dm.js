import assert from 'node:assert';
import util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
export class AbstractRefType extends AbstractDataModelBase {
    text = '';
    refid = '';
    prot;
    inline;
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
            else if (attributeName === '@_prot') {
                this.prot = xml.getAttributeStringValue(element, '@_prot');
            }
            else if (attributeName === '@_inline') {
                this.inline = Boolean(xml.getAttributeBooleanValue(element, '@_inline'));
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.refid.length > 0);
    }
}
export class InnerModuleDataModel extends AbstractRefType {
    constructor(xml, element) {
        super(xml, element, 'innermodule');
    }
}
export class InnerDirDataModel extends AbstractRefType {
    constructor(xml, element) {
        super(xml, element, 'innerdir');
    }
}
export class InnerFileDataModel extends AbstractRefType {
    constructor(xml, element) {
        super(xml, element, 'innerfile');
    }
}
export class InnerClassDataModel extends AbstractRefType {
    constructor(xml, element) {
        super(xml, element, 'innerclass');
    }
}
export class InnerConceptDataModel extends AbstractRefType {
    constructor(xml, element) {
        super(xml, element, 'innerconcept');
    }
}
export class InnerNamespaceDataModel extends AbstractRefType {
    constructor(xml, element) {
        super(xml, element, 'innernamespace');
    }
}
export class InnerPageDataModel extends AbstractRefType {
    constructor(xml, element) {
        super(xml, element, 'innerpage');
    }
}
export class InnerGroupDataModel extends AbstractRefType {
    constructor(xml, element) {
        super(xml, element, 'innergroup');
    }
}
//# sourceMappingURL=reftype-dm.js.map