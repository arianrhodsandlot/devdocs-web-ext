import React from 'react'
import i18n from '../../lib/i18n'
import { render } from '../../lib/render'
import App from './components/app'
import './styles'

document.title = i18n('optionsTitle')
render(<App />)
