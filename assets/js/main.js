import 'babel-polyfill'
import turbolinks from 'turbolinks'
import raven from 'raven-js'

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
import disqus from './disqus'

const isProduction = process.env.NODE_ENV === 'production'

const installSentry = () =>
  raven
    .config('https://6be3214d8335461caeb4c6e4ef667158@sentry.io/300767')
    .install()

const init = () => {
  installSentry()
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

const handlePageLoad = event => {
  headerLinks()
  share()
  bindToggleEventListeners()
  disqus()
}

// Hugo live reload has some issues with turbolinks enabled in development mode
// so it's best to only run it in production.
if (turbolinks.supported && isProduction) {
  init()
} else {
  removeNoJS()
  initTheme()
  handlePageLoad()
  fonts()
  sw()
}
