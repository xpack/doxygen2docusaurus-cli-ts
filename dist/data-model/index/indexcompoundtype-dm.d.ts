import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { IndexMemberDataModel } from './indexmembertype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractIndexCompoundType extends AbstractDataModelBase {
    name: string;
    members: IndexMemberDataModel[] | undefined;
    refid: string;
    kind: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export type IndexCompoundKind = 'class' | 'struct' | 'union' | 'interface' | 'protocol' | 'category' | 'exception' | 'file' | 'namespace' | 'protocol' | 'category' | 'exception' | 'file' | 'namespace' | 'group' | 'page' | 'example' | 'dir' | 'type' | 'concept' | 'module';
export declare class IndexCompoundDataModel extends AbstractIndexCompoundType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
