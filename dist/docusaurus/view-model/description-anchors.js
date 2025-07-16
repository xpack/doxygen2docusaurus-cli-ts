export class DescriptionAnchor {
    compound;
    id;
    constructor(compound, id) {
        this.compound = compound;
        this.id = id;
    }
}
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
//# sourceMappingURL=description-anchors.js.map