import React from 'react'
import i18n from './i18n'

export default class About extends React.Component {
  render () {
    return (
      <div className="option-page option-about">
        <h2>{i18n('optionsAbout')}</h2>
        <section>
          <div className="oh"><img className="fl" src="/images/icon-38.png" />
            <div className="fl about-content">
              <h3>DevDocs Web Ext</h3>
              <p dangerouslySetInnerHTML={{__html: i18n('optionsAboutDesc')}}></p>
            </div>
          </div><a href="https://github.com/arianrhodsandlot/DevDocs-Web-Ext/issues/new" target="_blank">
            <button className="report">{i18n('optionsReport')}</button></a>
          <p><span>{i18n('optionsVersion')}</span><span>0.1.10</span></p>
          <p dangerouslySetInnerHTML={{__html: i18n('optionsOpenSource')}}></p>
        </section>
      </div>
    )
  }
}
