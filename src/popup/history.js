import createHistory from 'history/createHashHistory'

const history = createHistory()
history.listen((location, action) => {
  localStorage.lastPopupPath = `${location.pathname}${location.search}${location.hash}`
})

if (localStorage.lastPopupPath) {
  history.replace(localStorage.lastPopupPath)
}

export default history
