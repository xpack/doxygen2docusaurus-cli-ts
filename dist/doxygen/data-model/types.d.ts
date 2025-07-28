import { CompoundDefDataModel } from './compounds/compounddef-dm.js';
import { type AbstractDocImageType } from './compounds/descriptiontype-dm.js';
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
/**
 * @public
 */
export interface XmlAttributes {
    ':@': Record<string, string | number | boolean>;
}
/**
 * @public
 */
export interface XmlElement {
    (key: string): XmlElement[];
    '#text': string | number | boolean;
    ':@'?: Record<string, string | number | boolean>;
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
/**
 * @public
 */
export declare abstract class AbstractDataModelBase {
    elementName: string;
    skipPara?: boolean;
    children?: (string | AbstractDataModelBase)[];
    constructor(elementName: string);
}
export type DataModelElement = AbstractDataModelBase | string;
/**
 * @public
 */
export interface DataModel {
    doxygenindex?: DoxygenIndexDataModel;
    compoundDefs: CompoundDefDataModel[];
    doxyfile?: DoxygenFileDataModel;
    images?: AbstractDocImageType[];
}
//# sourceMappingURL=types.d.ts.map