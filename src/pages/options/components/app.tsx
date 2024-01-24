import { Button } from '@rmwc/button'
import { Elevation } from '@rmwc/elevation'
import { Icon } from '@rmwc/icon'
import { Radio } from '@rmwc/radio'
import { Typography } from '@rmwc/typography'
import { endsWith } from 'lodash'
import { type MouseEvent } from 'react'
import browser from 'webextension-polyfill'
import { useTheme } from '~/src/lib/hooks/use-theme'
import i18n from '~/src/lib/utils/i18n'
import { useOptions } from '~src/lib/hooks/use-options'

const { version } = browser.runtime.getManifest()

const edgeId = 'dglcbgdedngbiaaohopncfonhdngodmo'
const isEdge = endsWith(location?.origin, edgeId)
const rateUrl = isEdge
  ? 'https://microsoftedge.microsoft.com/addons/detail/devdocs-web-ext/dglcbgdedngbiaaohopncfonhdngodmo'
  : 'https://chrome.google.com/webstore/detail/devdocs-web-ext/kdjoccdpjblcefijcfhnjoljodddedpj'

function App() {
  const { options, updateOptions, loaded } = useOptions()
  const { isDark } = useTheme()

  if (!loaded) {
    return
  }

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
          <div style={{ margin: '8px 0', opacity: '0.5' }}>{options.width}px</div>
          <input
            className='slider'
            max={800}
            min={300}
            name='height'
            onInput={(e) => {
              updateOptions({ width: e.currentTarget.value })
            }}
            step={50}
            style={{ margin: '8px 0', width: '100%', display: 'block' }}
            type='range'
            value={options.width}
          />
        </Elevation>
        <Elevation z={0}>
          <Typography tag='h3' use='subtitle2'>
            {i18n('optionsHeight')}
          </Typography>
          <div style={{ margin: '8px 0', opacity: '0.5' }}>{options.height}px</div>
          <input
            className='slider'
            max={600}
            min={300}
            name='height'
            onInput={(e) => {
              updateOptions({ height: e.currentTarget.value })
            }}
            step={50}
            style={{ margin: '8px 0', width: '60%', display: 'block' }}
            type='range'
            value={options.height}
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
            checked={options.theme === value}
            key={value}
            name='theme'
            onChange={() => {
              updateOptions({ theme: value })
            }}
            value={value}
          >
            {label}
          </Radio>
        ))}
      </Elevation>

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
          onClick={(e: MouseEvent<HTMLAnchorElement, MouseEvent>) => {
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
          <a href={rateUrl}>
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
