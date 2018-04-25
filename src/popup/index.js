import App from './App.svelte'

const {width, height, theme} = localStorage

let activeStyle
switch (theme) {
	case 'light':
		activeStyle = document.querySelector('[data-href="devdocs-style.css"]')
		break
	case 'dark':
		activeStyle = document.querySelector('[data-href="devdocs-dark-style.css"]')
		break
}
activeStyle.href = activeStyle.dataset.href

document.documentElement.style.width = `${width}px`
document.documentElement.style.height = `${height}px`
document.body.style.width = `${width}px`
document.body.style.height = `${height}px`

new App({
	target: document.querySelector('._app')
})
