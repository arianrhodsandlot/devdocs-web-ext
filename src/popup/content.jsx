import React, { Component } from 'react'
import browser from 'webextension-polyfill'
import url from 'url'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      contentUrl: '',
      content: ''
    }

    this.onContentClick = this.onContentClick.bind(this)
  }

  componentDidMount () {
    this.getContent()
  }

  componentDidUpdate (prevProps) {
    if (this.props.location !== prevProps.location) {
      this.getContent()
    }
  }

  async getContent () {
    const contentUrl = `http://docs.devdocs.io${this.props.location.pathname}.html${this.props.location.search}`
    this.setState({contentUrl, pending: true})
    const res = await fetch(contentUrl)
    const content = await res.text()
    if (this.state.contentUrl === contentUrl) {
      this.setState({content, pending: false})
    }
  }

  onContentClick (e) {
    window.h = this.props.history
    let {target} = e
    while (target.tagName !== 'A') {
      if (target === e.currentTarget) return
      target = target.parentElement
    }
    e.preventDefault()
    if (target.href.startsWith('http://') || target.href.startsWith('https://')) {
      browser.tabs.create({url: target.href})
    } else {
      const currentUrl = this.props.history.location.pathname
      const targetUrl = url.resolve(currentUrl, target.getAttribute('href'))
      this.props.history.replace(targetUrl)
    }
  }

  render () {
    const {pending} = this.state
    if (pending) {
      return (
        <div className="_container" role="document">
          <div className="_content" role="main">
            <div className="_page">
              <div className="_content-loading"></div>
            </div>
          </div>
        </div>
      )
    }

    const {content} = this.state
    return (
      <div className="_container" role="document">
        <div className="_content" role="main">
          <div
            className="_page _{getCategoryPageClass(contentEntry.category)}"
            onClick={this.onContentClick}
            dangerouslySetInnerHTML={{__html: content}}>
          </div>
        </div>
      </div>
    )
  }
}

export default App
