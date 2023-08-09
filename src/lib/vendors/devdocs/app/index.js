import { app } from './app'

// these modules have no exports, instead they make side effects on the `app`
import './searcher'
import '../models/entry'
console.assert(app.models.Entry)
console.assert(app.Searcher)
console.assert(app.SynchronousSearcher)

export { app }
