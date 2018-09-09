import React, { Component } from 'react'
import querystring from 'querystring'
import { withRouter } from 'react-router'

class Header extends Component {
  constructor (props) {
    super(props)

    let query
    if (props.location.pathname === '/search') {
      query = querystring.parse(props.location.search.slice(1)).query.trim()
    }
    query = query || ''

    this.state = {
      query: query,
      content: '',
      redirect: ''
    }

    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount () {
    this.refs.input.select()
  }

  handleChange (event) {
    const query = event.target.value
    this.props.history.replace('/search?query=' + query.trim())
  }

  render () {
    return (
      <div className="_header">
        <form className="_search" autoComplete="off">
          <svg><use href="#icon-search"/></svg>
          <input defaultValue={this.state.query} placeholder="Search..." className="input _search-input" spellCheck="false" onChange={this.handleChange} autoFocus ref="input" />
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
