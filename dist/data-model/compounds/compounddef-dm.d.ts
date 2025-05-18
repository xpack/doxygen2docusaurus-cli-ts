import { IncludedByDataModel, IncludesDataModel } from './inctype-dm.js';
import { BaseCompoundRefDataModel, DerivedCompoundRefDataModel } from './compoundreftype-dm.js';
import { TemplateParamListDataModel } from './templateparamlisttype-dm.js';
import { SectionDefDataModel } from './sectiondeftype-dm.js';
import { ListOfAllMembersDataModel } from './listofallmemberstype-dm.js';
import { BriefDescriptionDataModel, DetailedDescriptionDataModel, ProgramListingDataModel } from './descriptiontype-dm.js';
import { InnerClassDataModel, InnerDirDataModel, InnerFileDataModel, InnerGroupDataModel, InnerNamespaceDataModel } from './reftype-dm.js';
import { LocationDataModel } from './locationtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
export declare abstract class AbstractCompoundDefType extends AbstractDataModelBase {
    compoundName: string;
    title?: string | undefined;
    briefDescription?: BriefDescriptionDataModel | undefined;
    detailedDescription?: DetailedDescriptionDataModel | undefined;
    baseCompoundRefs?: BaseCompoundRefDataModel[] | undefined;
    derivedCompoundRefs?: DerivedCompoundRefDataModel[] | undefined;
    includes?: IncludesDataModel[] | undefined;
    includedBy?: IncludedByDataModel[] | undefined;
    templateParamList?: TemplateParamListDataModel | undefined;
    sectionDefs?: SectionDefDataModel[] | undefined;
    innerDirs?: InnerDirDataModel[] | undefined;
    innerFiles?: InnerFileDataModel[] | undefined;
    innerClasses?: InnerClassDataModel[] | undefined;
    innerNamespaces?: InnerNamespaceDataModel[] | undefined;
    innerGroups?: InnerGroupDataModel[] | undefined;
    programListing?: ProgramListingDataModel | undefined;
    location?: LocationDataModel | undefined;
    listOfAllMembers?: ListOfAllMembersDataModel | undefined;
    id: string;
    kind: string;
    language?: string | undefined;
    prot?: string | undefined;
    final?: Boolean | undefined;
    inline?: Boolean | undefined;
    sealed?: Boolean | undefined;
    abstract?: Boolean | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class CompoundDefDataModel extends AbstractCompoundDefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
