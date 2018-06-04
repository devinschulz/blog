import turbolinks from 'turbolinks'

import { init as initGoogleAnalytics } from './googleAnalytics'
import headerLinks from './headerLinks'
import fonts from './fonts'
import sw from './sw'

const init = () => {
  turbolinks.start()
  bindEventListeners()
  initGoogleAnalytics()
  fonts()
  sw()
}

const bindEventListeners = () => {
  document.addEventListener('turbolinks:load', handlePageLoad)
}

const handlePageLoad = event => {
  headerLinks()
}

// Hugo live reload has some issues with turbolinks enabled in development mode
// so it's best to only run it in production.
if (turbolinks.supported && process.env.NODE_ENV === 'production') {
  init()
} else {
  handlePageLoad()
  fonts()
  sw()
}
