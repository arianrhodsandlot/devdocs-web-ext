import React from 'react'
import i18n from './i18n'

export default class Abbout extends React.Component {
  render () {
    return (
      <div className="option-page option-docs">
        <h2>{i18n('optionsDocs')}</h2>
        <section>
          <p dangerouslySetInnerHTML={{__html: i18n('optionsSelectFrom')}}></p>
          <div className="iframe-container">
            <iframe src='https://devdocs.io/settings'></iframe>
          </div>
        </section>
      </div>
    )
  }
}
