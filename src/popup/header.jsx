import React, { useState, useEffect, useRef } from 'react'
import querystring from 'querystring'
import { withRouter } from 'react-router'
import key from 'keymaster'
import browser from 'webextension-polyfill'

export default withRouter(function Header ({location, history}) {
  const [doc, setDoc] = useState(null)
  const [inputPaddingLeft, setInputPaddingLeft] = useState(0)
  const inputState = getInputState()
  const [scope, setScope] = useState(inputState.scope)
  const [query, setQuery] = useState(inputState.query)
  const inputRef = useRef()
  const scopeRef = useRef()
  const keyHandlersRef = useRef()
  keyHandlersRef.current = {guessDocFromScope}

  useEffect(() => {
    inputRef.current.select()
    const clearQuery = false
    guessDocFromScope(scope, clearQuery)
    key('tab', () => {
      if (doc) return false
      const scope = inputRef.current.value.trim()
      const clearQuery = true
      keyHandlersRef.current.guessDocFromScope(scope, clearQuery)
      return false
    })
    key('backspace', () => {
      if (!inputRef.current.value) {
        clearDoc()
        return false
      }
    })
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
  }, [doc])

  useEffect(() => {
    const inputState = getInputState()
    setScope(inputState.scope)
    setQuery(inputState.query)
    ;(async () => {
      const doc = await browser.runtime.sendMessage({
        action: 'auto-compelete-enabled-doc',
        payload: { scope: inputState.scope }
      })
      setDoc(doc)
    })()
  }, [location])

  function getInputState () {
    let query
    let scope
    if (location.pathname === '/search') {
      const parsed = querystring.parse(location.search.slice(1))
      query = parsed.query
      scope = parsed.scope
    }
    query = (query || localStorage.query || '').trim()
    scope = (scope || localStorage.scope || '').trim()
    return {query, scope}
  }

  async function guessDocFromScope (scope, clearQuery) {
    if (!scope) return
    const doc = await browser.runtime.sendMessage({
      action: 'auto-compelete-enabled-doc',
      payload: { scope }
    })
    if (doc) {
      history.replace('/search?query=' + encodeURIComponent(clearQuery ? '' : query) + '&scope=' + encodeURIComponent(scope))
    }
  }

  function clearDoc () {
    history.replace('/search')
  }

  function handleChange (e) {
    e.persist()
    const query = e.currentTarget.value
    history.replace('/search?query=' + encodeURIComponent(query) + '&scope=' + encodeURIComponent(scope))
  }

  return (
    <div className='_header'>
      <form className='_search' autoComplete='off'>
        <svg><use href='#icon-search' /></svg>
        <input value={query} placeholder='Search...' className='input _search-input' spellCheck='false' onChange={handleChange} autoFocus ref={inputRef} style={doc ? {paddingLeft: inputPaddingLeft} : {}} />
        {doc ? <div className='_search-tag' ref={scopeRef}>{doc.fullName}</div> : null}
      </form>

      <svg className='_settings' xmlns='http://www.w3.org/2000/svg'>
        <defs>
          <symbol id='icon-search' viewBox='0 0 24 24'><path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' /></symbol>
        </defs>
      </svg>
    </div>
  )
})
