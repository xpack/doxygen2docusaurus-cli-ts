import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractMemberRefType extends AbstractDataModelBase {
    scope: string;
    name: string;
    refid: string;
    prot: string;
    virt: string;
    ambiguityscope?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
/**
 * @public
 */
export declare class MemberRefDataModel extends AbstractMemberRefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=memberreftype-dm.d.ts.map