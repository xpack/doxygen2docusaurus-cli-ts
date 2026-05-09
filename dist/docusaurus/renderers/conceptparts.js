/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2025-2026 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can be
 * obtained from https://opensource.org/licenses/mit.
 */
// ----------------------------------------------------------------------------
import assert from 'node:assert';
// import util from 'node:util'
import { ElementLinesRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
/**
 * Renders concept parts containers to output lines.
 *
 * @remarks
 * This renderer is useful because concept documentation may contain an
 * ordered mixture of documentation fragments and code fragments that must be
 * preserved in the generated output. Use it by passing an
 * {@link AbstractConceptParts} instance to `renderToLines()`, which delegates
 * rendering to the registered renderers for the contained child elements.
 * Additional handling is not required here because the ordering is already
 * represented by the parsed data model.
 */
export class ConceptPartsLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a concept parts container to formatted output lines.
     *
     * @remarks
     * This method is useful because it preserves the original order of the
     * mixed concept content while delegating the actual rendering of each child
     * element to the workspace renderer pipeline. Use it by passing the parsed
     * concept parts element and the target output type. If no children are
     * present, the method returns an empty array.
     *
     * @param element - The concept parts element to render.
     * @param type - The target rendering type.
     * @returns The rendered output lines.
     */
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        assert(element.children !== undefined);
        if (element.children.length > 0) {
            lines.push(...this.workspace.renderElementsArrayToLines(element.children, type));
        }
        return lines;
    }
}
// ----------------------------------------------------------------------------
/**
 * Renders concept code parts to output lines.
 *
 * @remarks
 * This renderer is useful because concept code fragments are stored as a
 * dedicated data model node that wraps a program listing and optional source
 * location metadata. Use it by passing an {@link AbstractConceptCodePart}
 * instance to `renderToLines()`, which forwards rendering to the existing
 * program-listing renderer. The line metadata is currently retained only in
 * the data model and is not emitted in the rendered output.
 */
export class ConceptCodePartLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a concept code part to formatted output lines.
     *
     * @remarks
     * This method is useful because it converts the wrapped program listing
     * into the same line-based output used elsewhere in the renderer pipeline,
     * ensuring consistent formatting for code blocks. Use it by passing the
     * parsed concept code part and the target rendering type. The method
     * requires the embedded program listing to be present.
     *
     * @param element - The concept code part to render.
     * @param type - The target rendering type.
     * @returns The rendered output lines.
     */
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        assert(element.programListing !== undefined);
        // TODO: find out how to handle the element.line number.
        lines.push(...this.workspace.renderElementToLines(element.programListing, type));
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=conceptparts.js.map