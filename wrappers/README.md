# README

`DocusaurusContentDocsWithDoxygenWrapper.js` is a wrapper that must
must be installed in place of the Docusaurus Content Docs plugin,
to perform the MDX generation **before** the Docs plugin starts
parsing the files.

```js
    [
      // '@docusaurus/plugin-content-docs',
      './src/plugins/DocusaurusContentDocsWithDoxygenWrapper.js',
      {
        sidebarPath: './sidebars.ts',
        // Please change this to your repo.
        // Remove this to remove the "edit this page" links.
        editUrl: 'https://github.com/micro-os-plus/micro-test-plus-xpack/edit/website/website/',
        // showLastUpdateAuthor: true,
        showLastUpdateTime: true,

        doxygenPluginOptions: {
          verbose: true,
          runOnStart: true
        }
      },
    ],
```
