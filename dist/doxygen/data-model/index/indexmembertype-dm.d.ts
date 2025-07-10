import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractIndexMemberType extends AbstractDataModelBase {
    name: string;
    refid: string;
    kind: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export type IndexMemberKind = 'define' | 'property' | 'event' | 'variable' | 'typedef' | 'enum' | 'enumvalue' | 'function' | 'signal' | 'prototype' | 'friend' | 'dcop' | 'slot';
export declare class IndexMemberDataModel extends AbstractIndexMemberType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=indexmembertype-dm.d.ts.map