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
export class TocList {
    constructor(compound) {
        this.tocItems = [];
        this.compound = compound;
    }
}
export class TocItem {
    constructor(id, tocList) {
        this.id = id;
        this.tocList = tocList;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=toc-lists-vm%20copy.js.map