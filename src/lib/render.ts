import { createRoot } from 'react-dom/client'

export function render(App: JSX.Element) {
  const rootElement = document.querySelector<HTMLDivElement>('#app')
  if (rootElement) {
    createRoot(rootElement).render(App)
  }
}
