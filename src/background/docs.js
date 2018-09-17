import debounce from 'lodash/debounce'
import flatten from 'lodash/flatten'
import filter from 'lodash/filter'
import extend from 'lodash/extend'
import map from 'lodash/map'
import includes from 'lodash/includes'
import Searcher from '../../vendor/devdocs/assets/javascripts/app/searcher.coffee'

class Docs {
  constructor (docNames) {
    this.docNames = docNames
    this.docs = []
    this.reload()
  }
  async reload () {
    const allDocs = await this.getAllDocs()
    const docs = filter(allDocs, (doc) => includes(this.docNames, doc.slug))
    await this.extendedDocs(docs)
    this.docs = docs
  }
  extendedDocs (docs) {
    return Promise.all(map(docs, (doc) => {
      return this.extendDoc(doc)
    }))
  }
  async extendDoc (doc) {
    const index = await this.getDocIndexByName(doc.slug)
    index.entries = map(index.entries, (entry) => {
      return {
        ...entry,
        text: [entry.name],
        doc: {...doc}
      }
    })
    extend(doc, index)
  }
  async getDocIndexByName (docName) {
    const docUrl = `http://docs.devdocs.io/${docName}/index.json`
    const response = await fetch(docUrl)
    const responseText = await response.text()
    const index = JSON.parse(responseText)
    return index
  }
  async getAllDocs () {
    const docsUrl = 'https://devdocs.io/docs/docs.json'
    const response = await fetch(docsUrl)
    const responseText = await response.text()
    const docs = JSON.parse(responseText)
    for (const doc of docs) {
      doc.fullName = doc.name + (doc.version ? ` ${doc.version}` : '')
      doc.slug_without_version = doc.slug.split('~')[0]
      doc.icon = doc.slug_without_version
      doc.short_version = doc.version ? doc.version.split(' ')[0] : ''
      doc.text = [doc.name, doc.slug]
    }
    return docs
  }
  searchEntries (query) {
    const entries = flatten(this.docs.map((doc) => doc.entries))
    const searcher = new Searcher()

    return new Promise((resolve) => {
      searcher.on('results', (results) => {
        resolve(results)
      })
      searcher.find(entries, 'text', query)
    })
  }
  attemptToMatchOneDoc (query) {
    const searcher = new Searcher({
      max_results: 1,
      fuzzy_min_length: 1
    })

    return new Promise((resolve) => {
      searcher.on('results', (results) => {
        console.log(this.docs, results)
        const doc = results.length ? results[0] : null
        resolve(doc)
      })
      searcher.find(this.docs, 'text', query)
    })
  }
}
Docs.prototype.debouncedReload = debounce(function () {
  this.reload()
}, 100)

export default Docs
