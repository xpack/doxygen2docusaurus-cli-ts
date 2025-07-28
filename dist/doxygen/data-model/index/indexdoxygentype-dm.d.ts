import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { IndexCompoundDataModel } from './indexcompoundtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractIndexDoxygenType extends AbstractDataModelBase {
    version: string;
    lang: string;
    compounds?: IndexCompoundDataModel[] | undefined;
    noNamespaceSchemaLocation?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * @public
 */
export declare class DoxygenIndexDataModel extends AbstractIndexDoxygenType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=indexdoxygentype-dm.d.ts.map