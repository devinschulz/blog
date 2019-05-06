import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    this.bindLinks()
  }

  onClick() {
    try {
      ga('send', 'event', 'Table of Contents', 'click')
    } catch (error) {}
  }

  bindLinks() {
    Array.from(this.element.querySelectorAll('a')).forEach(link => {
      link.addEventListener('click', this.onClick, false)
    })
  }
}
