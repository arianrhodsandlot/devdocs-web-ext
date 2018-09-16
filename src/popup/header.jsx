import React, { Component } from 'react'
import querystring from 'querystring'
import { withRouter } from 'react-router'
import key from 'keymaster'

class Header extends Component {
  constructor (props) {
    super(props)

    let query
    if (props.location.pathname === '/search') {
      query = querystring.parse(props.location.search.slice(1)).query.trim()
    }
    query = query || localStorage.lastQuery || ''

    this.state = {
      query: query,
      content: '',
      redirect: '',
      scope: '',
      inputPaddingLeft: 0
    }
    this.inputRef = React.createRef()
    this.scopeRef = React.createRef()

    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount () {
    this.inputRef.current.select()

    key.filter = () => true
    key('tab', () => {
      if (this.state.scope) return
      const scope = this.guessScope()
      if (!scope) return
      this.addScope(scope)
      this.inputRef.current.value = ''
      return false
    })
    key('backspace', () => {
      if (!this.inputRef.current.value) {
        this.removeScope()
        return false
      }
    })
  }

  guessScope () {
    return this.inputRef.current.value
  }

  addScope (scope) {
    this.setState({scope}, () => {
      this.setState({inputPaddingLeft: this.scopeRef.current.offsetWidth + 10})
    })
  }

  removeScope () {
    this.setState({scope: '', inputPaddingLeft: 0})
  }

  handleChange (event) {
    const query = event.target.value.trim()
    localStorage.lastQuery = query
    this.props.history.replace('/search?query=' + encodeURIComponent(query))
  }

  render () {
    const {query, scope, inputPaddingLeft} = this.state
    return (
      <div className="_header">
        <form className="_search" autoComplete="off">
          <svg><use href="#icon-search"/></svg>
          <input defaultValue={query} placeholder="Search..." className="input _search-input" spellCheck="false" onChange={this.handleChange} autoFocus ref={this.inputRef} style={scope ? {paddingLeft: inputPaddingLeft} : {}} />
          {scope ? <div className="_search-tag" ref={this.scopeRef}>{scope}</div> : null}
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
