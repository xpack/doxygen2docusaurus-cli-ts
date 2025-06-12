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
export class CollectionBase {
    // --------------------------------------------------------------------------
    constructor(workspace) {
        this.workspace = workspace;
        this.collectionCompoundsById = new Map();
    }
    async generatePerInitialsIndexMdxFiles() {
        // Nothing at this level. Override it where needed.
    }
    hasCompounds() {
        return this.collectionCompoundsById.size > 0;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=collection-base.js.map