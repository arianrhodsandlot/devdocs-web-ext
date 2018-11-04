import React from 'react'
import i18n from './i18n'

export default class Abbout extends React.Component {
  render () {
    return (
      <form className="option-page option-apparence">
        <h2>{i18n('optionsApparence')}</h2>
        <section className="theme">
          <h3>{i18n('optionsTheme')}</h3>
          <div className="item">
            <label>
              <input className="light" type="radio" name="theme" value="light" /><span>{i18n('optionsLight')}</span>
            </label>
          </div>
          <div className="item">
            <label>
              <input className="dark" type="radio" name="theme" value="dark" /><span>{i18n('optionsDark')}</span>
            </label>
          </div>
        </section>
        <section className="size">
          <h3>{i18n('optionsWindowSize')}</h3>
          <div className="item">
            <label>{i18n('optionsWidth')}</label>
            <input className="width" type="range" name="width" min="300" max="800" step="50" /><span className="val width-val">400</span><span>px</span>
          </div>
          <div className="item">
            <label>{i18n('optionsHeight')}</label>
            <input className="height" type="range" name="height" min="300" max="600" step="50" /><span className="val height-val">400</span><span>px</span>
          </div>
        </section>
      </form>
    )
  }
}
