import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractIndexMemberType extends AbstractDataModelBase {
    name: string;
    refid: string;
    kind: string;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export type IndexMemberKind = 'define' | 'property' | 'event' | 'variable' | 'typedef' | 'enum' | 'enumvalue' | 'function' | 'signal' | 'prototype' | 'friend' | 'dcop' | 'slot';
/**
 * @public
 */
export declare class IndexMemberDataModel extends AbstractIndexMemberType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=indexmembertype-dm.d.ts.map