import { MemberDefDataModel } from '../../data-model/compounds/memberdeftype-dm.js';
import { MemberDataModel } from '../../data-model/compounds/membertype-dm.js';
import { SectionDefDataModel } from '../../data-model/compounds/sectiondeftype-dm.js';
import { CompoundBase } from './compound-base-vm.js';
export declare class Section {
    compound: CompoundBase;
    kind: string;
    headerName: string;
    descriptionMdxText: string | undefined;
    members: Array<Member | MemberRef>;
    definitionMembers: Member[];
    _private: {
        _sectionDef?: SectionDefDataModel;
    };
    constructor(compound: CompoundBase, sectionDef: SectionDefDataModel);
    initializeLate(): void;
    hasDefinitionMembers(): boolean;
    getHeaderNameByKind(sectionDef: SectionDefDataModel): string;
    renderIndexToMdxLines(): string[];
    renderToMdxLines(): string[];
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
    briefDescriptionMdxText: string | undefined;
    detailedDescriptionMdxText: string | undefined;
    argsstring: string | undefined;
    qualifiedName: string | undefined;
    definition: string | undefined;
    typeMdxText: string | undefined;
    initializerMdxText: string | undefined;
    locationMdxText: string | undefined;
    templateParametersMdxText: string | undefined;
    enumMdxLines: string[] | undefined;
    parameters: string | undefined;
    labels: string[];
    isTrailingType: boolean;
    isConstexpr: boolean;
    isStrong: boolean;
    isConst: boolean;
    _private: {
        _memberDef?: MemberDefDataModel;
    };
    constructor(section: Section, memberDef: MemberDefDataModel);
    initializeLate(): void;
    renderIndexToMdxLines(): string[];
    renderToMdxLines(): string[];
    renderEnumToMdxLines(memberDef: MemberDefDataModel): string[];
}
export declare class MemberRef extends MemberBase {
    refid: string;
    constructor(section: Section, memberRef: MemberDataModel);
}
export {};
