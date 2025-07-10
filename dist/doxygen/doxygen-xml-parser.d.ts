import { XMLParser } from 'fast-xml-parser';
import { XmlElement, DataModel } from './data-model/types.js';
import { IndexCompoundDataModel } from './data-model/index/indexcompoundtype-dm.js';
import { CliOptions } from '../docusaurus/options.js';
export declare class DoxygenXmlParser {
    options: CliOptions;
    parsedFilesCounter: number;
    xmlParser: XMLParser;
    dataModel: DataModel;
    constructor({ options }: {
        options: CliOptions;
    });
    parse({ folderPath }: {
        folderPath: string;
    }): Promise<DataModel>;
    parseDoxygenIndex(): Promise<void>;
    processCompoundDefs(indexCompound: IndexCompoundDataModel, parsedDoxygenElements: XmlElement[]): void;
    processMemberdefs(): void;
    parseDoxyfile(): Promise<void>;
    parseFile({ fileName }: {
        fileName: string;
    }): Promise<any>;
    hasAttributes(element: Object): boolean;
    getAttributesNames(element: Object): string[];
    hasAttribute(element: Object, name: string): boolean;
    getAttributeStringValue(element: Object, name: string): string;
    getAttributeNumberValue(element: Object, name: string): number;
    getAttributeBooleanValue(element: Object, name: string): boolean;
    hasInnerElement(element: Object, name: string): boolean;
    isInnerElementText(element: Object, name: string): boolean;
    hasInnerText(element: Object): boolean;
    getInnerElements<T = XmlElement[]>(element: Object, name: string): T;
    getInnerElementText(element: Object, name: string): string;
    getInnerElementNumber(element: Object, name: string): number;
    getInnerElementBoolean(element: Object, name: string): boolean;
    getInnerText(element: Object): string;
}
//# sourceMappingURL=doxygen-xml-parser.d.ts.map