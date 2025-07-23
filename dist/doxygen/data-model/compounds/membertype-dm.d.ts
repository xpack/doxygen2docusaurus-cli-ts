import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractMemberBaseType } from './memberdeftype-dm.js';
/**
 * @public
 */
export declare abstract class AbstractMemberType extends AbstractMemberBaseType {
    refid: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export type MemberKind = 'define' | 'property' | 'event' | 'variable' | 'typedef' | 'enum' | 'function' | 'signal' | 'prototype' | 'friend' | 'dcop' | 'slot';
/**
 * @public
 */
export declare class MemberDataModel extends AbstractMemberType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=membertype-dm.d.ts.map