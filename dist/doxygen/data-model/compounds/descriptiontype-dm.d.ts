import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
import { VariableListDataModel } from './docvarlistentrytype-dm.js';
export declare abstract class AbstractStringType extends AbstractDataModelBase {
    text: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDescriptionType extends AbstractDataModelBase {
    title?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractListingTypeBase extends AbstractDataModelBase {
    codelines?: CodeLineDataModel[] | undefined;
    filename?: string | undefined;
}
export declare abstract class AbstractListingType extends AbstractListingTypeBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ProgramListingDataModel extends AbstractListingType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class MemberProgramListingDataModel extends AbstractListingTypeBase {
    constructor(programListing: ProgramListingDataModel, startLine: number, endLine: number);
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
export declare abstract class AbstractDocSectType extends AbstractDataModelBase {
    title?: TitleDataModel | undefined;
    id: string | undefined;
}
export declare abstract class AbstractDocSect1Type extends AbstractDocSectType {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocSect2Type extends AbstractDocSectType {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocSect3Type extends AbstractDocSectType {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocSect4Type extends AbstractDocSectType {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocSect5Type extends AbstractDocSectType {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocSect6Type extends AbstractDocSectType {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS1Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS2Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS3Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS4Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS5Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocInternalS6Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export type DocTitleCmdGroup = BoldDataModel | UnderlineDataModel | EmphasisDataModel | ComputerOutputDataModel | RefDataModel | LineBreakDataModel | UlinkDataModel | AnchorDataModel | SubstringDocMarkupType;
export declare function parseDocTitleCmdGroup(xml: DoxygenXmlParser, element: Object, elementName: string): DocTitleCmdGroup[];
export declare class AbstractDocTitleType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export type DocCmdGroup = BoldDataModel | SimpleSectDataModel | UnderlineDataModel | EmphasisDataModel | ParameterListDataModel | ComputerOutputDataModel | RefDataModel | ItemizedListDataModel | LineBreakDataModel | UlinkDataModel | AnchorDataModel | XrefSectDataModel | VariableListDataModel | SubstringDocMarkupType | DocTableDataModel | ParameterListDataModel;
export declare abstract class AbstractDocParaType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class AbstractDocMarkupType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class SubstringDocMarkupType extends AbstractDocMarkupType {
    substring: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string, substring: string);
}
export declare class CopyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IexclDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CentDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PoundDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CurrenDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class YenDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class BrvbarDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SectDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UmlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
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
export declare class OrdfDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class NotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ShyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RegisteredDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class MacrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DegDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PlusmnDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Sup2DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Sup3DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AcuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class MicroDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ParaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class MiddotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CedilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Sup1DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OrdmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Frac14DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Frac12DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class Frac34DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IquestDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AringDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AEligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CcedilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ETHDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class NtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class TimesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OslashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class YacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class THORNDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SzligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AtildeSmallDocMarkupType extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AringSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AeligSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CcedilSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EthSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class NtildeSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OtildeSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DivideDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OslashSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class YacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ThornSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class YumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class FnofDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AlphaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class BetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class GammaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DeltaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EpsilonDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ZetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EtaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ThetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IotaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class KappaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LambdaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class MuDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class NuDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class XiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OmicronDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RhoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SigmaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class TauDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UpsilonDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PhiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ChiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PsiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OmegaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AlphaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class BetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class GammaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DeltaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EpsilonSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ZetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EtaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ThetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IotaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class KappaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LambdaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class MuSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class NuSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class XiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OmicronSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RhoSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SigmaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SigmafSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class TauSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UpsilonSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PhiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ChiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PsiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OmegaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ThetasymDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UpsihDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PivDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class BullDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class HellipDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PrimeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PrimeUpperDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OlineDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class FraslDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class WeierpDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ImaginaryDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RealDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class TrademarkDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AlefsymDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class HarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CrarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class UArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class HArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ForallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PartDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ExistDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EmptyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class NablaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IsinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class NotinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class NiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ProdDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SumDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class MinusDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LowastDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RadicDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PropDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InfinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AngDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AndDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CapDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CupDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class IntDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class There4DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SimDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CongDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AsympDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class NeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EquivDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class GeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SubDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SupDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class NsubDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SubeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SupeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OplusDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OtimesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PerpDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SdotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LceilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RceilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LfloorDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RfloorDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LangDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RangDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LozDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SpadesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ClubsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class HeartsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DiamsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OEligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class OeligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ScaronDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ScaronSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class YumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class TildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EnspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EmspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ThinspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ZwnjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LrmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RlmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SbquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class BdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DaggerDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DaggerUpperDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class PermilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LsaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RsaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class EuroDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class TmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class LsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class RsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocURLLink extends AbstractDataModelBase {
    url: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class UlinkDataModel extends AbstractDocURLLink {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocAnchorType extends AbstractDataModelBase {
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
export declare abstract class AbstractDocIndexEntryType extends AbstractDataModelBase {
    primaryie: string;
    secondaryie: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class IndexEntryDataModel extends AbstractDocIndexEntryType {
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
    kind: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractDocRefTextType extends AbstractDataModelBase {
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
    id: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class DocCaptionDataModel extends AbstractDocCaptionType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocHeadingType extends AbstractDataModelBase {
    level: number;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class HeadingDataModel extends AbstractDocHeadingType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractDocImageType extends AbstractDataModelBase {
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
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ParameterNamelistDataModel extends AbstractDocParamNameList {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocParamType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ParameterTypeDataModel extends AbstractDocParamType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocParamName extends AbstractDataModelBase {
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
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class BlockquoteDataModel extends AbstractDocBlockQuoteType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class AbstractDocEmptyType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare abstract class AbstractEmojiType extends AbstractDataModelBase {
    name: string;
    unicode: string;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class EmojiDataModel extends AbstractEmojiType {
    constructor(xml: DoxygenXmlParser, element: Object);
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
export declare class BoldDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class StrikeDataModel extends AbstractDocMarkupType {
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
export declare class SubscriptDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SuperscriptDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CenterDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class SmallDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class CiteDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DelDataModel extends AbstractDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InsDataModel extends AbstractDocMarkupType {
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
export declare class NonBreakableSpaceDataModel extends AbstractDocEmptyType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class ParaEmptyDataModel extends AbstractDocEmptyType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractVerbatimType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class VerbatimDataModel extends AbstractVerbatimType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare abstract class AbstractPreformattedType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class PreformattedDataModel extends AbstractPreformattedType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=descriptiontype-dm.d.ts.map