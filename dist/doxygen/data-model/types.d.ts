export interface XmlPrologue {
    '?xml': [XmlText];
    ':@': {
        '@_version': string;
        '@_encoding': string;
        '@_standalone': string;
    };
}
export interface XmlAttributes {
    ':@': Record<string, string | number | boolean>;
}
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
export declare abstract class AbstractDataModelBase {
    elementName: string;
    skipPara?: boolean;
    children?: (string | AbstractDataModelBase)[];
    constructor(elementName: string);
}
export type DataModelElement = string | AbstractDataModelBase;
//# sourceMappingURL=types.d.ts.map