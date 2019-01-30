import Raven from 'raven-js'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'

if (process.env.NODE_ENV === 'production') {
  Raven.config('https://d2ddb64170f34a2ca621de47235480bc@sentry.io/1196839').install()
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
