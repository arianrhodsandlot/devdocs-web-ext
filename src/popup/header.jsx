import React, { Component } from 'react'
import querystring from 'querystring'
import { withRouter } from 'react-router'
import key from 'keymaster'
import browser from 'webextension-polyfill'

class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {
      doc: null,
      inputPaddingLeft: 0,
      ...this.getInputState()
    }
    if (this.state.scope) {
      this.guessDocFromScope(this.state.scope)
    }
    this.inputRef = React.createRef()
    this.scopeRef = React.createRef()

    this.handleChange = this.handleChange.bind(this)
  }

  componentDidUpdate (prevProps, prevState) {
    const {props, state} = this
    if (props.location !== prevProps.location) {
      this.setState(this.getInputState())
    }
    if (state.doc && state.doc !== prevState.doc) {
      this.setState({inputPaddingLeft: this.scopeRef.current.offsetWidth + 10})
    }
    this.inputRef.current.focus()
  }

  getInputState () {
    const {props} = this
    let query
    let scope
    if (props.location.pathname === '/search') {
      const parsed = querystring.parse(props.location.search.slice(1))
      query = parsed.query
      scope = parsed.scope
    }
    query = (query || localStorage.query || '').trim()
    scope = (scope || localStorage.scope || '').trim()
    return {query, scope}
  }

  componentDidMount () {
    this.inputRef.current.select()

    key.filter = () => true
    key('tab', () => {
      if (!this.state.doc) {
        const scope = this.inputRef.current.value.trim()
        this.guessDocFromScope(scope, () => {
          localStorage.scope = scope
          localStorage.query = ''
          this.inputRef.current.value = localStorage.query
          this.props.history.replace('/search?query=' + encodeURIComponent(this.state.query) + '&scope=' + encodeURIComponent(this.state.scope))
        })
      }
      return false
    })
    key('backspace', () => {
      if (!this.inputRef.current.value) {
        this.clearDoc()
        return false
      }
    })
    key('/', () => {
      if (document.activeElement !== this.inputRef.current) {
        this.inputRef.current.focus()
        this.inputRef.current.select()
        return false
      }
    })
  }

  async guessDocFromScope (scope, cb) {
    if (!scope) return
    const doc = await browser.runtime.sendMessage({
      action: 'auto-compelete-enabled-doc',
      payload: { scope }
    })
    if (doc) {
      this.setState({doc, scope, query: ''}, () => {
        if (cb) cb()
      })
    }
  }

  clearDoc () {
    localStorage.scope = ''
    this.setState({doc: null, scope: localStorage.scope, inputPaddingLeft: 0})
    this.props.history.replace('/search?query=' + encodeURIComponent(this.state.query))
  }

  handleChange () {
    const query = this.inputRef.current.value.trim()
    localStorage.query = query
    this.props.history.replace('/search?query=' + encodeURIComponent(query) + '&scope=' + encodeURIComponent(this.state.scope))
  }

  render () {
    const {query, doc, inputPaddingLeft} = this.state
    return (
      <div className="_header">
        <form className="_search" autoComplete="off">
          <svg><use href="#icon-search"/></svg>
          <input defaultValue={query} placeholder="Search..." className="input _search-input" spellCheck="false" onChange={this.handleChange} autoFocus ref={this.inputRef} style={doc ? {paddingLeft: inputPaddingLeft} : {}} />
          {doc ? <div className="_search-tag" ref={this.scopeRef}>{doc.fullName}</div> : null}
        </form>

        <svg className="_settings" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <symbol id="icon-search" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></symbol>
          </defs>
        </svg>
      </div>
    )
  }
}

export default withRouter(Header)
