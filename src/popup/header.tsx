import url from 'url'
import querystring from 'querystring'
import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import key from 'keymaster'
import { sendMessage } from '../common/message'

async function attemptCompeleteDocName (docScope: string) {
  if (docScope === '') {
    return ''
  }

  const { content: doc } = await sendMessage<ExtendedDoc>({
    action: 'auto-compelete-enabled-doc',
    payload: { scope: docScope }
  })
  if (doc) {
    return doc.fullName
  }
  return ''
}

function Header () {
  const [inputPaddingLeft, setInputPaddingLeft] = useState(0)
  const [scope, setScope] = useState('')
  const [query, setQuery] = useState('')
  const [docName, setDocName] = useState('')
  const inputRef = useRef<HTMLInputElement>()
  const scopeRef = useRef<HTMLInputElement>()

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!inputRef.current) {
      return
    }
    inputRef.current.select()

    key('/', (e) => {
      if (!inputRef.current) {
        return
      }
      if (document.activeElement === inputRef.current) {
        return
      }

      inputRef.current.focus()
      inputRef.current.select()
      e.preventDefault()
    })
  }, [])

  useEffect(() => {
    const lastPopupPath = localStorage.getItem('lastPopupPath')
    if (lastPopupPath) {
      navigate(lastPopupPath, { replace: true })
    }
    setTimeout(() => {
      if (!inputRef.current) {
        return
      }
      inputRef.current.focus()
      inputRef.current.select()
    })
  }, [])

  useEffect(() => {
    (async () => {
      const completedDocName = await attemptCompeleteDocName(scope)
      setDocName(completedDocName)
    })()
  }, [scope])

  useEffect(() => {
    if (scopeRef.current) {
      setInputPaddingLeft(scopeRef.current.offsetWidth + 10)
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [docName])

  useEffect(() => {
    if (location.pathname === '/search' || location.pathname === '/') {
      const inputState = getInputState()
      setScope(inputState.scope)
      setQuery(inputState.query)
    }
  }, [location])

  function getInputState () {
    const parsed = querystring.parse(location.search.slice(1))
    return {
      query: parsed.query ? `${parsed.query}` : '',
      scope: parsed.scope ? `${parsed.scope}` : ''
    }
  }

  function clearDoc () {
    setScope('')
    setQuery('')
    setDocName('')
    navigate('/', { replace: true })
  }

  async function completeDoc () {
    const completedDocName = await attemptCompeleteDocName(query)
    if (completedDocName) {
      const urlQuery = { scope: query }
      navigate(url.format({
        pathname: '/search',
        query: urlQuery
      }), { replace: true })
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  function handleChange (e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.currentTarget.value
    const urlQuery = {
      query: '',
      scope: ''
    }
    if (query) {
      urlQuery.query = query
    }
    if (scope) {
      urlQuery.scope = scope
    }
    navigate(url.format({
      pathname: '/search',
      query: urlQuery
    }), { replace: true })
  }

  function handleKeyDown (e: React.KeyboardEvent<HTMLInputElement>) {
    const query = e.currentTarget.value
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
    <div className='_header' style={{ maxWidth: document.body.style.width || '' }}>
      <form className='_search' autoComplete='off'>
        <svg><use href='#icon-search' /></svg>
        <input
          defaultValue={query}
          placeholder='Search...'
          className='input _search-input'
          spellCheck={false}
          onInput={handleChange}
          autoFocus
          ref={inputRef as React.MutableRefObject<HTMLInputElement>}
          style={docName ? { paddingLeft: inputPaddingLeft } : {}} onKeyDown={handleKeyDown} />
        {docName ? <div className='_search-tag' ref={scopeRef as React.MutableRefObject<HTMLDivElement>}>{docName}</div> : null}
      </form>

      <svg className='_settings' xmlns='http://www.w3.org/2000/svg'>
        <defs>
          <symbol id='icon-search' viewBox='0 0 24 24'><path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' /></symbol>
        </defs>
      </svg>
    </div>
  )
}

export default Header
