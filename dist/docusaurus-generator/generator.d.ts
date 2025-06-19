import { Workspace } from './workspace.js';
import { DataModel } from '../data-model/types.js';
import { PluginOptions } from '../plugin/options.js';
export declare class DocusaurusGenerator {
    workspace: Workspace;
    constructor({ dataModel, pluginOptions, siteConfig, pluginActions }: {
        dataModel: DataModel;
        pluginOptions: PluginOptions;
        siteConfig: any;
        pluginActions?: any;
    });
    generate(): Promise<void>;
    prepareOutputFolder(): Promise<void>;
    generateConfigurationFile(): Promise<void>;
    generateSidebarFile(): Promise<void>;
    generateMenuDropdownFile(): Promise<void>;
    generateIndexDotMdFiles(): Promise<void>;
    generatePerInitialsIndexMdFiles(): Promise<void>;
    generatePages(): Promise<void>;
    generateRedirectFiles(): Promise<void>;
    private generateRedirectFile;
    copyFiles(): Promise<void>;
}
