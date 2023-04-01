import resolve from '@jridgewell/resolve-uri'
import classnames from 'classnames'
import key from 'keymaster'
import ky from 'ky'
import Prism from 'prismjs'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import browser from 'webextension-polyfill'
import { sendMessage } from '~/src/lib/utils/message'

function cssEscape(selector: string) {
  try {
    return CSS.escape(selector)
  } catch {
    return selector.replace(/([#,./:[\]])/gu, '\\$1')
  }
}

export default function Content() {
  const [loading, setLoading] = useState(false)
  const [contentUrl, setContentUrl] = useState('')
  const [content, setContent] = useState('')
  const [doc, setDoc] = useState<Doc>()
  const pageRef = useRef<HTMLDivElement>()
  const prevPathRef = useRef<string | undefined>()
  const prevPath = prevPathRef.current

  const location = useLocation()
  const navigate = useNavigate()

  const scrollToHash = useCallback(
    function () {
      let entryHash = location.hash
      if (!entryHash || !pageRef.current) {
        return
      }
      if (entryHash.startsWith('#')) {
        entryHash = entryHash.slice(1)
      }
      if (entryHash) {
        const scrollTargetId = entryHash.startsWith('.') ? entryHash.slice(1) : entryHash
        const scrollTarget = document.querySelector<HTMLElement>(`#${cssEscape(scrollTargetId)}`)
        if (scrollTarget) {
          pageRef.current.scrollTo(0, scrollTarget.offsetTop)
        }
      }
    },
    [location]
  )

  useEffect(() => {
    key('enter', () => false)

    key('space', () => {
      if (pageRef.current) {
        pageRef.current.scrollBy({
          top: 150,
          left: 0,
          behavior: 'smooth',
        })
      }
      return false
    })

    key('shift+space', () => {
      if (pageRef.current) {
        pageRef.current.scrollBy({
          top: -150,
          left: 0,
          behavior: 'smooth',
        })
      }
      return false
    })
    ;(async () => {
      const scope = location.pathname.split('/')[1].split('~')[0]
      if (!scope) {
        return
      }
      const { content: contentDoc } = await sendMessage<Doc>({
        action: 'get-content-doc',
        payload: { scope },
      })
      if (contentDoc) {
        setDoc(contentDoc)
      }
    })()

    return () => {
      key.unbind('enter')
      key.unbind('space')
      key.unbind('shift+space')
    }
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname === prevPath) {
      scrollToHash()
    } else {
      setContentUrl(`https://documents.devdocs.io${location.pathname}.html${location.search}`)
    }
    prevPathRef.current = location.pathname
  }, [location.pathname, location.hash, location.search, prevPath, scrollToHash])

  useEffect(() => {
    if (!contentUrl) {
      return
    }

    let docContent = ''
    ;(async () => {
      setLoading(true)
      try {
        docContent = await ky(contentUrl).text()
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
      setContent(docContent)
    })()
  }, [contentUrl])

  useEffect(() => {
    if (!content) {
      return
    }
    const preEls = document.querySelectorAll<HTMLPreElement>('pre[data-language]')
    if (!preEls) {
      return
    }
    for (const el of preEls) {
      if (el) {
        const { language } = el.dataset
        el.classList.add(`language-${language}`)
        Prism.highlightElement(el)
      }
    }
  }, [content])

  useEffect(() => {
    if (!content) {
      return
    }
    if (!location.hash) {
      return
    }
    scrollToHash()
  }, [content, doc, location.hash, scrollToHash])

  function onContentClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    let target = e.target as HTMLElement | null
    while (target && target.tagName !== 'A') {
      if (target === e.currentTarget) {
        return
      }
      target = target.parentElement
    }
    e.preventDefault()
    if (!target) {
      return
    }
    const href = target.getAttribute('href') || ''
    if (href.startsWith('http://') || href.startsWith('https://')) {
      browser.tabs.create({ url: href })
    } else {
      navigate(resolve(href, location.pathname), { replace: true })
    }
  }

  if (loading) {
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

  return (
    <div className='_container' role='document'>
      <div className='_content' role='main'>
        <div
          className={classnames(['_page', doc ? `_${doc.type}` : ''])}
          onClick={onContentClick}
          ref={pageRef as React.MutableRefObject<HTMLDivElement>}
          dangerouslySetInnerHTML={{ __html: content }}
          aria-hidden='true'
        />
      </div>
    </div>
  )
}
