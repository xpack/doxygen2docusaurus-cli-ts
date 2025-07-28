import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { MemberRefDataModel } from './memberreftype-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractListOfAllMembersType extends AbstractDataModelBase {
    memberRefs?: MemberRefDataModel[] | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * @public
 */
export declare class ListOfAllMembersDataModel extends AbstractListOfAllMembersType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=listofallmemberstype-dm.d.ts.map