export interface FrontMatter {
    keywords: string[];
    [key: string]: string | string[] | null | boolean | number;
}
