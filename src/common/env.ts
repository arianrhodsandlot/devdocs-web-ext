/* global BUILD_MODE */
const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd
const isTest = BUILD_MODE === 'test'

const isContextMenuEnabled = false

export { isProd, isDev, isTest, isContextMenuEnabled }
