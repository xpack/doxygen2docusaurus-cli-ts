import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractRefTextType extends AbstractDataModelBase {
    text: string;
    refid: string;
    kindref: string;
    external?: string | undefined;
    tooltip?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export type DoxRefKind = 'compound' | 'member';
export declare class RefTextDataModel extends AbstractRefTextType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=reftexttype-dm.d.ts.map