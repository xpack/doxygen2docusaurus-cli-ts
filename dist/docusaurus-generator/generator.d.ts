import { Workspace } from './workspace.js';
import { DataModel } from '../data-model/types.js';
import { PluginOptions } from '../plugin/options.js';
export declare class DocusaurusGenerator {
    workspace: Workspace;
    constructor({ dataModel, pluginOptions, siteConfig }: {
        dataModel: DataModel;
        pluginOptions: PluginOptions;
        siteConfig: any;
    });
    generate(): Promise<void>;
    prepareOutputFolder(): Promise<void>;
    generateSidebarFile(): Promise<void>;
    generateMenuDropdownFile(): Promise<void>;
    generateIndexDotMdxFiles(): Promise<void>;
    generatePages(): Promise<void>;
    generateRedirectFiles(): Promise<void>;
    private generateRedirectFile;
}
