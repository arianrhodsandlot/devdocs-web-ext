import React, { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Content from './content'
import Header from './header'
import Home from './home'
import Search from './search'

export default function App() {
  const location = useLocation()

  useEffect(() => {
    localStorage.lastPopupPath = `${location.pathname}${location.search}${location.hash}`
  }, [location])

  return (
    <>
      <Header />
      <Routes>
        <Route element={<Home />} path='/' />
        <Route element={<Search />} path='/search' />
        <Route element={<Content />} path='*' />
      </Routes>
    </>
  )
}
