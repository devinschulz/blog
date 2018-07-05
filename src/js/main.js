import turbolinks from 'turbolinks'

import { init as initGoogleAnalytics } from './googleAnalytics'
import headerLinks from './headerLinks'
import share from './share'
import fonts from './fonts'
import sw from './sw'
import {
  init as initTheme,
  unbindEventListeners as unbindToggleEventListeners,
  bindEventListeners as bindToggleEventListeners,
} from './themeToggle'

const init = () => {
  removeNoJS()
  turbolinks.start()
  bindEventListeners()
  initGoogleAnalytics()
  fonts()
  sw()
  initTheme()
}

const bindEventListeners = () => {
  document.addEventListener('turbolinks:load', handlePageLoad)
}

const unbindEventListeners = () => {
  document.addEventListener('turbolinks:before-render', handleBeforeRender)
}

const handleBeforeRender = () => {
  unbindToggleEventListeners()
}

const removeNoJS = () => {
  document.documentElement.classList.remove('no-js')
}

const handlePageLoad = () => {
  headerLinks()
  share()
  bindToggleEventListeners()
}

// Hugo live reload has some issues with turbolinks enabled in development mode
// so it's best to only run it in production.
if (turbolinks.supported && process.env.NODE_ENV === 'production') {
  init()
} else {
  removeNoJS()
  initTheme()
  handlePageLoad()
  fonts()
  sw()
}
