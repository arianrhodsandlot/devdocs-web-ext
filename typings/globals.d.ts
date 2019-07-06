declare const VERSION: string
declare const GIT_VERSION: string
declare const BUILD_MODE: string

type Unpromisify<T> = T extends Promise<infer U> ? U : T
