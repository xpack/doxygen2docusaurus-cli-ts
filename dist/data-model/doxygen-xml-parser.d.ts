import { XMLParser } from 'fast-xml-parser';
import { XmlElement, DataModel } from './types.js';
export declare class DoxygenXmlParser {
    verbose: boolean;
    parsedFilesCounter: number;
    dataModel: DataModel;
    constructor({ verbose }: {
        verbose: boolean;
    });
    parse({ folderPath }: {
        folderPath: string;
    }): Promise<DataModel>;
    parseFile({ fileName, folderPath, xmlParser }: {
        fileName: string;
        folderPath: string;
        xmlParser: XMLParser;
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
