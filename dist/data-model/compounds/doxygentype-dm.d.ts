import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { CompoundDefDataModel } from './compounddef-dm.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractDoxygenType extends AbstractDataModelBase {
    version: string;
    lang: string;
    compoundDefs?: CompoundDefDataModel[] | undefined;
    noNamespaceSchemaLocation?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class DoxygenDataModel extends AbstractDoxygenType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
