import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { DescriptionDataModel } from './descriptiontype-dm.js';
import { MemberDefDataModel } from './memberdeftype-dm.js';
import { MemberDataModel } from './membertype-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractSectionDefTypeBase extends AbstractDataModelBase {
    kind: string;
    header?: string | undefined;
    description?: DescriptionDataModel | undefined;
    memberDefs?: MemberDefDataModel[] | undefined;
    members?: MemberDataModel[] | undefined;
    constructor(elementName: string, kind: string);
    hasMembers(): boolean;
    computeAdjustedKind(sectionSuffix: string, memberSuffix?: string): string;
}
/**
 * @public
 */
export declare abstract class AbstractSectionDefType extends AbstractSectionDefTypeBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * @public
 */
export declare class SectionDefDataModel extends AbstractSectionDefType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SectionDefByKindDataModel extends AbstractSectionDefTypeBase {
    constructor(kind: string);
}
//# sourceMappingURL=sectiondeftype-dm.d.ts.map