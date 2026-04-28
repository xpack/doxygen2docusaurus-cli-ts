import assert from 'node:assert';
export class DoxygenFileOptions {
    membersById;
    constructor(options) {
        this.membersById = new Map();
        assert(options !== undefined);
        for (const option of options) {
            this.membersById.set(option.id, option);
        }
    }
    getOptionStringValue(optionId) {
        const option = this.membersById.get(optionId);
        assert(option !== undefined);
        assert(option.values !== undefined);
        assert(option.values.length === 1);
        assert(typeof option.values[0] === 'string');
        return option.values[0];
    }
    getOptionCdataValue(optionId) {
        const option = this.membersById.get(optionId);
        assert(option !== undefined);
        assert(option.values !== undefined);
        assert(option.values.length === 1);
        assert(typeof option.values[0] === 'string');
        return option.values[0].replace(/^"/, '').replace(/"$/, '');
    }
}
//# sourceMappingURL=options.js.map