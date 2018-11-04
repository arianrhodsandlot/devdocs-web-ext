import React from 'react'
import i18n from './i18n'

export default class Abbout extends React.Component {
  render () {
    return (
      <div className="option-page option-welcome">
        <h2>{i18n('optionsWelcom')}</h2>
        <div className="container">
          <h3>{i18n('readmeTitle')}</h3>
          <div className="content">
            <p className="p1">{i18n('readmeP1')}</p>
            <p className="p2">{i18n('readmeP2')}</p>
            <p className="p3">{i18n('readmeP3')}</p>
            <p className="p4">{i18n('readmeP4')}</p>
          </div>
        </div>
      </div>
    )
  }
}
