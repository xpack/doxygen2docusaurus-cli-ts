import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
import { RefTextDataModel } from './reftexttype-dm.js';
import { VariableListDataModel } from './docvarlistentrytype-dm.js';
export declare abstract class AbstractDescriptionType extends AbstractDataModelBase {
    title?: string | undefined;
    children: Array<string | ParaDataModel | InternalDataModel | Sect1DataModel>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractListingType extends AbstractDataModelBase {
    codelines?: CodeLineDataModel[] | undefined;
    filename?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ProgramListingDataModel extends AbstractListingType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractCodeLineType extends AbstractDataModelBase {
    highlights?: HighlightDataModel[] | undefined;
    lineno?: Number | undefined;
    refid?: string | undefined;
    refkind?: string | undefined;
    external?: Boolean | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class CodeLineDataModel extends AbstractCodeLineType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export type DoxHighlightClass = 'comment' | 'normal' | 'preprocessor' | 'keyword' | 'keywordtype' | 'keywordflow' | 'stringliteral' | 'xmlcdata' | 'charliteral' | 'vhdlkeyword' | 'vhdllogic' | 'vhdlchar' | 'vhdldigit';
export declare abstract class AbstractHighlightType extends AbstractDataModelBase {
    children: Array<string | SpDataModel | RefTextDataModel>;
    classs: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class HighlightDataModel extends AbstractHighlightType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractSpType extends AbstractDataModelBase {
    text: string;
    value?: Number | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class SpDataModel extends AbstractSpType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocSect1Type extends AbstractDataModelBase {
    title?: TitleDataModel | undefined;
    children: Array<string | ParaDataModel | InternalS1DataModel | Sect2DataModel>;
    id: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocSect2Type extends AbstractDataModelBase {
    title?: TitleDataModel | undefined;
    children: Array<string | ParaDataModel | InternalS2DataModel | Sect3DataModel>;
    id: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocSect3Type extends AbstractDataModelBase {
    title?: TitleDataModel | undefined;
    children: Array<string | ParaDataModel | InternalS3DataModel | Sect4DataModel>;
    id: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocSect4Type extends AbstractDataModelBase {
    title?: TitleDataModel | undefined;
    children: Array<string | ParaDataModel | InternalS4DataModel | Sect5DataModel>;
    id: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocSect5Type extends AbstractDataModelBase {
    title?: TitleDataModel | undefined;
    children: Array<string | ParaDataModel | InternalS5DataModel | Sect6DataModel>;
    id: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocSect6Type extends AbstractDataModelBase {
    title?: TitleDataModel | undefined;
    children: Array<string | ParaDataModel | InternalS6DataModel>;
    id: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalType extends AbstractDataModelBase {
    children: Array<string | ParaDataModel | Sect1DataModel>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS1Type extends AbstractDataModelBase {
    children: Array<string | ParaDataModel | Sect2DataModel>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS2Type extends AbstractDataModelBase {
    children: Array<string | ParaDataModel | Sect3DataModel>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS3Type extends AbstractDataModelBase {
    children: Array<string | ParaDataModel | Sect4DataModel>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS4Type extends AbstractDataModelBase {
    children: Array<string | ParaDataModel | Sect5DataModel>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS5Type extends AbstractDataModelBase {
    children: Array<string | ParaDataModel | Sect6DataModel>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS6Type extends AbstractDataModelBase {
    children: Array<string | ParaDataModel>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export type DocTitleCmdGroup = (BoldDataModel | UnderlineDataModel | EmphasisDataModel | ComputerOutputDataModel | RefDataModel | LineBreakDataModel | UlinkDataModel | AnchorDataModel | SubstringDocMarkupType);
export declare class AbstractDocTitleType extends AbstractDataModelBase {
    children: Array<string | DocTitleCmdGroup>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export type DocCmdGroup = (BoldDataModel | SimpleSectDataModel | UnderlineDataModel | EmphasisDataModel | ParameterListDataModel | ComputerOutputDataModel | RefDataModel | ItemizedListDataModel | LineBreakDataModel | UlinkDataModel | AnchorDataModel | XrefSectDataModel | VariableListDataModel | SubstringDocMarkupType | DocTableDataModel | ParameterListDataModel);
export declare abstract class AbstractDocParaType extends AbstractDataModelBase {
    children: Array<string | DocCmdGroup>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class AbstractDocMarkupType extends AbstractDataModelBase {
    children: Array<string | DocCmdGroup>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class SubstringDocMarkupType extends AbstractDocMarkupType {
    substring: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string, substring: string);
}
export declare class NzwjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ZwjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class NdashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class MdashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocURLLink extends AbstractDataModelBase {
    children: Array<string | DocTitleCmdGroup>;
    url: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class UlinkDataModel extends AbstractDocURLLink {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocAnchorType extends AbstractDataModelBase {
    children: string[];
    id: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class AnchorDataModel extends AbstractDocAnchorType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocFormulaType extends AbstractDataModelBase {
    text: string;
    id: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class FormulaDataModel extends AbstractDocFormulaType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocListType extends AbstractDataModelBase {
    listItems: ListItemDataModel[];
    type: string;
    start: Number | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocListItemType extends AbstractDataModelBase {
    paras?: ParaDataModel[] | undefined;
    override: string | undefined;
    value: Number | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ListItemDataModel extends AbstractDocListItemType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocSimpleSectType extends AbstractDataModelBase {
    title?: string | undefined;
    children: Array<string | ParaDataModel>;
    kind: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocRefTextType extends AbstractDataModelBase {
    children: Array<string | DocTitleCmdGroup>;
    refid: string;
    kindref: string;
    external?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class RefDataModel extends AbstractDocRefTextType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocTableType extends AbstractDataModelBase {
    caption?: DocCaptionDataModel;
    rows?: DocRowDataModel[];
    rowsCount: number;
    colsCount: number;
    width: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class DocTableDataModel extends AbstractDocTableType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocRowType extends AbstractDataModelBase {
    entries?: DocEntryDataModel[] | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class DocRowDataModel extends AbstractDocRowType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocEntryType extends AbstractDataModelBase {
    paras?: ParaDataModel[] | undefined;
    thead: boolean;
    colspan?: Number | undefined;
    rowspan?: Number | undefined;
    align?: string | undefined;
    valign?: string | undefined;
    width?: string | undefined;
    classs?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class DocEntryDataModel extends AbstractDocEntryType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocCaptionType extends AbstractDataModelBase {
    children: Array<string | DocTitleCmdGroup>;
    id: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class DocCaptionDataModel extends AbstractDocCaptionType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocImageType extends AbstractDataModelBase {
    children: Array<string | DocTitleCmdGroup>;
    type?: string | undefined;
    name?: string | undefined;
    width?: string | undefined;
    height?: string | undefined;
    alt?: string | undefined;
    inline?: Boolean | undefined;
    caption?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ImageDataModel extends AbstractDocImageType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocParamListType extends AbstractDataModelBase {
    parameterItems?: ParameterItemDataModel[] | undefined;
    kind: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ParameterListDataModel extends AbstractDocParamListType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocParamListItem extends AbstractDataModelBase {
    parameterDescription: ParameterDescriptionDataModel | undefined;
    parameterNameList?: ParameterNamelistDataModel[] | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ParameterItemDataModel extends AbstractDocParamListItem {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocParamNameList extends AbstractDataModelBase {
    children: Array<ParameterTypeDataModel | ParameterNameDataModel>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ParameterNamelistDataModel extends AbstractDocParamNameList {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocParamType extends AbstractDataModelBase {
    children: Array<string | RefTextDataModel>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ParameterTypeDataModel extends AbstractDocParamType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocParamName extends AbstractDataModelBase {
    children: Array<string | RefTextDataModel>;
    direction: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ParameterNameDataModel extends AbstractDocParamName {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocXRefSectType extends AbstractDataModelBase {
    xreftitle: string | undefined;
    xrefdescription: XrefDescriptionDataModel | undefined;
    id: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class XrefSectDataModel extends AbstractDocXRefSectType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocBlockQuoteType extends AbstractDataModelBase {
    children: Array<string | ParaDataModel>;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class BlockquoteDataModel extends AbstractDocBlockQuoteType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocEmptyType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class BriefDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DetailedDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InbodyDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DescriptionDataModel extends AbstractDescriptionType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class XrefDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ParameterDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InternalDataModel extends AbstractDocInternalType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InternalS1DataModel extends AbstractDocInternalS1Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InternalS2DataModel extends AbstractDocInternalS2Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InternalS3DataModel extends AbstractDocInternalS3Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InternalS4DataModel extends AbstractDocInternalS4Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InternalS5DataModel extends AbstractDocInternalS5Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InternalS6DataModel extends AbstractDocInternalS6Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Sect1DataModel extends AbstractDocSect1Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Sect2DataModel extends AbstractDocSect2Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Sect3DataModel extends AbstractDocSect3Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Sect4DataModel extends AbstractDocSect4Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Sect5DataModel extends AbstractDocSect5Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Sect6DataModel extends AbstractDocSect6Type {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class TitleDataModel extends AbstractDocTitleType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class TermDataModel extends AbstractDocTitleType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ParaDataModel extends AbstractDocParaType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ParaEmptyDataModel extends AbstractDocEmptyType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class BoldDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UnderlineDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EmphasisDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ComputerOutputDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SimpleSectDataModel extends AbstractDocSimpleSectType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ItemizedListDataModel extends AbstractDocListType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OrderedListDataModel extends AbstractDocListType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LineBreakDataModel extends AbstractDocEmptyType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class HrulerDataModel extends AbstractDocEmptyType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractVerbatimType extends AbstractDataModelBase {
    text: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class VerbatimDataModel extends AbstractVerbatimType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
