import React, { Component } from 'react'
import querystring from 'querystring'
import browser from 'webextension-polyfill'
import classnames from 'classnames'
import key from 'keymaster'

class Search extends Component {
  constructor (props) {
    super(props)
    this.state = {
      entries: [],
      focusPos: 0,
      failMessage: ''
    }

    this.componentWillReceiveProps(props)
  }

  componentWillReceiveProps (props) {
    const {query} = querystring.parse(props.location.search.slice(1))
    if (!query) {
      props.history.replace('/')
      return false
    }
    this.search(query)
  }

  componentDidMount () {
    key.filter = () => true
    key('down', () => {
      this.focusNextEntry()
    })
    key('up', () => {
      this.focusPrevEntry()
    })
    key('enter', () => {
      this.enterFocusEntry()
    })
  }

  componentWillUnmount () {
    key.unbind('down')
    key.unbind('up')
    key.unbind('enter')
  }

  getCategoryVersion (category) {
    return category.includes('~') ? category.split('~')[1] : ''
  }

  getCategoryName (category) {
    return category.split('~')[0]
  }

  focusNextEntry () {
    const {focusPos, entries} = this.state
    const maxFocusPos = entries.length - 1
    this.setState({focusPos: focusPos === maxFocusPos ? 0 : focusPos + 1})
    // this.refs.list.children[this.state.focusPos].scrollIntoView({behavior: 'smooth'})
  }

  focusPrevEntry () {
    const {focusPos, entries} = this.state
    const maxFocusPos = entries.length - 1
    this.setState({focusPos: focusPos === 0 ? maxFocusPos : focusPos - 1})
    // this.refs.list.children[this.state.focusPos].scrollIntoView({behavior: 'smooth'})
  }

  enterFocusEntry () {
    const {focusPos, entries} = this.state
    const focusEntry = entries[focusPos]
    const [entryPath, entryHash] = focusEntry.path.split('#')
    const pathAndHash = entryHash ? `${entryPath}.html#${entryHash}` : `${entryPath}.html`
    this.props.history.replace(`/${focusEntry.category}/${pathAndHash}`)
  }

  async search (query) {
    await browser.runtime.sendMessage(query)
    const response = await browser.runtime.sendMessage(query)
    let entries = []
    let focusPos = 0
    let failMessage = ''
    if (response.status === 'success') {
      entries = response.content
    } else if (response.status === 'fail') {
      failMessage = response.message
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
    return (
      <div>
        <div className="_sidebar">
          <div className="_list">
            {entries.map((entry, i) => (
              <div
                className={classnames(
                  '_list-item', '_list-hover', '_list-entry',
                  `_icon-${this.getCategoryName(entry.category)}`,
                  {focus: focusPos === i ? 'focus' : ''})}
                key={`${entry.category}/${entry.path}`}>
                <div className="_list-count">{this.getCategoryVersion(entry.category)}</div>
                <div className="_list-text">{entry.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

export default Search
