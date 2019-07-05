declare const VERSION: string
declare const GIT_VERSION: string

type Unpromisify<T> = T extends Promise<infer U> ? U : T
