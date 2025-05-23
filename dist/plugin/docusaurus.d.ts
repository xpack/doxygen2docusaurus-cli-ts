import { PluginOptions } from './options.js';
import type { LoadContext } from '@docusaurus/types';
export declare const pluginName: string;
export default function pluginDocusaurus(context: LoadContext, options: PluginOptions): Promise<any>;
export declare function extendCliGenerateDoxygen(cli: any, context: LoadContext, options: PluginOptions): void;
export declare function validateOptions({ validate, options: userOptions }: {
    validate: any;
    options: PluginOptions;
}): PluginOptions;
