export interface FrontMatter {
    keywords: string[];
    [key: string]: string | string[] | null | boolean | number | undefined;
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
export interface SidebarCategory {
    type: 'category';
    label: string;
    link: {
        type: 'doc';
        id: string;
    };
    collapsed: false;
    items: SidebarItem[];
}
export interface SidebarDocItem {
    type: 'doc';
    label: string;
    className?: string;
    id: string;
}
export interface SidebarCategoryItem {
    type: 'category';
    label: string;
    link?: {
        type: 'doc';
        id: string;
    };
    className?: string;
    collapsed: boolean;
    items: SidebarItem[];
}
export type SidebarItem = SidebarDocItem | SidebarCategoryItem;
export interface MenuDropdown {
    type?: 'dropdown';
    label: string;
    to: string;
    position: 'left' | 'right';
    items?: MenuItem[];
}
export interface MenuItem {
    label: string;
    to: string;
}
//# sourceMappingURL=types.d.ts.map