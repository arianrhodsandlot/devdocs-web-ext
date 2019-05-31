import React from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import Header from './header'
import Home from './home'
import Search from './search'
import Content from './content'
import history from './history'

export default function App () {
  return <>
    <Router history={history}>
      <Header />
    </Router>
    <Router history={history}>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/search' component={Search} />
        <Route path='*' component={Content} />
      </Switch>
    </Router>
  </>
}
