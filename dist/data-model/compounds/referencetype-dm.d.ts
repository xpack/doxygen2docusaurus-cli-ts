import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractReferenceType extends AbstractDataModelBase {
    text: string;
    refid: string;
    startline: Number | undefined;
    endline: Number | undefined;
    compoundref?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ReferenceDataModel extends AbstractReferenceType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ReferencedByDataModel extends AbstractReferenceType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
