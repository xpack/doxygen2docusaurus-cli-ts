import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractReimplementType extends AbstractDataModelBase {
    text: string;
    refId: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
/**
 * @public
 */
export declare class ReimplementDataModel extends AbstractReimplementType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ReimplementedByDataModel extends AbstractReimplementType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=reimplementtype-dm.d.ts.map