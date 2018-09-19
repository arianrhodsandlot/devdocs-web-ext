import React from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import Header from './header.jsx'
import Home from './home.jsx'
import Search from './search.jsx'
import Content from './content.jsx'
import history from './history'

const App = () => (
  <React.Fragment>
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
  </React.Fragment>
)

export default App
