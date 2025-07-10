import type { CliOptions } from '../docusaurus/options.js';
import type { DataModel } from '../doxygen/data-model/types.js';
export declare function main(argv: string[]): Promise<number>;
export declare function parseDoxygen({ options, }: {
    options: CliOptions;
}): Promise<DataModel>;
export declare function generateDocusaurusMd({ dataModel, options, }: {
    dataModel: DataModel;
    options: CliOptions;
}): Promise<number>;
