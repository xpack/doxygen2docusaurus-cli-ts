import { IncludedByDataModel, IncludesDataModel } from './inctype-dm.js';
import { BaseCompoundRefDataModel, DerivedCompoundRefDataModel } from './compoundreftype-dm.js';
import { TemplateParamListDataModel } from './templateparamlisttype-dm.js';
import { SectionDefDataModel } from './sectiondeftype-dm.js';
import { ListOfAllMembersDataModel } from './listofallmemberstype-dm.js';
import { AbstractStringType, BriefDescriptionDataModel, DetailedDescriptionDataModel, ProgramListingDataModel } from './descriptiontype-dm.js';
import { InnerClassDataModel, InnerDirDataModel, InnerFileDataModel, InnerGroupDataModel, InnerNamespaceDataModel, InnerPageDataModel } from './reftype-dm.js';
import { LocationDataModel } from './locationtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { TableOfContentsDataModel } from './tableofcontentstype-dm.js';
export declare abstract class AbstractXyzType extends AbstractDataModelBase {
    text: string;
    compoundName: string;
    colsCount: number;
    elm12: boolean;
    elm20?: string | undefined;
    elm21?: Boolean | undefined;
    elm22?: Number | undefined;
    briefDescription: BriefDescriptionDataModel | undefined;
    includes?: IncludesDataModel[] | undefined;
    id: string;
    rowsCount: number;
    thead: boolean;
    language?: string | undefined;
    final?: Boolean | undefined;
    lineno?: Number | undefined;
    attr23?: string[] | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class XyzDataModel extends AbstractXyzType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
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
    tableOfContents?: TableOfContentsDataModel | undefined;
    innerDirs?: InnerDirDataModel[] | undefined;
    innerFiles?: InnerFileDataModel[] | undefined;
    innerClasses?: InnerClassDataModel[] | undefined;
    innerNamespaces?: InnerNamespaceDataModel[] | undefined;
    innerPages?: InnerPageDataModel[] | undefined;
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
export declare abstract class AbstractDocHtmlOnlyType extends AbstractDataModelBase {
    text: string;
    block?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class HtmlOnlyDataModel extends AbstractDocHtmlOnlyType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ManOnlyDataModel extends AbstractStringType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class XmlOnlyDataModel extends AbstractStringType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RtfOnlyDataModel extends AbstractStringType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LatexOnlyDataModel extends AbstractStringType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DocBookOnlyDataModel extends AbstractStringType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=compounddef-dm.d.ts.map