import { Controller } from 'stimulus'

export default class extends Controller {
  initialize() {
    document.addEventListener(
      'turbolinks:before-cache',
      this.handleBeforeCache,
      false
    )
  }

  // Remove the critical CSS since it causes the fonts to flicker during page
  // changes. The critical CSS isn't necessary anymore since the main stylesheet
  // would have loaded by now.
  handleBeforeCache(event) {
    const style = event.target.querySelector('head style')
    if (style) {
      style.parentNode.removeChild(style)
    }
  }
}
