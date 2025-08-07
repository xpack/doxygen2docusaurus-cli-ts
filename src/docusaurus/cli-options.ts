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

import assert from 'node:assert'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
// import * as util from 'node:util'

// ----------------------------------------------------------------------------

export interface Redirects {
  from: string | string[]
  to: string
}

/**
 * Options, as written by the user. All are optional.
 *
 * @public
 */
export type CliConfigurationOptions = Record<string, string | boolean>

export type CommandOptions = Record<string, string | boolean | undefined>

/**
 * Options, when multi-configurations are used.
 *
 * @public
 */
export type MultiConfigurations = Record<string, CliConfigurationOptions>

// Prefer config.doxygen2docusaurus, but also accept doxygen2docusaurus.
interface GenericPackageConfiguration {
  config?: { doxygen2docusaurus: CliConfigurationOptions }
  doxygen2docusaurus?: CliConfigurationOptions
}

/**
 * Options, as seen by the application. Most are mandatory.
 *
 * @public
 */
export class CliOptions {
  /**
   * Relative to the current website folder, like `doxygen/xml`, no initial/
   * final slashes.
   */
  doxygenXmlInputFolderPath = 'doxygen/xml'

  /**
   * Relative to the current website folder, like `docs`, no initial/final
   * slashes.
   */
  docsFolderPath = 'docs'

  /** Relative to the docs folder, like `api`, no initial/final slashes. */
  apiFolderPath = 'api'

  /** Site base URL, like / or /xxx/. */
  baseUrl = '/'

  /** Relative to the web home, like `docs`, without initial/final slashes. */
  docsBaseUrl = 'docs'

  /** Relative to the docs home, like `api`, without initial/final slashes. */
  apiBaseUrl = 'api'

  /** Relative to `static` */
  imagesFolderPath = 'assets/images/doxygen'

  /**  Relative to the current `website/static` folder, like `reference`. */
  compatibilityRedirectsOutputFolderPath?: string | undefined

  /** The title to be displayed on the main page. */
  mainPageTitle = ''

  /**
   * Relative to the current website folder.
   */
  sidebarCategoryFilePath = 'sidebar-category-doxygen.json'

  /** Short text to be displayed in the sidebar. */
  sidebarCategoryLabel = 'API Reference (Doxygen)'

  /**
   * Relative to the current website folder.
   */
  navbarFilePath = 'docusaurus-config-navbar-doxygen.json'

  /** Short text to be displayed in the top navigation bar. */
  navbarLabel = 'Reference'

  /** Where the menu is to be displayed, left or right. */
  navbarPosition: 'left' | 'right' = 'left'

  /**
   * Relative to the current website folder, default
   * `src/css/custom-doxygen.css`
   */
  customCssFilePath = 'src/css/custom-doxygen2docusaurus.css'

  /** Boolean to control verbosity. */
  verbose = false

  /** Boolean to control debug verbosity. */
  debug = false

  /** Boolean to control if the TODO suggestions are shown. */
  suggestToDoDescriptions = false

  /** Boolean to list the pages at the top of the sidebar. */
  listPagesAtTop = true

  /** Boolean to render the program listing in the File pages. */
  renderProgramListing = true

  /**
   * Boolean to render the program listing in the member definitions sections.
   */
  renderProgramListingInline = true

  /**
   * Location of original Doxygen pages
   *
   * 'For comparison, the original Doxygen html pages, styled with the
   * <a href="https://jothepro.github.io/doxygen-awesome-css/">doxygen-awesome-css</a>
   * plugin, continue to be available via the
   * <a href="pathname:///doxygen/topics.html"><code>.../doxygen/*.html</b></code>
   * URLs.'
   */
  originalPagesNote = ''

  /** String identifier in case of multiple instances. */
  id = 'default'

  constructor(commandOptions: CommandOptions) {
    this.id = commandOptions.id as string

    if (commandOptions.verbose !== undefined) {
      this.verbose = true
    }

    if (commandOptions.debug !== undefined) {
      this.debug = true
    }

    if (this.id !== 'default') {
      this.apiFolderPath = this.id
      this.apiBaseUrl = this.id
      this.imagesFolderPath = `img/doxygen-${this.id}`
      this.sidebarCategoryFilePath =
        'sidebar-category-doxygen' + `-${this.id}.json`
      this.navbarFilePath =
        'docusaurus-config-navbar-doxygen' + `-${this.id}.json`
    } else {
      this.apiFolderPath = 'api'
      this.apiBaseUrl = 'api'
      this.imagesFolderPath = `img/doxygen`
      this.sidebarCategoryFilePath = `sidebar-category-doxygen.json`
      this.navbarFilePath = `docusaurus-config-navbar-doxygen.json`
    }
  }

