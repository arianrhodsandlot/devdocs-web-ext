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

    this.pageRef = React.createRef()

    this.onContentClick = this.onContentClick.bind(this)
  }

  componentDidMount () {
    this.getContent()
  }

  componentDidUpdate (prevProps) {
    if (this.props.location !== prevProps.location) {
      if (this.props.location.pathname === prevProps.location.pathname) {
        this.scrollToHash()
      } else {
        this.getContent()
      }
    }
  }

  async getContent () {
    const contentUrl = `http://docs.devdocs.io${this.props.location.pathname}.html${this.props.location.search}`
    this.setState({contentUrl, pending: true})
    const res = await fetch(contentUrl)
    const content = await res.text()
    if (this.state.contentUrl === contentUrl) {
      this.setState({content, pending: false}, () => {
        this.scrollToHash()
      })
    }
  }

  scrollToHash () {
    let entryHash = this.props.location.hash
    if (!entryHash) return
    if (entryHash.startsWith('#')) {
      entryHash = entryHash.slice(1)
    }
    if (entryHash) {
      const scrollTargetId = entryHash.startsWith('.') ? entryHash.slice(1) : entryHash
      const scrollTarget = document.getElementById(scrollTargetId)
      if (scrollTarget) {
        this.pageRef.current.scrollTo(0, scrollTarget.offsetTop)
      }
    }
  }

  onContentClick (e) {
    let {target} = e
    while (target.tagName !== 'A') {
      if (target === e.currentTarget) return
      target = target.parentElement
    }
    e.preventDefault()
    const href = target.getAttribute('href')
    if (href.startsWith('http://') || href.startsWith('https://')) {
      browser.tabs.create({url: href})
    } else {
      const currentUrl = this.props.history.location.pathname
      const targetUrl = url.resolve(currentUrl, href)
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
            ref={this.pageRef}
            dangerouslySetInnerHTML={{__html: content}}>
          </div>
        </div>
      </div>
    )
  }
}

export default App
