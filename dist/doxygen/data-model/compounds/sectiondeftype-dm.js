import assert from 'node:assert';
import * as util from 'node:util';
import { DescriptionDataModel } from './descriptiontype-dm.js';
import { MemberDefDataModel } from './memberdeftype-dm.js';
import { MemberDataModel } from './membertype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export class AbstractSectionDefTypeBase extends AbstractDataModelBase {
    kind = '';
    header;
    description;
    memberDefs;
    members;
    constructor(elementName, kind) {
        super(elementName);
        this.kind = kind;
    }
    hasMembers() {
        return this.memberDefs !== undefined || this.members !== undefined;
    }
    computeAdjustedKind(sectionSuffix, memberSuffix = sectionSuffix) {
        if (this.kind === 'user-defined') {
            return memberSuffix;
        }
        if (this.kind.includes('-')) {
            return `${this.kind.replace(/[-][a-z][a-z]*$/, '-')}${sectionSuffix}`;
        }
        else {
            return memberSuffix;
        }
    }
}
export class AbstractSectionDefType extends AbstractSectionDefTypeBase {
    constructor(xml, element, elementName) {
        super(elementName, '');
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.isInnerElementText(innerElement, 'header')) {
                assert(this.header === undefined);
                this.header = xml.getInnerElementText(innerElement, 'header');
            }
            else if (xml.hasInnerElement(innerElement, 'description')) {
                assert(this.description === undefined);
                this.description = new DescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'memberdef')) {
                if (this.memberDefs === undefined) {
                    this.memberDefs = [];
                }
                this.memberDefs.push(new MemberDefDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'member')) {
                if (this.members === undefined) {
                    this.members = [];
                }
                this.members.push(new MemberDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_kind') {
                assert(this.kind.length === 0);
                this.kind = xml.getAttributeStringValue(element, '@_kind');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.kind.length > 0);
    }
}
export class SectionDefDataModel extends AbstractSectionDefType {
    constructor(xml, element) {
        super(xml, element, 'sectiondef');
    }
}
export class SectionDefByKindDataModel extends AbstractSectionDefTypeBase {
    constructor(kind) {
        super('sectiondef', kind);
    }
}
//# sourceMappingURL=sectiondeftype-dm.js.map