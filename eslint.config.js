import { createConfig } from '@arianrhodsandlot/eslint-config'

export default createConfig({
  typeChecking: false,
  overrides: { js: { ignores: ['src/lib/vendor/devdocs/**/*.js'] } },
})
