import { Controller } from 'stimulus'
import LazyLoad from 'vanilla-lazyload'

export default class extends Controller {
  initialize() {
    this.lazy = new LazyLoad()
  }

  connect() {
    this.lazy.update()
  }
}
