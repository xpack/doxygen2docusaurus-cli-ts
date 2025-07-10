import type { DoxygenFileOptionDataModel } from '../../doxygen/data-model/doxyfile/doxyfileoptiontype-dm.js';
export declare class DoxygenFileOptions {
    membersById: Map<string, DoxygenFileOptionDataModel>;
    constructor(options: DoxygenFileOptionDataModel[] | undefined);
    getOptionStringValue(optionId: string): string;
    getOptionCdataValue(optionId: string): string;
}
