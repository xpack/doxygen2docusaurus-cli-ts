# README

`DocusaurusContentDocsWithDoxygen.js` is an experiment to wrap the ContentDocs plugin.

In the end the entire processing was moved to the top plugin function and this hack was no longer needed.

```
    [
      './src/plugins/DocusaurusContentDocsWithDoxygen.js',
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

