import { DataModel } from '../data-model/types.js';
import { PluginOptions } from './options.js';
export declare function parseDoxygen({ options }: {
    options: PluginOptions;
}): Promise<DataModel>;
export declare function generateDocusaurusMdx({ dataModel, options, siteConfig, pluginActions }: {
    dataModel: DataModel;
    options: PluginOptions;
    siteConfig: any;
    pluginActions?: any;
}): Promise<number>;
