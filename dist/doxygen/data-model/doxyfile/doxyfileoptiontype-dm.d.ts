import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractDoxygenFileOptionType extends AbstractDataModelBase {
    values: string[] | undefined;
    id: string;
    default: string;
    type: string;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export type DoxyfileDefaultType = 'yes' | 'no';
export type DoxyfileTypeType = 'int' | 'bool' | 'string' | 'stringlist';
/**
 * @public
 */
export declare class DoxygenFileOptionDataModel extends AbstractDoxygenFileOptionType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=doxyfileoptiontype-dm.d.ts.map