import { CompoundDefDataModel } from './compounds/compounddef-dm.js';
import { AbstractDocImageType } from './compounds/descriptiontype-dm.js';
import { DoxygenFileDataModel } from './doxyfile/doxyfiletype-dm.js';
import { DoxygenIndexDataModel } from './index/indexdoxygentype-dm.js';
export interface XmlPrologue {
    '?xml': [XmlText];
    ':@': {
        '@_version': string;
        '@_encoding': string;
        '@_standalone': string;
    };
}
export interface XmlAttributes {
    ':@': {
        [key: string]: string | number | boolean;
    };
}
export interface XmlElement {
    (key: string): XmlElement[];
    '#text': string | number | boolean;
    ':@'?: {
        [key: string]: string | number | boolean;
    };
}
export interface XmlText {
    '#text': string;
}
export interface XmlCDATA {
    '#cdata': string;
}
export interface XmlNameElement {
    name: {
        '#text': string;
    };
}
export declare abstract class AbstractDataModelBase {
    elementName: string;
    skipPara?: boolean;
    children?: Array<string | AbstractDataModelBase>;
    constructor(elementName: string);
}
export interface DataModel {
    doxygenindex?: DoxygenIndexDataModel;
    compoundDefs: CompoundDefDataModel[];
    doxyfile?: DoxygenFileDataModel;
    images?: AbstractDocImageType[];
}
