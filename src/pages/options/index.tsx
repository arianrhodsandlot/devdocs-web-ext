import React from 'react'
import i18n from '~/src/lib/utils/i18n'
import { render } from '~/src/lib/utils/render'
import App from './components/app'
import './styles'

document.title = i18n('optionsTitle')
render(<App />)
