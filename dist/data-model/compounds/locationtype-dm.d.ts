import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractLocationType extends AbstractDataModelBase {
    file: string;
    line?: Number | undefined;
    column?: Number | undefined;
    declfile?: string | undefined;
    declline?: Number | undefined;
    declcolumn?: Number | undefined;
    bodyfile?: string | undefined;
    bodystart?: Number | undefined;
    bodyend?: Number | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class LocationDataModel extends AbstractLocationType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
