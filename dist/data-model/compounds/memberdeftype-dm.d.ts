import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { BriefDescriptionDataModel, DetailedDescriptionDataModel, InbodyDescriptionDataModel } from './descriptiontype-dm.js';
import { InitializerDataModel, TypeDataModel } from './linkedtexttype-dm.js';
import { LocationDataModel } from './locationtype-dm.js';
import { ParamDataModel } from './paramtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
import { TemplateParamListDataModel } from './templateparamlisttype-dm.js';
import { EnumValueDataModel } from './enumvaluetype-dm.js';
import { ReimplementDataModel } from './reimplementtype-dm.js';
export type DoxMemberKind = 'define' | 'property' | 'event' | 'variable' | 'typedef' | 'enum' | 'function' | 'signal' | 'prototype' | 'friend' | 'dcop' | 'slot' | 'interface' | 'service';
export declare abstract class AbstractMemberBaseType extends AbstractDataModelBase {
    name: string;
    kind: string;
}
export declare abstract class AbstractMemberDefType extends AbstractMemberBaseType {
    location: LocationDataModel | undefined;
    id: string;
    prot: string;
    staticc: Boolean | undefined;
    templateparamlist?: TemplateParamListDataModel | undefined;
    type?: TypeDataModel | undefined;
    definition?: string | undefined;
    argsstring?: string | undefined;
    qualifiedName?: string | undefined;
    bitfield?: string | undefined;
    reimplements?: ReimplementDataModel[] | undefined;
    reimplementedBys?: ReimplementDataModel[] | undefined;
    params?: ParamDataModel[] | undefined;
    enumvalues?: EnumValueDataModel[] | undefined;
    initializer?: InitializerDataModel | undefined;
    briefDescription?: BriefDescriptionDataModel | undefined;
    detailedDescription?: DetailedDescriptionDataModel | undefined;
    inbodyDescription?: InbodyDescriptionDataModel | undefined;
    extern?: Boolean | undefined;
    strong?: Boolean | undefined;
    constt?: Boolean | undefined;
    explicit?: Boolean | undefined;
    inline?: Boolean | undefined;
    refqual?: Boolean | undefined;
    virt?: string | undefined;
    volatile?: Boolean | undefined;
    mutable?: Boolean | undefined;
    noexcept?: Boolean | undefined;
    noexceptexpression?: Boolean | undefined;
    nodiscard?: Boolean | undefined;
    constexpr?: Boolean | undefined;
    consteval?: Boolean | undefined;
    constinit?: Boolean | undefined;
    final?: Boolean | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class MemberDefDataModel extends AbstractMemberDefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
