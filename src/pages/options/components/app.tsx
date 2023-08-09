import { Button } from '@rmwc/button'
import { Checkbox } from '@rmwc/checkbox'
import { Elevation } from '@rmwc/elevation'
import { Icon } from '@rmwc/icon'
import { Radio } from '@rmwc/radio'
import { Slider } from '@rmwc/slider'
import { Typography } from '@rmwc/typography'
import { debounce } from 'lodash'
import React, { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'
import { useTheme } from '~/src/lib/hooks/use-theme'
import { defaultOptions } from '~/src/lib/utils/default-options'
import { isContextMenuEnabled } from '~/src/lib/utils/env'
import i18n from '~/src/lib/utils/i18n'
import { storage } from '~/src/lib/utils/storage'

const lazyPersist = debounce(async (data) => {
  await storage.set(data)
}, 100)

const { version } = browser.runtime.getManifest()

function App() {
  const [initialized, setInitialized] = useState(false)
  const [width, setWidth] = useState(defaultOptions.width)
  const [height, setHeight] = useState(defaultOptions.height)
  const [showContextMenu, setShowContextMenu] = useState(defaultOptions.showContextMenu)

  const [{ theme, isDark }, setTheme] = useTheme(defaultOptions.theme)

  useEffect(() => {
    ;(async () => {
      const { theme, width, height, showContextMenu } = await storage.get()
      setTheme(theme)
      setWidth(width)
      setHeight(height)
      setShowContextMenu(showContextMenu)
      setInitialized(true)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <form className={`theme-${isDark ? 'dark' : 'light'}`}>
      <Typography tag='h2' use='subtitle2'>
        {i18n('optionsWindowSize')}
      </Typography>
      <Elevation className='elevation-with-padding' z={0}>
        <Elevation z={0}>
          <Typography tag='h3' use='subtitle2'>
            {i18n('optionsWidth')}
          </Typography>
          <Slider
            className='slider-size slider-width'
            discrete
            displayMarkers
            max={800}
            min={300}
            name='width'
            onInput={(e) => {
              setWidth(e.detail.value)
            }}
            step={50}
            value={width}
          />
        </Elevation>
        <Elevation z={0}>
          <Typography tag='h3' use='subtitle2'>
            {i18n('optionsHeight')}
          </Typography>
          <Slider
            className='slider-size slider-height'
            discrete
            displayMarkers
            max={600}
            min={300}
            name='height'
            onInput={(e) => {
              setHeight(e.detail.value)
            }}
            step={50}
            value={height}
          />
        </Elevation>
      </Elevation>

      <Typography tag='h3' use='subtitle2'>
        {i18n('optionsTheme')}
      </Typography>
      <Elevation z={0}>
        {[
          { value: 'system', label: i18n('optionsSystem') },
          { value: 'light', label: i18n('optionsLight') },
          { value: 'dark', label: i18n('optionsDark') },
        ].map(({ value, label }) => (
          <Radio
            checked={theme === value}
            key={value}
            name='theme'
            onChange={() => {
              setTheme(value)
            }}
            value={value}
          >
            {label}
          </Radio>
        ))}
      </Elevation>

      {isContextMenuEnabled ? (
        <>
          <Typography tag='h3' use='subtitle2'>
            {i18n('optionsShowContextMenu')}
          </Typography>
          <Elevation z={0}>
            <Checkbox
              checked={showContextMenu}
              label={showContextMenu ? i18n('optionsEnabled') : i18n('optionsDisabled')}
              name='showContextMenu'
              onChange={(e) => {
                setShowContextMenu(e.currentTarget.checked)
              }}
            />
          </Elevation>
        </>
      ) : undefined}

      <Typography tag='h3' use='subtitle2'>
        {i18n('optionsDocs')}
      </Typography>
      <Elevation className='elevation-with-padding' z={0}>
        <Button dense href='https://devdocs.io/settings' icon='open_in_new' outlined tag='a' target='_blank'>
          {i18n('optionsSelectFrom')}
        </Button>
      </Elevation>

      <Typography tag='h3' use='subtitle2'>
        {i18n('optionsShortcut')}
      </Typography>
      <Elevation className='elevation-with-padding' z={0}>
        <Button
          dense
          href='chrome://extensions/shortcuts'
          icon='keyboard'
          onClick={(e) => {
            e.preventDefault()
            browser.tabs.create({ url: e.currentTarget.href })
          }}
          outlined
          tag='a'
          target='_blank'
        >
          {i18n('optionsConfigureShortcuts')}
        </Button>
      </Elevation>

      <Elevation className='footer' z={0}>
        <Typography tag='h3' use='caption'>
          DevDocs Web Ext
          <span className='space'>-</span>
          {i18n('optionsVersion')} {version}
        </Typography>
        <Typography tag='div' use='caption'>
          {i18n('optionsAboutDesc')}
        </Typography>
        <Typography tag='div' use='caption'>
          <a href='https://chrome.google.com/webstore/detail/devdocs-web-ext/kdjoccdpjblcefijcfhnjoljodddedpj'>
            <Icon icon={{ icon: 'star_half' }} />
            {i18n('optionsRate')}
          </a>
          <span className='space'>·</span>
          <a href='https://github.com/arianrhodsandlot/devdocs-web-ext'>
            <Icon icon={{ icon: 'code' }} />
            {i18n('optionsSource')}
          </a>
          <span className='space'>·</span>
          <a href='https://github.com/arianrhodsandlot'>
            <Icon icon={{ icon: 'copyright' }} />
            arianrhodsandlot
          </a>
        </Typography>
      </Elevation>

      <a
        className='github-fork-ribbon right-bottom fixed'
        data-ribbon='Star me on GitHub'
        href='https://github.com/arianrhodsandlot/devdocs-web-ext'
        title='Star me on GitHub'
      >
        Star me on GitHub
      </a>
    </form>
  )
}

export default App
