import * as util from 'node:util';
import { ElementLinesRendererBase } from './element-renderer-base.js';
export class ParamTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        if (element.attributes !== undefined) {
            console.error(util.inspect(element, { compact: false, depth: 999 }));
            console.error(element.elementName, 'property attributes not yet rendered in', this.constructor.name);
        }
        if (element.defname !== undefined) {
            console.error(util.inspect(element, { compact: false, depth: 999 }));
            console.error(element.elementName, 'property defname not yet rendered in', this.constructor.name);
        }
        if (element.typeconstraint !== undefined) {
            console.error(util.inspect(element, { compact: false, depth: 999 }));
            console.error(element.elementName, 'property typeconstraint not yet rendered in', this.constructor.name);
        }
        if (element.briefdescription !== undefined) {
            console.error(util.inspect(element, { compact: false, depth: 999 }));
            console.error(element.elementName, 'property briefdescription not yet rendered in', this.constructor.name);
        }
        let text = '';
        text += this.workspace.renderElementToString(element.type, type);
        if (element.declname !== undefined) {
            text += ` ${element.declname}`;
            if (element.array !== undefined) {
                text += `=${element.array}`;
            }
            if (element.defval !== undefined) {
                text += `=${this.workspace.renderElementToString(element.defval, type)}`;
            }
        }
        return [text];
    }
}
//# sourceMappingURL=paramtype.js.map