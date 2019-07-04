import browser from 'webextension-polyfill'
import { debounce } from 'lodash'
import React, { useState, useEffect } from 'react'
import storage from '../common/storage'
import i18n from './i18n'
import { Slider, Typography, Radio, Button, Elevation } from 'rmwc'

const lazyPersist = debounce(function () {
  storage.set(...arguments)
}, 100)

const App = function () {
  const [initialized, setInitialized] = useState(false)
  const [theme, setTheme] = useState()
  const [width, setWidth] = useState()
  const [height, setHeight] = useState()

  function updateOption (option, value) {
    switch (option) {
      case 'theme':
        setTheme(value)
        break
      case 'width':
        setWidth(value)
        break
      case 'height':
        setHeight(value)
        break
    }
  }

  useEffect(() => {
    (async () => {
      const { theme, width, height } = await storage.get()
      setTheme(theme)
      setWidth(width)
      setHeight(height)
      setInitialized(true)
    })()
  }, [])

  useEffect(() => {
    if (initialized) {
      lazyPersist({ theme, width, height })
    }
  }, [theme, width, height])

  return <form className={`theme-${theme}`}>
    <Typography use="subtitle2" tag="h2">{i18n('optionsWindowSize')}</Typography>
    <Elevation className='elevation-with-padding'>
      <Elevation>
        <Typography use="subtitle2" tag="h3">{i18n('optionsWidth')}</Typography>
        <Slider
          className='slider-size slider-width'
          name='width'
          value={width}
          onInput={(e) => { updateOption('width', e.detail.value) }}
          discrete
          displayMarkers
          min={300}
          max={800}
          step={50}
        />
      </Elevation>
      <Elevation>
        <Typography use="subtitle2" tag="h3">{i18n('optionsHeight')}</Typography>
        <Slider
          className='slider-size slider-height'
          name='height'
          value={height}
          onInput={(e) => { updateOption('height', e.detail.value) }}
          discrete
          displayMarkers
          min={300}
          max={600}
          step={50}
        />
      </Elevation>
    </Elevation>

    <Typography use="subtitle2" tag="h3">{i18n('optionsTheme')}</Typography>
    <Elevation>
      <Radio
        name='theme'
        value="light"
        checked={theme === 'light'}
        onChange={(e) => { updateOption('theme', e.target.value) }}>
        {i18n('optionsLight')}
      </Radio>
      <Radio
        name='theme'
        value="dark"
        checked={theme === 'dark'}
        onChange={(e) => { updateOption('theme', e.target.value) }}>
        {i18n('optionsDark')}
      </Radio>
    </Elevation>

    <Typography use="subtitle2" tag="h3">{i18n('optionsDocs')}</Typography>
    <Elevation className='elevation-with-padding'>
      <Button icon="open_in_new" outlined dense href='https://devdocs.io/settings' target='_blank' tag='a'>{i18n('optionsSelectFrom')}</Button>
    </Elevation>

    <Typography use="subtitle2" tag="h3">{i18n('optionsShortcut')}</Typography>
    <Elevation className='elevation-with-padding'>
      <Button icon="keyboard" outlined dense href='chrome://extensions/shortcuts' target='_blank' tag='a' onClick={(e) => {
        e.preventDefault()
        browser.tabs.create({ url: e.currentTarget.href })
      }}>{i18n('optionsConfigureShortcuts')}</Button>
    </Elevation>

    <Elevation className='footer'>
      <Typography use="caption" tag="h3">
        DevDocs Web Ext
        <span className='space'>-</span>
        {i18n('optionsVersion')} {VERSION} (<a href={`https://github.com/arianrhodsandlot/DevDocs-Web-Ext/tree/${GIT_VERSION}`}>{GIT_VERSION}</a>)
      </Typography>
      <Typography use="caption" tag="div">{i18n('optionsAboutDesc')}</Typography>
      <Typography use="caption" tag="div">
        <a href="https://chrome.google.com/webstore/detail/devdocs-web-ext/kdjoccdpjblcefijcfhnjoljodddedpj">
          <i className="material-icons">star_half</i>
          {i18n('optionsRate')}
        </a>
        <span className='space'>·</span>
        <a href="https://github.com/arianrhodsandlot/DevDocs-Web-Ext">
          <i className="material-icons">code</i>
          {i18n('optionsSource')}
        </a>
        <span className='space'>·</span>
        <a href="https://github.com/arianrhodsandlot">
          <i className="material-icons">copyright</i>
          arianrhodsandlot
        </a>
      </Typography>
    </Elevation>

    <a className="github-fork-ribbon right-bottom fixed" href="https://github.com/arianrhodsandlot/DevDocs-Web-Ext" data-ribbon="Star me on GitHub" title="Star me on GitHub">Star me on GitHub</a>
  </form>
}

export default App
