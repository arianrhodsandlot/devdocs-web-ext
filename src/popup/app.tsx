import React, { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './header'
import Home from './home'
import Search from './search'
import Content from './content'

export default function App () {
  const location = useLocation()

  useEffect(() => {
    localStorage.lastPopupPath = `${location.pathname}${location.search}${location.hash}`
  }, [location])

  return <>
    <Header />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/search' element={<Search />} />
      <Route path='*' element={<Content />} />
    </Routes>
  </>
}
