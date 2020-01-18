import { Controller } from 'stimulus'
import LazyLoad from 'vanilla-lazyload'

export default class extends Controller {
  initialize () {
    this.lazy = new LazyLoad({
      callback_reveal (element) {
        // Code smell, refactor
        if (element.classList.contains('c-browser__image')) {
          const vp = element.closest('.c-browser__viewport')
          if (vp) {
            vp.classList.add('loading')
          }
        }
      },
      callback_loaded (element) {
        // Code smell, refactor
        if (element.classList.contains('c-browser__image')) {
          const vp = element.closest('.c-browser__viewport')
          if (vp) {
            vp.classList.remove('loading')
          }
        }
      }
    })
  }

  connect () {
    this.lazy.update()
  }
}
