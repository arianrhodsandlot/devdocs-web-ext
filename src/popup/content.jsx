import React, { Component } from 'react'
import browser from 'webextension-polyfill'
import url from 'url'
import classnames from 'classnames'

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

  getCategoryPageClass (category) {
    const categoryName = category.split('~')[0]
    switch (categoryName) {
      case 'ansible':
      case 'bottle':
      case 'codeigniter':
      case 'django':
      case 'falcon':
      case 'matplotlib':
      case 'numpy':
      case 'pandas':
      case 'python':
      case 'scikit_image':
      case 'scikit_learn':
      case 'statsmodels':
      case 'twig':
        return 'sphinx'
      case 'babel':
      case 'bluebird':
      case 'eslint':
      case 'homebrew':
      case 'jsdoc':
      case 'react':
      case 'relay':
        return 'simple'
      case 'backbone':
        return 'underscore'
      case 'chef':
      case 'cmake':
      case 'godot':
      case 'julia':
      case 'opentsdb':
        return 'sphinx_simple'
      case 'cpp':
        return 'c'
      case 'padrino':
        return 'rubydoc'
      case 'phoenix':
        return 'elixir'
      case 'sass':
        return 'yard'
      case 'symfony':
        return 'laravel'
      default:
        return categoryName
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
    let category = this.props.location.pathname.split(/\/|~/g)
    if (category) {
      category = category[1] || ''
    }
    return (
      <div className="_container" role="document">
        <div className="_content" role="main">
          <div
            className="_page"
            className={classnames(['_page', `_${this.getCategoryPageClass(category)}`])}
            onClick={this.onContentClick}
            dangerouslySetInnerHTML={{__html: content}}>
          </div>
        </div>
      </div>
    )
  }
}

export default App
