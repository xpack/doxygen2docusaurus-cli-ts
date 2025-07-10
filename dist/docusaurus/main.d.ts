import { Workspace } from './workspace.js';
import type { DataModel } from '../doxygen/data-model/types.js';
import type { CliOptions } from './options.js';
export declare class DocusaurusGenerator {
    workspace: Workspace;
    constructor({ dataModel, options, }: {
        dataModel: DataModel;
        options: CliOptions;
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
