const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd
const isTest = BUILD_MODE === 'test'

export { isProd, isDev, isTest }
