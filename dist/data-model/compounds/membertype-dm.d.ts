import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractMemberType extends AbstractDataModelBase {
    name: string;
    refid: string;
    kind: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export type MemberKind = 'define' | 'property' | 'event' | 'variable' | 'typedef' | 'enum' | 'function' | 'signal' | 'prototype' | 'friend' | 'dcop' | 'slot';
export declare class MemberDataModel extends AbstractMemberType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
