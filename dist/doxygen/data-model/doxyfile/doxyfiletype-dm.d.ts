import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { DoxygenFileOptionDataModel } from './doxyfileoptiontype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractDoxygenFileType extends AbstractDataModelBase {
    version: string;
    lang: string;
    options?: DoxygenFileOptionDataModel[] | undefined;
    noNamespaceSchemaLocation?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class DoxygenFileDataModel extends AbstractDoxygenFileType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
