import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractDoxygenFileOptionType extends AbstractDataModelBase {
    values: string[] | undefined;
    id: string;
    default: string;
    type: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export type DoxyfileDefaultType = 'yes' | 'no';
export type DoxyfileTypeType = 'int' | 'bool' | 'string' | 'stringlist';
export declare class DoxygenFileOptionDataModel extends AbstractDoxygenFileOptionType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
