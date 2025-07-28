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
//# sourceMappingURL=types.d.ts.map