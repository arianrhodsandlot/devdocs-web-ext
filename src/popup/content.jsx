import React, { Component } from 'react'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      contentUrl: '',
      content: ''
    }
  }

  componentWillReceiveProps () {
    this.getContent()
  }

  componentDidMount () {
    this.getContent()
  }

  async getContent () {
    const contentUrl = `http://docs.devdocs.io${this.props.location.pathname}${this.props.location.search}`
    this.setState({contentUrl, pending: true})
    const res = await fetch(contentUrl)
    const content = await res.text()
    if (this.state.contentUrl === contentUrl) {
      this.setState({content, pending: false})
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
            dangerouslySetInnerHTML={{__html: content}}>
          </div>
        </div>
      </div>
    )
  }
}

export default App
