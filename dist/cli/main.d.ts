import { CliOptions } from '../docusaurus/options.js';
import type { DataModel } from '../doxygen/data-model/types.js';
/**
 * Main entry point for the doxygen2docusaurus CLI tool.
 *
 * @param argv - Command line arguments array
 * @returns Promise that resolves to the exit code (0 for success, 1 for error)
 *
 * @public
 */
export declare function main(argv: string[]): Promise<number>;
/**
 * Parses Doxygen XML files and creates a data model.
 *
 * @public
 * @param options - Configuration options for parsing
 * @returns Promise that resolves to the parsed data model
 */
export declare function parseDoxygen({ options, }: {
    options: CliOptions;
}): Promise<DataModel>;
/**
 * Generates Docusaurus markdown files from the parsed data model.
 *
 * @public
 * @param dataModel - The parsed Doxygen data model
 * @param options - Configuration options for generation
 * @returns Promise that resolves to the exit code (0 for success)
 */
export declare function generateDocusaurusMd({ dataModel, options, }: {
    dataModel: DataModel;
    options: CliOptions;
}): Promise<number>;
//# sourceMappingURL=main.d.ts.map