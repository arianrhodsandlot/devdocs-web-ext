import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import querystring from 'querystring'
import browser from 'webextension-polyfill'
import classnames from 'classnames'
import key from 'keymaster'
import { Link } from 'react-router-dom'
import Docs from '../background/docs'

type Unpromisify<T> = T extends Promise<infer U> ? U : T

export default function Search ({ location, history }) {
  const [entries, setEntries] = useState([] as Unpromisify<ReturnType<Docs['searchEntries']>>)
  const [focusPos, setFocusPos] = useState(0)
  const [failMessage, setFailMessage] = useState('')
  const entryRefs = []

  const keyHandlersRef = useRef({ focusNextEntry, focusPrevEntry, enterFocusEntry })

  useEffect(() => {
    key.filter = () => true
    key('down', () => {
      keyHandlersRef.current.focusNextEntry()
      return false
    })
    key('up', () => {
      keyHandlersRef.current.focusPrevEntry()
      return false
    })
    key('enter', () => {
      keyHandlersRef.current.enterFocusEntry()
      return false
    })

    return () => {
      key.unbind('down')
      key.unbind('up')
      key.unbind('enter')
    }
  }, [])

  useEffect(() => {
    search()
  }, [location])

  useEffect(() => {
    if (!entries) return
    const ref = getEntryRef(entries[focusPos])
    if (ref && ref.current) {
      const entryDomNode = ReactDOM.findDOMNode(ref.current)
      entryDomNode.scrollIntoView({ behavior: 'smooth' })
    }
  }, [focusPos])

  function getDocVersion (doc) {
    return doc.slug.includes('~') ? doc.slug.split('~')[1] : ''
  }

  function focusNextEntry () {
    const maxFocusPos = entries.length - 1
    setFocusPos(focusPos === maxFocusPos ? 0 : focusPos + 1)
  }

  function focusPrevEntry () {
    const maxFocusPos = entries.length - 1
    setFocusPos(focusPos === 0 ? maxFocusPos : focusPos - 1)
  }

  function getEntryUrl (entry) {
    const [entryPath, entryHash] = entry.path.split('#')
    const pathAndHash = entryHash ? `${entryPath}#${entryHash}` : `${entryPath}`
    return `/${entry.doc.slug}/${pathAndHash}`
  }

  function enterFocusEntry () {
    const focusEntry = entries[focusPos]
    history.push(getEntryUrl(focusEntry))
  }

  function getEntryRef (entry) {
    const index = entries.indexOf(entry)
    let ref = entryRefs[index]
    if (!ref) {
      ref = React.createRef()
      entryRefs[index] = ref
    }
    return ref
  }

  async function search () {
    const { query = '', scope = '' } = querystring.parse(location.search.slice(1))
    if (!query && !scope) {
      history.replace('/')
      return
    }

    let entries = []
    const focusPos = 0
    let failMessage = ''

    let response
    try {
      response = await browser.runtime.sendMessage({
        action: 'search-entry',
        payload: { query, scope }
      })
    } catch (e) {
      failMessage = e.message
    }

    if (response) {
      if (response.status === 'success') {
        entries = response.content
      } else if (response.status === 'fail') {
        failMessage = response.message
      }
    }

    setEntries(entries)
    setFocusPos(focusPos)
    setFailMessage(failMessage)
  }

  if (failMessage) {
    return (
      <div className='_container' role='document'>
        <div className='_content' role='main'>
          <div>
            <div className='_splash-title error'>{failMessage}</div>
          </div>
        </div>
      </div>
    )
  }

  const noResults = (
    <>
      <div className='_list-note'>
        No results.
      </div>
      <div className='_list-note'>
        Note: documentations must be <a href='https://devdocs.io/settings' className='_list-note-link' target='_blank' onClick={(e) => {
          e.preventDefault()
          browser.tabs.create({ url: e.currentTarget.href })
        }}>enabled</a> to appear in the search.
      </div>
    </>
  )

  const results = (entries
    ? entries.map((entry, i) => (
      <Link
        className={classnames(
          '_list-item', '_list-hover', '_list-entry',
          `_icon-${entry.doc.icon}`,
          { focus: focusPos === i ? 'focus' : '' })}
        key={`${entry.doc.slug}-${entry.doc.name}/${entry.path}-${entry.name}`}
        to={getEntryUrl(entry)}
        ref={getEntryRef(entry)}>
        <div className='_list-count'>{getDocVersion(entry.doc)}</div>
        <div className='_list-text'>{entry.name}</div>
      </Link>
    ))
    : null
  )

  return (
    <div className='_sidebar'>
      <div className='_list'>
        {entries ? (entries.length ? results : noResults) : null}
      </div>
    </div>
  )
}
