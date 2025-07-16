import assert from 'node:assert';
import * as util from 'node:util';
import { RefTextDataModel } from './reftexttype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export class AbstractLinkedTextType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'ref')) {
                this.children.push(new RefTextDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class InitializerDataModel extends AbstractLinkedTextType {
    constructor(xml, element) {
        super(xml, element, 'initializer');
    }
}
export class TypeDataModel extends AbstractLinkedTextType {
    constructor(xml, element) {
        super(xml, element, 'type');
    }
}
export class DefValDataModel extends AbstractLinkedTextType {
    constructor(xml, element) {
        super(xml, element, 'defval');
    }
}
export class TypeConstraintDataModel extends AbstractLinkedTextType {
    constructor(xml, element) {
        super(xml, element, 'typeconstraint');
    }
}
//# sourceMappingURL=linkedtexttype-dm.js.map