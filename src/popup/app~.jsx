import '@babel/polyfill'
import React, { Component } from 'react'
import browser from 'webextension-polyfill'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      content: ''
    }
  }
  onKeydown (event) {
    const {content, entries} = this.get()
    switch (event.key) {
      case 'ArrowUp':
        if (entries.length) {
          event.preventDefault()
          this.focusPrevEntry()
        }
        break
      case 'ArrowDown':
        if (entries.length) {
          event.preventDefault()
          this.focusNextEntry()
        }
        break
      case 'Tab':
        if (content) {
          event.preventDefault()
          if (event.shiftKey) {
            this.scrollToPrevPage()
          } else {
            this.scrollToNextPage()
          }
        } else if (entries.length) {
          event.preventDefault()
          if (event.shiftKey) {
            this.focusPrevEntry()
          } else {
            this.focusNextEntry()
          }
        }
        break
      case 'PageDown':
        if (content) {
          event.preventDefault()
          this.scrollToNextPage()
        } else if (entries.length) {
          event.preventDefault()
          this.focusNextEntry()
        }
        break
      case 'PageUp':
        if (content) {
          event.preventDefault()
          if (event.shiftKey) {
          this.scrollToPrevPage()
        } else if (entries.length) {
          event.preventDefault()
          this.focusPrevEntry()
          }
        }
        break
      case 'f':
        if (event.ctrlKey) {
          event.preventDefault()
          this.scrollToNextPage()
        }
        break
      case 'b':
        if (event.ctrlKey) {
          event.preventDefault()
          this.scrollToPrevPage()
        }
        break
      case '/':
        const {input} = this.refs
        if (event.target !== input) {
          event.preventDefault()
          input.focus()
          input.select()
        }
        break
      case 'Enter':
        event.preventDefault()
        this.openContent(this.get().focusEntry)
        break
    }
  }
  focusNextEntry () {
    const {focusPos, maxFocusPos} = this.get()
    this.set({focusPos: focusPos === maxFocusPos ? 0 : focusPos + 1})
    this.refs.list.children[this.get().focusPos].scrollIntoView({behavior: 'smooth'})
  }
  focusPrevEntry () {
    const {focusPos, maxFocusPos} = this.get()
    this.set({focusPos: focusPos === 0 ? maxFocusPos : focusPos - 1})
    this.refs.list.children[this.get().focusPos].scrollIntoView({behavior: 'smooth'})
  }
  async search () {
    const {query} = this.get()
    this.set({content: ''})

    localStorage.setItem('lastViewed', JSON.stringify({
      type: 'list',
      query,
      content: ''
    }))

    let entries = []
    let focusPos = 0
    let failMessage = ''

    const response = await browser.runtime.sendMessage(query)
    if (response.status === 'success') {
      entries = response.content
    } else if (response.status === 'fail') {
      failMessage = response.message
    }
    this.set({entries, focusPos, failMessage, searchLoading: false})

    if (this.refs.list) {
      this.refs.list.scrollTo(0, 0)
    }
  }
  scrollToNextPage () {
    const {page} = this.refs
    page.style['scroll-behavior'] = 'smooth'
    page.scrollTo(0, page.scrollTop + this.refs.page.offsetHeight)
    delete page.style['scroll-behavior']
  }
  scrollToPrevPage () {
    const {page} = this.refs
    page.style['scroll-behavior'] = 'smooth'
    page.scrollTo(0, page.scrollTop - this.refs.page.offsetHeight)
    delete page.style['scroll-behavior']
  }
  async openContent (entry) {
    if (!entry) return
    this.set({contentEntry: entry, contentLoading: true})

    this.refs.input.select()

    const res = await fetch(this.get().contentEntryUrl)
    const content = await res.text()

    this.set({content, contentLoading: false})

    localStorage.setItem('lastViewed', JSON.stringify({
      type: 'page',
      entry,
      query: this.get().query
    }))

    const {page} = this.refs
    page.scrollTo(0, 0)

    const entryHash = entry.path.split('#')[1]
    if (entryHash) {
      const scrollTargetId = entryHash.startsWith('.') ? entryHash.slice(1) : entryHash
      const scrollTarget = document.getElementById(scrollTargetId)
      if (scrollTarget) {
        page.scrollTo(0, scrollTarget.offsetTop)
      }
    }
  }
  render() {
    return (
      <div>
        <div class="_header">
          <form class="_search" autocomplete="off">
            <input placeholder="Search..." class="input _search-input" spellcheck="false" />
          </form>
        </div>

        {this.state.content || this.state.contentLoading ?

        <div class="_container" role="document">
          <div class="_content" role="main">
            {contentLoading ?
            <div class="_page">
              <div class="_content-loading"></div>
            </div>
            :
            <div class="_page _{getCategoryPageClass(contentEntry.category)}">
              {content}
            </div>
            }
          </div>
        </div>

        :

        (entries.length ?
          <div class="_sidebar">
            <div class="_list">
              {entries.map((entry, i) => (
                <div class="_list-item _list-hover _list-entry _icon-{getCategoryName(entry.category)} {focusPos === i ? 'focus' : ''}" click="openContent(entry)">
                <div class="_list-count">{getCategoryVersion(entry.category)}</div>
                <div class="_list-text">{entry.name}</div>
                </div>
              ))}
            </div>
          </div>

          :

          <div class="_container" role="document">
            <div class="_content" role="main">
              <div>
                {failMessage ?
                <div class="_splash-title error">{failMessage}</div>
                :
                <div class="_splash-title">DevDocs Web Ext</div>
                }
              </div>
            </div>
          </div>
        )}

        <svg class="_settings" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <symbol id="icon-search" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></symbol>
          </defs>
        </svg>
      </div>
    )
  }
}

export default App
