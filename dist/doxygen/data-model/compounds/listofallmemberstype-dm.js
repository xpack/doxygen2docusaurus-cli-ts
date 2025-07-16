import assert from 'node:assert';
import * as util from 'node:util';
import { MemberRefDataModel } from './memberreftype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export class AbstractListOfAllMembersType extends AbstractDataModelBase {
    memberRefs;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'member')) {
                if (this.memberRefs === undefined) {
                    this.memberRefs = [];
                }
                this.memberRefs.push(new MemberRefDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class ListOfAllMembersDataModel extends AbstractListOfAllMembersType {
    constructor(xml, element) {
        super(xml, element, 'listofallmembers');
    }
}
//# sourceMappingURL=listofallmemberstype-dm.js.map