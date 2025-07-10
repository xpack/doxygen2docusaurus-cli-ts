import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { MemberRefDataModel } from './memberreftype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractListOfAllMembersType extends AbstractDataModelBase {
    memberRefs?: MemberRefDataModel[] | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ListOfAllMembersDataModel extends AbstractListOfAllMembersType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=listofallmemberstype-dm.d.ts.map