  async parse(): Promise<void> {
    let configurationOptions: CliConfigurationOptions | undefined = undefined

    try {
      const userPackageJsonPath = path.resolve(
        process.cwd(),
        'config',
        'doxygen2docusaurus.json'
      )
      const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8')

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const multiConfigurations: MultiConfigurations = JSON.parse(pkgJsonRaw)

      configurationOptions = this.selectMultiConfiguration(multiConfigurations)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* Cannot read/parse JSON */
    }

    if (configurationOptions === undefined) {
      try {
        const userPackageJsonPath = path.resolve(
          process.cwd(),
          'doxygen2docusaurus.json'
        )
        const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8')

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const multiConfigurations: MultiConfigurations = JSON.parse(pkgJsonRaw)

        configurationOptions =
          this.selectMultiConfiguration(multiConfigurations)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        /* Cannot read/parse JSON */
      }
    }

    if (configurationOptions === undefined) {
      try {
        // Try to get the configuration from
        // package.json/[config/]doxygen2docusaurus.
        const userPackageJsonPath = path.resolve(process.cwd(), 'package.json')
        const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8')

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const pkgJson: GenericPackageConfiguration = JSON.parse(pkgJsonRaw)

        const multiConfigurations:
          | CliConfigurationOptions
          | MultiConfigurations
          | undefined =
          pkgJson.config?.doxygen2docusaurus ?? pkgJson.doxygen2docusaurus

        if (multiConfigurations !== undefined) {
          configurationOptions =
            this.selectMultiConfiguration(multiConfigurations)
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        /* Cannot read/parse JSON */
      }
    }

    if (configurationOptions !== undefined) {
      if (this.debug) {
        console.log(configurationOptions)
      }
      // Override only properties that exist in CliOptions
      const thisProperties = Object.getOwnPropertyNames(this)

      for (const key of Object.keys(configurationOptions)) {
        const value: unknown = configurationOptions[key]
        // console.log(key, value)
        if (value !== undefined && thisProperties.includes(key)) {
          const thisProperty = (this as Record<string, unknown>)[key]
          const thisType = typeof thisProperty
          const valueType = typeof value

          if (['id', 'verbose', 'debug'].includes(key)) {
            continue
          }

          // Override only if types match.
          if (thisType === valueType) {
            ;(this as Record<string, unknown>)[key] = value
          }
        }
      }
    }

    if (this.debug) {
      this.verbose = true
    }

    if (this.verbose) {
      console.log()
      console.log(this)
    }

    assert(
      this.doxygenXmlInputFolderPath.length > 0,
      'doxygenXmlInputFolderPath is required'
    )

    assert(this.docsFolderPath.length > 0, 'docsFolderPath is required')
    assert(this.apiFolderPath.length > 0, 'apiFolderPath is required')

    assert(this.docsBaseUrl.length > 0, 'docsBaseUrl is required')
    // assert(this.apiBaseUrl.length > 0, 'apiBaseUrl is required')

    assert(
      this.sidebarCategoryFilePath.length > 0,
      'sidebarCategoryFilePath is required'
    )
  }

  selectMultiConfiguration(
    multiConfigurations: CliConfigurationOptions | MultiConfigurations
  ): CliConfigurationOptions | undefined {
    let configurationOptions: CliConfigurationOptions | undefined = undefined
    if (this.id !== 'default') {
      configurationOptions = (
        multiConfigurations as Record<
          string,
          CliConfigurationOptions | undefined
        >
      )[this.id]

      if (configurationOptions !== undefined) {
        configurationOptions.id = this.id
      }
    } else {
      const multiConfig = multiConfigurations as MultiConfigurations
      configurationOptions =
        'default' in multiConfig
          ? multiConfig.default
          : (multiConfigurations as CliConfigurationOptions)
    }
    return configurationOptions
  }
}

// Was used during development. Now stick to true.
export const renderParagraphs = true

export const maxParallelPromises = 42

// ----------------------------------------------------------------------------
