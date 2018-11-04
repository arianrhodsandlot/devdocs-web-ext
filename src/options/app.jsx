import React from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import Header from './header.jsx'
import Welcome from './welcome.jsx'
import Apparence from './apparence.jsx'
import Docs from './docs.jsx'
import About from './about.jsx'
import createHistory from 'history/createHashHistory'

const history = createHistory()

const App = () => (
  <React.Fragment>
    <Router history={history}>
      <Header />
    </Router>
    <Router history={history}>
      <Switch>
        <Route exact path='/welcome' component={Welcome} />
        <Route path='/apparence' component={Apparence} />
        <Route path='/docs' component={Docs} />
        <Route path='/about' component={About} />
      </Switch>
    </Router>
  </React.Fragment>
)

export default App
