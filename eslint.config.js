// https://eslint.org/docs/latest/use/configure/configuration-files
// https://github.com/mightyiam/eslint-config-love

import love from 'eslint-config-love'

export default [
  {
    ignores: ['dist/**'],
  },
  {
    ...love,
    files: ['src/cli/*.ts', 'src/docusaurus/**/*.ts'],
    rules: {
      ...love.rules,
      'eslint-comments/require-description': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      'max-len': [
        'warn',
        80,
        {
          ignoreUrls: true,
          ignorePattern:
            '^\\s*// eslint-disable-next-line|^\\s*import\\s+\\{[^}]+\\}\\s+from\\s+[\'"][^\'"]+[\'"]|^\\s*import\\s+type\\s+\\{[^}]+\\}\\s+from\\s+[\'"][^\'"]+[\'"]|^export class .+ extends .+\\{$',
        },
      ],
    },
  },
]
