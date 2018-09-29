import turbolinks from 'turbolinks'
import raven from 'raven-js'

import { trackPageView, trackPageLoad } from './googleAnalytics'
import headerLinks from './headerLinks'
import sw from './sw'
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
  sw()
  trackPageLoad()
}

const bindEventListeners = () => {
  document.addEventListener('turbolinks:load', handlePageLoad)
}

const unbindEventListeners = () => {
  document.addEventListener('turbolinks:before-render', handleBeforeRender)
}

const removeNoJS = () => {
  document.documentElement.classList.remove('no-js')
}

const handlePageLoad = event => {
  headerLinks()
  disqus()
  trackPageView()
}

// Hugo live reload has some issues with turbolinks enabled in development mode
// so it's best to only run it in production.
if (turbolinks.supported && isProduction) {
  init()
} else {
  removeNoJS()
  handlePageLoad()
  sw()
}
