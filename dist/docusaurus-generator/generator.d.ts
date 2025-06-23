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
    generateSidebarFile(): Promise<void>;
    generateMenuFile(): Promise<void>;
    generateCollectionsIndexDotMdFiles(): Promise<void>;
    generateTopIndexDotMdFile(): Promise<void>;
    generatePerInitialsIndexMdFiles(): Promise<void>;
    generatePages(): Promise<void>;
    generateCompatibilityRedirectFiles(): Promise<void>;
    private generateRedirectFile;
    copyFiles(): Promise<void>;
    copyImageFiles(): Promise<void>;
}
