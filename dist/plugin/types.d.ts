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
    id: string;
}
export interface SidebarCategoryItem {
    type: 'category';
    label: string;
    link?: {
        type: 'doc';
        id: string;
    };
    collapsed: boolean;
    items: SidebarItem[];
}
export type SidebarItem = SidebarDocItem | SidebarCategoryItem;
export interface MenuDropdown {
    type: 'dropdown';
    label: string;
    to: string;
    position: 'left' | 'right';
    items: MenuItem[];
}
export interface MenuItem {
    label: string;
    to: string;
}
