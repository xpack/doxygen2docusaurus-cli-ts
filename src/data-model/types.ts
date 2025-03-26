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

// For unknown reasons, importing this class template ends in a crash.
// For now instantiate manually.
export class Compounds<T> {
  membersById: Map<string, T>

  constructor () {
    this.membersById = new Map()
  }

  add (id: string, compound: T): void {
    this.membersById.set(id, compound)
  }

  get (id: string): T {
    const value = this.membersById.get(id)
    if (value !== undefined) {
      return value
    }
    throw new Error(`get(${id}) not found`)
  }
}

// ----------------------------------------------------------------------------
