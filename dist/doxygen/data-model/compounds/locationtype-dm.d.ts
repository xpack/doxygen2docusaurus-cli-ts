import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractLocationType extends AbstractDataModelBase {
    file: string;
    line?: number | undefined;
    column?: number | undefined;
    declfile?: string | undefined;
    declline?: number | undefined;
    declcolumn?: number | undefined;
    bodyfile?: string | undefined;
    bodystart?: number | undefined;
    bodyend?: number | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * @public
 */
export declare class LocationDataModel extends AbstractLocationType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=locationtype-dm.d.ts.map