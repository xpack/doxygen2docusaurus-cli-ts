import { MemberDefDataModel } from '../../data-model/compounds/memberdeftype-dm.js';
import { MemberDataModel } from '../../data-model/compounds/membertype-dm.js';
import { SectionDefDataModel } from '../../data-model/compounds/sectiondeftype-dm.js';
import { CompoundBase } from './compound-base-vm.js';
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
    briefDescriptionNoParaString: string | undefined;
    detailedDescriptionLines: string[] | undefined;
    argsstring: string | undefined;
    qualifiedName: string | undefined;
    definition: string | undefined;
    type: string | undefined;
    initializer: string | undefined;
    locationLines: string[] | undefined;
    templateParameters: string | undefined;
    enumLines: string[] | undefined;
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
    renderIndexToLines(): string[];
    renderToLines(): string[];
    private renderMemberDefinitionToLines;
    renderEnumToLines(memberDef: MemberDefDataModel): string[];
}
export declare class MemberRef extends MemberBase {
    refid: string;
    constructor(section: Section, memberRef: MemberDataModel);
}
export {};
