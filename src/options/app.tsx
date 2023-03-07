/* global VERSION, GIT_VERSION */
import { debounce } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Elevation, Radio, Slider, Typography } from 'rmwc'
import browser from 'webextension-polyfill'
import { defaultOptions } from '../common/default-options'
import { isContextMenuEnabled } from '../common/env'
import { storage } from '../common/storage'
import i18n from './i18n'

const lazyPersist = debounce(async (data) => {
  await storage.set(data)
}, 100)

function App() {
  const [initialized, setInitialized] = useState(false)
  const [theme, setTheme] = useState(defaultOptions.theme)
  const [width, setWidth] = useState(defaultOptions.width)
  const [height, setHeight] = useState(defaultOptions.height)
  const [showContextMenu, setShowContextMenu] = useState(defaultOptions.showContextMenu)

  useEffect(() => {
    ;(async () => {
      const { theme, width, height, showContextMenu } = await storage.get()
      setTheme(theme)
      setWidth(width)
      setHeight(height)
      setShowContextMenu(showContextMenu)
      setInitialized(true)
    })()
  }, [])

  useEffect(() => {
    if (initialized) {
      lazyPersist({
        theme,
        width,
        height,
        showContextMenu,
      })
    }
  }, [theme, width, height, showContextMenu, initialized])

  return (
    <form className={`theme-${theme}`}>
      <Typography use='subtitle2' tag='h2'>
        {i18n('optionsWindowSize')}
      </Typography>
      <Elevation z={0} className='elevation-with-padding'>
        <Elevation z={0}>
          <Typography use='subtitle2' tag='h3'>
            {i18n('optionsWidth')}
          </Typography>
          <Slider
            className='slider-size slider-width'
            name='width'
            value={width}
            onInput={(e) => {
              setWidth(e.detail.value)
            }}
            discrete
            displayMarkers
            min={300}
            max={800}
            step={50}
          />
        </Elevation>
        <Elevation z={0}>
          <Typography use='subtitle2' tag='h3'>
            {i18n('optionsHeight')}
          </Typography>
          <Slider
            className='slider-size slider-height'
            name='height'
            value={height}
            onInput={(e) => {
              setHeight(e.detail.value)
            }}
            discrete
            displayMarkers
            min={300}
            max={600}
            step={50}
          />
        </Elevation>
      </Elevation>

      <Typography use='subtitle2' tag='h3'>
        {i18n('optionsTheme')}
      </Typography>
      <Elevation z={0}>
        <Radio
          name='theme'
          value='light'
          checked={theme === 'light'}
          onChange={(e) => {
            setTheme(e.currentTarget.value)
          }}
        >
          {i18n('optionsLight')}
        </Radio>
        <Radio
          name='theme'
          value='dark'
          checked={theme === 'dark'}
          onChange={(e) => {
            setTheme(e.currentTarget.value)
          }}
        >
          {i18n('optionsDark')}
        </Radio>
      </Elevation>

      {isContextMenuEnabled ? (
        <>
          <Typography use='subtitle2' tag='h3'>
            {i18n('optionsShowContextMenu')}
          </Typography>
          <Elevation z={0}>
            <Checkbox
              name='showContextMenu'
              label={showContextMenu ? i18n('optionsEnabled') : i18n('optionsDisabled')}
              checked={showContextMenu}
              onChange={(e) => {
                setShowContextMenu(e.currentTarget.checked)
              }}
            />
          </Elevation>
        </>
      ) : null}

      <Typography use='subtitle2' tag='h3'>
        {i18n('optionsDocs')}
      </Typography>
      <Elevation z={0} className='elevation-with-padding'>
        <Button icon='open_in_new' outlined dense href='https://devdocs.io/settings' target='_blank' tag='a'>
          {i18n('optionsSelectFrom')}
        </Button>
      </Elevation>

      <Typography use='subtitle2' tag='h3'>
        {i18n('optionsShortcut')}
      </Typography>
      <Elevation z={0} className='elevation-with-padding'>
        <Button
          icon='keyboard'
          outlined
          dense
          href='chrome://extensions/shortcuts'
          target='_blank'
          tag='a'
          onClick={(e) => {
            e.preventDefault()
            browser.tabs.create({ url: e.currentTarget.href })
          }}
        >
          {i18n('optionsConfigureShortcuts')}
        </Button>
      </Elevation>

      <Elevation z={0} className='footer'>
        <Typography use='caption' tag='h3'>
          DevDocs Web Ext
          <span className='space'>-</span>
          {i18n('optionsVersion')} {VERSION} (
          <a href={`https://github.com/arianrhodsandlot/DevDocs-Web-Ext/tree/${GIT_VERSION}`}>{GIT_VERSION}</a>)
        </Typography>
        <Typography use='caption' tag='div'>
          {i18n('optionsAboutDesc')}
        </Typography>
        <Typography use='caption' tag='div'>
          <a href='https://chrome.google.com/webstore/detail/devdocs-web-ext/kdjoccdpjblcefijcfhnjoljodddedpj'>
            <i className='material-icons'>star_half</i>
            {i18n('optionsRate')}
          </a>
          <span className='space'>·</span>
          <a href='https://github.com/arianrhodsandlot/DevDocs-Web-Ext'>
            <i className='material-icons'>code</i>
            {i18n('optionsSource')}
          </a>
          <span className='space'>·</span>
          <a href='https://github.com/arianrhodsandlot'>
            <i className='material-icons'>copyright</i>
            arianrhodsandlot
          </a>
        </Typography>
      </Elevation>

      <a
        className='github-fork-ribbon right-bottom fixed'
        href='https://github.com/arianrhodsandlot/DevDocs-Web-Ext'
        data-ribbon='Star me on GitHub'
        title='Star me on GitHub'
      >
        Star me on GitHub
      </a>
    </form>
  )
}

export default App
