import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import querystring from 'querystring'
import browser from 'webextension-polyfill'
import classnames from 'classnames'
import key from 'keymaster'
import { Link } from 'react-router-dom'

class Search extends Component {
  constructor (props) {
    super(props)
    this.state = {
      entries: null,
      focusPos: 0,
      failMessage: ''
    }

    this.entryRefs = []

    this.search(props)
  }

  componentDidUpdate (prevProps) {
    if (this.props.location !== prevProps.location) {
      this.search()
    }
  }

  componentDidMount () {
    key.filter = () => true
    key('down', () => {
      this.focusNextEntry()
      return false
    })
    key('up', () => {
      this.focusPrevEntry()
      return false
    })
    key('enter', () => {
      this.enterFocusEntry()
      return false
    })
  }

  componentWillUnmount () {
    key.unbind('down')
    key.unbind('up')
    key.unbind('enter')
  }

  getDocVersion (doc) {
    return doc.slug.includes('~') ? doc.slug.split('~')[1] : ''
  }

  getDocName (doc) {
    return doc.split('~')[0]
  }

  focusNextEntry () {
    const {focusPos, entries} = this.state
    const maxFocusPos = entries.length - 1
    this.setState({
      focusPos: focusPos === maxFocusPos ? 0 : focusPos + 1
    }, () => {
      const ref = this.getEntryRef(this.state.entries[this.state.focusPos])
      const entryDomNode = ReactDOM.findDOMNode(ref.current)
      entryDomNode.scrollIntoView({behavior: 'smooth'})
    })
  }

  focusPrevEntry () {
    const {focusPos, entries} = this.state
    const maxFocusPos = entries.length - 1
    this.setState({
      focusPos: focusPos === 0 ? maxFocusPos : focusPos - 1
    }, () => {
      const ref = this.getEntryRef(this.state.entries[this.state.focusPos])
      const entryDomNode = ReactDOM.findDOMNode(ref.current)
      entryDomNode.scrollIntoView({behavior: 'smooth'})
    })
  }

  getEntryUrl (entry) {
    const [entryPath, entryHash] = entry.path.split('#')
    const pathAndHash = entryHash ? `${entryPath}#${entryHash}` : `${entryPath}`
    return `/${entry.doc.slug}/${pathAndHash}`
  }

  enterFocusEntry () {
    const {focusPos, entries} = this.state
    const focusEntry = entries[focusPos]
    this.props.history.replace(this.getEntryUrl(focusEntry))
  }

  getEntryRef (entry) {
    const index = this.state.entries.indexOf(entry)
    let ref = this.entryRefs[index]
    if (!ref) {
      ref = React.createRef()
      this.entryRefs[index] = ref
    }
    return ref
  }

  async search () {
    const {query, scope} = querystring.parse(this.props.location.search.slice(1))
    if (!query && !scope) {
      this.props.history.replace('/')
      return
    }

    let entries = []
    let focusPos = 0
    let failMessage = ''

    let response
    try {
      response = await browser.runtime.sendMessage({
        action: 'search-entry',
        payload: { query, scope }
      })
    } catch (e) {
      failMessage = e.message
    }

    if (response) {
      if (response.status === 'success') {
        entries = response.content
      } else if (response.status === 'fail') {
        failMessage = response.message
      }
    }

    this.setState({entries, focusPos, failMessage, searchLoading: false})
  }

  render () {
    const {failMessage} = this.state
    if (failMessage) {
      return (
        <div className="_container" role="document">
          <div className="_content" role="main">
            <div>
              <div className="_splash-title error">{failMessage}</div>
            </div>
          </div>
        </div>
      )
    }

    const {entries, focusPos} = this.state
    const noResults = (
      <React.Fragment>
        <div className="_list-note">
          No results.
        </div>
        <div className="_list-note">
          Note: documentations must be <a href="https://devdocs.io/settings" className="_list-note-link">enabled</a> to appear in the search.
        </div>
      </React.Fragment>
    )

    const results = (entries
      ?
      entries.map((entry, i) => (
        <Link
          className={classnames(
            '_list-item', '_list-hover', '_list-entry',
            `_icon-${entry.doc.icon}`,
            {focus: focusPos === i ? 'focus' : ''})}
          key={`${entry.doc.slug}-${entry.doc.name}/${entry.path}-${entry.name}`}
          to={this.getEntryUrl(entry)}
          ref={this.getEntryRef(entry)}>
          <div className="_list-count">{this.getDocVersion(entry.doc)}</div>
          <div className="_list-text">{entry.name}</div>
        </Link>
      ))
      :
      null
    )

    return (
      <div className="_sidebar">
        <div className="_list">
          {entries ? (entries.length ? results : noResults) : null}
        </div>
      </div>
    )
  }
}

export default Search
