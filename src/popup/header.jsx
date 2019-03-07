import url from 'url'
import React, { useState, useEffect, useRef } from 'react'
import querystring from 'querystring'
import { withRouter } from 'react-router'
import key from 'keymaster'
import browser from 'webextension-polyfill'

export default withRouter(function Header ({ location, history }) {
  const [inputPaddingLeft, setInputPaddingLeft] = useState(0)
  const initialInputState = getInitialInputState()
  const [scope, setScope] = useState(initialInputState.scope)
  const [query, setQuery] = useState(initialInputState.query)
  const [docName, setDocName] = useState(initialInputState.docName)
  const inputRef = useRef()
  const scopeRef = useRef()

  useEffect(() => {
    inputRef.current.select()
    if (scope) {
      attemptUpdateDoc(scope)
    }
    key('/', () => {
      if (document.activeElement !== inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
        return false
      }
    })
  }, [])

  useEffect(() => {
    if (scopeRef.current) setInputPaddingLeft(scopeRef.current.offsetWidth + 10)
    inputRef.current.focus()
  }, [docName])

  useEffect(() => {
    localStorage.setItem('scope', scope)
    localStorage.setItem('query', query)
    localStorage.setItem('docName', docName)
  }, [scope, query, docName])

  useEffect(() => {
    if (location.pathname === '/search' || location.pathname === '/') {
      const inputState = getInputState()
      setScope(inputState.scope)
      setQuery(inputState.query)
      if (!inputState.scope) {
        setDocName('')
      }
    }
  }, [location])

  function getInputState () {
    const parsed = querystring.parse(location.search.slice(1))
    return {
      query: parsed.query || '',
      scope: parsed.scope || ''
    }
  }

  function getInitialInputState () {
    const scope = localStorage.getItem('scope')
    const query = localStorage.getItem('query')
    const docName = localStorage.getItem('docName')
    return { scope, query, docName}
  }

  function clearDoc () {
    history.replace('/')
  }

  async function attemptUpdateDoc (docScope) {
    if (docScope === '') {
      setDocName('')
      return
    }
    const doc = await browser.runtime.sendMessage({
      action: 'auto-compelete-enabled-doc',
      payload: { scope: docScope }
    })
    if (doc) {
      setDocName(doc.fullName)
    }
  }

  async function completeDoc () {
    await attemptUpdateDoc(query)
    const urlQuery = { scope: query }
    history.replace(url.format({
      pathname: '/search',
      query: urlQuery
    }))
  }

  function handleChange (e) {
    const query = e.currentTarget.value
    const urlQuery = {}
    if (query) urlQuery.query = query
    if (scope) urlQuery.scope = scope
    history.replace(url.format({
      pathname: '/search',
      query: urlQuery
    }))
  }

  function handleKeyDown (e) {
    switch (e.key) {
      case 'Tab':
        e.preventDefault()
        completeDoc()
        break
      case 'Backspace':
        if (!query) {
          e.preventDefault()
          clearDoc()
        }
        break
    }
  }

  return (
    <div className='_header'>
      <form className='_search' autoComplete='off'>
        <svg><use href='#icon-search' /></svg>
        <input value={query} placeholder='Search...' className='input _search-input' spellCheck='false' onChange={handleChange} autoFocus ref={inputRef} style={docName ? { paddingLeft: inputPaddingLeft } : {}} onKeyDown={handleKeyDown} />
        {docName ? <div className='_search-tag' ref={scopeRef}>{docName}</div> : null}
      </form>

      <svg className='_settings' xmlns='http://www.w3.org/2000/svg'>
        <defs>
          <symbol id='icon-search' viewBox='0 0 24 24'><path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' /></symbol>
        </defs>
      </svg>
    </div>
  )
})
