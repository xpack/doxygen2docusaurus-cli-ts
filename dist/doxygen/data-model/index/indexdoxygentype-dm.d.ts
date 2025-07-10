import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { IndexCompoundDataModel } from './indexcompoundtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractIndexDoxygenType extends AbstractDataModelBase {
    version: string;
    lang: string;
    compounds?: IndexCompoundDataModel[] | undefined;
    noNamespaceSchemaLocation?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class DoxygenIndexDataModel extends AbstractIndexDoxygenType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
