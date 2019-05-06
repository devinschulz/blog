import { Controller } from 'stimulus'

export default class extends Controller {
  initialize() {
    document.addEventListener('turbolinks:load', this.handlePageView, false)
  }

  disconnect() {
    document.removeEventListener('turbolinks:load', this.handlePageView, false)
  }

  handlePageView(event) {
    if (typeof window.ga === 'function') {
      ga('set', 'location', window.location.pathname)
      ga('send', 'pageview')
    }
  }
}
