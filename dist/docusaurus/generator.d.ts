import { Workspace } from './workspace.js';
import { CliOptions } from './cli-options.js';
import type { SidebarCategory, NavbarItem } from './types.js';
import type { CompoundBase } from './view-model/compound-base-vm.js';
export declare class DocusaurusGenerator {
    workspace: Workspace;
    options: CliOptions;
    constructor(workspace: Workspace);
    run(): Promise<number>;
    prepareOutputFolder(): Promise<void>;
    generateSidebarCategory(): SidebarCategory;
    writeSidebarFile(sidebarCategory: SidebarCategory): Promise<void>;
    generateNavbarItem(): NavbarItem;
    writeNavbarFile(navbarItem: NavbarItem): Promise<void>;
    generateCollectionsIndexDotMdFiles(): Promise<void>;
    generateTopIndexDotMdFile(): Promise<void>;
    generatePerInitialsIndexDotMdFiles(): Promise<void>;
    generateMdFiles(): Promise<void>;
    generatePage(compound: CompoundBase): Promise<void>;
    generateCompatibilityRedirectFiles(): Promise<void>;
    private generateRedirectFile;
    copyFiles(): Promise<void>;
    copyImageFiles(): Promise<void>;
}
//# sourceMappingURL=generator.d.ts.map