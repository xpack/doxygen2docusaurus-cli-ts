export interface FrontMatter {
    keywords: string[];
    [key: string]: string | string[] | null | boolean | number;
}
export interface collapsibleTableRow {
    id: string;
    iconLetter?: string;
    iconClass?: string;
    label: string;
    link: string;
    description: string;
    children?: collapsibleTableRow[];
}
