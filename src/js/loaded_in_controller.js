import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['time']
  initialize() {
    window.addEventListener('load', this.setLoadTime.bind(this), false)
  }

  connect() {
    this.setLoadTime()
  }

  setLoadTime() {
    window.removeEventListener('load', this.setLoadTime.bind(this), false)
    this.timeTarget.innerText = `· loaded in ${this.getLoadTime() / 1000}s`
  }

  getLoadTime() {
    return (
      window.performance.timing.domContentLoadedEventEnd -
      window.performance.timing.navigationStart
    )
  }
}
