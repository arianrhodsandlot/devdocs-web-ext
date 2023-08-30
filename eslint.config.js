import { createConfig } from '@arianrhodsandlot/eslint-config'

export default createConfig({
  overrides: {
    js: { ignores: ['src/lib/vendors/devdocs/**/*.js'] },
  },
})
