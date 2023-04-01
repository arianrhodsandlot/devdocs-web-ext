function Model(o) {
  for (k in o) {
    this[k] = o[k]
  }
}

export const app = {
  models: {},

  Model,

  config: {
    max_results: 50
  }
}
