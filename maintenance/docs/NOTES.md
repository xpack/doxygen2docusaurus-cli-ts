# NOTES

## Inspiration

This project draws inspiration from
[`docusaurus-plugin-typedoc-api`](https://github.com/milesj/docusaurus-plugin-typedoc-api/),
but does not attempt to fully reimplement the `content-docs` functionality for processing Markdown files.

The initial intention was to develop this code as a Docusaurus plugin, utilising `loadContent()` to parse the input XML files and generate the Markdown files. However, this approach proved impractical due to the current Docusaurus policy of initialising all plugins in parallel. The conversion process must be completed prior to the execution of the `content-docs` plugin, which parses the Markdown files.

Consequently, the final implementation was revised to a standalone CLI application, which must be executed before building the site with Docusaurus.

In terms of appearance, the output was inspired by
[Doxygen Awesome](https://jothepro.github.io/doxygen-awesome-css/),
but has been adapted to align with the Docusaurus look and feel.

## Discussions

- https://github.com/xpack/doxygen2docusaurus/discussions/1
- https://github.com/facebook/docusaurus/discussions/10637#discussioncomment-11139802
- https://github.com/typedoc2md/typedoc-plugin-markdown/discussions/710#discussioncomment-11130976
- https://github.com/jothepro/doxygen-awesome-css/discussions/165
- https://github.com/doxygen/doxygen/discussions/11215
- https://github.com/milesj/docusaurus-plugin-typedoc-api/issues/157

## Links

- https://www.doxygen.nl
- https://github.com/doxygen/doxygen
- https://github.com/facebook/docusaurus
- https://docusaurus.io
- https://github.com/milesj/docusaurus-plugin-typedoc-api
- https://github.com/typedoc2md/typedoc-plugin-markdown
- https://github.com/microsoft/react-native-windows/tree/main/packages/%40rnw-scripts/doxysaurus
- https://github.com/sourcey/moxygen
- https://github.com/matusnovak/doxybook2 (archived)

## Issues

- https://github.com/doxygen/doxygen/issues/11613 - case-insensitive file names (not a bug; use CASE_SENSE_NAMES = SYSTEM)
- https://github.com/doxygen/doxygen/issues/11614 - duplicate IDs

---

## eslint

The source code passes the checks with
[eslint](https://eslint.org/docs/latest/use/configure/configuration-files)
with the
[eslint-config-love](https://github.com/mightyiam/eslint-config-love)
rules.

The few exceptions to the rules are in `eslint.config.js`.

Currently there is no content in `tsconfig.eslint.json`.

Rules can be disabled in the source code:

- https://eslint.org/docs/latest/use/configure/rules#disabling-rules

```js
/* eslint-disable */
...
/* eslint-enable */

/* eslint-disable no-alert, no-console */
...
/* eslint-enable no-alert, no-console */

alert("foo"); // eslint-disable-line no-alert

// eslint-disable-next-line no-alert
alert("foo");
```

`eslint-config-love` has no rules to fix code, but some fixes are
still available via the basic `eslint`, therefore it is still
useful to invoke it with `--fix`:

```json
    "lint": "eslint --fix",
```

## prettier

The source code is formatted with [prettier](https://prettier.io),
using the configuration in `package.json` and `.prettierignore`.

- https://prettier.io/docs/options

To skip formatting for some lines in a file:

```js
// prettier-ignore
...
```

To invoke it via npm:

```json
    "prettier": "prettier src --write",
```

## TODO

In LLVM there is a page with a broken link to #details.

