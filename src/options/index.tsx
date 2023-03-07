import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import i18n from './i18n'

document.title = i18n('optionsTitle')

ReactDOM.render(<App />, document.querySelector('#app'))
