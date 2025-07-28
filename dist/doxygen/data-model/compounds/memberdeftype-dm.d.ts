import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { BriefDescriptionDataModel, DetailedDescriptionDataModel, InbodyDescriptionDataModel } from './descriptiontype-dm.js';
import { InitializerDataModel, TypeDataModel } from './linkedtexttype-dm.js';
import { LocationDataModel } from './locationtype-dm.js';
import { ParamDataModel } from './paramtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
import { TemplateParamListDataModel } from './templateparamlisttype-dm.js';
import { EnumValueDataModel } from './enumvaluetype-dm.js';
import { ReimplementDataModel } from './reimplementtype-dm.js';
import { ReferenceDataModel, ReferencedByDataModel } from './referencetype-dm.js';
export type DoxMemberKind = 'define' | 'property' | 'event' | 'variable' | 'typedef' | 'enum' | 'function' | 'signal' | 'prototype' | 'friend' | 'dcop' | 'slot' | 'interface' | 'service';
/**
 * @public
 */
export declare abstract class AbstractMemberBaseType extends AbstractDataModelBase {
    name: string;
    kind: string;
}
/**
 * @public
 */
export declare abstract class AbstractMemberDefType extends AbstractMemberBaseType {
    location: LocationDataModel | undefined;
    id: string;
    prot: string;
    staticc: boolean | undefined;
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
    references?: ReferenceDataModel[] | undefined;
    referencedBy?: ReferencedByDataModel[] | undefined;
    extern?: boolean | undefined;
    strong?: boolean | undefined;
    constt?: boolean | undefined;
    explicit?: boolean | undefined;
    inline?: boolean | undefined;
    refqual?: boolean | undefined;
    virt?: string | undefined;
    volatile?: boolean | undefined;
    mutable?: boolean | undefined;
    noexcept?: boolean | undefined;
    noexceptexpression?: boolean | undefined;
    nodiscard?: boolean | undefined;
    constexpr?: boolean | undefined;
    consteval?: boolean | undefined;
    constinit?: boolean | undefined;
    final?: boolean | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * @public
 */
export declare class MemberDefDataModel extends AbstractMemberDefType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=memberdeftype-dm.d.ts.map