/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2025 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/licenses/MIT.
 */
// ----------------------------------------------------------------------------
// import * as util from 'node:util'
import assert from 'node:assert';
// ----------------------------------------------------------------------------
/**
 * Manages Doxygen file configuration options and provides access methods.
 *
 * @remarks
 * Organises Doxygen configuration options by identifier and provides
 * convenient methods for retrieving option values in different formats.
 * Used to access project-specific settings from the Doxygen configuration.
 *
 * @public
 */
export class DoxygenFileOptions {
    membersById;
    /**
     * Creates a new Doxygen file options manager.
     *
     * @remarks
     * Builds an indexed map of configuration options for efficient lookup
     * by option identifier. Validates that options are provided.
     *
     * @param options - Array of Doxygen file option data models
     * @throws Assertion error if options array is undefined
     */
    constructor(options) {
        this.membersById = new Map();
        assert(options !== undefined);
        for (const option of options) {
            this.membersById.set(option.id, option);
        }
    }
    /**
     * Retrieves a string option value by identifier.
     *
     * @remarks
     * Extracts the raw string value from a Doxygen configuration option.
     * Validates that the option exists and contains exactly one string value.
     *
     * @param optionId - Identifier of the configuration option
     * @returns The string value of the specified option
     * @throws Assertion error if option is missing or has invalid format
     */
    getOptionStringValue(optionId) {
        const option = this.membersById.get(optionId);
        assert(option !== undefined);
        assert(option.values !== undefined);
        assert(option.values.length === 1);
        assert(typeof option.values[0] === 'string');
        return option.values[0];
    }
    /**
     * Retrieves a CDATA option value with quote removal.
     *
     * @remarks
     * Extracts the string value from a Doxygen configuration option and
     * removes surrounding double quotes that are commonly present in
     * CDATA sections. Useful for path and string configuration values.
     *
     * @param optionId - Identifier of the configuration option
     * @returns The unquoted string value of the specified option
     * @throws Assertion error if option is missing or has invalid format
     */
    getOptionCdataValue(optionId) {
        const option = this.membersById.get(optionId);
        assert(option !== undefined);
        assert(option.values !== undefined);
        assert(option.values.length === 1);
        assert(typeof option.values[0] === 'string');
        return option.values[0].replace(/^"/, '').replace(/"$/, '');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=options.js.map