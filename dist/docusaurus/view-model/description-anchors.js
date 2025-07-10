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
export class DescriptionAnchor {
    compound;
    id;
    constructor(compound, id) {
        this.compound = compound;
        this.id = id;
    }
}
// ----------------------------------------------------------------------------
export class DescriptionTocList {
    compound;
    tocItems = [];
    constructor(compound) {
        this.compound = compound;
    }
}
export class DescriptionTocItem {
    id;
    tocList;
    constructor(id, tocList) {
        this.id = id;
        this.tocList = tocList;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=description-anchors.js.map