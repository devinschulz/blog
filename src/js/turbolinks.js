import turbolinks from 'turbolinks'
import {
  maybeInit as maybeInitCommenting,
  maybeDeInit as maybeDeInitCommenting,
} from './comments'

const init = () => {
  turbolinks.start()
  bindEventListeners()
  maybeInitCommenting()
}

const bindEventListeners = () => {
  document.addEventListener('turbolinks:load', handlePageLoad)
  document.addEventListener('turbolinks:before-render', handleBeforeRender)
}

const handlePageLoad = event => {
  maybeInitCommenting()
}

const handleBeforeRender = () => {
  maybeDeInitCommenting()
}

// Hugo live reload has some issues with turbolinks enabled in development mode
// so it's best to only run it in production.
if (turbolinks.supported && process.env.NODE_ENV === 'production') {
  init()
} else {
  handlePageLoad()
}
