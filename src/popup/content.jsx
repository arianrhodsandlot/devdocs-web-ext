import React, { useState, useEffect, useRef } from 'react'
import browser from 'webextension-polyfill'
import url from 'url'
import classnames from 'classnames'
import key from 'keymaster'
import ky from 'ky'
import _ from 'lodash'
import { StorageLRU, asyncify } from 'storage-lru'

const lru = new StorageLRU(asyncify(localStorage))

function lruGetItem (key) {
  return new Promise(function (resolve) {
    lru.getItem(key, {json: false}, function (error, value) {
      resolve(error ? '' : value)
    })
  })
}

function lruSetItem (key, value) {
  return new Promise(function (resolve, reject) {
    lru.setItem(key, value, {
      json: false,
      cacheControl: `max-age=${30/* day */ * 24/* hour */ * 60/* min */ * 60/* sec */}`
    }, function (error) {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

export default function App ({location, history}) {
  const [loading, setLoading] = useState(false)
  const [contentUrl, setContentUrl] = useState('')
  const [content, setContent] = useState('')
  const [doc, setDoc] = useState(null)
  const pageRef = useRef()
  const prevPathRef = useRef()
  const prevPath = prevPathRef.current

  useEffect(() => {
    updateDoc()
  }, [])

  useEffect(() => {
    if (location.pathname === prevPath) {
      scrollToHash()
    } else {
      setContentUrl(`http://docs.devdocs.io${location.pathname}.html${location.search}`)
    }
    prevPathRef.current = location.pathname
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!contentUrl) return

    (async () => {
      let docContent = await lruGetItem(contentUrl)
      if (docContent) {
        setContent(docContent)
      } else {
        setLoading(true)
      }
      docContent = await ky(contentUrl).text()
      setLoading(false)
      setContent(docContent)
      await lruSetItem(contentUrl, docContent)
    })()
  }, [contentUrl])

  useEffect(() => {
    if (!content) return
    if (!location.hash) return
    scrollToHash()
  }, [content, doc])

  async function updateDoc () {
    let scope = location.pathname.split('/')[1].split('~')[0]
    if (!scope) return
    const contentDoc = await browser.runtime.sendMessage({
      action: 'get-content-doc',
      payload: { scope }
    })
    if (contentDoc) {
      setDoc(contentDoc)
    }
  }

  function scrollToHash () {
    let entryHash = location.hash
    if (!entryHash) return
    if (entryHash.startsWith('#')) {
      entryHash = entryHash.slice(1)
    }
    if (entryHash) {
      const scrollTargetId = entryHash.startsWith('.') ? entryHash.slice(1) : entryHash
      const scrollTarget = document.getElementById(scrollTargetId)
      if (scrollTarget) {
        pageRef.current.scrollTo(0, scrollTarget.offsetTop)
      }
    }
  }

  function onContentClick (e) {
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
      const currentUrl = history.location.pathname
      const targetUrl = url.resolve(currentUrl, href)
      history.replace(targetUrl)
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

  let category = location.pathname.split(/\/|~/g)
  if (category) {
    category = category[1] || ''
  }
  return (
    <div className='_container' role='document'>
      <div className='_content' role='main'>
        <div
          className='_page'
          className={classnames(['_page', doc ? `_${doc.type}` : ''])}
          onClick={onContentClick}
          ref={pageRef}
          dangerouslySetInnerHTML={{__html: content}} />
      </div>
    </div>
  )
}
