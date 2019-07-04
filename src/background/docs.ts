import _ from 'lodash'
import ky from 'ky'
import Searcher from '../../vendor/devdocs/assets/javascripts/app/searcher.coffee'
import Entry from '../../vendor/devdocs/assets/javascripts/models/entry.coffee'

class Docs {
  debouncedReload: any;
  docNames = ''
  docs = []
  allDocs = []
  ready = false
  constructor (docNames: string) {
    this.docNames = docNames
    this.reload()
  }
  async reload (docNames?: string | undefined) {
    this.ready = false
    if (docNames) {
      this.docNames = docNames
    }
    this.allDocs = await this.getAllDocs()
    const docs = _.filter(this.allDocs, (doc) => _.includes(this.docNames, doc.slug))
    await this.extendedDocs(docs)
    this.docs = docs
    this.ready = true
  }
  extendedDocs (docs) {
    return Promise.all(_.map(docs, (doc) => {
      return this.extendDoc(doc)
    }))
  }
  async extendDoc (doc) {
    const docEntry = new Entry({ ...doc, ...{ name: doc.fullName } })
    if (docEntry.version) {
      docEntry.addAlias(doc.name)
    }

    const index = await this.getDocIndexByName(doc.slug) as Index
    index.entries = _.map(index.entries, (entry) => {
      return {
        ...new Entry(entry),
        doc: { ...doc }
      }
    })

    _.extend(doc, { ...index, ...docEntry })
  }
  async getDocIndexByName (docName) {
    const docUrl = `http://docs.devdocs.io/${docName}/index.json`
    const index = await ky(docUrl).json()
    return index
  }
  async getAllDocs () {
    const docsUrl = 'https://devdocs.io/docs/docs.json'
    const docs = await ky(docsUrl).json() as Doc[]
    return docs.map((doc) => ({
      fullName: doc.name + (doc.version ? ` ${doc.version}` : ''),
      slug_without_version: doc.slug.split('~')[0],
      icon: doc.slug.split('~')[0],
      short_version: doc.version ? doc.version.split(' ')[0] : '',
      text: [doc.name, doc.slug]
    }))
  }
  searchEntries (query) {
    const groupedEntries = _.map(this.docs, (doc) => doc.entries)
    const entries = _.flatten(groupedEntries)

    const searcher = new Searcher()

    return new Promise((resolve) => {
      searcher.on('results', (results) => {
        resolve(results)
      })
      searcher.find(entries, 'text', query)
    })
  }
  searchEntriesInDoc (query, doc) {
    const entries = doc.entries
    const searcher = new Searcher()

    return new Promise((resolve) => {
      searcher.on('results', (results) => {
        resolve(results)
      })
      searcher.find(entries, 'text', query)
    })
  }
  attemptToMatchOneDoc (query, docs) {
    query = query.replace('_', ' ')
    const searcher = new Searcher({
      max_results: 1,
      fuzzy_min_length: 1
    })

    return new Promise((resolve) => {
      searcher.on('results', (results) => {
        const doc = results.length ? results[0] : null
        resolve(doc)
      })
      searcher.find(docs, 'text', query)
    })
  }
  attemptToMatchOneDocInEnabledDocs (query) {
    return this.attemptToMatchOneDoc(query, this.docs)
  }
  attemptToMatchOneDocInAllDocs (query) {
    return this.attemptToMatchOneDoc(query, this.allDocs)
  }
}
Docs.prototype.debouncedReload = _.debounce(function (docNames) {
  this.reload(docNames)
}, 100)

export default Docs
