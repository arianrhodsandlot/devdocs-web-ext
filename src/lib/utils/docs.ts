import ky from 'ky'
import _ from 'lodash'
import { log } from '~/src/lib/utils/log'
import { Entry, Searcher } from '~/src/lib/vendors/devdocs'

export class Docs {
  docNames: string[] = []

  docs: ExtendedDoc[] = []

  allDocs: Doc[] = []

  status = 'ready'

  private syncProcess: Promise<void> | undefined = undefined

  private syncingDocNames: string[] = []

  static searchEntriesInDoc(query: string, doc: Doc & Index) {
    const { entries } = doc
    const searcher = new Searcher()

    return new Promise((resolve) => {
      searcher.on('results', (results: typeof entries) => {
        resolve(results)
      })
      searcher.find(entries, 'text', query)
    }) as Promise<typeof entries>
  }

  private static extendDocs(docs: Doc[]) {
    return Promise.all(_.map(docs, (doc) => Docs.extendDoc(doc)))
  }

  private static async extendDoc(doc: Doc) {
    const extendedDoc = {
      ...doc,
      fullName: doc.name + (doc.version ? ` ${doc.version}` : ''),
      slug_without_version: doc.slug.split('~')[0],
      icon: doc.slug.split('~')[0],
      short_version: doc.version ? doc.version.split(' ')[0] : '',
      text: [doc.name, doc.slug],
    }
    const docEntry = new Entry({
      ...extendedDoc,

      name: extendedDoc.fullName,
    }) as { addAlias: (alias: string) => undefined } & typeof extendedDoc

    if (docEntry.version) {
      docEntry.addAlias(doc.name)
    }

    const index = (await Docs.getDocIndexByName(doc.slug)) as Index
    index.entries = _.map(index.entries, (entry) => ({
      ...new Entry(entry),
      doc: { ...extendedDoc },
    }))

    return {
      ...doc,
      ...index,
      ...docEntry,
    }
  }

  private static async getDocIndexByName(docName: string) {
    const docUrl = `https://documents.devdocs.io/${docName}/index.json`
    return await ky(docUrl).json()
  }

  private static async getAllDocs() {
    const docsUrl = 'https://devdocs.io/docs/docs.json'
    return (await ky(docsUrl).json()) as Doc[]
  }

  private static attemptToMatchOneDoc<Doc>(rawQuery: string, docs: Doc[]) {
    const query = rawQuery.replace('_', ' ')
    const searcher = new Searcher({
      max_results: 1,
      fuzzy_min_length: 1,
    })

    return new Promise((resolve) => {
      searcher.on('results', (results: Doc[]) => {
        const doc = results.length > 0 ? results[0] : undefined
        resolve(doc)
      })
      searcher.find(docs, 'slug', query)
    }) as Promise<Doc | undefined>
  }

  load({ docNames, docs, allDocs }: Pick<Docs, 'docNames' | 'docs' | 'allDocs'>) {
    this.docNames = docNames
    this.docs = docs
    this.allDocs = allDocs
  }

  dump() {
    return {
      docNames: this.docNames,
      docs: this.docs,
      allDocs: this.allDocs,
    }
  }

  async sync() {
    if (this.status === 'pending' && _.isEqual(this.docNames, this.syncingDocNames)) {
      await this.syncProcess
      return
    }

    this.syncProcess = this.startSyncProcess()
    await this.syncProcess
    this.syncProcess = undefined
  }

  searchEntries(query: string) {
    const groupedEntries = _.map(this.docs, (doc) => doc.entries)
    const entries = groupedEntries.flat()

    const searcher = new Searcher()

    return new Promise((resolve) => {
      searcher.on('results', (results: typeof entries) => {
        resolve(results)
      })
      searcher.find(entries, 'text', query)
    }) as Promise<typeof entries>
  }

  attemptToMatchOneDocInEnabledDocs(query: string) {
    return Docs.attemptToMatchOneDoc(query, this.docs)
  }

  attemptToMatchOneDocInAllDocs(query: string) {
    return Docs.attemptToMatchOneDoc(query, this.allDocs)
  }

  private async startSyncProcess() {
    this.status = 'pending'
    this.syncingDocNames = [...this.docNames]
    const { syncingDocNames, docNames } = this

    log('[background/docs] start fetching docs from server')
    const allDocs = await Docs.getAllDocs()
    if (_.isEqual(syncingDocNames, docNames)) {
      this.allDocs = allDocs
    }

    const docs = _.filter(this.allDocs, (doc) => _.includes(syncingDocNames, doc.slug))
    const extendedDocs = await Docs.extendDocs(docs)
    log('[background/docs] finish fetching docs from server')

    if (_.isEqual(syncingDocNames, docNames)) {
      this.docs = extendedDocs
      this.status = 'ready'
      this.syncingDocNames = []
    }
  }
}
