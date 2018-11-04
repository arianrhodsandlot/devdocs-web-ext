import React, { Component } from 'react'
import browser from 'webextension-polyfill'
import url from 'url'
import classnames from 'classnames'
import key from 'keymaster'
import ky from 'ky'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      contentUrl: '',
      content: '',
      doc: null
    }

    this.pageRef = React.createRef()

    this.updateDoc()

    this.onContentClick = this.onContentClick.bind(this)
  }

  componentDidMount () {
    // avoid iframes in the content blocking the popup page
    setTimeout(() => {
      this.renderContent()
    }, 1)
    key.filter = () => true
    key('enter', () => {
      return false
    })
    key('space', () => {
      this.pageRef.current.scrollBy({ top: 150, left: 0, behavior: 'smooth' })
      return false
    })
    key('shift+space', () => {
      this.pageRef.current.scrollBy({ top: -150, left: 0, behavior: 'smooth' })
      return false
    })
  }

  componentWillUnmount () {
    key.unbind('enter')
    key.unbind('space')
    key.unbind('shift+space')
  }

  componentDidUpdate (prevProps) {
    if (this.props.location !== prevProps.location) {
      if (this.props.location.pathname === prevProps.location.pathname) {
        this.scrollToHash()
      } else {
        this.renderContent()
      }
    }
  }

  async updateDoc () {
    let scope = this.props.location.pathname.split('/')[1].split('~')[0]
    if (!scope) return
    const doc = await browser.runtime.sendMessage({
      action: 'get-content-doc',
      payload: { scope }
    })
    if (doc) {
      this.setState({doc})
    }
  }

  async getDocContent (contentUrl) {
    let content
    if (localStorage.cachedDocContentUrl === contentUrl) {
      content = localStorage.cachedDocContent
    } else {
      content = await ky(contentUrl).text()
    }

    localStorage.cachedDocContentUrl = contentUrl
    localStorage.cachedDocContent = content

    return content
  }

  renderContent () {
    const contentUrl = `http://docs.devdocs.io${this.props.location.pathname}.html${this.props.location.search}`

    this.setState({contentUrl, pending: true}, async () => {
      const content = await this.getDocContent(contentUrl)

      if (this.state.contentUrl === contentUrl) {
        this.setState({content, pending: false}, () => {
          this.scrollToHash()
        })
      }
    })
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

  render () {
    const {pending} = this.state
    if (pending) {
      return (
        <div className='_container' role='document'>
          <div className='_content' role='main'>
            <div className='_page'>
              <div className='_content-loading' />
            </div>
          </div>
        </div>
      )
    }

    const {content, doc} = this.state
    let category = this.props.location.pathname.split(/\/|~/g)
    if (category) {
      category = category[1] || ''
    }
    return (
      <div className='_container' role='document'>
        <div className='_content' role='main'>
          <div
            className='_page'
            className={classnames(['_page', doc ? `_${doc.type}` : ''])}
            onClick={this.onContentClick}
            ref={this.pageRef}
            dangerouslySetInnerHTML={{__html: content}} />
        </div>
      </div>
    )
  }
}

export default App
