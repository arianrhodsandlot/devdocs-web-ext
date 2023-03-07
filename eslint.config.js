import { createConfig } from '@arianrhodsandlot/eslint-config'

export default createConfig({
  typeChecking: false,
  append: {
    rules: {
      '@typescript-eslint/no-shadow': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'unicorn/no-null': 'off',
    },
  },
})
