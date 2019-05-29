import { Controller } from 'stimulus'
import lozad from 'lozad'

export default class extends Controller {
  initialize() {
    this.observer = lozad('.lozad', {
      threshold: 0.8,
    })
  }

  connect() {
    this.observer.observe()
  }
}
