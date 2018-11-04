import React from 'react'
import { Route } from 'react-router'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import i18n from './i18n'

const ListItemLink = function ({ to, activeClassName, ...rest }) {
  return (
    <Route
      path={to}
      children={({ match }) => (
        <li className={classnames({[activeClassName]: match})}>
          <Link to={to} {...rest} />
        </li>
      )}
    />
  )
}

export default class Header extends React.Component {
  render (props) {
    return <div>
      <h1>DevDocs Web Ext</h1>
      <ul className="option-navs">
        <ListItemLink to="/welcome" activeClassName="selected">
          {i18n('optionsWelcom')}
        </ListItemLink>
        <ListItemLink to="/apparence" activeClassName="selected">
          {i18n('optionsApparence')}
        </ListItemLink>
        <ListItemLink to="/docs" activeClassName="selected">
          {i18n('optionsDocs')}
        </ListItemLink>
        <ListItemLink to="/about" activeClassName="selected">
          {i18n('optionsAbout')}
        </ListItemLink>
      </ul>
    </div>
  }
}
