import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    this.bindLinks()
  }

  bindLinks() {
    Array.from(this.element.querySelectorAll('a')).forEach(link => {
      link.addEventListener('click', this.onClick, false)
    })
  }
}
