import React from 'react'
import { HashRouter, Route, Switch } from "react-router-dom"
import Header from './header.jsx'
import Home from './home.jsx'
import Search from './search.jsx'
import Content from './content.jsx'

const App = () => (
  <div className="_app">
    <HashRouter>
      <Header />
    </HashRouter>
    <HashRouter>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="*" component={Content} />
      </Switch>
    </HashRouter>
  </div>
)

export default App
