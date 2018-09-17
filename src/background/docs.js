import debounce from 'lodash/debounce'
import flatten from 'lodash/flatten'
import Searcher from '../../vendor/devdocs/assets/javascripts/app/searcher.coffee'

class Docs {
  constructor (docNames) {
    this.docNames = docNames
    this.docs = []
    this.reload()
  }
  async reload () {
    this.docNames = this.docNames || await getCategories()
    this.docs = await Promise.all(this.docNames.map(this.getDocByName))
  }
  async getDocByName (docName) {
    const docUrl = `http://docs.devdocs.io/${docName}/index.json`
    const response = await fetch(docUrl)
    const responseText = await response.text()
    let {entries, types} = JSON.parse(responseText)
    const doc = {name: docName, type: 'mdn' }
    entries = entries.map((entry) => {
      return {
        ...entry,
        doc: { ...doc },
        text: entry.name,
      }
    })
    doc.entries = entries
    doc.types = types
    return doc
  }
  searchEntries (query) {
    const entries = flatten(this.docs.map((doc) => doc.entries))

    return new Promise((resolve) => {
      const searcher = new Searcher()
      const attr = 'name'
      searcher.on('results', (results) => {
        resolve(results)
      })
      searcher.find(entries, attr, query)
    })
  }
}
Docs.prototype.debouncedReload = debounce(function () {
  this.reload()
}, 100)

export default Docs
