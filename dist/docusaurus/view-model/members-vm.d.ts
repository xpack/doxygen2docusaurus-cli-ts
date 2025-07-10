import type { MemberDefDataModel } from '../../doxygen/data-model/compounds/memberdeftype-dm.js';
import type { MemberDataModel } from '../../doxygen/data-model/compounds/membertype-dm.js';
import type { SectionDefDataModel } from '../../doxygen/data-model/compounds/sectiondeftype-dm.js';
import type { CompoundBase } from './compound-base-vm.js';
import { MemberProgramListingDataModel, type ProgramListingDataModel } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
import type { LocationDataModel } from '../../doxygen/data-model/compounds/locationtype-dm.js';
import type { EnumValueDataModel } from '../../doxygen/data-model/compounds/enumvaluetype-dm.js';
export declare const sectionHeaders: Record<string, [string, number]>;
export declare class Section {
    compound: CompoundBase;
    kind: string;
    headerName: string;
    descriptionLines: string[] | undefined;
    indexMembers: Array<MemberRef | Member>;
    definitionMembers: Member[];
    _private: {
        _sectionDef?: SectionDefDataModel;
    };
    constructor(compound: CompoundBase, sectionDef: SectionDefDataModel);
    initializeLate(): void;
    hasDefinitionMembers(): boolean;
    getHeaderNameByKind(sectionDef: SectionDefDataModel): string;
    getSectionOrderByKind(): number;
    renderIndexToLines(): string[];
    renderToLines(): string[];
}
declare class MemberBase {
    section: Section;
    name: string;
    constructor(section: Section, name: string);
    initializeLate(): void;
}
export declare class Member extends MemberBase {
    id: string;
    kind: string;
    briefDescriptionHtmlString: string | undefined;
    detailedDescriptionHtmlLines: string[] | undefined;
    argsstring: string | undefined;
    qualifiedName: string | undefined;
    definition: string | undefined;
    type: string | undefined;
    initializerHtmlLines: string[] | undefined;
    locationMarkdownLines: string[] | undefined;
    templateParameters: string | undefined;
    enumHtmlLines: string[] | undefined;
    parametersHtmlString: string | undefined;
    programListing: ProgramListingDataModel | undefined;
    referencedByMarkdownString: string | undefined;
    referencesMarkdownString: string | undefined;
    enumValues: EnumValue[] | undefined;
    labels: string[];
    isTrailingType: boolean;
    isConstexpr: boolean;
    isStrong: boolean;
    isConst: boolean;
    isStatic: boolean;
    _private: {
        _memberDef?: MemberDefDataModel;
    };
    constructor(section: Section, memberDef: MemberDefDataModel);
    initializeLate(): void;
    filterProgramListingForLocation(location: LocationDataModel | undefined): MemberProgramListingDataModel | undefined;
    renderIndexToLines(): string[];
    renderToLines(): string[];
    private renderMemberDefinitionToLines;
    renderEnumToLines(): string[];
}
export declare class MemberRef extends MemberBase {
    refid: string;
    constructor(section: Section, memberRef: MemberDataModel);
}
export declare class EnumValue {
    name: string;
    id: string;
    briefDescriptionHtmlString: string | undefined;
    initializerHtmlString: string | undefined;
    member: Member;
    constructor(member: Member, enumValue: EnumValueDataModel);
}
export {};
