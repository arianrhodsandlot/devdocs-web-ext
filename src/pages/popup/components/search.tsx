import classnames from 'classnames'
import key from 'keymaster'
import { type RefObject, createRef, useCallback, useEffect, useState } from 'react'
import { findDOMNode } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import browser from 'webextension-polyfill'
import { type Docs } from '~/src/lib/utils/docs'
import { sendMessage } from '~/src/lib/utils/message'
import { type WrapedResponse } from '~/src/types/message'

function getDocVersion(doc: Doc) {
  return doc.slug.includes('~') ? doc.slug.split('~')[1] : ''
}

function getEntryUrl(entry: Entry) {
  const [entryPath, entryHash] = entry.path.split('#')
  const pathAndHash = entryHash ? `${entryPath}#${entryHash}` : `${entryPath}`
  return `/${entry.doc.slug}/${pathAndHash}`
}

export default function Search() {
  const [entries, setEntries] = useState<Awaited<ReturnType<Docs['searchEntries']>>>()
  const [focusPos, setFocusPos] = useState(0)
  const [failMessage, setFailMessage] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  const focusNextEntry = useCallback(
    function () {
      if (!entries) {
        return
      }
      const maxFocusPos = entries.length - 1
      setFocusPos(focusPos === maxFocusPos ? 0 : focusPos + 1)
    },
    [focusPos, entries],
  )

  const focusPrevEntry = useCallback(
    function () {
      if (!entries) {
        return
      }
      const maxFocusPos = entries.length - 1
      setFocusPos(focusPos === 0 ? maxFocusPos : focusPos - 1)
    },
    [focusPos, entries],
  )

  const enterFocusEntry = useCallback(
    function () {
      if (!entries) {
        return
      }
      const focusEntry = entries[focusPos]
      if (focusEntry) {
        navigate(getEntryUrl(focusEntry))
      }
    },
    [focusPos, entries, navigate],
  )

  const getEntryRef = useCallback(
    function (entry: Entry) {
      const entryRefs: RefObject<any>[] = []
      if (!entries) {
        return
      }
      const index = entries.indexOf(entry)
      let ref = entryRefs[index]
      if (!ref) {
        ref = createRef()
        entryRefs[index] = ref
      }
      return ref
    },
    [entries],
  )

  const search = useCallback(
    async function search() {
      const params = new URLSearchParams(location.search.slice(1))
      const query = params.get('query') ?? ''
      const scope = params.get('scope') ?? ''
      if (!query && !scope) {
        navigate('/', { replace: true })
        return
      }

      let newEntries: Entry[] = []
      const newFocusPos = 0
      let newFailMessage = ''

      let response: WrapedResponse<Entry[]>
      try {
        response = await sendMessage<Entry[]>({
          action: 'search-entry',
          payload: { query, scope },
        })
        newEntries = response.content
      } catch (error: any) {
        newFailMessage = error.message
      }

      setEntries(newEntries)
      setFocusPos(newFocusPos)
      setFailMessage(newFailMessage)
    },
    [location, navigate],
  )

  useEffect(() => {
    key('down', () => {
      focusNextEntry()
      return false
    })
    key('up', () => {
      focusPrevEntry()
      return false
    })
    key('enter', () => {
      enterFocusEntry()
      return false
    })

    return () => {
      key.unbind('down')
      key.unbind('up')
      key.unbind('enter')
    }
  }, [focusNextEntry, focusPrevEntry, enterFocusEntry])

  useEffect(() => {
    search()
  }, [search])

  useEffect(() => {
    if (!entries) {
      return
    }
    const ref = getEntryRef(entries[focusPos])
    if (ref?.current) {
      // eslint-disable-next-line react/no-find-dom-node
      const entryDomNode = findDOMNode(ref.current)
      if (entryDomNode instanceof HTMLAnchorElement) {
        entryDomNode.scrollIntoView({
          block: 'end',
          behavior: 'smooth',
        })
      }
    }
  }, [focusPos, entries, getEntryRef])

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
      <div className='_list-note'>No results.</div>
      <div className='_list-note'>
        Note: documentations must be{' '}
        <a
          className='_list-note-link'
          href='https://devdocs.io/settings'
          onClick={(e) => {
            e.preventDefault()
            browser.tabs.create({ url: e.currentTarget.href })
          }}
          rel='noopener noreferrer'
          target='_blank'
        >
          enabled
        </a>{' '}
        to appear in the search.
      </div>
    </>
  )

  const results = entries
    ? entries.map((entry, i) => (
        <Link
          className={classnames('_list-item', '_list-hover', '_list-entry', `_icon-${entry.doc.icon}`, {
            focus: focusPos === i ? 'focus' : '',
          })}
          key={`${entry.doc.slug}-${entry.doc.name}/${entry.path}-${entry.name}`}
          ref={getEntryRef(entry)}
          to={getEntryUrl(entry)}
        >
          <div className='_list-count'>{getDocVersion(entry.doc)}</div>
          <div className='_list-text'>{entry.name}</div>
        </Link>
      ))
    : undefined

  return (
    <div className='_sidebar'>
      <div className='_list'>{entries ? (entries.length > 0 ? results : noResults) : undefined}</div>
    </div>
  )
}
