import turbolinks from 'turbolinks'
import raven from 'raven-js'

import { trackPageView, trackPageLoad } from './googleAnalytics'
import headerLinks from './headerLinks'
import sw from './sw'
import { initScroll, deinitScroll } from './scroll'
import {
  init as initTheme,
  bindEventListeners as bindThemeEventListeners,
  unbindEventListeners as unbindThemeEventListeners,
} from './themeToggle'
import { maybeLikes } from './likes'
import share from './share'

const isProduction = process.env.NODE_ENV === 'production'

const installSentry = () =>
  raven
    .config('https://6be3214d8335461caeb4c6e4ef667158@sentry.io/300767')
    .install()

const init = () => {
  installSentry()
  initTheme()
  removeNoJS()
  turbolinks.start()
  bindEventListeners()
  sw().then(updateAvailable => {
    if (updateAvailable) {
      document.querySelector('.js-update').classList.remove('hidden')
    }
  })
  trackPageLoad()
  initScroll()
}

const handleBeforeRender = () => {
  deinitScroll()
  unbindThemeEventListeners()
}

const bindEventListeners = () => {
  document.addEventListener('turbolinks:load', handlePageLoad)
  document.addEventListener('turbolinks:before-render', handleBeforeRender)
}

const removeNoJS = () => {
  document.documentElement.classList.remove('no-js')
}

const handlePageLoad = event => {
  headerLinks()
  trackPageView()
  bindThemeEventListeners()
  initScroll()
  maybeLikes()
  share()
}

// Hugo live reload has some issues with turbolinks enabled in development mode
// so it's best to only run it in production.
if (turbolinks.supported && isProduction) {
  init()
} else {
  initTheme()
  removeNoJS()
  handlePageLoad()
}
