import { Controller } from 'stimulus'

export default class extends Controller {
  checkPosition() {
    const doc = document.documentElement
    const top = Math.max(
      (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0),
      0,
    )
    this.element.classList[top ? 'add' : 'remove']('visible')
  }
}
