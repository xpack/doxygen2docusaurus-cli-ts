import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractIncType extends AbstractDataModelBase {
    text: string;
    local: boolean;
    refId?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * @public
 */
export declare class IncludesDataModel extends AbstractIncType {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * @public
 */
export declare class IncludedByDataModel extends AbstractIncType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=inctype-dm.d.ts.map